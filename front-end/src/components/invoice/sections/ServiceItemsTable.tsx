import type { InvoiceSectionProps } from "@/types/invoice-template";
import { calculateTotals, formatCurrency } from "./utils";

const ServiceItemsTable = ({ data, theme }: InvoiceSectionProps) => {
  const totals = calculateTotals(data.items);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          Service items
        </p>
        <p className="text-sm text-slate-500">
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
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  {item.description ? (
                    <p className="text-xs text-slate-500">{item.description}</p>
                  ) : null}
                </div>
                <div className="text-right text-sm text-slate-600">
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
