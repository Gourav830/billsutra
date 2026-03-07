"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview } from "@/lib/apiClient";
import DashNavbar from "@/components/dashboard/DashNav";
import MetricCard from "@/components/dashboard/metric-card";
import SalesChart from "@/components/dashboard/sales-chart";
import ProfitForecast from "@/components/dashboard/profit-forecast";
import InventoryOverview from "@/components/dashboard/inventory-overview";
import TransactionsTable from "@/components/dashboard/transactions-table";
import CustomerInsights from "@/components/dashboard/customer-insights";
import SupplierOverview from "@/components/dashboard/supplier-overview";
import CashFlowChart from "@/components/dashboard/cashflow-chart";
import QuickActions from "@/components/dashboard/quick-actions";
import ActivityTimeline from "@/components/dashboard/activity-timeline";
import NotificationsPanel from "@/components/dashboard/notifications-panel";
import {
  Banknote,
  ClipboardList,
  CreditCard,
  Package,
  TrendingUp,
  Wallet,
} from "lucide-react";

type DashboardClientProps = {
  name: string;
  image?: string;
};

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const DashboardClient = ({ name, image }: DashboardClientProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboardOverview,
  });

  const metrics = data?.metrics;
  const invoiceStats = data?.invoiceStats;

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#1f1b16]">
      <DashNavbar name={name} image={image} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
            Business analytics
          </p>
          <h1 className="text-3xl font-semibold">Welcome back, {name}.</h1>
          <p className="max-w-2xl text-sm text-[#5c4b3b]">
            A clean snapshot of revenue, cash flow, inventory health, and
            customer momentum.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && (
            <div className="col-span-full h-28 rounded-2xl bg-[#fdf7f1] animate-pulse" />
          )}
          {metrics && (
            <>
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(metrics.totalRevenue)}
                change={metrics.changes.totalRevenue}
                icon={<TrendingUp size={18} />}
              />
              <MetricCard
                title="Total Sales"
                value={formatCurrency(metrics.totalSales)}
                change={metrics.changes.totalSales}
                icon={<Banknote size={18} />}
              />
              <MetricCard
                title="Total Purchases"
                value={formatCurrency(metrics.totalPurchases)}
                change={metrics.changes.totalPurchases}
                icon={<ClipboardList size={18} />}
              />
              <MetricCard
                title="Pending Payments"
                value={formatCurrency(metrics.receivables)}
                change={metrics.changes.receivables}
                icon={<CreditCard size={18} />}
              />
              <MetricCard
                title="Supplier Payables"
                value={formatCurrency(metrics.payables)}
                change={metrics.changes.payables}
                icon={<Wallet size={18} />}
              />
              <MetricCard
                title="Inventory Value"
                value={formatCurrency(metrics.inventoryValue)}
                change={metrics.changes.inventoryValue}
                icon={<Package size={18} />}
              />
            </>
          )}
        </section>

        <SalesChart />

        <ProfitForecast />

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <InventoryOverview />
          <div className="grid gap-4">
            <CustomerInsights />
            <SupplierOverview />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <TransactionsTable />
          <div className="grid gap-4">
            <CashFlowChart />
            {invoiceStats && (
              <div className="rounded-2xl border border-[#ecdccf] bg-white/90 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
                  Invoice statistics
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Total", value: invoiceStats.total },
                    { label: "Paid", value: invoiceStats.paid },
                    { label: "Pending", value: invoiceStats.pending },
                    { label: "Overdue", value: invoiceStats.overdue },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-[#f2e6dc] bg-[#fff9f2] p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
                        {item.label}
                      </p>
                      <p className="mt-3 text-lg font-semibold text-[#1f1b16]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <QuickActions />
          <NotificationsPanel />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <ActivityTimeline />
          <div className="rounded-2xl border border-[#ecdccf] bg-white/90 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
              Empty states
            </p>
            <p className="mt-3 text-sm text-[#5c4b3b]">
              This panel intentionally reserves space for future widgets or
              notes.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardClient;
