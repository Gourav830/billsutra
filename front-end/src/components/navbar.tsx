import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hexagon } from "lucide-react";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
  { label: "Login", href: "/login" },
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f2ea]/80 backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f766e] text-white shadow-sm">
            <Hexagon size={18} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-[#1f1b16] dark:text-white">
            BillSutra
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[#5c4b3b] dark:text-slate-300 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-[#b45309]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="hidden md:inline-flex">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button
            asChild
            className="bg-[#1f1b16] text-white hover:bg-[#2c2520]"
          >
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
