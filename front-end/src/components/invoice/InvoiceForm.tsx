"use client";

import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { InvoiceFormState, TaxMode } from "@/types/invoice";

export type InvoiceFormProps = {
  form: InvoiceFormState;
  customers: Array<{ id: number; name: string; email?: string | null }>;
  warehouses: Array<{ id: number; name: string }>;
  taxMode: TaxMode;
  onFormChange: (next: InvoiceFormState) => void;
  onTaxModeChange: (mode: TaxMode) => void;
  onSubmit: (event: FormEvent) => void;
  isSubmitting?: boolean;
  summaryErrors: string[];
  serverError?: string | null;
};

const InvoiceForm = ({
  form,
  customers,
  warehouses,
  taxMode,
  onFormChange,
  onTaxModeChange,
  onSubmit,
  isSubmitting,
  summaryErrors,
  serverError,
}: InvoiceFormProps) => {
  return (
    <form
      className="no-print rounded-2xl border border-[#ecdccf] bg-white/90 p-6 shadow-[0_18px_40px_-30px_rgba(92,75,59,0.5)]"
      onSubmit={onSubmit}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#8a6d56]">
            Invoice details
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[#1f1b16]">
            Customer and dates
          </h2>
        </div>
        <span className="rounded-full border border-[#eadacc] bg-[#fff7ef] px-3 py-1 text-xs text-[#8a6d56]">
          Auto number
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]"
            htmlFor="customer"
          >
            Customer
          </Label>
          <select
            id="customer"
            className="h-10 w-full rounded-md border border-[#e4d6ca] bg-white px-3 text-sm text-[#1f1b16] shadow-sm focus:border-[#d6b38e] focus:outline-none focus:ring-2 focus:ring-[#d6b38e]/40"
            value={form.customer_id}
            onChange={(event) =>
              onFormChange({ ...form, customer_id: event.target.value })
            }
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} {customer.email ? `• ${customer.email}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]"
            htmlFor="invoice_date"
          >
            Invoice date
          </Label>
          <Input
            id="invoice_date"
            type="date"
            value={form.date}
            onChange={(event) =>
              onFormChange({ ...form, date: event.target.value })
            }
            className="h-10 border-[#e4d6ca] bg-white shadow-sm focus-visible:ring-[#d6b38e]/40"
          />
        </div>
        <div className="grid gap-2">
          <Label
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]"
            htmlFor="due_date"
          >
            Due date
          </Label>
          <Input
            id="due_date"
            type="date"
            value={form.due_date}
            onChange={(event) =>
              onFormChange({ ...form, due_date: event.target.value })
            }
            className="h-10 border-[#e4d6ca] bg-white shadow-sm focus-visible:ring-[#d6b38e]/40"
          />
        </div>
        <div className="grid gap-2">
          <Label
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]"
            htmlFor="tax_mode"
          >
            GST mode
          </Label>
          <select
            id="tax_mode"
            className="h-10 w-full rounded-md border border-[#e4d6ca] bg-white px-3 text-sm text-[#1f1b16] shadow-sm focus:border-[#d6b38e] focus:outline-none focus:ring-2 focus:ring-[#d6b38e]/40"
            value={taxMode}
            onChange={(event) => onTaxModeChange(event.target.value as TaxMode)}
          >
            <option value="CGST_SGST">CGST + SGST</option>
            <option value="IGST">IGST</option>
            <option value="NONE">No GST</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]"
            htmlFor="discount"
          >
            Discount
          </Label>
          <Input
            id="discount"
            type="number"
            value={form.discount}
            onChange={(event) =>
              onFormChange({ ...form, discount: event.target.value })
            }
            className="h-10 border-[#e4d6ca] bg-white shadow-sm focus-visible:ring-[#d6b38e]/40"
          />
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]"
            htmlFor="notes"
          >
            Notes
          </Label>
          <Input
            id="notes"
            value={form.notes}
            onChange={(event) =>
              onFormChange({ ...form, notes: event.target.value })
            }
            placeholder="Optional notes for the customer"
            className="h-10 border-[#e4d6ca] bg-white shadow-sm focus-visible:ring-[#d6b38e]/40"
          />
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-start gap-3 rounded-xl border border-[#eadacc] bg-[#fff7ef] p-3">
            <input
              id="sync_sales"
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[#8a6d56]"
              checked={form.sync_sales}
              onChange={(event) =>
                onFormChange({ ...form, sync_sales: event.target.checked })
              }
            />
            <div>
              <Label
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]"
                htmlFor="sync_sales"
              >
                Sync with sales and inventory
              </Label>
              <p className="mt-1 text-xs text-[#8a6d56]">
                Creates a sales record and deducts stock from inventory.
              </p>
            </div>
          </div>
        </div>
        {form.sync_sales && (
          <div className="grid gap-2 sm:col-span-2">
            <Label
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]"
              htmlFor="warehouse"
            >
              Warehouse for stock sync
            </Label>
            <select
              id="warehouse"
              className="h-10 w-full rounded-md border border-[#e4d6ca] bg-white px-3 text-sm text-[#1f1b16] shadow-sm focus:border-[#d6b38e] focus:outline-none focus:ring-2 focus:ring-[#d6b38e]/40"
              value={form.warehouse_id ?? ""}
              onChange={(event) =>
                onFormChange({ ...form, warehouse_id: event.target.value })
              }
            >
              <option value="">Select warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {summaryErrors.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#f5d0b5] bg-[#fff5ea] p-4 text-sm text-[#b45309]">
          {summaryErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}

      {serverError && (
        <p className="mt-4 text-sm text-[#b45309]">{serverError}</p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
          Invoice number is generated automatically.
        </div>
        <Button
          type="submit"
          className="bg-[#1f1b16] text-white shadow-[0_10px_20px_-12px_rgba(31,27,22,0.6)] hover:bg-[#2c2520]"
          disabled={isSubmitting}
        >
          Create invoice
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;
