"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { fetchDashboardForecast } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const ProfitForecast = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "forecast"],
    queryFn: fetchDashboardForecast,
  });

  const profitSeries = data?.profit.last30 ?? [];
  const monthlyProfit = data?.profit.monthly ?? [];
  const forecastSeries = data?.forecast.next14Days ?? [];

  const totalProfit = profitSeries.reduce((sum, item) => sum + item.profit, 0);
  const totalRevenue = profitSeries.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );
  const avgMargin = totalRevenue === 0 ? 0 : (totalProfit / totalRevenue) * 100;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="border-[#ecdccf] bg-white/90">
        <CardHeader>
          <CardTitle className="text-lg">Profit analytics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          {isLoading && (
            <div className="h-40 rounded-xl bg-[#fdf7f1] animate-pulse" />
          )}
          {isError && (
            <p className="text-sm text-[#b45309]">
              Unable to load profit data.
            </p>
          )}
          {!isLoading && !isError && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "30-day profit",
                    value: formatCurrency(totalProfit),
                  },
                  {
                    label: "Avg margin",
                    value: `${avgMargin.toFixed(1)}%`,
                  },
                  {
                    label: "Best month",
                    value:
                      monthlyProfit
                        .slice()
                        .sort((a, b) => b.profit - a.profit)[0]?.month ?? "-",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[#f2e6dc] bg-[#fff9f2] p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
                      {item.label}
                    </p>
                    <p className="mt-3 text-lg font-semibold text-[#1f1b16]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
                  Profit trend (last 30 days)
                </p>
                <div className="mt-3 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={profitSeries}>
                      <CartesianGrid stroke="#f2e6dc" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#0f766e"
                        fill="rgba(15,118,110,0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#ecdccf] bg-white/90">
        <CardHeader>
          <CardTitle className="text-lg">Sales forecasting</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isLoading && (
            <div className="h-40 rounded-xl bg-[#fdf7f1] animate-pulse" />
          )}
          {isError && (
            <p className="text-sm text-[#b45309]">Unable to load forecast.</p>
          )}
          {!isLoading && !isError && (
            <>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
                Method: {data?.forecast.method ?? "-"}
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastSeries}>
                    <CartesianGrid stroke="#f2e6dc" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-[#8a6d56]">
                Forecast uses seasonal day-of-week averages from the last 8
                weeks.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfitForecast;
