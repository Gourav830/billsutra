import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";
import { formatCurrency } from "./utils";

const DiscountSection = ({ data }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("discount");
  const discountAmount = 0;

  return (
    <section className="rounded-2xl border border-slate-200" style={style}>
      <p className="text-xs uppercase tracking-[0.25em] opacity-70">
        Discounts
      </p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>Discount applied</span>
        <span className="font-semibold">
          {formatCurrency(discountAmount, data.business.currency)}
        </span>
      </div>
    </section>
  );
};

export default DiscountSection;
