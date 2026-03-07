"use client";

import React from "react";
import Link from "next/link";
import DashNavbar from "@/components/dashboard/DashNav";
import { useWarehousesQuery } from "@/hooks/useInventoryQueries";

type WarehousesClientProps = {
  name: string;
  image?: string;
};

const WarehousesClient = ({ name, image }: WarehousesClientProps) => {
  const { data, isLoading, isError } = useWarehousesQuery();

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#1f1b16]">
      <DashNavbar name={name} image={image} />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8a6d56]">
            Storage
          </p>
          <h1 className="text-3xl font-black">Warehouses</h1>
          <p className="max-w-2xl text-base text-[#5c4b3b]">
            Monitor warehouse footprints and available stock at a glance.
          </p>
        </div>

        <section className="mt-6 rounded-2xl border border-[#ecdccf] bg-white/90 p-6">
          {isLoading && (
            <p className="text-sm text-[#8a6d56]">Loading warehouses...</p>
          )}
          {isError && (
            <p className="text-sm text-[#b45309]">Failed to load warehouses.</p>
          )}
          {!isLoading && !isError && data && data.length === 0 && (
            <p className="text-sm text-[#8a6d56]">No warehouses yet.</p>
          )}
          {!isLoading && !isError && data && data.length > 0 && (
            <div className="grid gap-3">
              {data.map((warehouse) => (
                <Link
                  key={warehouse.id}
                  href={`/warehouses/${warehouse.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f2e6dc] bg-[#fff9f2] px-4 py-3 text-left transition hover:-translate-y-0.5"
                >
                  <div>
                    <p className="text-base font-semibold">{warehouse.name}</p>
                    <p className="text-xs text-[#8a6d56]">
                      {warehouse.location ?? "Location not set"}
                    </p>
                  </div>
                  <span className="text-sm text-[#b45309]">View stock →</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WarehousesClient;
