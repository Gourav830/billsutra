import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";

const Header = ({ data, theme }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("header");

  return (
    <section className="rounded-2xl border border-slate-200" style={style}>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          {data.business.showLogoOnInvoice ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold opacity-70">
              {data.business.logoUrl ? (
                <img
                  src={data.business.logoUrl}
                  alt={`${data.business.businessName} logo`}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                "Logo"
              )}
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] opacity-70">
              Invoice
            </p>
            <h1
              className="mt-2 text-3xl font-semibold"
              style={{
                fontFamily: theme.fontFamily,
                color: theme.primaryColor,
              }}
            >
              {data.business.businessName}
            </h1>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm">
          <p className="text-xs uppercase tracking-[0.2em] opacity-70">
            Invoice No.
          </p>
          <p className="mt-1 text-base font-semibold">{data.invoiceNumber}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] opacity-70">
            Invoice Date
          </p>
          <p className="mt-1 font-medium">{data.invoiceDate}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] opacity-70">
            Due Date
          </p>
          <p className="mt-1 font-medium">{data.dueDate}</p>
        </div>
      </div>
    </section>
  );
};

export default Header;
