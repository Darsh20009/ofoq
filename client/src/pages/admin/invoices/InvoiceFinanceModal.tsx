import { FormEvent, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowDownLeft, CreditCard, FilePenLine, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { invoicesApi } from "../../../api/client";
import type { Invoice, InvoiceAccountCredit } from "../../../types";
import { useLang } from "../../../i18n/LangContext";
import CurrencySuffix from "../../../components/CurrencySuffix";

type Props = {
  invoice: Invoice;
  mode: "edit" | "reconcile";
  canEdit: boolean;
  canReconcile: boolean;
  onClose: () => void;
  onChanged: () => void;
};

const dayToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const remainingFor = (invoice: Invoice) =>
  Math.max(0, Math.round((Number(invoice.total || 0) - Number(invoice.paidAmount || 0) - Number(invoice.creditedAmount || 0)) * 100) / 100);
const errorMessage = (error: any, isArabic: boolean) =>
  error?.response?.status === 409
    ? (isArabic ? "تم تحديث الفاتورة في مكان آخر. حدّث البيانات ثم أعد المحاولة." : "This invoice changed elsewhere. Refresh the data, then try again.")
    : (error?.response?.data?.error || (isArabic ? "تعذر حفظ التغيير" : "Couldn't save the change"));

export default function InvoiceFinanceModal({ invoice, mode, canEdit, canReconcile, onClose, onChanged }: Props) {
  const { dir, lang } = useLang();
  const ar = lang === "ar";
  const qc = useQueryClient();
  const [description, setDescription] = useState(invoice.items?.[0]?.description || (ar ? "رصيد الفاتورة المستورد" : "Imported invoice balance"));
  const [quantity, setQuantity] = useState(String(invoice.items?.[0]?.quantity || 1));
  const [unitPrice, setUnitPrice] = useState(String(invoice.items?.[0]?.unitPrice ??
    (Number(invoice.operationalImport?.sourceInvoiceTotal || invoice.total) / (1 + (invoice.operationalImport?.confirmedTaxRate ?? 15) / 100))));
  const [notes, setNotes] = useState(invoice.notes || "");
  const [notesAr, setNotesAr] = useState(invoice.notesAr || "");
  const [dueDate, setDueDate] = useState(invoice.dueDate?.slice(0, 10) || "");
  const currency = invoice.currency || "SAR";
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paidAt, setPaidAt] = useState(dayToday());
  const [reference, setReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [selectedEntry, setSelectedEntry] = useState("");
  const [allocationAmount, setAllocationAmount] = useState("");
  const [serverError, setServerError] = useState("");
  const paymentRequest = useRef<{ signature: string; id: string } | null>(null);
  const isEdit = mode === "edit";
  const balance = remainingFor(invoice);
  const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const previewNet = roundMoney(Number(quantity || 0) * Number(unitPrice || 0));
  const previewTax = roundMoney(Number(quantity || 0) * Number(unitPrice || 0) * (invoice.operationalImport?.confirmedTaxRate ?? 15) / 100);
  const previewTotal = roundMoney(previewNet + previewTax);

  const creditsQuery = useQuery({
    queryKey: ["invoice-account-credits", invoice._id],
    queryFn: () => invoicesApi.accountCredits(invoice._id).then((response) => response.data as {
      entries: InvoiceAccountCredit[]; unallocatedTotal: number;
      history?: { _id: string; kind: string; reference: string; date: string; amount: number; note?: string }[];
    }),
    enabled: !isEdit && canReconcile,
  });
  const entries = useMemo(() => creditsQuery.data?.entries || [], [creditsQuery.data?.entries]);
  const selectedCredit = entries.find((entry) => entry._id === selectedEntry);
  const amountToAllocate = Number(allocationAmount);

  const invalidateFinance = () => {
    qc.invalidateQueries({ queryKey: ["invoices"] });
    qc.invalidateQueries({ queryKey: ["invoice-finance-summary"] });
    qc.invalidateQueries({ queryKey: ["customers"] });
    qc.invalidateQueries({ queryKey: ["projects"] });
    qc.invalidateQueries({ queryKey: ["invoice-account-credits", invoice._id] });
    onChanged();
  };

  const editMutation = useMutation({
    mutationFn: () => invoicesApi.update(invoice._id, {
      items: [{
        description: description.trim(),
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        discount: 0,
        tax: invoice.operationalImport?.confirmedTaxRate ?? 15,
      }],
      notes: notes.trim(),
      notesAr: notesAr.trim(),
      dueDate: dueDate || null,
      currency,
      expectedVersion: invoice.__v,
    }),
    onSuccess: () => {
      toast.success(ar ? "تم تحديث الفاتورة" : "Invoice updated");
      invalidateFinance();
    },
    onError: (error: any) => setServerError(errorMessage(error, ar)),
  });
  const paymentMutation = useMutation({
    mutationFn: (payload: { paidAmount: number; paidAt: string; reference?: string; note?: string; requestId: string; expectedVersion: number }) =>
      invoicesApi.recordPayment(invoice._id, payload),
    onSuccess: () => {
      toast.success(ar ? "تم تسجيل الدفعة" : "Payment recorded");
      invalidateFinance();
    },
    onError: (error: any) => setServerError(errorMessage(error, ar)),
  });
  const allocateMutation = useMutation({
    mutationFn: (payload: { entryId: string; amount: number; expectedVersion: number }) =>
      invoicesApi.allocateCredit(invoice._id, payload),
    onSuccess: () => {
      toast.success(ar ? "تم تخصيص الرصيد للفاتورة" : "Credit allocated to invoice");
      setAllocationAmount("");
      setSelectedEntry("");
      invalidateFinance();
    },
    onError: (error: any) => setServerError(errorMessage(error, ar)),
  });

  const submitEdit = (event: FormEvent) => {
    event.preventDefault();
    setServerError("");
    if (!canEdit) return;
    if (!description.trim() || Number(quantity) <= 0 || Number(unitPrice) < 0) {
      setServerError(ar ? "أدخل وصفًا وكمية وسعرًا صحيحًا." : "Enter a valid description, quantity and unit price.");
      return;
    }
    editMutation.mutate();
  };
  const submitPayment = (event: FormEvent) => {
    event.preventDefault();
    setServerError("");
    const amount = Number(paymentAmount);
    if (!canReconcile || !Number.isFinite(amount) || amount <= 0 || amount > balance || !paidAt) {
      setServerError(ar ? "أدخل مبلغًا صحيحًا لا يتجاوز المتبقي، وحدد التاريخ." : "Enter a valid amount up to the remaining balance and choose a date.");
      return;
    }
    const signature = JSON.stringify([invoice._id, amount, paidAt, reference.trim(), paymentNote.trim()]);
    if (paymentRequest.current?.signature !== signature) {
      paymentRequest.current = {
        signature,
        id: typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `payment-${invoice._id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      };
    }
    const requestId = paymentRequest.current.id;
    paymentMutation.mutate({
      paidAmount: amount,
      paidAt,
      reference: reference.trim() || undefined,
      note: paymentNote.trim() || undefined,
      requestId,
      expectedVersion: invoice.__v,
    });
  };
  const submitAllocation = (event: FormEvent) => {
    event.preventDefault();
    setServerError("");
    if (!selectedCredit || amountToAllocate <= 0 || amountToAllocate > selectedCredit.remaining || amountToAllocate > balance) {
      setServerError(ar ? "اختر رصيدًا وأدخل مبلغًا لا يتجاوز المتاح والمتبقي على الفاتورة." : "Choose a credit and enter an amount within both its available and invoice balances.");
      return;
    }
    allocateMutation.mutate({ entryId: selectedCredit._id, amount: amountToAllocate, expectedVersion: invoice.__v });
  };

  const busy = editMutation.isPending || paymentMutation.isPending || allocateMutation.isPending;
  const title = isEdit ? (ar ? "تعديل الفاتورة المستوردة" : "Edit activated invoice") : (ar ? "تسوية الفاتورة" : "Invoice reconciliation");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5" dir={dir}>
        <motion.button aria-label={ar ? "إغلاق النافذة" : "Close dialog"} className="fixed inset-0 cursor-default bg-[#101c3b]/45"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.section role="dialog" aria-modal="true" aria-labelledby="finance-modal-title"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
          className="relative max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#dce3ec] bg-[#fffefa] shadow-2xl">
          <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e4e8ef] bg-[#fffefa] px-5 py-4 sm:px-7">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#8b97aa]">{invoice.invoiceNumber}</p>
              <h2 id="finance-modal-title" className="mt-1 text-xl font-bold text-[#1c2b52]">{title}</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#69758b] hover:bg-[#f0f3f7]" aria-label={ar ? "إغلاق" : "Close"}><X size={18} /></button>
          </header>
          <div className="space-y-5 p-5 sm:p-7">
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#f1f4f7] p-3 text-sm">
              <div><p className="text-xs text-[#768297]">{ar ? "الإجمالي" : "Invoice total"}</p><strong className="mt-1 block text-[#1c2b52]">{invoice.total.toLocaleString(lang)} <CurrencySuffix currency={currency} /></strong></div>
              <div><p className="text-xs text-[#768297]">{ar ? "المدفوع" : "Cash paid"}</p><strong className="mt-1 block text-[#1c6c58]">{Number(invoice.paidAmount || 0).toLocaleString(lang)} <CurrencySuffix currency={currency} /></strong></div>
              <div><p className="text-xs text-[#768297]">{ar ? "المتبقي" : "Remaining"}</p><strong className="mt-1 block text-[#1c2b52]">{balance.toLocaleString(lang)} <CurrencySuffix currency={currency} /></strong></div>
            </div>

            {isEdit ? (
              <form onSubmit={submitEdit} className="space-y-4">
                <div className="rounded-lg border border-[#e9d8a8] bg-[#fff8e6] p-3 text-sm leading-6 text-[#6b5b35]">
                  {ar
                    ? `الإجمالي المستورد يشمل ضريبة القيمة المضافة ${invoice.operationalImport?.confirmedTaxRate ?? 15}%. تُعرض الخدمات بأسعار قبل الضريبة، ويُعاد احتساب الإجمالي عند الحفظ.`
                    : `The imported total already includes ${invoice.operationalImport?.confirmedTaxRate ?? 15}% VAT. Service prices below are pre-tax; the server recalculates the invoice total when saved.`}
                </div>
                <div>
                  <label className="label">{ar ? "وصف الخدمة / الرصيد" : "Service or balance description"}</label>
                  <input className="input-field" value={description} onChange={(event) => setDescription(event.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">{ar ? "الكمية" : "Quantity"}</label><input className="input-field" type="number" min="0.01" step="0.01" dir="ltr" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></div>
                  <div><label className="label">{ar ? "سعر الوحدة قبل الضريبة" : "Unit price before VAT"}</label><input className="input-field" type="number" min="0" step="0.000001" dir="ltr" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} required /></div>
                </div>
                <p className="text-xs text-[#748096]">{ar ? "ضريبة القيمة المضافة المعتمدة" : "Confirmed VAT rate"}: {invoice.operationalImport?.confirmedTaxRate ?? 15}%</p>
                <p className="rounded-lg border border-[#dce3ec] p-3 text-sm font-semibold text-[#1c2b52]">
                  {ar ? "الإجمالي بعد التعديل شامل الضريبة" : "Updated total including VAT"}: {previewTotal.toLocaleString(lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <CurrencySuffix currency={currency} />
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><label className="label">{ar ? "تاريخ الاستحقاق" : "Due date"}</label><input className="input-field" type="date" dir="ltr" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></div>
                  <div><label className="label">{ar ? "العملة" : "Currency"}</label><input className="input-field" dir="ltr" value={currency} readOnly /></div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><label className="label">{ar ? "ملاحظات" : "Notes"}</label><textarea className="input-field min-h-20 resize-y" value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
                  <div><label className="label">{ar ? "ملاحظات بالعربية" : "Arabic notes"}</label><textarea className="input-field min-h-20 resize-y" dir="rtl" value={notesAr} onChange={(event) => setNotesAr(event.target.value)} /></div>
                </div>
                {serverError && <ErrorMessage message={serverError} />}
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={onClose} className="btn-ghost">{ar ? "إلغاء" : "Cancel"}</button>
                  <button type="submit" disabled={busy || !canEdit} className="btn-primary"><FilePenLine size={16} />{busy ? (ar ? "جارٍ الحفظ..." : "Saving…") : (ar ? "حفظ التعديلات" : "Save changes")}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <section className="rounded-xl border border-[#dce5e5] bg-[#f5f9f7] p-4">
                  <div className="mb-3 flex items-center gap-2 text-[#1c6c58]"><CreditCard size={17} /><h3 className="font-bold">{ar ? "تسجيل دفعة نقدية جديدة" : "Record a new cash payment"}</h3></div>
                  {creditsQuery.isLoading ? <div className="skeleton h-12 rounded-lg" /> : (creditsQuery.data?.unallocatedTotal || 0) > 0 ? (
                    <div className="mb-3 flex gap-2 rounded-lg bg-[#fff5df] p-3 text-xs leading-5 text-[#755b22]">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{ar ? `لدى العميل أرصدة غير مخصصة بقيمة ${creditsQuery.data?.unallocatedTotal.toLocaleString(lang)}. لا تسجل إيصال المصدر مرة أخرى؛ استخدم تخصيص الرصيد أدناه.` : `This customer has ${creditsQuery.data?.unallocatedTotal.toLocaleString(lang)} in unapplied credits. Do not record those source receipts again; allocate an existing credit below.`}</span>
                    </div>
                  ) : null}
                  <form onSubmit={submitPayment} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div><label className="label">{ar ? "المبلغ" : "Payment amount"}</label><input className="input-field" dir="ltr" type="number" min="0.01" max={balance} step="0.01" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} required /></div>
                    <div><label className="label">{ar ? "تاريخ الدفع" : "Payment date"}</label><input className="input-field" dir="ltr" type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} required /></div>
                    <div><label className="label">{ar ? "المرجع (اختياري)" : "Reference (optional)"}</label><input className="input-field" value={reference} onChange={(event) => setReference(event.target.value)} /></div>
                    <div><label className="label">{ar ? "ملاحظة (اختيارية)" : "Note (optional)"}</label><input className="input-field" value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} /></div>
                    <div className="sm:col-span-2 flex justify-end"><button type="submit" className="btn-primary" disabled={busy || !canReconcile || balance <= 0}><CreditCard size={16} />{busy ? (ar ? "جارٍ التسجيل..." : "Recording…") : (ar ? "تسجيل الدفعة" : "Record payment")}</button></div>
                  </form>
                </section>

                <section className="rounded-xl border border-[#d9e1eb] bg-[#f7f8fb] p-4">
                  <div className="mb-3 flex items-center gap-2 text-[#1c2b52]"><ArrowDownLeft size={17} /><h3 className="font-bold">{ar ? "تخصيص رصيد عميل موجود" : "Allocate existing customer credit"}</h3></div>
                  <p className="mb-3 text-xs leading-5 text-[#738097]">{ar ? "هذه العملية تربط دفعة أو إشعار دائن سابقًا بهذه الفاتورة، ولا تسجل نقدًا جديدًا." : "This links an existing payment or credit note to this invoice; it does not record new cash."}</p>
                  {creditsQuery.isLoading ? <div className="skeleton h-20 rounded-lg" /> : creditsQuery.isError ? (
                    <p className="text-sm text-[#a3463d]">{ar ? "تعذر تحميل أرصدة العميل. أعد فتح النافذة للمحاولة." : "Couldn't load customer credits. Reopen this dialog to retry."}</p>
                  ) : entries.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-[#d3dbe5] px-4 py-5 text-center text-sm text-[#758198]">{ar ? "لا توجد دفعات أو إشعارات دائنة غير مخصصة لهذا العميل." : "No unapplied customer payments or credit notes are available."}</p>
                  ) : (
                    <form onSubmit={submitAllocation} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
                      <div><label className="label">{ar ? "الرصيد المتاح" : "Available credit"}</label><select className="input-field" value={selectedEntry} onChange={(event) => { setSelectedEntry(event.target.value); setAllocationAmount(""); }} required><option value="">{ar ? "اختر حركة..." : "Choose an entry…"}</option>{entries.map((entry) => <option key={entry._id} value={entry._id}>{entry.kind === "payment" ? (ar ? "دفعة" : "Payment") : (ar ? "إشعار دائن" : "Credit note")} · {entry.reference || "—"} · {entry.remaining.toLocaleString(lang)} {invoice.currency}</option>)}</select></div>
                      <div><label className="label">{ar ? "مبلغ التخصيص" : "Amount to allocate"}</label><input className="input-field" type="number" dir="ltr" min="0.01" max={Math.min(balance, selectedCredit?.remaining || balance)} step="0.01" value={allocationAmount} onChange={(event) => setAllocationAmount(event.target.value)} required /></div>
                      <button type="submit" className="btn-primary justify-center" disabled={busy || !canReconcile || !selectedCredit || balance <= 0}>{busy ? (ar ? "جارٍ التخصيص..." : "Allocating…") : (ar ? "تخصيص" : "Allocate")}</button>
                    </form>
                  )}
                  {selectedCredit && <p className="mt-2 text-xs text-[#738097]">{ar ? "المتاح في الحركة المحددة" : "Available on selected entry"}: {selectedCredit.remaining.toLocaleString(lang)} <CurrencySuffix currency={invoice.currency} /></p>}
                </section>
                {serverError && <ErrorMessage message={serverError} />}
                {!!creditsQuery.data?.history?.length && (
                  <section className="space-y-2 border-t border-[#dce3ec] pt-4">
                    <h3 className="font-bold text-[#1c2b52]">{ar ? "السداد والتسويات المسجلة" : "Recorded payments and credits"}</h3>
                    {creditsQuery.data.history.map((entry) => (
                      <div key={entry._id} className="rounded-lg border border-[#dce3ec] p-3 text-sm">
                        <div className="flex flex-wrap justify-between gap-2">
                          <span>{ar ? (entry.kind === "payment" ? "سند قبض" : "مرتجع / رصيد دائن") : entry.kind === "payment" ? "Receipt" : "Credit note"} · <bdi>{entry.reference}</bdi></span>
                          <strong>{entry.amount.toLocaleString(lang)} <CurrencySuffix currency={currency} /></strong>
                        </div>
                        <p className="mt-1 text-xs text-[#69758b]">{new Date(entry.date).toLocaleDateString(ar ? "ar-SA-u-ca-gregory" : "en-GB", { timeZone: "Asia/Riyadh" })}</p>
                        {entry.note && <p className="mt-1 text-xs text-[#69758b]">{entry.note}</p>}
                      </div>
                    ))}
                  </section>
                )}
                {!canReconcile && <p className="text-sm text-[#a3463d]">{ar ? "تسجيل الدفعات وتخصيص الأرصدة متاح للمسؤولين فقط." : "Recording payments and allocating credits is restricted to administrators."}</p>}
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </AnimatePresence>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#f0d1ce] bg-[#fff1ef] p-3 text-sm leading-5 text-[#a3463d]"><AlertCircle size={16} className="mt-0.5 shrink-0" />{message}</p>;
}
