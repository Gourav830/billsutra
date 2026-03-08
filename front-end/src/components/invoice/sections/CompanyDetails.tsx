import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";

const CompanyDetails = ({ data }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("company_details");
  const business = data.business;

  return (
    <section className="rounded-2xl border border-slate-200" style={style}>
      <p className="text-xs uppercase tracking-[0.25em] opacity-70">
        Company details
      </p>
      <div className="mt-3 grid gap-2 text-sm">
        <p className="text-base font-semibold">{business.businessName}</p>
        <p>{business.address}</p>
        <p>{business.phone}</p>
        <p>{business.email}</p>
        <p>{business.website}</p>
        {business.showTaxNumber && business.taxId ? (
          <p className="text-xs uppercase tracking-[0.2em] opacity-70">
            Tax ID: {business.taxId}
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default CompanyDetails;
