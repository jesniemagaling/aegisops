"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui";
import { CheckCircle, X } from "lucide-react";

const alertsData = [
  {
    id: "ALT-4821",
    severity: "CRITICAL",
    status: "OPEN",
    type: "Reconciliation",
    message: "Mismatch rate exceeded 5% threshold on SAP ↔ Oracle run",
    created: "12m ago",
    source: "RUN-482",
  },
  {
    id: "ALT-4820",
    severity: "HIGH",
    status: "OPEN",
    type: "Ingestion",
    message: "SAP ingestion latency > 3s for 15 consecutive batches",
    created: "28m ago",
    source: "BATCH-1204",
  },
  {
    id: "ALT-4819",
    severity: "MEDIUM",
    status: "ACKNOWLEDGED",
    type: "Validation",
    message: "Duplicate transaction IDs detected in Oracle feed",
    created: "1h ago",
    source: "BATCH-1201",
  },
  {
    id: "ALT-4818",
    severity: "LOW",
    status: "OPEN",
    type: "System",
    message: "Scheduled reconciliation run delayed by 5 minutes",
    created: "2h ago",
    source: "SCHEDULER",
  },
  {
    id: "ALT-4817",
    severity: "HIGH",
    status: "ACKNOWLEDGED",
    type: "Reconciliation",
    message: "12 missing counterparty records in Plaid feed",
    created: "3h ago",
    source: "RUN-479",
  },
  {
    id: "ALT-4816",
    severity: "CRITICAL",
    status: "CLOSED",
    type: "Ingestion",
    message: "SAP connection timeout — batch ingestion halted",
    created: "5h ago",
    source: "CONNECTOR-SAP",
  },
  {
    id: "ALT-4815",
    severity: "MEDIUM",
    status: "CLOSED",
    type: "Validation",
    message: "Currency mismatch on 8 Stripe transactions",
    created: "6h ago",
    source: "BATCH-1198",
  },
  {
    id: "ALT-4814",
    severity: "LOW",
    status: "CLOSED",
    type: "System",
    message: "Database query latency exceeded warning threshold",
    created: "8h ago",
    source: "SYSTEM",
  },
];

export default function AlertsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? alertsData
      : alertsData.filter((a) => a.status === filter);
  const selectedAlert = alertsData.find((a) => a.id === selected);

  const cardClass =
    "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)]";

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2>Alerts</h2>
        <div className="flex items-center gap-2">
          {["all", "OPEN", "ACKNOWLEDGED", "CLOSED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 text-[12px] rounded-[10px] transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              {f !== "all" && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  ({alertsData.filter((a) => a.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Alert List */}
        <div className={`flex-1 bg-card rounded-xl overflow-auto ${cardClass}`}>
          <div className="space-y-0">
            {filtered.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelected(a.id)}
                className={`flex items-start gap-3 px-5 py-4 border-b border-border/30 cursor-pointer transition-all ${
                  selected === a.id
                    ? "bg-primary/[0.03] border-l-2 border-l-primary"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.severity} size="xs" />
                    <StatusBadge status={a.status} size="xs" />
                    <span className="text-[11px] text-muted-foreground">
                      {a.type}
                    </span>
                  </div>
                  <p className="text-[12px] truncate text-foreground">
                    {a.message}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="font-mono">{a.id}</span>
                    <span>Source: {a.source}</span>
                    <span>{a.created}</span>
                  </div>
                </div>
                {a.status === "OPEN" && (
                  <button className="mt-1 flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] bg-muted rounded-[8px] hover:bg-muted/70 text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors">
                    <CheckCircle className="w-3 h-3" /> Ack
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedAlert && (
          <div
            className={`w-[340px] min-w-[340px] bg-card rounded-xl p-6 overflow-auto ${cardClass}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[13px] text-foreground font-mono font-medium">
                {selectedAlert.id}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 hover:bg-muted rounded-[8px] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedAlert.severity} />
                <StatusBadge status={selectedAlert.status} />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Message
                </span>
                <p className="text-[12px] mt-1.5 text-foreground leading-relaxed">
                  {selectedAlert.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-5 text-[12px]">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Type
                  </span>
                  <p className="text-foreground mt-1 font-medium">
                    {selectedAlert.type}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Source
                  </span>
                  <p className="text-foreground mt-1 font-mono text-[11px] font-medium">
                    {selectedAlert.source}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Created
                  </span>
                  <p className="text-foreground mt-1 font-medium">
                    {selectedAlert.created}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <button className="flex-1 px-4 py-2 text-[12px] bg-primary text-primary-foreground rounded-[10px] transition-colors hover:bg-primary/90 shadow-sm">
                  Acknowledge
                </button>
                <button className="flex-1 px-4 py-2 text-[12px] bg-card rounded-[10px] hover:bg-muted border border-border/50 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
