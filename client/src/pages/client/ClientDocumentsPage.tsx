import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { invoicesApi } from "../../api/client";
import type { Invoice } from "../../types";
import { useLang } from "../../i18n/LangContext";

export default function ClientDocumentsPage() {
  const { dir, lang } = useLang();
  const isArabic = lang === "ar";
  const [downloading, setDownloading] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["client-documents"],
    queryFn: () => invoicesApi.list({ limit: 100 }).then((response) => response.data.invoices as Invoice[]),
  });

  async function download(invoice: Invoice, includeBankDetails: boolean) {
    const key = `${invoice._id}-${includeBankDetails ? "bank" : "no-bank"}`;
    setDownloading(key);
    try {
      const response = await invoicesApi.pdf(invoice._id, includeBankDetails);
      if (!String(response.headers["content-type"] || "").includes("pdf")) throw new Error("Invalid PDF response");
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${invoice.invoiceNumber}${includeBankDetails ? "-bank" : "-without-bank"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || (isArabic ? "تعذر تحميل الملف" : "Couldn't download this document"));
    } finally {
      setDownloading(null);
    }
  }

  const documents = data || [];
  const statusLabel: Record<string, string> = isArabic
    ? { sent: "مرسل", viewed: "تمت مشاهدته", accepted: "معتمد", partial: "مدفوع جزئيًا", paid: "مدفوع", overdue: "متأخر" }
    : { sent: "Sent", viewed: "Viewed", accepted: "Accepted", partial: "Partially paid", paid: "Paid", overdue: "Overdue" };

  return (
    <main className="mx-auto max-w-[1480px] space-y-6" dir={dir}>
      <header className="rounded-2xl bg-[#071a32] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#e0b875]"><FileText size={23} /></span>
          <div>
            <p className="text-xs font-bold text-[#e0b875]">{isArabic ? "ملفاتي" : "MY DOCUMENTS"}</p>
            <h1 className="mt-1 text-2xl font-black">{isArabic ? "الفواتير وعروض الأسعار" : "Invoices & quotations"}</h1>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/70">
          {isArabic ? "حمّل نسخة من مستنداتك مع البيانات البنكية أو بدونها." : "Download your documents with or without bank details."}
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20 text-[#8b806f]"><Loader2 className="animate-spin" /></div>
      ) : documents.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#ded7ce] bg-[#fffdfa] px-6 py-16 text-center">
          <FileText className="mx-auto mb-3 text-[#c7c0b6]" size={38} />
          <p className="font-bold text-[#071a32]">{isArabic ? "لا توجد مستندات متاحة حتى الآن" : "No documents are available yet"}</p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-[#e8e0d6] bg-[#fffdfa]">
          <div className="divide-y divide-[#eee7de]">
            {documents.map((invoice) => {
              const isQuotation = (invoice as any).type === "proforma";
              return (
                <article key={invoice._id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f4efe8] text-[#1c2b6e]"><FileText size={19} /></span>
                    <div className="min-w-0">
                      <h2 className="font-bold text-[#071a32]">{isQuotation ? (isArabic ? "عرض سعر" : "Quotation") : (isArabic ? "فاتورة" : "Invoice")}</h2>
                      <p className="mt-1 truncate font-mono text-xs text-[#8b806f]">{invoice.invoiceNumber}</p>
                      <p className="mt-1 text-xs text-[#8b806f]">
                        {invoice.total.toLocaleString(isArabic ? "ar-SA" : lang)} {invoice.currency}
                        {invoice.status ? ` · ${statusLabel[invoice.status] || invoice.status}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {[true, false].map((withBank) => {
                      const key = `${invoice._id}-${withBank ? "bank" : "no-bank"}`;
                      return (
                        <button key={key} onClick={() => download(invoice, withBank)} disabled={downloading === key}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#ded7ce] px-3 py-2 text-xs font-bold text-[#071a32] transition-colors hover:border-[#c59650] hover:bg-[#f8f5f0] disabled:opacity-60">
                          {downloading === key ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                          {isArabic
                            ? (withBank ? "تنزيل مع البيانات البنكية" : "تنزيل بدون البيانات البنكية")
                            : (withBank ? "With bank details" : "Without bank details")}
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}