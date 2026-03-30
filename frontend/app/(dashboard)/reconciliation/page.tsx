"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui";
import { KpiCard } from "@/components/cards";
import { Plus, Play, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const runs = [
  {
    id: "RUN-482",
    date: "2026-03-21 09:14",
    sources: "SAP ↔ Oracle",
    status: "COMPLETED",
    matched: 1842,
    mismatched: 34,
    missing: 12,
    duration: "2m 14s",
  },
  {
    id: "RUN-481",
    date: "2026-03-21 06:00",
    sources: "Stripe ↔ Internal",
    status: "COMPLETED",
    matched: 3201,
    mismatched: 8,
    missing: 2,
    duration: "1m 48s",
  },
  {
    id: "RUN-480",
    date: "2026-03-20 18:00",
    sources: "SAP ↔ Oracle",
    status: "COMPLETED",
    matched: 1756,
    mismatched: 41,
    missing: 18,
    duration: "2m 32s",
  },
  {
    id: "RUN-479",
    date: "2026-03-20 12:00",
    sources: "Plaid ↔ Internal",
    status: "FAILED",
    matched: 0,
    mismatched: 0,
    missing: 0,
    duration: "0m 12s",
  },
  {
    id: "RUN-478",
    date: "2026-03-20 06:00",
    sources: "Stripe ↔ Internal",
    status: "COMPLETED",
    matched: 2987,
    mismatched: 15,
    missing: 5,
    duration: "1m 55s",
  },
];

const reviewQueue = [
  {
    id: "RQ-1201",
    txnId: "TXN-89420",
    field: "amount",
    source: "18,720.50 EUR",
    target: "18,520.50 EUR",
    diff: "200.00",
    status: "PENDING_REVIEW",
  },
  {
    id: "RQ-1200",
    txnId: "TXN-89412",
    field: "amount",
    source: "12,450.00 USD",
    target: "12,350.00 USD",
    diff: "100.00",
    status: "PENDING_REVIEW",
  },
  {
    id: "RQ-1199",
    txnId: "TXN-89407",
    field: "date",
    source: "2026-03-20",
    target: "2026-03-19",
    diff: "1 day",
    status: "ESCALATED",
  },
  {
    id: "RQ-1198",
    txnId: "TXN-89401",
    field: "reference",
    source: "SAP-FI-878",
    target: "—",
    diff: "missing",
    status: "PENDING_REVIEW",
  },
];

export default function ReconciliationPage() {
  const [view, setView] = useState<"runs" | "queue">("runs");
  const [showCreate, setShowCreate] = useState(false);
  const [recoSource, setRecoSource] = useState("SAP");
  const [recoTarget, setRecoTarget] = useState("Oracle");

  const cardClass = "card-shadow";

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2>Reconciliation</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-4 py-2 text-[12px] bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-3.5 h-3.5" /> New Run
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Total Runs (7d)" value="28" change="+4" trend="up" />
        <KpiCard title="Match Rate" value="97.2%" change="+0.3%" trend="up" />
        <KpiCard title="Open Mismatches" value="98" change="-12" trend="down" />
        <KpiCard title="Pending Reviews" value="23" change="+5" trend="up" />
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className={`bg-card rounded-xl p-6 ${cardClass}`}>
          <h4 className="text-[13px] mb-5 text-foreground font-medium">
            Create Reconciliation Run
          </h4>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2 font-medium">
                Source System
              </label>
              <Select value={recoSource} onValueChange={setRecoSource}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAP">SAP</SelectItem>
                  <SelectItem value="Oracle">Oracle</SelectItem>
                  <SelectItem value="Stripe">Stripe</SelectItem>
                  <SelectItem value="Plaid">Plaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2 font-medium">
                Target System
              </label>
              <Select value={recoTarget} onValueChange={setRecoTarget}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Oracle">Oracle</SelectItem>
                  <SelectItem value="SAP">SAP</SelectItem>
                  <SelectItem value="Internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-2 font-medium">
                Date Range
              </label>
              <input
                type="text"
                defaultValue="Last 24 hours"
                readOnly
                className="w-full bg-background border border-border/50 rounded-lg px-2.5 py-2 text-[12px] text-foreground"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  toast.success("Reconciliation run started", {
                    description: "Run ID will appear in history when complete.",
                  });
                  setShowCreate(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-[12px] bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                <Play className="w-3 h-3" /> Start Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex gap-0 border-b border-border">
        {(["runs", "queue"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2.5 text-[12px] border-b-2 transition-colors ${
              view === v
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {v === "runs" ? "Run History" : "Review Queue"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={`flex-1 bg-card rounded-xl overflow-auto ${cardClass}`}>
        {view === "runs" ? (
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-card z-10 shadow-[0_1px_0_0_var(--border)]">
              <tr className="text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Run ID</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Sources</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Matched</th>
                <th className="text-right px-4 py-3 font-medium">Mismatched</th>
                <th className="text-right px-4 py-3 font-medium">Missing</th>
                <th className="text-right px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-border/30 hover:bg-primary/[0.02] cursor-pointer transition-colors ${
                    i % 2 === 1 ? "bg-muted/20" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-primary font-medium">{r.id}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-4 py-3 text-foreground">{r.sources}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} size="xs" />
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 tabular-nums font-medium">
                    {r.matched.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {r.mismatched > 0 ? (
                      <span className="text-orange-600 font-medium">
                        {r.mismatched}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {r.missing > 0 ? (
                      <span className="text-red-600 font-medium">
                        {r.missing}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                    {r.duration}
                  </td>
                  <td className="px-4 py-3">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-card z-10 shadow-[0_1px_0_0_var(--border)]">
              <tr className="text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">ID</th>
                <th className="text-left px-4 py-3 font-medium">Transaction</th>
                <th className="text-left px-4 py-3 font-medium">Field</th>
                <th className="text-left px-4 py-3 font-medium">
                  Source Value
                </th>
                <th className="text-left px-4 py-3 font-medium">
                  Target Value
                </th>
                <th className="text-left px-4 py-3 font-medium">Diff</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviewQueue.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-border/30 hover:bg-primary/[0.02] transition-colors ${
                    i % 2 === 1 ? "bg-muted/20" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-muted-foreground">{r.id}</td>
                  <td className="px-4 py-3 text-primary font-medium">
                    {r.txnId}
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">
                    {r.field}
                  </td>
                  <td className="px-4 py-3 text-green-600 tabular-nums">
                    {r.source}
                  </td>
                  <td className="px-4 py-3 text-red-600 tabular-nums">
                    {r.target}
                  </td>
                  <td className="px-4 py-3 text-orange-600 tabular-nums font-medium">
                    {r.diff}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} size="xs" />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        toast.info(`Reviewing ${r.txnId}`, {
                          description: "Opening transaction for review...",
                        })
                      }
                      className="px-3 py-1 text-[11px] bg-primary/[0.06] text-primary rounded-lg hover:bg-primary/[0.12] transition-colors font-medium"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
