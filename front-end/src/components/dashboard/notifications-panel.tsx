"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NotificationsPanel = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboardOverview,
  });

  const alerts = data?.alerts;

  return (
    <Card className="border-[#ecdccf] bg-[#fff7ef]">
      <CardHeader>
        <CardTitle className="text-lg">Notifications & alerts</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {isLoading && (
          <div className="h-20 rounded-xl bg-white/70 animate-pulse" />
        )}
        {isError && (
          <p className="text-sm text-[#b45309]">Unable to load alerts.</p>
        )}
        {!isLoading && !isError && alerts && (
          <>
            {alerts.lowStock.length === 0 &&
            alerts.overdueInvoices.length === 0 &&
            alerts.supplierPayables.length === 0 ? (
              <p className="text-sm text-[#8a6d56]">No alerts right now.</p>
            ) : (
              <div className="grid gap-2 text-sm">
                {alerts.lowStock.map((item) => (
                  <div
                    key={`low-${item}`}
                    className="rounded-lg border border-[#f2e6dc] bg-white px-3 py-2"
                  >
                    Low stock: {item}
                  </div>
                ))}
                {alerts.overdueInvoices.map((item) => (
                  <div
                    key={`overdue-${item}`}
                    className="rounded-lg border border-[#f2e6dc] bg-white px-3 py-2"
                  >
                    Overdue invoice: {item}
                  </div>
                ))}
                {alerts.supplierPayables.map((item) => (
                  <div
                    key={`payable-${item}`}
                    className="rounded-lg border border-[#f2e6dc] bg-white px-3 py-2"
                  >
                    Supplier payment due: {item}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
