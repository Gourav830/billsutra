"use client";

import Link from "next/link";
import ProfileMenu from "../auth/ProfileMenu";
import ThemeToggle from "@/components/theme-toggle";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Products", href: "/products" },
  { label: "Customers", href: "/customers" },
  { label: "Suppliers", href: "/suppliers" },
  { label: "Purchases", href: "/purchases" },
  { label: "Sales", href: "/sales" },
  { label: "Invoices", href: "/invoices" },
  { label: "Warehouses", href: "/warehouses" },
  { label: "Inventory", href: "/inventory" },
];

export default function DashNavbar({
  name,
  image,
}: {
  name: string;
  image?: string;
}) {
  return (
    <nav className="border-b border-border/60 bg-background">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="text-xl font-extrabold md:text-2xl">BillSutra</div>
        <div className="hidden flex-wrap items-center gap-4 text-sm text-muted-foreground lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <ThemeToggle />
          <ProfileMenu name={name} image={image} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-6 pb-4 text-xs text-muted-foreground lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-border px-3 py-1 hover:border-primary"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
