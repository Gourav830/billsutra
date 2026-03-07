"use client";

import Link from "next/link";
import ProfileMenu from "../auth/ProfileMenu";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Products", href: "/products" },
  { label: "Customers", href: "/customers" },
  { label: "Suppliers", href: "/suppliers" },
  { label: "Purchases", href: "/purchases" },
  { label: "Sales", href: "/sales" },
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
    <nav className="border-b border-[#ecdccf] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="text-xl md:text-2xl font-extrabold">BillSutra</div>
        <div className="hidden flex-wrap items-center gap-4 text-sm text-[#5c4b3b] lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-[#b45309]"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <ProfileMenu name={name} image={image} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-6 pb-4 text-xs text-[#8a6d56] lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-[#f2e6dc] px-3 py-1 hover:border-[#f6a54a]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
