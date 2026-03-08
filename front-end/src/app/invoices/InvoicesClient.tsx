"use client";

import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import DashNavbar from "@/components/dashboard/DashNav";
import InvoiceTemplate from "@/components/invoice/InvoiceTemplate";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoiceTable from "@/components/invoice/InvoiceTable";
import InvoiceHeader from "@/components/invoice/InvoiceHeader";
import InvoiceTotals from "@/components/invoice/InvoiceTotals";
import InvoiceDraftPanel from "@/components/invoice/InvoiceDraftPanel";
import InvoiceDraftList from "@/components/invoice/InvoiceDraftList";
import InvoiceActions from "@/components/invoice/InvoiceActions";
import { useInvoiceTotals } from "@/hooks/invoice/useInvoiceTotals";
import { useInvoiceValidation } from "@/hooks/invoice/useInvoiceValidation";
import { useInvoiceDrafts } from "@/hooks/invoice/useInvoiceDrafts";
import { useInvoicePdf } from "@/hooks/invoice/useInvoicePdf";
import type {
  InvoiceDraft,
  InvoiceFormState,
  InvoiceItemError,
  InvoiceItemForm,
  TaxMode,
} from "@/types/invoice";
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

const InvoiceClient = ({ name, image }: InvoiceClientProps) => {
  const { data: customers } = useCustomersQuery();
  const { data: products } = useProductsQuery();
  const { data: warehouses } = useWarehousesQuery();
  const createInvoice = useCreateInvoiceMutation();
  const { downloadPdf } = useInvoicePdf();

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
  const validation = useInvoiceValidation(form, items);
  const totals = useInvoiceTotals(items, form.discount, taxMode);

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

  const invoiceDate = useMemo(
    () =>
      form.date
        ? new Date(form.date).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN"),
    [form.date],
  );

  const handleLoadDraft = useCallback((draft: InvoiceDraft) => {
    setForm({
      ...draft.form,
      sync_sales: draft.form.sync_sales ?? true,
      warehouse_id: draft.form.warehouse_id ?? "",
    });
    setTaxMode(draft.taxMode);
    setItems(draft.items);
    setItemErrors([]);
    setSummaryErrors([]);
    setServerError(null);
  }, []);

  const {
    drafts,
    draftId,
    lastSavedAt,
    isDirty,
    markDirty,
    saveNewDraft,
    loadDraft,
    deleteDraft,
    clearDraft,
  } = useInvoiceDrafts({
    form,
    items,
    taxMode,
    onLoadDraft: handleLoadDraft,
  });

  const handleItemChange = useCallback(
    (index: number, key: keyof InvoiceItemForm, value: string) => {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === index ? { ...item, [key]: value } : item,
        ),
      );
      setItemErrors([]);
      setSummaryErrors([]);
      setServerError(null);
      markDirty();
    },
    [markDirty],
  );

  const handleProductSelect = useCallback(
    (index: number, productId: string) => {
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
      markDirty();
    },
    [markDirty, products],
  );

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { product_id: "", name: "", quantity: "1", price: "", tax_rate: "" },
    ]);
    setItemErrors([]);
    setSummaryErrors([]);
    setServerError(null);
    markDirty();
  }, [markDirty]);

  const removeItem = useCallback(
    (index: number) => {
      setItems((prev) => prev.filter((_, idx) => idx !== index));
      setItemErrors([]);
      setSummaryErrors([]);
      setServerError(null);
      markDirty();
    },
    [markDirty],
  );

  const handleFormChange = useCallback(
    (next: InvoiceFormState) => {
      setForm(next);
      setSummaryErrors([]);
      setServerError(null);
      markDirty();
    },
    [markDirty],
  );

  const handleTaxModeChange = useCallback(
    (mode: TaxMode) => {
      setTaxMode(mode);
      setSummaryErrors([]);
      setServerError(null);
      markDirty();
    },
    [markDirty],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPdf = useCallback(() => {
    downloadPdf({
      businessName: "BillSutra",
      invoiceNumber: "INV-NEW",
      invoiceDate,
      customer: customer
        ? {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
          }
        : null,
      items: templateItems,
      totals,
      taxMode,
    });
  }, [customer, downloadPdf, invoiceDate, taxMode, templateItems, totals]);

  const handleSubmit = async (event: FormEvent) => {
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
      setServerError(null);
      clearDraft();
    } catch (error) {
      setServerError(parseServerErrors(error, "Unable to create invoice."));
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(80%_60%_at_8%_8%,#fff2e5_0%,transparent_60%),radial-gradient(70%_55%_at_90%_0%,#f7e3cf_0%,transparent_55%),#f7f3ee] text-[#1f1b16] font-[var(--font-sora),var(--font-geist-sans)]">
      <div className="no-print">
        <DashNavbar name={name} image={image} />
      </div>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <InvoiceHeader isDirty={isDirty} lastSavedAt={lastSavedAt} />

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

            <InvoiceDraftPanel
              isDirty={isDirty}
              lastSavedAt={lastSavedAt}
              onSaveDraft={saveNewDraft}
            />
            <InvoiceDraftList
              drafts={drafts}
              currentDraftId={draftId}
              customerNameById={customerNameById}
              onLoadDraft={loadDraft}
              onDeleteDraft={deleteDraft}
            />
            <InvoiceTotals totals={totals} taxMode={taxMode} />
            <div className="no-print rounded-2xl border border-[#ecdccf] bg-[#fff5ea] p-6 text-sm text-[#5c4b3b]">
              <p className="font-semibold text-[#1f1b16]">GST note</p>
              <p className="mt-2">
                Choose CGST + SGST for intra-state invoices and IGST for
                inter-state billing. Use “No GST” for exempt invoices.
              </p>
            </div>
            <InvoiceActions
              onPrint={handlePrint}
              onDownloadPdf={handleDownloadPdf}
            />
          </aside>
        </section>
      </main>
    </div>
  );
};

export default InvoiceClient;
