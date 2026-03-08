import type { InvoiceSectionProps } from "@/types/invoice-template";
import { calculateTotals, formatCurrency } from "./utils";

const TaxSection = ({ data }: InvoiceSectionProps) => {
  const totals = calculateTotals(data.items);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        Tax summary
      </p>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-700">
        <span>Total tax</span>
        <span className="font-semibold">
          {formatCurrency(totals.tax, data.business.currency)}
        </span>
      </div>
    </section>
  );
};

export default TaxSection;
