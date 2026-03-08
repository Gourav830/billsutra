import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";
import { calculateTotals, formatCurrency } from "./utils";

const TaxSection = ({ data }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("tax");
  const totals = calculateTotals(data.items);

  return (
    <section className="rounded-2xl border border-slate-200" style={style}>
      <p className="text-xs uppercase tracking-[0.25em] opacity-70">
        Tax summary
      </p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>Total tax</span>
        <span className="font-semibold">
          {formatCurrency(totals.tax, data.business.currency)}
        </span>
      </div>
    </section>
  );
};

export default TaxSection;
