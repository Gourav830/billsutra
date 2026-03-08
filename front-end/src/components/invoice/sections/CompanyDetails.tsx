import type { InvoiceSectionProps } from "@/types/invoice-template";

const CompanyDetails = ({ data }: InvoiceSectionProps) => {
  const business = data.business;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        Company details
      </p>
      <div className="mt-3 grid gap-2 text-sm text-slate-700">
        <p className="text-base font-semibold text-slate-900">
          {business.businessName}
        </p>
        <p>{business.address}</p>
        <p>{business.phone}</p>
        <p>{business.email}</p>
        <p>{business.website}</p>
        {business.showTaxNumber && business.taxId ? (
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Tax ID: {business.taxId}
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default CompanyDetails;
