import type { InvoiceSectionProps } from "@/types/invoice-template";

const PaymentInfo = ({ data }: InvoiceSectionProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        Payment info
      </p>
      <p className="mt-3 text-sm text-slate-700">{data.paymentInfo}</p>
      {data.business.showPaymentQr ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500">
          <div className="h-12 w-12 rounded-lg bg-slate-100" />
          <span>QR payment enabled</span>
        </div>
      ) : null}
    </section>
  );
};

export default PaymentInfo;
