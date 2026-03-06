"use client";
import Link from "next/link";
import { CustomUser } from "@/app/api/auth/[...nextauth]/options";
import { Button } from "../ui/button";
import LoginModel from "../auth/LoginModal";
// import LoginModal from "../auth/LoginModal";
export default function Navbar({ user }: { user?: CustomUser | null }) {
  return (
    <nav className="w-full bg-white border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-400" />
          <div>
            <div className="text-xl font-extrabold text-gray-900">
              BillSutra
            </div>
            <div className="text-xs font-medium text-gray-400">
              GST Billing for SMBs
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-6 text-sm text-gray-600 md:flex">
          <Link href="#mobile" className="hover:text-gray-900">
            Try mobile app
          </Link>
          <Link href="#solutions" className="hover:text-gray-900">
            Solutions
          </Link>
          <Link href="#pricing" className="hover:text-gray-900">
            Pricing
          </Link>
          <Link href="#about" className="hover:text-gray-900">
            About Us
          </Link>
          <Link href="#desktop" className="hover:text-gray-900">
            Desktop
          </Link>
          <Link href="#careers" className="hover:text-gray-900">
            Careers
          </Link>
          <Link href="#partner" className="hover:text-gray-900">
            Partner with us
          </Link>
          {!user ? (
            <LoginModel />
          ) : (
            <Link href="/dashboard">
              <Button className="bg-red-500 hover:bg-red-600">Dashboard</Button>
            </Link>
          )}
        </div>
        <div className="md:hidden">
          {!user ? (
            <LoginModel />
          ) : (
            <Link href="/dashboard">
              <Button className="bg-red-500 hover:bg-red-600">Dashboard</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
