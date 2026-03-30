"use client";

import { useState } from "react";
import { Sparkles, Send, TrendingUp, ArrowRight } from "lucide-react";

const sampleQueries = [
  "Why are SAP mismatches increasing this week?",
  "What's the root cause of Oracle validation failures?",
  "Show me patterns in EUR→USD reconciliation differences",
  "Summarize today's ingestion health",
];

interface AnalysisResult {
  query: string;
  summary: string;
  explanation: string;
  metrics: { label: string; value: string; trend?: "up" | "down" }[];
  relatedTxns: string[];
  confidence: number;
}

const mockResult: AnalysisResult = {
  query: "Why are SAP mismatches increasing this week?",
  summary:
    "SAP reconciliation mismatches increased 42% this week, primarily driven by FX rate discrepancies in EUR→USD conversions.",
  explanation:
    "Analysis of 194 mismatches this week reveals that 72% (140 cases) involve amount differences in EUR-denominated transactions reconciled against USD targets. The root cause appears to be a configuration drift in SAP\u2019s FX rate source — SAP is using ECB rates (updated daily at 16:00 CET) while Oracle uses Bloomberg rates (real-time). On high-volatility days (Mon, Wed), mismatch rates spike to 3.8% vs the baseline 1.2%.",
  metrics: [
    { label: "Mismatches this week", value: "194", trend: "up" },
    { label: "FX-related", value: "72%", trend: "up" },
    { label: "Avg difference", value: "€142.30" },
    { label: "Peak day", value: "Wednesday" },
  ],
  relatedTxns: [
    "TXN-89420",
    "TXN-89412",
    "TXN-89407",
    "TXN-89401",
    "TXN-89398",
  ],
  confidence: 87,
};

export default function AiCopilotPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const cardClass = "bg-card rounded-xl card-shadow";

  const runQuery = (q: string) => {
    setQuery(q);
    setLoading(true);
    setTimeout(() => {
      setResult({ ...mockResult, query: q });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-[960px]">
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-5 h-5 text-violet-500" />
        <h2>AI Copilot</h2>
        <span className="text-[10px] bg-violet-500/10 text-violet-600 px-2 py-0.5 rounded-full font-medium">
          AI-POWERED ANALYSIS
        </span>
      </div>
      <p className="text-[12px] text-muted-foreground -mt-3 leading-relaxed">
        Ask questions about your transaction data. Results are AI-generated and
        should be verified against source evidence.
      </p>

      {/* Query Input */}
      <div className={`${cardClass} p-6`}>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && query && runQuery(query)}
            placeholder="Ask about transaction patterns, anomalies, or root causes..."
            className="flex-1 bg-background border border-border/50 rounded-lg px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-colors hover:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
          />
          <button
            onClick={() => query && runQuery(query)}
            className="flex items-center gap-2 px-5 py-2.5 text-[12px] bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
            disabled={!query || loading}
          >
            <Send className="w-3.5 h-3.5" /> Analyze
          </button>
        </div>
        {!result && !loading && (
          <div className="mt-4 flex flex-wrap gap-2">
            {sampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => runQuery(q)}
                className="px-3.5 py-2 text-[11px] bg-muted rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className={`${cardClass} p-12 flex flex-col items-center gap-3`}>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] text-muted-foreground">
            Analyzing transaction data...
          </span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4 flex-1 overflow-auto">
          {/* Context bar */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-violet-500/[0.06] border border-violet-500/10 rounded-lg px-4 py-2.5">
            <Sparkles className="w-3 h-3 text-violet-500 shrink-0" />
            <span>AI-generated analysis</span>
            <span className="ml-auto">
              Confidence:{" "}
              <span className="text-violet-600 font-medium">
                {result.confidence}%
              </span>
            </span>
          </div>

          {/* Summary */}
          <div className={`${cardClass} p-6`}>
            <h4 className="text-[13px] mb-2.5 text-foreground font-medium">
              Summary
            </h4>
            <p className="text-[13px] text-foreground leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            {result.metrics.map((m) => (
              <div key={m.label} className={`${cardClass} p-4`}>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  {m.label}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[20px] text-foreground leading-none font-semibold">
                    {m.value}
                  </span>
                  {m.trend && (
                    <TrendingUp
                      className={`w-3.5 h-3.5 ${m.trend === "up" ? "text-red-500" : "text-green-600"}`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div className={`${cardClass} p-6`}>
            <h4 className="text-[13px] mb-2.5 text-foreground font-medium">
              Detailed Explanation
            </h4>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {result.explanation}
            </p>
          </div>

          {/* Related */}
          <div className={`${cardClass} p-6`}>
            <h4 className="text-[13px] mb-3 text-foreground font-medium">
              Related Transactions
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.relatedTxns.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1.5 text-[11px] bg-primary/[0.06] text-primary rounded-lg cursor-pointer hover:bg-primary/[0.12] transition-colors font-medium"
                >
                  {t}
                </span>
              ))}
              <span className="px-2.5 py-1.5 text-[11px] text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                View all 140 <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
