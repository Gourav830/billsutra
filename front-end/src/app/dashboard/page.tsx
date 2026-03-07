import React from "react";
import DashNavbar from "../../components/dashboard/DashNav";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "../api/auth/[...nextauth]/options";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReportSummary from "@/components/dashboard/ReportSummary";
import BusinessCharts from "@/components/dashboard/BusinessCharts";

const Page = async () => {
  const session: CustomSession | null = await getServerSession(authOptions);
  const name = session?.user?.name || "Guest";

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#1f1b16]">
      <DashNavbar name={name} image={session?.user?.image || undefined} />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-[#f6a54a] via-[#f9d59b] to-transparent opacity-40 blur-2xl" />
        <div className="pointer-events-none absolute left-0 top-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#0f766e] via-[#9ae6b4] to-transparent opacity-30 blur-2xl" />

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-6 pt-10">
          <div className="flex flex-col gap-3">
            <p className="text-sm uppercase tracking-[0.2em] text-[#8a6d56]">
              Billing pulse
            </p>
            <h2 className="text-3xl font-black leading-tight md:text-4xl">
              Welcome back, {name.split(" ")[0]}.
              <span className="block text-[#b45309]">
                BillSutra is humming.
              </span>
            </h2>
            <p className="max-w-2xl text-base text-[#5c4b3b] md:text-lg">
              Track invoices, spot overdue accounts, and keep inventory healthy
              with a crisp, focused control room.
            </p>
          </div>

          <ReportSummary />

          <BusinessCharts />
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-16">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <Card className="border-[#ecdccf] bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg">Recent activity</CardTitle>
                <CardDescription>
                  Actionable touches over the last 2 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  "Invoice INV-2031 marked paid",
                  "New customer: Rhea onboarded",
                  "Purchase order PO-118 generated",
                  "Low stock alert: Ink cartridges",
                ].map((entry) => (
                  <div
                    key={entry}
                    className="flex items-center justify-between rounded-xl border border-[#f2e6dc] bg-[#fdf7f1] px-4 py-3 text-sm"
                  >
                    <span className="text-[#4b3a2a]">{entry}</span>
                    <span className="text-xs text-[#8a6d56]">Just now</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#ecdccf] bg-[#f8fafc]">
              <CardHeader>
                <CardTitle className="text-lg">Cashflow board</CardTitle>
                <CardDescription>
                  A glanceable rhythm of today&apos;s collections.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3">
                  {[
                    {
                      label: "Invoice batch",
                      time: "09:00",
                      tone: "bg-[#fde68a]",
                    },
                    {
                      label: "Payment run",
                      time: "13:30",
                      tone: "bg-[#99f6e4]",
                    },
                    {
                      label: "Stock review",
                      time: "16:00",
                      tone: "bg-[#fecdd3]",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-white px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#1f1b16]">
                          {item.label}
                        </p>
                        <p className="text-xs text-[#64748b]">Next event</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold text-[#1f1b16] ${item.tone}`}
                      >
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full rounded-xl border border-[#cbd5f5] bg-[#1e293b] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                  Open billing timeline
                </button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Page;
