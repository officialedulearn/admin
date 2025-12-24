"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "#00FF80",
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl p-6 transition-all hover:shadow-lg hover:border-border/80",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div
          className="p-2.5 rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      {trend && (
        <p
          className={cn(
            "text-sm font-medium",
            trend.positive ? "text-[#00FF80]" : "text-destructive"
          )}
        >
          {trend.value}
        </p>
      )}
    </div>
  );
}


