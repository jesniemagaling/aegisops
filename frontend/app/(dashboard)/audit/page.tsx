"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui";
import { Filter, X } from "lucide-react";

const logs = [
  {
    id: "EVT-28401",
    timestamp: "2026-03-21 09:15:00",
    actor: "System",
    action: "review.assigned",
    resource: "TXN-89420",
    detail:
      "Auto-assigned to john.doe@company.com based on SAP ownership rules",
  },
  {
    id: "EVT-28400",
    timestamp: "2026-03-21 09:14:02",
    actor: "System",
    action: "reconciliation.mismatch",
    resource: "TXN-89420",
    detail: "Amount mismatch detected: 200.00 EUR difference",
  },
  {
    id: "EVT-28399",
    timestamp: "2026-03-21 09:14:01",
    actor: "System",
    action: "reconciliation.completed",
    resource: "RUN-482",
    detail: "Completed: 1842 matched, 34 mismatched, 12 missing",
  },
  {
    id: "EVT-28398",
    timestamp: "2026-03-21 09:12:20",
    actor: "System",
    action: "validation.completed",
    resource: "TXN-89420",
    detail: "Validation completed with 1 warning: date consistency check",
  },
  {
    id: "EVT-28397",
    timestamp: "2026-03-21 09:12:18",
    actor: "System",
    action: "transaction.ingested",
    resource: "TXN-89420",
    detail: "Ingested from SAP batch BATCH-1205",
  },
  {
    id: "EVT-28396",
    timestamp: "2026-03-21 09:12:15",
    actor: "System",
    action: "batch.completed",
    resource: "BATCH-1205",
    detail: "SAP batch completed: 248 transactions, 0 errors",
  },
  {
    id: "EVT-28395",
    timestamp: "2026-03-21 09:00:00",
    actor: "john.doe",
    action: "alert.acknowledged",
    resource: "ALT-4819",
    detail: "Alert acknowledged: duplicate detection in Oracle feed",
  },
  {
    id: "EVT-28394",
    timestamp: "2026-03-21 08:55:12",
    actor: "jane.smith",
    action: "review.resolved",
    resource: "TXN-89414",
    detail:
      "Marked as resolved: confirmed correct amount after manual verification",
  },
  {
    id: "EVT-28393",
    timestamp: "2026-03-21 08:45:00",
    actor: "System",
    action: "reconciliation.started",
    resource: "RUN-482",
    detail: "Started SAP ↔ Oracle reconciliation run for last 24h",
  },
  {
    id: "EVT-28392",
    timestamp: "2026-03-21 08:30:00",
    actor: "admin",
    action: "config.updated",
    resource: "CONNECTOR-SAP",
    detail: "Updated SAP connector polling interval from 5m to 3m",
  },
];

const actionColors: Record<string, string> = {
  "transaction.ingested": "text-blue-600 bg-blue-500/10",
  "validation.completed": "text-cyan-600 bg-cyan-500/10",
  "reconciliation.completed": "text-violet-600 bg-violet-500/10",
  "reconciliation.mismatch": "text-orange-600 bg-orange-500/10",
  "reconciliation.started": "text-violet-600 bg-violet-500/10",
  "review.assigned": "text-yellow-700 bg-yellow-500/10",
  "review.resolved": "text-green-600 bg-green-500/10",
  "alert.acknowledged": "text-amber-600 bg-amber-500/10",
  "batch.completed": "text-teal-600 bg-teal-500/10",
  "config.updated": "text-indigo-600 bg-indigo-500/10",
};

export default function AuditLogsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedLog = logs.find((l) => l.id === selected);

  const cardClass =
    "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)]";

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2>Audit Logs</h2>
        <button className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] bg-card rounded-[10px] hover:bg-muted border border-border/50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Filter className="w-3.5 h-3.5" /> Filters
        </button>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className={`flex-1 bg-card rounded-xl overflow-auto ${cardClass}`}>
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-card z-10 shadow-[0_1px_0_0_var(--border)]">
              <tr className="text-muted-foreground">
                <th className="text-left px-4 py-3 whitespace-nowrap font-medium">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 font-medium">Event ID</th>
                <th className="text-left px-4 py-3 font-medium">Actor</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium">Resource</th>
                <th className="text-left px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr
                  key={l.id}
                  onClick={() => setSelected(l.id)}
                  className={`border-b border-border/30 cursor-pointer transition-colors ${
                    selected === l.id
                      ? "bg-primary/[0.03]"
                      : `hover:bg-primary/[0.02] ${i % 2 === 1 ? "bg-muted/20" : ""}`
                  }`}
                >
                  <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap font-mono text-[11px]">
                    {l.timestamp}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                    {l.id}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {l.actor}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        actionColors[l.action] ||
                        "text-muted-foreground bg-muted"
                      }`}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-primary font-mono text-[11px] font-medium">
                    {l.resource}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[300px]">
                    {l.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedLog && (
          <div
            className={`w-[320px] min-w-[320px] bg-card rounded-xl p-6 overflow-auto ${cardClass}`}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[13px] text-foreground font-mono font-medium">
                {selectedLog.id}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 hover:bg-muted rounded-[8px] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-5 text-[12px]">
              {(
                [
                  ["Timestamp", selectedLog.timestamp],
                  ["Actor", selectedLog.actor],
                  ["Action", selectedLog.action],
                  ["Resource", selectedLog.resource],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {label}
                  </span>
                  <p className="text-foreground mt-1 font-medium">{value}</p>
                </div>
              ))}
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Detail
                </span>
                <p className="mt-1.5 text-muted-foreground leading-relaxed">
                  {selectedLog.detail}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
