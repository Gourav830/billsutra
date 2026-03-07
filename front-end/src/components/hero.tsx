import Link from "next/link";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#f7f2ea] pb-16 pt-14 text-[#1f1b16] dark:bg-slate-950 dark:text-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-12 top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.28),rgba(249,115,22,0))]" />
        <div className="absolute right-0 top-8 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.22),rgba(15,118,110,0))]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6d56] dark:text-slate-400">
            Business management platform
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Manage Your Business Smarter with BillSutra
          </h1>
          <p className="max-w-xl text-base text-[#5c4b3b] dark:text-slate-300">
            Create invoices, track inventory, manage customers and payments —
            all in one powerful platform.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-[#1f1b16] text-white hover:bg-[#2c2520]"
            >
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="#product">View Demo</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-[#ecdccf] bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-slate-900">
          <div className="rounded-2xl border border-dashed border-[#e6d6c7] bg-[#fdf7f1] p-6 dark:border-white/10 dark:bg-slate-950">
            <div className="flex items-center justify-between text-xs text-[#8a6d56] dark:text-slate-400">
              <span>Dashboard Preview</span>
              <span>Live</span>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="h-3 w-40 rounded-full bg-[#f97316]/40" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded-xl bg-white shadow-sm dark:bg-slate-900" />
                <div className="h-20 rounded-xl bg-white shadow-sm dark:bg-slate-900" />
                <div className="h-20 rounded-xl bg-white shadow-sm dark:bg-slate-900" />
              </div>
              <div className="h-32 rounded-2xl bg-white shadow-sm dark:bg-slate-900" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 rounded-2xl bg-white shadow-sm dark:bg-slate-900" />
                <div className="h-24 rounded-2xl bg-white shadow-sm dark:bg-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
