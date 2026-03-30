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
      className={`bg-card rounded-xl p-5 flex flex-col gap-3 card-shadow transition-all duration-200 ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0" : ""}`}
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
            className={`flex items-center gap-1 text-[11px] pb-0.5 font-medium px-2 py-0.5 rounded-full ${
              trend === "up"
                ? "text-emerald-600 bg-emerald-500/10"
                : trend === "down"
                  ? "text-red-500 bg-red-500/10"
                  : "text-muted-foreground bg-muted"
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
