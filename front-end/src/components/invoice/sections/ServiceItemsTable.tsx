import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";
import { calculateTotals, formatCurrency } from "./utils";

const ServiceItemsTable = ({ data, theme }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("service_items");
  const totals = calculateTotals(data.items);

  return (
    <section className="rounded-2xl border border-slate-200" style={style}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.25em] opacity-70">
          Service items
        </p>
        <p className="text-sm opacity-70">
          Subtotal: {formatCurrency(totals.subtotal, data.business.currency)}
        </p>
      </div>
      <div className="mt-4 grid gap-3">
        {data.items.map((item) => {
          const lineTotal = item.quantity * item.unitPrice;
          const taxAmount = lineTotal * ((item.taxRate ?? 0) / 100);
          return (
            <div
              key={item.name}
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  {item.description ? (
                    <p className="text-xs opacity-70">{item.description}</p>
                  ) : null}
                </div>
                <div className="text-right text-sm opacity-80">
                  <p>Qty: {item.quantity}</p>
                  <p>
                    Rate:{" "}
                    {formatCurrency(item.unitPrice, data.business.currency)}
                  </p>
                  <p>Tax: {item.taxRate ?? 0}%</p>
                  <p
                    className="mt-2 font-semibold"
                    style={{ color: theme.primaryColor }}
                  >
                    {formatCurrency(
                      lineTotal + taxAmount,
                      data.business.currency,
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ServiceItemsTable;
