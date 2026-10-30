interface CurrencySuffixProps {
  currency?: string;
}

export default function CurrencySuffix({ currency = "SAR" }: CurrencySuffixProps) {
  if (currency !== "SAR") return <span>{currency}</span>;

  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap" dir="ltr">
      <span className="saudi-riyal-symbol" aria-hidden="true">&#xea;</span>
      <small className="text-[0.72em] font-normal">SAR</small>
    </span>
  );
}
