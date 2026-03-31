"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, Sparkles, ArrowRight, Server } from "lucide-react";
import { KpiCard } from "@/components/cards";
import { StatusBadge } from "@/components/ui";

const volumeData = [
  { day: "Mon", volume: 12400, mismatches: 34 },
  { day: "Tue", volume: 14200, mismatches: 28 },
  { day: "Wed", volume: 13100, mismatches: 41 },
  { day: "Thu", volume: 15800, mismatches: 19 },
  { day: "Fri", volume: 16200, mismatches: 52 },
  { day: "Sat", volume: 9400, mismatches: 12 },
  { day: "Sun", volume: 8200, mismatches: 8 },
];

const sourceData = [
  { source: "SAP", volume: 4200, errors: 12, latency: "1.2s" },
  { source: "Oracle", volume: 3800, errors: 8, latency: "0.8s" },
  { source: "Stripe", volume: 6100, errors: 3, latency: "0.3s" },
  { source: "Plaid", volume: 2400, errors: 0, latency: "0.5s" },
  { source: "Internal", volume: 1900, errors: 21, latency: "2.1s" },
];

const alerts = [
  {
    id: "ALT-4821",
    severity: "CRITICAL",
    message: "Reconciliation mismatch rate exceeded 5% threshold",
    time: "12m ago",
  },
  {
    id: "ALT-4820",
    severity: "HIGH",
    message: "SAP ingestion latency > 3s for 15 consecutive batches",
    time: "28m ago",
  },
  {
    id: "ALT-4819",
    severity: "MEDIUM",
    message: "Duplicate transaction IDs detected in Oracle feed",
    time: "1h ago",
  },
  {
    id: "ALT-4818",
    severity: "LOW",
    message: "Scheduled reconciliation run delayed by 5 minutes",
    time: "2h ago",
  },
];

const aiInsights = [
  {
    title: "Mismatch Pattern Detected",
    desc: "72% of SAP mismatches involve currency conversion rounding in EUR→USD transactions.",
  },
  {
    title: "Anomaly Alert",
    desc: "Oracle feed volume dropped 34% compared to same day last week. Possible upstream issue.",
  },
  {
    title: "Optimization Suggestion",
    desc: "Batching Stripe ingestions in 5-min windows could reduce duplicate detection by ~18%.",
  },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3.5 py-2.5 text-[12px] shadow-lg">
      <p className="text-foreground font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="mt-0.5">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 page-enter">
      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-4">
        <KpiCard
          title="Total Transactions"
          value="89,421"
          change="+12.3%"
          trend="up"
          subtitle="Last 7 days"
          onClick={() => router.push("/transactions")}
        />
        <KpiCard
          title="Mismatches"
          value="194"
          change="+8.1%"
          trend="up"
          subtitle="Needs attention"
          onClick={() => router.push("/transactions?recon=MISMATCHED")}
        />
        <KpiCard
          title="Validation Failures"
          value="67"
          change="-23.4%"
          trend="down"
          subtitle="Improving"
          onClick={() => router.push("/transactions?validation=INVALID")}
        />
        <KpiCard
          title="Pending Review"
          value="38"
          change="+2"
          trend="up"
          subtitle="Assigned to you: 12"
          onClick={() => router.push("/transactions?review=PENDING_REVIEW")}
        />
        <KpiCard
          title="Open Alerts"
          value="14"
          change="-3"
          trend="down"
          onClick={() => router.push("/alerts")}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Volume Chart */}
        <div className="col-span-2 bg-card rounded-xl p-6 card-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] gradient-accent opacity-40" />
          <div className="flex items-center justify-between mb-6">
            <span className="text-[13px] text-foreground font-medium">
              Transaction Volume
            </span>
            <div className="flex gap-5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" /> Volume
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" />{" "}
                Mismatches
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={volumeData}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                dy={4}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                dx={-4}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                dx={4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="volume"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                name="Volume"
              />
              <Bar
                yAxisId="right"
                dataKey="mismatches"
                fill="#fb923c"
                opacity={0.3}
                radius={[4, 4, 0, 0]}
                name="Mismatches"
                barSize={20}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts Panel */}
        <div className="bg-card rounded-xl p-6 flex flex-col card-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-red-400 opacity-50" />
          <div className="flex items-center justify-between mb-5">
            <span className="flex items-center gap-2 text-[13px] text-foreground font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Active Alerts
            </span>
            <Link
              href="/alerts"
              className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col gap-2 overflow-auto">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-background hover:bg-muted/50 transition-all duration-150 cursor-pointer group"
              >
                <StatusBadge status={a.severity} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] truncate text-foreground leading-snug">
                    {a.message}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {a.id} · {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Source Performance */}
        <div className="col-span-2 bg-card rounded-xl p-6 card-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] gradient-accent opacity-40" />
          <div className="flex items-center gap-2 mb-5">
            <Server className="w-4 h-4 text-muted-foreground" />
            <span className="text-[13px] text-foreground font-medium">
              Source System Performance
            </span>
          </div>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left pb-3 pr-4 font-medium">Source</th>
                <th className="text-right pb-3 px-4 font-medium">
                  Volume (7d)
                </th>
                <th className="text-right pb-3 px-4 font-medium">Errors</th>
                <th className="text-right pb-3 px-4 font-medium">
                  Avg Latency
                </th>
                <th className="text-right pb-3 pl-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sourceData.map((s) => (
                <tr
                  key={s.source}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 pr-4 text-foreground font-medium">
                    {s.source}
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground tabular-nums">
                    {s.volume.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    {s.errors > 10 ? (
                      <span className="text-red-600 font-medium">
                        {s.errors}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{s.errors}</span>
                    )}
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground tabular-nums">
                    {s.latency}
                  </td>
                  <td className="text-right py-3 pl-4">
                    <StatusBadge
                      status={s.errors > 10 ? "WARNING" : "ACTIVE"}
                      size="xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Insights */}
        <div className="bg-card rounded-xl p-6 card-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-400 to-indigo-400 opacity-50" />
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-[13px] text-foreground font-medium">
              AI Insights
            </span>
            <span className="ml-auto text-[10px] bg-violet-500/10 text-violet-600 px-2 py-0.5 rounded-full font-medium">
              AI-GENERATED
            </span>
          </div>
          <div className="space-y-3">
            {aiInsights.map((insight, i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-violet-500/[0.04] border border-violet-500/10 hover:border-violet-500/20 transition-colors"
              >
                <p className="text-[12px] text-foreground font-medium">
                  {insight.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  {insight.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
