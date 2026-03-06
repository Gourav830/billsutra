import Register from "@/components/auth/register";
import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f3ee] px-6 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-[#ecdccf] bg-white/90 px-10 py-8 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#f97316] to-[#fb7185]" />
          <div>
            <div className="text-2xl font-extrabold text-[#1f1b16]">
              BillSutra
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b45309]">
              Create account
            </div>
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-[#1f1b16]">
          Start billing with confidence
        </h1>
        <p className="mt-2 text-sm text-[#5c4b3b]">
          Create your BillSutra workspace and get invoices out in minutes.
        </p>

        <div className="mt-6">
          <Register />
        </div>

        <p className="mt-6 text-center text-sm text-[#5c4b3b]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#b45309]">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;
