"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type InvoiceItemForm = {
  product_id: string;
  name: string;
  quantity: string;
  price: string;
  tax_rate: string;
};

export type InvoiceItemError = {
  product_id?: string;
  name?: string;
  quantity?: string;
  price?: string;
  tax_rate?: string;
};

export type InvoiceTableProps = {
  items: InvoiceItemForm[];
  errors: InvoiceItemError[];
  products: Array<{
    id: number;
    name: string;
    sku: string;
    price: string;
    gst_rate: string;
  }>;
  onItemChange: (
    index: number,
    key: keyof InvoiceItemForm,
    value: string,
  ) => void;
  onProductSelect: (index: number, productId: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
};

const InvoiceTable = ({
  items,
  errors,
  products,
  onItemChange,
  onProductSelect,
  onAddItem,
  onRemoveItem,
}: InvoiceTableProps) => {
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[#8a6d56]">
            Line items
          </p>
          <h2 className="mt-2 text-lg font-semibold">Invoice items</h2>
        </div>
        <Button type="button" variant="outline" onClick={onAddItem}>
          Add item
        </Button>
      </div>

      <div className="mt-4 grid gap-3">
        {items.map((item, index) => (
          <div
            key={`item-${index}`}
            className="grid gap-3 rounded-2xl border border-[#f0e2d6] bg-white p-4 shadow-[0_12px_30px_-24px_rgba(92,75,59,0.5)] md:grid-cols-[1.2fr_1fr_0.6fr_0.7fr_0.6fr_auto]"
          >
            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]">
                Product
              </Label>
              <select
                className="h-10 w-full rounded-md border border-[#e4d6ca] bg-white px-3 text-sm text-[#1f1b16] shadow-sm focus:border-[#d6b38e] focus:outline-none focus:ring-2 focus:ring-[#d6b38e]/40"
                value={item.product_id}
                onChange={(event) => onProductSelect(index, event.target.value)}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} • {product.sku}
                  </option>
                ))}
              </select>
              {errors[index]?.product_id && (
                <p className="text-xs text-[#b45309]">
                  {errors[index]?.product_id}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]">
                Name
              </Label>
              <Input
                value={item.name}
                onChange={(event) =>
                  onItemChange(index, "name", event.target.value)
                }
                className="h-10 border-[#e4d6ca] bg-white shadow-sm focus-visible:ring-[#d6b38e]/40"
              />
              {errors[index]?.name && (
                <p className="text-xs text-[#b45309]">{errors[index]?.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]">
                Qty
              </Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(event) =>
                  onItemChange(index, "quantity", event.target.value)
                }
                className="h-10 border-[#e4d6ca] bg-white shadow-sm focus-visible:ring-[#d6b38e]/40"
              />
              {errors[index]?.quantity && (
                <p className="text-xs text-[#b45309]">
                  {errors[index]?.quantity}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]">
                Price
              </Label>
              <Input
                type="number"
                value={item.price}
                onChange={(event) =>
                  onItemChange(index, "price", event.target.value)
                }
                className="h-10 border-[#e4d6ca] bg-white shadow-sm focus-visible:ring-[#d6b38e]/40"
              />
              {errors[index]?.price && (
                <p className="text-xs text-[#b45309]">{errors[index]?.price}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d56]">
                GST %
              </Label>
              <Input
                type="number"
                value={item.tax_rate}
                onChange={(event) =>
                  onItemChange(index, "tax_rate", event.target.value)
                }
                className="h-10 border-[#e4d6ca] bg-white shadow-sm focus-visible:ring-[#d6b38e]/40"
              />
              {errors[index]?.tax_rate && (
                <p className="text-xs text-[#b45309]">
                  {errors[index]?.tax_rate}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="destructive"
                onClick={() => onRemoveItem(index)}
                disabled={items.length === 1}
                className="h-10"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvoiceTable;
