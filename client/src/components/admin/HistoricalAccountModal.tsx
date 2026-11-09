import { useLang } from "../../i18n/LangContext";
import type { HistoricalAccount } from "../../types";
import CurrencySuffix from "../CurrencySuffix";
import { X, BookOpen } from "lucide-react";

const entryLabels: Record<HistoricalAccount["entries"][number]["kind"], { ar: string; en: string }> = {
  invoice: { ar: "فاتورة", en: "Invoice" },
  receipt: { ar: "سند قبض", en: "Receipt" },
  credit_note: { ar: "إشعار دائن", en: "Credit note" },
};

export default function HistoricalAccountModal({
  account,
  customerName,
  onClose,
}: {
  account: HistoricalAccount | null;
  customerName: string;
  onClose: () => void;
}) {
  const { lang, dir } = useLang();
  if (!account) return null;
  const isArabic = lang === "ar";
  const dateText = (value: string) => new Date(value).toLocaleDateString(isArabic ? "ar-SA-u-ca-gregory" : "en-GB", {
    year: "numeric", month: "short", day: "numeric",
  });
  const amount = (value: number) => (
    <>{Number(value || 0).toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <CurrencySuffix /></>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6" dir={dir}>
      <button type="button" aria-label={isArabic ? "إغلاق كشف الحساب" : "Close account statement"}
        className="fixed inset-0 cursor-default bg-navy-900/45" onClick={onClose} />
      <section role="dialog" aria-modal="true" aria-labelledby="historical-account-title"
        className="relative flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800"><BookOpen size={20} /></div>
            <div>
              <h2 id="historical-account-title" className="text-lg font-bold text-navy-700">
                {isArabic ? "كشف الحساب" : "Account statement"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{customerName} · {account.accountCode}</p>
              <p className="mt-1 text-xs text-gray-400">
                {isArabic ? "الرصيد كما في" : "Snapshot as of"} {dateText(account.asOf)}
                <span className="mx-2">·</span>{account.sourceName}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={isArabic ? "إغلاق" : "Close"}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={18} /></button>
        </header>

        <div className="grid grid-cols-1 gap-3 border-b border-gray-100 bg-[#f8faf9] p-4 sm:grid-cols-3 sm:px-6">
          <div className="rounded-xl border border-gray-100 bg-white p-3">
            <p className="text-xs text-gray-500">{isArabic ? "إجمالي المدين" : "Total debit"}</p>
            <p className="mt-1 font-bold text-navy-700">{amount(account.debit)}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-3">
            <p className="text-xs text-gray-500">{isArabic ? "إجمالي الدائن" : "Total credit"}</p>
            <p className="mt-1 font-bold text-navy-700">{amount(account.credit)}</p>
            <p className="mt-1 text-[11px] leading-5 text-gray-400">
              {isArabic ? "يشمل الدائن المرتجعات والتسويات، وليس المقبوضات النقدية فقط." : "Credit includes returns and adjustments, not cash receipts alone."}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
            <p className="text-xs text-emerald-800">{isArabic ? "صافي الرصيد" : "Net balance"}</p>
            <p className="mt-1 font-bold text-navy-700">{amount(account.balance)}</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {account.entries.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              {isArabic ? "لا توجد حركات في الكشف." : "No entries in this statement."}
            </div>
          ) : (
            <table className="w-full min-w-[900px] text-start text-sm">
              <thead className="sticky top-0 z-10 bg-[#f4f7f5] text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">{isArabic ? "التاريخ" : "Date"}</th>
                  <th className="px-4 py-3 font-semibold">{isArabic ? "النوع" : "Type"}</th>
                  <th className="px-4 py-3 font-semibold">{isArabic ? "المرجع" : "Reference"}</th>
                  <th className="px-4 py-3 font-semibold">{isArabic ? "رقم القيد" : "Journal ref."}</th>
                  <th className="px-4 py-3 font-semibold">{isArabic ? "الوصف" : "Description"}</th>
                  <th className="px-4 py-3 text-end font-semibold">{isArabic ? "مدين" : "Debit"}</th>
                  <th className="px-4 py-3 text-end font-semibold">{isArabic ? "دائن" : "Credit"}</th>
                  <th className="px-4 py-3 text-end font-semibold">{isArabic ? "الرصيد" : "Balance"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {account.entries.map((entry) => (
                  <tr key={`${entry.row}-${entry.journalNumber}`} className="align-top hover:bg-[#fbfcfb]">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{dateText(entry.date)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded-md bg-[#eef4f0] px-2 py-1 text-xs font-semibold text-[#355f4b]">
                        {entryLabels[entry.kind][isArabic ? "ar" : "en"]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {entry.reference || "—"}
                      {entry.relatedInvoiceNumber && (
                        <span className="mt-1 block text-xs text-gray-400">
                          {isArabic ? "الفاتورة المرتبطة" : "Related invoice"}: {entry.relatedInvoiceNumber}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">{entry.journalNumber || "—"}</td>
                    <td className="max-w-xs whitespace-normal px-4 py-3 text-gray-600">{entry.description || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-end text-gray-700">{amount(entry.debit)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-end text-gray-700">{amount(entry.credit)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-end font-semibold text-navy-700">{amount(entry.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <footer className="flex justify-end border-t border-gray-100 p-4">
          <button type="button" onClick={onClose} className="btn-ghost">{isArabic ? "إغلاق" : "Close"}</button>
        </footer>
      </section>
    </div>
  );
}
