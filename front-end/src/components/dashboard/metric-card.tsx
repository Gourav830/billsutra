import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trendLabel?: string;
};

const formatChange = (change: number) => {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
};

const MetricCard = ({
  title,
  value,
  change,
  icon,
  trendLabel,
}: MetricCardProps) => {
  const isPositive = change >= 0;

  return (
    <Card className="border-[#ecdccf] bg-white/90">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8a6d56]">
              {title}
            </p>
            <p className="mt-3 text-2xl font-semibold text-[#1f1b16]">
              {value}
            </p>
          </div>
          <div className="rounded-xl border border-[#f2e6dc] bg-[#fff7ef] p-2 text-[#8a6d56]">
            {icon}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-[#8a6d56]">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                isPositive
                  ? "bg-[#e7f8f1] text-[#0f766e]"
                  : "bg-[#fee2e2] text-[#b45309]"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {formatChange(change)}
            </span>
            <span>{trendLabel ?? "vs last period"}</span>
          </div>
          <span className="h-1 w-12 rounded-full bg-[#ecdccf]">
            <span
              className={`block h-1 rounded-full ${isPositive ? "bg-[#0f766e]" : "bg-[#f97316]"}`}
              style={{ width: `${Math.min(100, Math.abs(change) * 2)}%` }}
            />
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
