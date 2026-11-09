---
name: Historical ledger evidence
description: Evidence limits when importing legacy customer accounting records.
---

Treat an uploaded general-ledger statement as evidence of its named accounts, dated entries, references and balances only. Do not infer service scope, tax treatment, project completion, quotations, or unspecified allocations of receipts and returns.

**Why:** The user explicitly selected importing confirmed information only. Their source statement lacked invoice line items, tax details, projects and quotations; some credits did not identify an invoice. Turning these into fully issued tax invoices or assigning the credits by amount would invent financial facts.

**How to apply:** Keep the source account snapshot separate from live receivables and newly issued documents. Historical invoice references are review records, not additional revenue or newly payable tax invoices. Obtain original supporting documents before implementing a review/issuance or reconciliation workflow. Preserve explicit source references, and do not double-count receipts and returns as new revenue.
