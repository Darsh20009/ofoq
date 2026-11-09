"""Read the Arabic account-ledger export without third-party dependencies."""
import json
import re
import sys
import zipfile
from datetime import datetime
from decimal import Decimal
from xml.etree import ElementTree as ET

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def amount(value):
    return Decimal(str(value or "0"))


def extract(path):
    with zipfile.ZipFile(path) as archive:
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            strings = [
                "".join(node.itertext())
                for node in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("m:si", NS)
            ]
        sheets = [name for name in archive.namelist()
                  if re.fullmatch(r"xl/worksheets/sheet\d+\.xml", name)]
        if len(sheets) != 1:
            raise ValueError("Expected a single account-ledger worksheet")
        rows = []
        for row in ET.fromstring(archive.read(sheets[0])).findall(".//m:row", NS):
            cells = {}
            for cell in row.findall("m:c", NS):
                value = cell.find("m:v", NS)
                inline = cell.find("m:is", NS)
                text = value.text if value is not None else "".join(inline.itertext()) if inline is not None else ""
                if cell.get("t") == "s":
                    text = strings[int(text)]
                cells[re.sub(r"\d", "", cell.get("r"))] = text
            rows.append((int(row.get("r")), cells))
    if rows[0][1].get("A") != "قيد اليومية" or rows[1][1].get("E") != "مدين":
        raise ValueError("Unrecognized ledger headers")
    accounts, current, grand = [], None, None
    journals, documents = set(), set()
    for row_number, cells in rows[2:]:
        title = cells.get("A", "").strip()
        customer = re.fullmatch(r"(.+)\s+#(\d+)", title)
        if customer:
            if current is not None:
                raise ValueError("Customer section has no total")
            current = {"name": customer[1].strip(), "accountCode": customer[2], "entries": []}
        elif title == "الرصيد السابق":
            if current is None or amount(cells.get("G")) - amount(cells.get("H")) != 0:
                raise ValueError("Nonzero opening balances require explicit handling")
        elif title == "المجموع":
            totals = {key: float(value) for key, value in {
                "debit": amount(cells.get("E")), "credit": amount(cells.get("F")),
                "balance": amount(cells.get("G")) - amount(cells.get("H")),
            }.items()}
            if current is not None:
                for field in ("debit", "credit"):
                    actual = sum(amount(entry[field]) for entry in current["entries"])
                    if actual != amount(totals[field]):
                        raise ValueError(f"Section {field} total mismatch at row {row_number}")
                if amount(totals["debit"]) - amount(totals["credit"]) != amount(totals["balance"]):
                    raise ValueError("Section balance mismatch")
                current.update(totals)
                accounts.append(current)
                current = None
            else:
                grand = totals
        elif cells.get("C"):
            if current is None:
                raise ValueError("Entry outside a customer section")
            source = cells["C"]
            if source.startswith("فاتورة مرتجعات "):
                kind, reference = "credit_note", source.removeprefix("فاتورة مرتجعات ")
            elif source.startswith("فاتورة "):
                kind, reference = "invoice", source.removeprefix("فاتورة ")
            elif source.startswith("سند قبض "):
                kind, reference = "receipt", source.removeprefix("سند قبض ")
            else:
                raise ValueError(f"Unknown source at row {row_number}")
            debit, credit = amount(cells.get("E")), amount(cells.get("F"))
            if (kind == "invoice" and (debit <= 0 or credit != 0)) or (
                kind != "invoice" and (credit <= 0 or debit != 0)
            ):
                raise ValueError("Unexpected entry direction")
            key = (kind, reference)
            if title in journals or key in documents:
                raise ValueError("Duplicate journal or document reference")
            journals.add(title)
            documents.add(key)
            date = datetime.strptime(cells["B"], "%Y/%m/%d").strftime("%Y-%m-%dT00:00:00.000Z")
            entry = {
                "row": row_number, "journalNumber": title, "date": date,
                "kind": kind, "reference": reference.strip(), "description": cells.get("D", ""),
                "debit": float(debit), "credit": float(credit),
                "balance": float(amount(cells.get("G")) - amount(cells.get("H"))),
            }
            previous = amount(current["entries"][-1]["balance"]) if current["entries"] else Decimal(0)
            if previous + debit - credit != amount(entry["balance"]):
                raise ValueError(f"Running balance mismatch at row {row_number}")
            # Only preserve an invoice association explicitly written in the source.
            related = re.findall(r"(?<![A-Z])INV-\d+-\d+-\d+", entry["description"])
            if len(set(related)) == 1:
                entry["relatedInvoiceNumber"] = related[0]
            current["entries"].append(entry)
        elif any(cells.get(column) for column in ("A", "B", "D", "E", "F", "G", "H")):
            raise ValueError(f"Unexpected nonempty row {row_number}")
    if current is not None or grand is None or not accounts:
        raise ValueError("Incomplete ledger")
    if len({account["accountCode"] for account in accounts}) != len(accounts):
        raise ValueError("Duplicate customer account codes")
    for field in ("debit", "credit", "balance"):
        if sum(amount(account[field]) for account in accounts) != amount(grand[field]):
            raise ValueError("Grand total mismatch")
    return {"accounts": accounts, "totals": grand}


if __name__ == "__main__":
    print(json.dumps(extract(sys.argv[1]), ensure_ascii=False))
