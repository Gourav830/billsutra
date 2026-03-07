import Link from "next/link";
import { Button } from "@/components/ui/button";

const Cta = () => {
  return (
    <section className="bg-white py-16 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="rounded-3xl border border-[#ecdccf] bg-[#1f1b16] px-8 py-10 text-white shadow-xl">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f2c9a9]">
                Ready to start
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                Start Managing Your Business Today
              </h2>
              <p className="mt-2 text-sm text-[#f2e6dc]">
                Join thousands of small businesses using BillSutra to simplify
                billing and inventory.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-white text-[#1f1b16] hover:bg-[#f7f2ea]"
              >
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="#product">Book Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cta;
