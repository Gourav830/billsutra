import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";

const Header = ({ data, theme }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("header");

  return (
    <section className="border border-slate-400 bg-white" style={style}>
      <div className="border-b border-slate-400 pb-2 text-center">
        <p className="text-[0.78em] font-semibold">Tax Invoice</p>
      </div>
      <div className="grid gap-3 px-1 py-2 sm:grid-cols-[96px_1fr] sm:items-center">
        <div className="flex h-14 w-full items-center justify-center border border-dashed border-slate-400 bg-slate-50 text-[0.78em] font-semibold">
          {data.business.showLogoOnInvoice && data.business.logoUrl ? (
            <img
              src={data.business.logoUrl}
              alt={`${data.business.businessName} logo`}
              className="h-10 w-10 object-contain"
            />
          ) : (
            "Logo"
          )}
        </div>
        <div className="min-h-14 border border-dashed border-slate-400 bg-[#eaf4ff] px-3 py-2">
          <h1
            className="text-[1.1em] font-semibold"
            style={{ color: theme.primaryColor }}
          >
            {data.business.businessName}
          </h1>
          <p className="mt-1 text-[0.85em]">Phone no.: {data.business.phone}</p>
        </div>
      </div>
    </section>
  );
};

export default Header;
