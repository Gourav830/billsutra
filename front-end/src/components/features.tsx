import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Boxes, Users, Truck, LineChart, Receipt } from "lucide-react";

const features = [
  {
    title: "Invoice Management",
    description: "Create and print invoices instantly",
    icon: Receipt,
  },
  {
    title: "Inventory Tracking",
    description: "Track product stock and get low stock alerts",
    icon: Boxes,
  },
  {
    title: "Customer Management",
    description: "Manage customer records and transactions",
    icon: Users,
  },
  {
    title: "Supplier Management",
    description: "Track purchases and supplier payments",
    icon: Truck,
  },
  {
    title: "Business Analytics",
    description: "Understand sales, profit and performance",
    icon: LineChart,
  },
  {
    title: "Payment Tracking",
    description: "Monitor pending payments and cash flow",
    icon: Wallet,
  },
];

const Features = () => {
  return (
    <section
      id="features"
      className="bg-white py-16 text-[#1f1b16] dark:bg-slate-950 dark:text-white"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6d56] dark:text-slate-400">
            Trusted by growing businesses
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm text-[#8a6d56] sm:grid-cols-4">
            {["StudioNine", "KiteSupply", "UrbanMart", "ByteCraft"].map(
              (brand) => (
                <div
                  key={brand}
                  className="rounded-full border border-[#f2e6dc] bg-[#fff9f2] px-4 py-2 text-center dark:border-white/10 dark:bg-slate-900"
                >
                  {brand}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-12 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold">Everything you need</h2>
            <p className="mt-2 max-w-xl text-sm text-[#5c4b3b] dark:text-slate-300">
              One workspace to handle invoices, inventory, and cash flow without
              juggling spreadsheets.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-[#f2e6dc] bg-[#fff9f2] transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900"
            >
              <CardContent className="flex h-full flex-col gap-3 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1b16] text-white dark:bg-white dark:text-slate-900">
                  <feature.icon size={18} />
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-[#5c4b3b] dark:text-slate-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
