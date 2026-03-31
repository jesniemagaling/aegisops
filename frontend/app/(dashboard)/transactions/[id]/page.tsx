"use client";

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTransaction } from "@/lib/api";
import { useApi } from "@/hooks";
import { StatusBadge } from "@/components/ui";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/types";

const tabs = [
  "Overview",
  "Raw Payload",
  "Validation",
  "Reconciliation",
  "Alerts",
  "Audit History",
];

const cardClass = "bg-card rounded-xl p-6 card-shadow";

/* â”€â”€ placeholder data (replaced once API endpoints are wired) â”€â”€ */

const validationResults = [
  {
    rule: "Amount Range Check",
    result: "PASS",
    detail: "Amount within expected range (100â€“50,000 EUR)",
  },
  {
    rule: "Currency Format",
    result: "PASS",
    detail: "Valid ISO 4217 currency code",
  },
  {
    rule: "Date Consistency",
    result: "WARNING",
    detail: "Transaction date is 3 days after batch date",
  },
  {
    rule: "Duplicate Detection",
    result: "PASS",
    detail: "No duplicates found",
  },
  {
    rule: "Reference Validation",
    result: "PASS",
    detail: "External reference matches SAP format",
  },
];

const reconResults = {
  status: "MISMATCHED",
  source: {
    amount: "18,720.50",
    currency: "EUR",
    date: "2026-03-21",
    ref: "SAP-FI-88102",
  },
  target: {
    amount: "18,520.50",
    currency: "EUR",
    date: "2026-03-21",
    ref: "ORC-AP-44201",
  },
  mismatches: [
    {
      field: "amount",
      source: "18,720.50",
      target: "18,520.50",
      diff: "200.00 EUR",
    },
  ],
};

const auditEvents = [
  {
    time: "09:12:18",
    user: "System",
    action: "Transaction ingested from SAP batch BATCH-1205",
  },
  {
    time: "09:12:19",
    user: "System",
    action: "Validation pipeline triggered",
  },
  {
    time: "09:12:20",
    user: "System",
    action: "Validation completed with 1 warning",
  },
  {
    time: "09:14:01",
    user: "System",
    action: "Reconciliation run RUN-482 matched with ORC-AP-44201",
  },
  {
    time: "09:14:02",
    user: "System",
    action: "Mismatch detected: amount difference of 200.00 EUR",
  },
  {
    time: "09:15:00",
    user: "System",
    action: "Review assigned to john.doe@company.com",
  },
];

const rawPayload = `{
  "transaction_id": "SAP-FI-88102",
  "source_system": "SAP",
  "type": "INVOICE",
  "amount": 18720.50,
  "currency": "EUR",
  "counterparty": {
    "name": "Acme Corp.",
    "id": "VENDOR-1042"
  },
  "posting_date": "2026-03-21",
  "document_date": "2026-03-18",
  "batch_id": "BATCH-1205",
  "line_items": [
    { "description": "Q1 consulting", "amount": 15600.00 },
    { "description": "Expenses", "amount": 3120.50 }
  ]
}`;

/* â”€â”€ page component â”€â”€ */

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Overview");

  const fetchTransaction = useCallback(
    () => getTransaction(params.id),
    [params.id],
  );
  const {
    data: tx,
    loading,
    error,
    execute,
  } = useApi<Transaction>(fetchTransaction);

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[12px] text-muted-foreground">
        Loading transactionâ€¦
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-600">
        {error}
      </div>
    );
  }
  if (!tx) return null;

  return (
    <div className="flex flex-col gap-6 h-full page-enter">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/transactions")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <h2>{tx.externalTransactionId || tx.id.slice(0, 12)}</h2>
          <div className="flex items-center gap-1.5 ml-1">
            <StatusBadge status={tx.lifecycleStatus} />
            <StatusBadge status={tx.validationStatus} />
            <StatusBadge status={tx.reconciliationStatus} />
            <StatusBadge status={tx.reviewStatus} />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() =>
              toast.info("Assigning transaction...", {
                description: "Transaction will be assigned to an analyst.",
              })
            }
            className="px-4 py-2 text-[12px] bg-card rounded-lg hover:bg-muted border border-border/50 transition-all card-shadow hover:shadow-md"
          >
            Assign
          </button>
          <button
            onClick={() =>
              toast.warning("Escalating transaction...", {
                description: "This will notify the team lead.",
              })
            }
            className="px-4 py-2 text-[12px] bg-card rounded-lg hover:bg-muted border border-border/50 transition-all card-shadow hover:shadow-md"
          >
            Escalate
          </button>
          <button
            onClick={() =>
              toast.success("Transaction resolved", {
                description: "Status updated to RESOLVED.",
              })
            }
            className="px-4 py-2 text-[12px] bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
          >
            Resolve
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex gap-0 border-b border-border mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-[12px] border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === "Overview" && <OverviewTab tx={tx} />}
            {activeTab === "Raw Payload" && <RawPayloadTab />}
            {activeTab === "Validation" && <ValidationTab />}
            {activeTab === "Reconciliation" && <ReconciliationTab />}
            {activeTab === "Alerts" && <AlertsTab />}
            {activeTab === "Audit History" && <AuditTab />}
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="w-[280px] min-w-[280px] flex flex-col gap-4">
          {/* AI Analysis */}
          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-[12px] text-foreground font-medium">
                AI Analysis
              </span>
              <span className="ml-auto text-[9px] bg-violet-500/10 text-violet-600 px-1.5 py-0.5 rounded-full font-medium">
                AI
              </span>
            </div>
            <div className="space-y-2.5 text-[12px]">
              <p className="text-muted-foreground leading-relaxed">
                This mismatch likely results from a{" "}
                <span className="text-foreground font-medium">
                  rounding difference in currency conversion
                </span>
                . SAP applied EURâ†’USD at 1.0834 while Oracle used 1.0821.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Similar pattern observed in{" "}
                <span className="text-primary cursor-pointer hover:underline">
                  23 other transactions
                </span>{" "}
                this week.
              </p>
              <div className="bg-violet-500/[0.06] border border-violet-500/10 rounded-lg p-3.5 mt-3">
                <span className="text-[11px] text-violet-600 font-medium">
                  Suggested Action
                </span>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                  Review FX rate source configuration in SAP connector settings.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={cardClass}>
            <span className="text-[12px] text-foreground font-medium">
              Quick Actions
            </span>
            <div className="mt-3 space-y-0.5">
              {[
                "View in SAP",
                "View matched record",
                "View batch",
                "Download evidence",
              ].map((action) => (
                <button
                  key={action}
                  onClick={() =>
                    toast.info(`Opening ${action}...`, {
                      description: "Redirecting to external system.",
                    })
                  }
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" /> {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€ Tab components â”€â”€ */

function OverviewTab({ tx }: { tx: Transaction }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className={cardClass}>
        <h4 className="text-[13px] mb-5 text-foreground font-medium">
          Transaction Summary
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-[12px]">
          {[
            ["Transaction ID", tx.id.slice(0, 12)],
            ["External ID", tx.externalTransactionId],
            ["Source", tx.sourceSystemId],
            ["Type", tx.transactionType],
            [
              "Amount",
              `${tx.currency} ${(tx.amountIn || tx.amountOut).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            ],
            ["Date", tx.occurredAt],
          ].map(([label, value]) => (
            <div key={label as string}>
              <span className="text-[11px] text-muted-foreground">{label}</span>
              <p className="text-foreground mt-1 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={cardClass}>
        <h4 className="text-[13px] mb-5 text-foreground font-medium">
          Reconciliation Summary
        </h4>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={tx.reconciliationStatus} />
            <span className="text-[12px] text-muted-foreground">
              1 field mismatch found
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-[12px] bg-muted/40 rounded-lg p-4">
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">
                Field
              </span>
              <span className="text-foreground font-medium">Amount</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">
                Source
              </span>
              <span className="text-green-600 font-medium">
                {reconResults.mismatches[0].source}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">
                Target
              </span>
              <span className="text-red-600 font-medium">
                {reconResults.mismatches[0].target}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Difference: {reconResults.mismatches[0].diff} (1.07%)
          </p>
        </div>
      </div>
    </div>
  );
}

function RawPayloadTab() {
  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[13px] text-foreground font-medium">
          Source Payload
        </h4>
        <button
          onClick={() => {
            navigator.clipboard.writeText(rawPayload);
            toast.success("Copied to clipboard");
          }}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-lg hover:bg-muted"
        >
          <Copy className="w-3 h-3" /> Copy
        </button>
      </div>
      <pre className="text-[12px] text-emerald-600 bg-muted/50 rounded-lg p-5 overflow-auto font-mono leading-relaxed border border-border/30">
        {rawPayload}
      </pre>
    </div>
  );
}

function ValidationTab() {
  return (
    <div className={cardClass}>
      <h4 className="text-[13px] mb-5 text-foreground font-medium">
        Validation Results
      </h4>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-muted-foreground border-b border-border">
            <th className="text-left pb-3 pr-4 font-medium">Rule</th>
            <th className="text-left pb-3 px-4 font-medium">Result</th>
            <th className="text-left pb-3 pl-4 font-medium">Detail</th>
          </tr>
        </thead>
        <tbody>
          {validationResults.map((v, i) => (
            <tr
              key={i}
              className="border-b border-border/30 hover:bg-muted/20 transition-colors"
            >
              <td className="py-3 pr-4 text-foreground font-medium">
                {v.rule}
              </td>
              <td className="py-3 px-4">
                <StatusBadge
                  status={v.result === "PASS" ? "VALID" : v.result}
                  size="xs"
                />
              </td>
              <td className="py-3 pl-4 text-muted-foreground">{v.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReconciliationTab() {
  return (
    <div className="space-y-4">
      <div className={cardClass}>
        <h4 className="text-[13px] mb-5 text-foreground font-medium">
          Side-by-Side Comparison
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Source (SAP)
            </span>
            <div className="mt-4 space-y-3 text-[12px]">
              {Object.entries(reconResults.source).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground tabular-nums font-medium">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Target (Oracle)
            </span>
            <div className="mt-4 space-y-3 text-[12px]">
              {Object.entries(reconResults.target).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span
                    className={`tabular-nums font-medium ${
                      k === "amount" ? "text-red-600" : "text-foreground"
                    }`}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertsTab() {
  return (
    <div className={cardClass}>
      <h4 className="text-[13px] mb-5 text-foreground font-medium">
        Related Alerts
      </h4>
      <div className="space-y-2">
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-foreground font-medium">
                ALT-4820
              </span>
              <StatusBadge status="HIGH" size="xs" />
              <StatusBadge status="OPEN" size="xs" />
            </div>
            <p className="text-[12px] text-muted-foreground mt-1.5">
              Amount mismatch exceeds 1% threshold for SAP reconciliation
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Created 28m ago
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditTab() {
  return (
    <div className={cardClass}>
      <h4 className="text-[13px] mb-5 text-foreground font-medium">Timeline</h4>
      <div className="relative ml-3">
        <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
        {auditEvents.map((e, i) => (
          <div key={i} className="flex items-start gap-4 pb-6 relative">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 relative z-10 ring-[3px] ring-card" />
            <div>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-muted-foreground tabular-nums font-mono text-[11px]">
                  {e.time}
                </span>
                <span className="text-foreground font-medium">{e.user}</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5 leading-relaxed">
                {e.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
