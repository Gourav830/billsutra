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

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-[#ecdccf] bg-white/80">
              <CardHeader>
                <CardTitle className="text-xl">Invoice Overview</CardTitle>
                <CardDescription>
                  Live momentum across invoices, payments, and collections.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Draft invoices", value: "18", delta: "+6" },
                    { label: "Paid today", value: "2,482", delta: "+14%" },
                    { label: "Avg. pay time", value: "3.2d", delta: "-12%" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-[#f2e6dc] bg-[#fff9f2] p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-[#8a6d56]">
                        {item.label}
                      </p>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-2xl font-black text-[#1f1b16]">
                          {item.value}
                        </span>
                        <span className="rounded-full bg-[#fef3c7] px-2 py-1 text-xs font-semibold text-[#92400e]">
                          {item.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-[#f2e6dc] bg-[#1f1b16] p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#f9d59b]">
                        Collections
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">
                        Collections queue is clear
                      </h3>
                    </div>
                    <button className="rounded-full bg-[#f6a54a] px-4 py-2 text-sm font-semibold text-[#1f1b16] shadow-sm transition hover:-translate-y-0.5">
                      Review cashflow
                    </button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      "0 invoices past due today",
                      "Auto-reminders: 12 sent",
                    ].map((line) => (
                      <div
                        key={line}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card className="border-[#ecdccf] bg-[#fff5ea]">
                <CardHeader>
                  <CardTitle className="text-lg">Inventory health</CardTitle>
                  <CardDescription>
                    Top stock groups moving fast today.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {[
                    { name: "Fast movers", pct: 72, tone: "bg-[#0f766e]" },
                    { name: "Low stock", pct: 58, tone: "bg-[#b45309]" },
                    { name: "Reorder queued", pct: 44, tone: "bg-[#334155]" },
                  ].map((lane) => (
                    <div key={lane.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>{lane.name}</span>
                        <span>{lane.pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white">
                        <div
                          className={`h-2 rounded-full ${lane.tone}`}
                          style={{ width: `${lane.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-[#ecdccf] bg-white/80">
                <CardHeader>
                  <CardTitle className="text-lg">Quick actions</CardTitle>
                  <CardDescription>
                    Launch billing tools without leaving the desk.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {[
                    "Create invoice",
                    "Record payment",
                    "Generate statement",
                    "Add inventory item",
                  ].map((action) => (
                    <button
                      key={action}
                      className="flex items-center justify-between rounded-xl border border-[#f2e6dc] bg-white px-4 py-3 text-left text-sm font-semibold text-[#1f1b16] transition hover:-translate-y-0.5 hover:border-[#f6a54a]"
                    >
                      {action}
                      <span className="text-[#b45309]">+</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
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
