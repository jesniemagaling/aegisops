import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "flat";
  subtitle?: string;
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  change,
  trend = "flat",
  subtitle,
  onClick,
}: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-xl p-5 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] transition-all duration-200 ${onClick ? "cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 active:translate-y-0" : ""}`}
    >
      <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
        {title}
      </span>
      <div className="flex items-end justify-between gap-2">
        <span
          className="text-[28px] tracking-tight text-foreground leading-none font-semibold"
          style={{ letterSpacing: "-0.025em" }}
        >
          {value}
        </span>
        {change && (
          <span
            className={`flex items-center gap-1 text-[11px] pb-0.5 font-medium ${
              trend === "up"
                ? "text-emerald-600"
                : trend === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : trend === "down" ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <span className="text-[11px] text-muted-foreground -mt-1">
          {subtitle}
        </span>
      )}
    </div>
  );
}
