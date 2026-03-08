import type { InvoiceSectionProps } from "@/types/invoice-template";
import { formatCurrency } from "./utils";

const DiscountSection = ({ data }: InvoiceSectionProps) => {
  const discountAmount = 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        Discounts
      </p>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-700">
        <span>Discount applied</span>
        <span className="font-semibold">
          {formatCurrency(discountAmount, data.business.currency)}
        </span>
      </div>
    </section>
  );
};

export default DiscountSection;
