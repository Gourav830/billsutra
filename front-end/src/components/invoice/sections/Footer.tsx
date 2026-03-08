import type { InvoiceSectionProps } from "@/types/invoice-template";

const Footer = ({ data }: InvoiceSectionProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
      <p>
        Thank you for choosing {data.business.businessName}. We appreciate your
        business.
      </p>
    </section>
  );
};

export default Footer;
