"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import DashNavbar from "@/components/dashboard/DashNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInvoicesQuery } from "@/hooks/useInventoryQueries";
import type { Invoice } from "@/lib/apiClient";

type InvoicesHistoryClientProps = {
  name: string;
  image?: string;
};

const formatCurrency = (value: string) => {
  const amount = Number(value || 0);
  return `INR ${amount.toFixed(2)}`;
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN");
};

const InvoicesHistoryClient = ({ name, image }: InvoicesHistoryClientProps) => {
  const { data, isLoading, isError } = useInvoicesQuery();
  const [query, setQuery] = useState("");

  const invoices = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return invoices;
    return invoices.filter((invoice) =>
      invoice.invoice_number?.toLowerCase().includes(normalized),
    );
  }, [invoices, query]);

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#1f1b16]">
      <DashNavbar name={name} image={image} />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8a6d56]">
            Invoices
          </p>
          <h1 className="text-3xl font-black">Invoice history</h1>
          <p className="max-w-2xl text-base text-[#5c4b3b]">
            Search completed invoices by their unique invoice number.
          </p>
        </div>

        <section className="mt-6 grid gap-6">
          <div className="rounded-2xl border border-[#ecdccf] bg-white/90 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Search invoices</h2>
                <p className="text-sm text-[#8a6d56]">
                  Type an invoice number like INV-0001.
                </p>
              </div>
              <div className="flex w-full max-w-md items-center gap-2">
                <Input
                  placeholder="Search by invoice number"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setQuery("")}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ecdccf] bg-white/90 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Results</h2>
              <span className="text-sm text-[#8a6d56]">
                {filtered.length} shown
              </span>
            </div>

            <div className="mt-4">
              {isLoading && (
                <p className="text-sm text-[#8a6d56]">Loading invoices...</p>
              )}
              {isError && (
                <p className="text-sm text-[#b45309]">
                  Failed to load invoices.
                </p>
              )}
              {!isLoading && !isError && filtered.length === 0 && (
                <p className="text-sm text-[#8a6d56]">No invoices found.</p>
              )}
              {!isLoading && !isError && filtered.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-[#f2e6dc]">
                  <table className="min-w-full divide-y divide-[#f2e6dc] text-sm">
                    <thead className="bg-[#fff9f2]">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">
                          Invoice No.
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Total
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2e6dc]">
                      {filtered.map((invoice: Invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-4 py-3 font-semibold">
                            {invoice.invoice_number}
                          </td>
                          <td className="px-4 py-3">
                            {invoice.customer?.name || "-"}
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(invoice.date)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full border border-[#eadacc] bg-[#fff7ef] px-2 py-1 text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(invoice.total)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button asChild variant="outline" className="h-8">
                              <Link href={`/invoices/history/${invoice.id}`}>
                                View
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default InvoicesHistoryClient;
