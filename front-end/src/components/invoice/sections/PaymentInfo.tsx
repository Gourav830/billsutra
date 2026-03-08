import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";

const PaymentInfo = ({ data }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("payment_info");

  return (
    <section className="rounded-2xl border border-slate-200" style={style}>
      <p className="text-xs uppercase tracking-[0.25em] opacity-70">
        Payment info
      </p>
      <p className="mt-3 text-sm">{data.paymentInfo}</p>
      {data.business.showPaymentQr ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-xs opacity-70">
          <div className="h-12 w-12 rounded-lg bg-slate-100" />
          <span>QR payment enabled</span>
        </div>
      ) : null}
    </section>
  );
};

export default PaymentInfo;
