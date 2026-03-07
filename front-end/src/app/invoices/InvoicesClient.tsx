"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import DashNavbar from "@/components/dashboard/DashNav";
import { Button } from "@/components/ui/button";
import InvoiceTemplate from "@/components/invoice/InvoiceTemplate";
import InvoiceForm, {
  InvoiceFormState,
  TaxMode,
} from "@/components/invoice/InvoiceForm";
import InvoiceTable, {
  InvoiceItemForm,
  InvoiceItemError,
} from "@/components/invoice/InvoiceTable";
import {
  useCreateInvoiceMutation,
  useCustomersQuery,
  useProductsQuery,
  useWarehousesQuery,
} from "@/hooks/useInventoryQueries";

type InvoiceClientProps = {
  name: string;
  image?: string;
};

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;
const DRAFTS_KEY = "billSutra:invoiceDrafts";

type InvoiceDraft = {
  id: string;
  savedAt: string;
  form: InvoiceFormState;
  taxMode: TaxMode;
  items: InvoiceItemForm[];
};

const loadDrafts = (): InvoiceDraft[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(DRAFTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as InvoiceDraft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveDrafts = (drafts: InvoiceDraft[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
};

const formatRelativeTime = (value: Date) => {
  const diffMs = Date.now() - value.getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const InvoiceClient = ({ name, image }: InvoiceClientProps) => {
  const { data: customers } = useCustomersQuery();
  const { data: products } = useProductsQuery();
  const { data: warehouses } = useWarehousesQuery();
  const createInvoice = useCreateInvoiceMutation();

  const [form, setForm] = useState<InvoiceFormState>({
    customer_id: "",
    date: "",
    due_date: "",
    discount: "0",
    notes: "",
    sync_sales: true,
    warehouse_id: "",
  });
  const [taxMode, setTaxMode] = useState<TaxMode>("CGST_SGST");
  const [items, setItems] = useState<InvoiceItemForm[]>([
    { product_id: "", name: "", quantity: "1", price: "", tax_rate: "" },
  ]);
  const [itemErrors, setItemErrors] = useState<InvoiceItemError[]>([]);
  const [summaryErrors, setSummaryErrors] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [drafts, setDrafts] = useState<InvoiceDraft[]>([]);

  const parseServerErrors = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as
        | { message?: string; errors?: Record<string, string[] | string> }
        | undefined;
      const messages = new Set<string>();
      if (data?.message) messages.add(data.message);
      if (data?.errors) {
        Object.values(data.errors).forEach((values) => {
          const list = Array.isArray(values) ? values : [values];
          list.forEach((value) => messages.add(value));
        });
      }
      if (messages.size) return Array.from(messages).join(" ");
    }
    return fallback;
  };

  const handleItemChange = (
    index: number,
    key: keyof InvoiceItemForm,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [key]: value } : item,
      ),
    );
    setItemErrors([]);
    setSummaryErrors([]);
    setServerError(null);
    setIsDirty(true);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = (products ?? []).find(
      (item) => String(item.id) === productId,
    );
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              product_id: productId,
              name: product?.name ?? item.name,
              price: product?.price ? String(product.price) : item.price,
              tax_rate: product?.gst_rate
                ? String(product.gst_rate)
                : item.tax_rate,
            }
          : item,
      ),
    );
    setItemErrors([]);
    setSummaryErrors([]);
    setServerError(null);
    setIsDirty(true);
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { product_id: "", name: "", quantity: "1", price: "", tax_rate: "" },
    ]);
    setItemErrors([]);
    setSummaryErrors([]);
    setServerError(null);
    setIsDirty(true);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
    setItemErrors([]);
    setSummaryErrors([]);
    setServerError(null);
    setIsDirty(true);
  };

  const handleFormChange = (next: InvoiceFormState) => {
    setForm(next);
    setSummaryErrors([]);
    setServerError(null);
    setIsDirty(true);
  };

  const handleTaxModeChange = (mode: TaxMode) => {
    setTaxMode(mode);
    setSummaryErrors([]);
    setServerError(null);
    setIsDirty(true);
  };

  const validation = useMemo(() => {
    const errors: InvoiceItemError[] = items.map(() => ({}));
    const summary: string[] = [];
    let missingCustomer = false;
    let missingProduct = false;
    let missingWarehouse = false;
    let invalidQuantity = false;
    let invalidPrice = false;
    let invalidTax = false;

    if (!form.customer_id) {
      missingCustomer = true;
      summary.push("Select a customer.");
    }

    if (form.sync_sales && !form.warehouse_id) {
      missingWarehouse = true;
      summary.push("Select a warehouse to sync inventory.");
    }

    items.forEach((item, index) => {
      if (!item.product_id) {
        errors[index].product_id = "Select a product.";
        missingProduct = true;
      }
      if (!item.name.trim()) {
        errors[index].name = "Enter an item name.";
      }

      const quantity = Number(item.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        errors[index].quantity = "Quantity must be greater than 0.";
        invalidQuantity = true;
      }

      const price = Number(item.price);
      if (!Number.isFinite(price) || price <= 0) {
        errors[index].price = "Price must be greater than 0.";
        invalidPrice = true;
      }

      if (item.tax_rate) {
        const taxRate = Number(item.tax_rate);
        if (!Number.isFinite(taxRate) || taxRate < 0) {
          errors[index].tax_rate = "Tax rate must be 0 or higher.";
          invalidTax = true;
        }
      }
    });

    if (
      missingCustomer ||
      missingProduct ||
      missingWarehouse ||
      invalidQuantity ||
      invalidPrice ||
      invalidTax
    ) {
      if (missingProduct) summary.push("Select a product for each line item.");
      if (missingWarehouse)
        summary.push("Choose a warehouse when syncing inventory.");
      if (invalidQuantity)
        summary.push("Ensure quantities are valid numbers greater than 0.");
      if (invalidPrice) summary.push("Enter a valid price for each item.");
      if (invalidTax)
        summary.push("Tax rates must be 0 or higher when provided.");
    }

    return { errors, summary };
  }, [items, form.customer_id, form.sync_sales, form.warehouse_id]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    items.forEach((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const taxRate = Number(item.tax_rate) || 0;
      const lineSubtotal = quantity * price;
      const lineTax = taxMode === "NONE" ? 0 : (lineSubtotal * taxRate) / 100;

      subtotal += lineSubtotal;
      tax += lineTax;

      if (taxMode === "CGST_SGST") {
        cgst += lineTax / 2;
        sgst += lineTax / 2;
      } else if (taxMode === "IGST") {
        igst += lineTax;
      }
    });

    const discount = Math.max(0, Number(form.discount) || 0);
    const total = subtotal + tax - discount;

    return {
      subtotal: round2(subtotal),
      tax: round2(tax),
      cgst: round2(cgst),
      sgst: round2(sgst),
      igst: round2(igst),
      discount: round2(discount),
      total: round2(Math.max(0, total)),
    };
  }, [items, form.discount, taxMode]);

  const templateItems = useMemo(() => {
    return items.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const taxRate = Number(item.tax_rate) || 0;
      const lineSubtotal = quantity * price;
      const lineTax = taxMode === "NONE" ? 0 : (lineSubtotal * taxRate) / 100;
      return {
        name: item.name || "Item",
        quantity,
        price,
        tax_rate: item.tax_rate ? Number(item.tax_rate) : 0,
        total: round2(lineSubtotal + lineTax),
      };
    });
  }, [items, taxMode]);

  const customer = useMemo(
    () =>
      (customers ?? []).find((item) => String(item.id) === form.customer_id),
    [customers, form.customer_id],
  );

  const customerNameById = useMemo(() => {
    const map = new Map<string, string>();
    (customers ?? []).forEach((item) => {
      map.set(String(item.id), item.name);
    });
    return map;
  }, [customers]);

  const invoiceDate = form.date
    ? new Date(form.date).toLocaleDateString("en-IN")
    : new Date().toLocaleDateString("en-IN");

  const persistDraft = useCallback(
    (createNew: boolean) => {
      const id = createNew || !draftId ? `draft-${Date.now()}` : draftId;
      const savedAt = new Date().toISOString();
      const draft: InvoiceDraft = {
        id,
        savedAt,
        form,
        taxMode,
        items,
      };
      const nextDrafts = loadDrafts().filter((item) => item.id !== id);
      nextDrafts.unshift(draft);
      const trimmed = nextDrafts.slice(0, 20);
      saveDrafts(trimmed);
      setDrafts(trimmed);
      setDraftId(id);
      setLastSavedAt(new Date(savedAt));
      setIsDirty(false);
    },
    [draftId, form, items, taxMode],
  );

  const clearDraft = useCallback(() => {
    if (!draftId) return;
    const nextDrafts = loadDrafts().filter((item) => item.id !== draftId);
    saveDrafts(nextDrafts);
    setDrafts(nextDrafts);
    setDraftId(null);
    setLastSavedAt(null);
    setIsDirty(false);
  }, [draftId]);

  const loadDraft = useCallback((draft: InvoiceDraft) => {
    setDraftId(draft.id);
    setForm({
      ...draft.form,
      sync_sales: draft.form.sync_sales ?? true,
      warehouse_id: draft.form.warehouse_id ?? "",
    });
    setTaxMode(draft.taxMode);
    setItems(draft.items);
    setLastSavedAt(new Date(draft.savedAt));
    setIsDirty(false);
  }, []);

  const deleteDraft = useCallback(
    (id: string) => {
      const nextDrafts = loadDrafts().filter((item) => item.id !== id);
      saveDrafts(nextDrafts);
      setDrafts(nextDrafts);
      if (draftId === id) {
        setDraftId(null);
        setLastSavedAt(null);
        setIsDirty(false);
      }
    },
    [draftId],
  );

  useEffect(() => {
    const storedDrafts = loadDrafts();
    setDrafts(storedDrafts);
    if (storedDrafts.length === 0) return;
    const [latest] = storedDrafts.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
    loadDraft(latest);
  }, [loadDraft]);

  useEffect(() => {
    if (!isDirty) return;
    const handle = window.setTimeout(() => {
      persistDraft(false);
    }, 1500);
    return () => window.clearTimeout(handle);
  }, [isDirty, form, items, taxMode, persistDraft]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const startX = 14;
    let cursorY = 18;
    const accent = [138, 109, 86] as const;
    const text = [31, 27, 22] as const;
    const soft = [249, 242, 234] as const;
    const softAlt = [255, 250, 245] as const;

    pdf.setFontSize(16);
    pdf.setTextColor(...text);
    pdf.text("BillSutra", startX, cursorY);
    pdf.setFontSize(10);
    pdf.setTextColor(...accent);
    pdf.text(`Invoice No: INV-NEW`, startX, cursorY + 8);
    pdf.text(`Invoice Date: ${invoiceDate}`, startX, cursorY + 15);

    cursorY += 26;
    pdf.setFontSize(11);
    pdf.setTextColor(...accent);
    pdf.text("Bill To", startX, cursorY);
    pdf.setFontSize(10);
    pdf.setTextColor(...text);
    pdf.text(customer?.name ?? "Customer", startX, cursorY + 6);
    if (customer?.email) pdf.text(customer.email, startX, cursorY + 12);
    if (customer?.phone) pdf.text(customer.phone, startX, cursorY + 18);
    if (customer?.address) pdf.text(customer.address, startX, cursorY + 24);

    const tableStart = cursorY + 30;
    autoTable(pdf, {
      startY: tableStart,
      head: [["Item", "Qty", "Price", "GST %", "Line Total"]],
      body: templateItems.map((item) => [
        item.name,
        String(item.quantity),
        formatCurrency(item.price),
        String(item.tax_rate ?? 0),
        formatCurrency(item.total),
      ]),
      styles: { fontSize: 9, textColor: text, cellPadding: 3 },
      headStyles: { fillColor: soft, textColor: accent, fontStyle: "bold" },
      alternateRowStyles: { fillColor: softAlt },
      tableLineColor: [231, 220, 208],
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
      },
    });

    const afterTable = (pdf as jsPDF & { lastAutoTable?: { finalY: number } })
      .lastAutoTable?.finalY;
    const totalsY = (afterTable ?? tableStart) + 8;
    const labelX = 130;
    const valueX = 190;

    pdf.setFontSize(10);
    pdf.setTextColor(...accent);
    pdf.text("Subtotal", labelX, totalsY, { align: "left" });
    pdf.setTextColor(...text);
    pdf.text(formatCurrency(totals.subtotal), valueX, totalsY, {
      align: "right",
    });

    let offset = 6;
    if (taxMode !== "NONE") {
      pdf.setTextColor(...accent);
      pdf.text("GST", labelX, totalsY + offset, { align: "left" });
      pdf.setTextColor(...text);
      pdf.text(formatCurrency(totals.tax), valueX, totalsY + offset, {
        align: "right",
      });
      offset += 6;
    }

    if (totals.discount) {
      pdf.setTextColor(...accent);
      pdf.text("Discount", labelX, totalsY + offset, { align: "left" });
      pdf.setTextColor(...text);
      pdf.text(
        `-${formatCurrency(totals.discount)}`,
        valueX,
        totalsY + offset,
        {
          align: "right",
        },
      );
      offset += 6;
    }

    const totalY = totalsY + offset + 2;
    pdf.setDrawColor(231, 220, 208);
    pdf.setFillColor(...softAlt);
    pdf.roundedRect(labelX - 6, totalY - 5, 66, 10, 2, 2, "F");
    pdf.setFontSize(11);
    pdf.setTextColor(...text);
    pdf.text("Total", labelX, totalY, { align: "left" });
    pdf.text(formatCurrency(totals.total), valueX, totalY, {
      align: "right",
    });

    pdf.save("invoice.pdf");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);

    setItemErrors(validation.errors);
    setSummaryErrors(validation.summary);
    if (validation.summary.length > 0) return;

    try {
      await createInvoice.mutateAsync({
        customer_id: Number(form.customer_id),
        date: form.date || undefined,
        due_date: form.due_date || undefined,
        discount: totals.discount || undefined,
        sync_sales: form.sync_sales,
        warehouse_id: form.warehouse_id ? Number(form.warehouse_id) : undefined,
        items: items.map((item) => ({
          product_id: item.product_id ? Number(item.product_id) : undefined,
          name: item.name.trim(),
          quantity: Number(item.quantity),
          price: Number(item.price),
          tax_rate: item.tax_rate ? Number(item.tax_rate) : undefined,
        })),
      });

      setForm({
        customer_id: "",
        date: "",
        due_date: "",
        discount: "0",
        notes: "",
        sync_sales: true,
        warehouse_id: "",
      });
      setItems([
        { product_id: "", name: "", quantity: "1", price: "", tax_rate: "" },
      ]);
      setItemErrors([]);
      setSummaryErrors([]);
      clearDraft();
    } catch (error) {
      setServerError(parseServerErrors(error, "Unable to create invoice."));
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(80%_60%_at_8%_8%,#fff2e5_0%,transparent_60%),radial-gradient(70%_55%_at_90%_0%,#f7e3cf_0%,transparent_55%),#f7f3ee] text-[#1f1b16] font-[family:var(--font-sora),var(--font-geist-sans)]">
      <div className="no-print">
        <DashNavbar name={name} image={image} />
      </div>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-[#e8d9cc] bg-white/80 p-6 shadow-[0_20px_40px_-30px_rgba(92,75,59,0.6)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#8a6d56]">
                Invoices
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Create invoice
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c4b3b]">
                Build GST-ready invoices with live totals, customer details, and
                preview-ready layouts for printing.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2">
              <span className="rounded-full border border-[#e8d9cc] bg-[#fff7ef] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[#8a6d56]">
                {isDirty ? "Draft" : "Saved"}
              </span>
              <span className="text-xs text-[#8a6d56]">
                {isDirty
                  ? "Unsaved changes"
                  : lastSavedAt
                    ? `Saved ${formatRelativeTime(lastSavedAt)}`
                    : "Ready"}
              </span>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/invoices/history">View invoice history</Link>
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-[#8a6d56]">
            <span className="rounded-full border border-[#e8d9cc] bg-white px-3 py-1">
              Live totals
            </span>
            <span className="rounded-full border border-[#e8d9cc] bg-white px-3 py-1">
              GST ready
            </span>
            <span className="rounded-full border border-[#e8d9cc] bg-white px-3 py-1">
              Print preview
            </span>
          </div>
        </div>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="grid gap-6">
            <InvoiceForm
              form={form}
              customers={customers ?? []}
              warehouses={warehouses ?? []}
              taxMode={taxMode}
              onFormChange={handleFormChange}
              onTaxModeChange={handleTaxModeChange}
              onSubmit={handleSubmit}
              isSubmitting={createInvoice.isPending}
              summaryErrors={summaryErrors}
              serverError={serverError}
            />
            <InvoiceTable
              items={items}
              errors={itemErrors}
              products={products ?? []}
              onItemChange={handleItemChange}
              onProductSelect={handleProductSelect}
              onAddItem={addItem}
              onRemoveItem={removeItem}
            />
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-8">
            <div className="printable">
              <InvoiceTemplate
                logoUrl={undefined}
                businessName="BillSutra"
                invoiceNumber="INV-NEW"
                invoiceDate={invoiceDate}
                customerName={customer?.name ?? "Customer"}
                customerEmail={customer?.email ?? null}
                customerPhone={customer?.phone ?? null}
                customerAddress={customer?.address ?? null}
                items={templateItems}
                totals={totals}
                gstMode={taxMode}
              />
            </div>

            <div className="no-print rounded-2xl border border-[#ecdccf] bg-white/90 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
                  Draft
                </p>
                <span className="rounded-full border border-[#eadacc] bg-[#fff7ef] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#8a6d56]">
                  {isDirty ? "Unsaved" : "Saved"}
                </span>
              </div>
              <p className="mt-3 text-sm text-[#5c4b3b]">
                {lastSavedAt
                  ? `Saved ${formatRelativeTime(lastSavedAt)}.`
                  : "Save a draft to continue later without submitting the invoice."}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => persistDraft(true)}
              >
                Save draft
              </Button>
            </div>

            <div className="no-print rounded-2xl border border-[#ecdccf] bg-white/90 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
                  Recent drafts
                </p>
                <span className="text-xs text-[#8a6d56]">
                  {drafts.length} total
                </span>
              </div>
              {drafts.length === 0 ? (
                <p className="mt-3 text-sm text-[#5c4b3b]">
                  No saved drafts yet.
                </p>
              ) : (
                <div className="mt-4 grid gap-3">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="rounded-xl border border-[#f0e2d6] bg-[#fff7ef] p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#1f1b16]">
                            {draft.form.customer_id
                              ? (customerNameById.get(draft.form.customer_id) ??
                                `Customer #${draft.form.customer_id}`)
                              : "Untitled draft"}
                          </p>
                          <p className="text-xs text-[#8a6d56]">
                            Saved {formatRelativeTime(new Date(draft.savedAt))}
                          </p>
                        </div>
                        {draftId === draft.id && (
                          <span className="rounded-full border border-[#eadacc] bg-white px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#8a6d56]">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => loadDraft(draft)}
                        >
                          Load
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          className="h-8 px-3 text-xs"
                          onClick={() => deleteDraft(draft.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="no-print rounded-2xl border border-[#ecdccf] bg-white/90 p-6">
              <h3 className="text-lg font-semibold">Totals</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a6d56]">Subtotal</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                {taxMode === "CGST_SGST" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8a6d56]">CGST</span>
                      <span>₹{totals.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8a6d56]">SGST</span>
                      <span>₹{totals.sgst.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {taxMode === "IGST" && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a6d56]">IGST</span>
                    <span>₹{totals.igst.toFixed(2)}</span>
                  </div>
                )}
                {taxMode !== "NONE" && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a6d56]">Total GST</span>
                    <span>₹{totals.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#8a6d56]">Discount</span>
                  <span>₹{totals.discount.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="no-print rounded-2xl border border-[#ecdccf] bg-[#fff5ea] p-6 text-sm text-[#5c4b3b]">
              <p className="font-semibold text-[#1f1b16]">GST note</p>
              <p className="mt-2">
                Choose CGST + SGST for intra-state invoices and IGST for
                inter-state billing. Use “No GST” for exempt invoices.
              </p>
            </div>

            <div className="no-print flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handlePrint}>
                Print invoice
              </Button>
              <Button type="button" onClick={handleDownloadPdf}>
                Download PDF
              </Button>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default InvoiceClient;
