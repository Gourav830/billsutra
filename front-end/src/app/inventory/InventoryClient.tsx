"use client";

import React, { useMemo } from "react";
import DashNavbar from "@/components/dashboard/DashNav";
import { useInventoriesQuery } from "@/hooks/useInventoryQueries";

type InventoryClientProps = {
  name: string;
  image?: string;
};

const InventoryClient = ({ name, image }: InventoryClientProps) => {
  const { data, isLoading, isError } = useInventoriesQuery();

  const grouped = useMemo(() => {
    if (!data) return [] as Array<{ name: string; items: typeof data }>;
    const map = new Map<string, typeof data>();
    data.forEach((item) => {
      const key = item.warehouse.name;
      const existing = map.get(key) ?? [];
      existing.push(item);
      map.set(key, existing);
    });
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  }, [data]);

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#1f1b16]">
      <DashNavbar name={name} image={image} />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8a6d56]">
            Inventory
          </p>
          <h1 className="text-3xl font-black">Warehouse Inventory</h1>
          <p className="max-w-2xl text-base text-[#5c4b3b]">
            All warehouse stock levels, grouped by location.
          </p>
        </div>

        <section className="mt-6 grid gap-4">
          {isLoading && (
            <p className="text-sm text-[#8a6d56]">Loading inventory...</p>
          )}
          {isError && (
            <p className="text-sm text-[#b45309]">Failed to load inventory.</p>
          )}
          {!isLoading && !isError && grouped.length === 0 && (
            <p className="text-sm text-[#8a6d56]">No inventory records yet.</p>
          )}
          {!isLoading && !isError && grouped.length > 0 && (
            <div className="grid gap-4">
              {grouped.map((group) => (
                <div
                  key={group.name}
                  className="rounded-2xl border border-[#ecdccf] bg-white/90 p-6"
                >
                  <h2 className="text-lg font-semibold">{group.name}</h2>
                  <div className="mt-4 grid gap-3">
                    {group.items.map((item) => (
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
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default InventoryClient;
