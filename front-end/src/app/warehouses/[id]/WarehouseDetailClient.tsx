"use client";

import React from "react";
import Link from "next/link";
import DashNavbar from "@/components/dashboard/DashNav";
import { useWarehouseQuery } from "@/hooks/useInventoryQueries";

type WarehouseDetailClientProps = {
  name: string;
  image?: string;
  warehouseId: number;
};

const WarehouseDetailClient = ({
  name,
  image,
  warehouseId,
}: WarehouseDetailClientProps) => {
  const { data, isLoading, isError } = useWarehouseQuery(warehouseId);

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#1f1b16]">
      <DashNavbar name={name} image={image} />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-2">
          <Link href="/warehouses" className="text-sm text-[#b45309]">
            ← Back to warehouses
          </Link>
          <h1 className="text-3xl font-black">{data?.name ?? "Warehouse"}</h1>
          <p className="max-w-2xl text-base text-[#5c4b3b]">
            {data?.location ?? "Location not set"}
          </p>
        </div>

        <section className="mt-6 rounded-2xl border border-[#ecdccf] bg-white/90 p-6">
          {isLoading && (
            <p className="text-sm text-[#8a6d56]">Loading inventory...</p>
          )}
          {isError && (
            <p className="text-sm text-[#b45309]">Failed to load inventory.</p>
          )}
          {!isLoading &&
            !isError &&
            (!data?.inventories || data.inventories.length === 0) && (
              <p className="text-sm text-[#8a6d56]">
                No items stored here yet.
              </p>
            )}
          {!isLoading &&
            !isError &&
            data?.inventories &&
            data.inventories.length > 0 && (
              <div className="grid gap-3">
                {data.inventories.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f2e6dc] bg-[#fff9f2] px-4 py-3"
                  >
                    <div>
                      <p className="text-base font-semibold">
                        {item.product.name} • {item.product.sku}
                      </p>
                      <p className="text-xs text-[#8a6d56]">
                        Reorder at {item.product.reorder_level}
                      </p>
                    </div>
                    <div className="text-sm text-[#5c4b3b]">
                      Stock: {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </section>
      </main>
    </div>
  );
};

export default WarehouseDetailClient;
