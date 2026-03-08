import type { InvoiceSectionProps } from "@/types/invoice-template";
import { useSectionStyles } from "@/components/invoice/DesignConfigContext";
import { calculateTotals, formatCurrency } from "./utils";

const ItemsTable = ({ data, theme }: InvoiceSectionProps) => {
  const { style } = useSectionStyles("items");
  const totals = calculateTotals(data.items);

  return (
    <section className="rounded-2xl border border-slate-200" style={style}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.25em] opacity-70">
          Line items
        </p>
        <p className="text-sm opacity-70">
          Subtotal: {formatCurrency(totals.subtotal, data.business.currency)}
        </p>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] opacity-70">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Item</th>
              <th className="px-4 py-3 text-right font-medium">Qty</th>
              <th className="px-4 py-3 text-right font-medium">Rate</th>
              <th className="px-4 py-3 text-right font-medium">Tax</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => {
              const lineTotal = item.quantity * item.unitPrice;
              const taxAmount = lineTotal * ((item.taxRate ?? 0) / 100);
              return (
                <tr key={item.name} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.name}</p>
                    {item.description ? (
                      <p className="text-xs opacity-70">{item.description}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right opacity-80">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right opacity-80">
                    {formatCurrency(item.unitPrice, data.business.currency)}
                  </td>
                  <td className="px-4 py-3 text-right opacity-80">
                    {item.taxRate ?? 0}%
                  </td>
                  <td
                    className="px-4 py-3 text-right font-semibold"
                    style={{ color: theme.primaryColor }}
                  >
                    {formatCurrency(
                      lineTotal + taxAmount,
                      data.business.currency,
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ItemsTable;
