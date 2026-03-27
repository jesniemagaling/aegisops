import { cn } from "@/lib/utils";

const statusStyles: Record<string, { bg: string; text: string; dot: string }> =
  {
    // Lifecycle
    INGESTED: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      dot: "bg-blue-500",
    },
    VALIDATED: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-600",
      dot: "bg-cyan-500",
    },
    RECONCILED: {
      bg: "bg-violet-500/10",
      text: "text-violet-600",
      dot: "bg-violet-500",
    },
    REVIEWED: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    EXPORTED: {
      bg: "bg-teal-500/10",
      text: "text-teal-600",
      dot: "bg-teal-500",
    },
    // Validation
    VALID: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      dot: "bg-green-500",
    },
    WARNING: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    INVALID: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    // Reconciliation
    MATCHED: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      dot: "bg-green-500",
    },
    MISMATCHED: {
      bg: "bg-orange-500/10",
      text: "text-orange-600",
      dot: "bg-orange-500",
    },
    MISSING: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    NEEDS_REVIEW: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      dot: "bg-yellow-500",
    },
    // Review
    PENDING_REVIEW: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      dot: "bg-yellow-500",
    },
    RESOLVED: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      dot: "bg-green-500",
    },
    ESCALATED: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    // Alerts
    OPEN: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    ACKNOWLEDGED: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      dot: "bg-amber-500",
    },
    CLOSED: { bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
    // Severity
    CRITICAL: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
    HIGH: {
      bg: "bg-orange-500/10",
      text: "text-orange-600",
      dot: "bg-orange-500",
    },
    MEDIUM: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-600",
      dot: "bg-yellow-500",
    },
    LOW: { bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
    // Generic
    ACTIVE: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      dot: "bg-green-500",
    },
    INACTIVE: {
      bg: "bg-gray-500/10",
      text: "text-gray-500",
      dot: "bg-gray-400",
    },
    RUNNING: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      dot: "bg-blue-500",
    },
    COMPLETED: {
      bg: "bg-green-500/10",
      text: "text-green-600",
      dot: "bg-green-500",
    },
    FAILED: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
  };

const fallback = {
  bg: "bg-gray-500/10",
  text: "text-gray-500",
  dot: "bg-gray-400",
};

interface StatusBadgeProps {
  status: string;
  size?: "xs" | "sm";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const s = statusStyles[status] || fallback;
  const isXs = size === "xs";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full whitespace-nowrap font-medium",
        s.bg,
        s.text,
        isXs ? "px-2 py-[2px] text-[10px]" : "px-2.5 py-[3px] text-[11px]",
      )}
      style={{ lineHeight: "16px" }}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          s.dot,
          isXs ? "w-[5px] h-[5px]" : "w-1.5 h-1.5",
        )}
      />
      {status.replace(/_/g, " ")}
    </span>
  );
}
