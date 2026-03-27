"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui";
import { Plus, Edit2, Trash2, Server, Users, ShieldCheck } from "lucide-react";

const users = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Admin",
    status: "ACTIVE",
    lastLogin: "2026-03-21 09:14",
  },
  {
    id: "USR-002",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "Reviewer",
    status: "ACTIVE",
    lastLogin: "2026-03-21 08:55",
  },
  {
    id: "USR-003",
    name: "Mike Chen",
    email: "mike.chen@company.com",
    role: "Analyst",
    status: "ACTIVE",
    lastLogin: "2026-03-20 17:30",
  },
  {
    id: "USR-004",
    name: "Sarah Kim",
    email: "sarah.kim@company.com",
    role: "Viewer",
    status: "INACTIVE",
    lastLogin: "2026-03-15 12:00",
  },
  {
    id: "USR-005",
    name: "Alex Rivera",
    email: "alex.r@company.com",
    role: "Reviewer",
    status: "ACTIVE",
    lastLogin: "2026-03-21 07:22",
  },
];

const roles = [
  { name: "Admin", users: 1, permissions: ["All permissions"] },
  {
    name: "Reviewer",
    users: 2,
    permissions: [
      "View transactions",
      "Review mismatches",
      "Resolve alerts",
      "View audit logs",
    ],
  },
  {
    name: "Analyst",
    users: 1,
    permissions: [
      "View transactions",
      "View reconciliation",
      "Use AI Copilot",
      "View audit logs",
    ],
  },
  {
    name: "Viewer",
    users: 1,
    permissions: ["View transactions", "View dashboard"],
  },
];

const sources = [
  {
    id: "SRC-001",
    name: "SAP",
    type: "ERP",
    status: "ACTIVE",
    lastSync: "2026-03-21 09:12",
    interval: "3m",
    records: "4,200/week",
  },
  {
    id: "SRC-002",
    name: "Oracle",
    type: "ERP",
    status: "ACTIVE",
    lastSync: "2026-03-21 09:10",
    interval: "5m",
    records: "3,800/week",
  },
  {
    id: "SRC-003",
    name: "Stripe",
    type: "Payment",
    status: "ACTIVE",
    lastSync: "2026-03-21 09:14",
    interval: "1m",
    records: "6,100/week",
  },
  {
    id: "SRC-004",
    name: "Plaid",
    type: "Banking",
    status: "ACTIVE",
    lastSync: "2026-03-21 09:08",
    interval: "5m",
    records: "2,400/week",
  },
  {
    id: "SRC-005",
    name: "Internal",
    type: "Journal",
    status: "WARNING",
    lastSync: "2026-03-21 08:45",
    interval: "10m",
    records: "1,900/week",
  },
];

const adminTabs = [
  { key: "users" as const, label: "Users", icon: Users },
  { key: "roles" as const, label: "Roles", icon: ShieldCheck },
  { key: "sources" as const, label: "Source Systems", icon: Server },
];

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "roles" | "sources">("users");

  const cardClass =
    "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)]";

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2>Admin</h2>
        <button className="flex items-center gap-1.5 px-4 py-2 text-[12px] bg-primary text-primary-foreground rounded-[10px] hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-3.5 h-3.5" />{" "}
          {tab === "users"
            ? "Add User"
            : tab === "roles"
              ? "Add Role"
              : "Add Source"}
        </button>
      </div>

      <div className="flex gap-0 border-b border-border">
        {adminTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className={`flex-1 bg-card rounded-xl overflow-auto ${cardClass}`}>
        {tab === "users" && (
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-card z-10 shadow-[0_1px_0_0_var(--border)]">
              <tr className="text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Last Login</th>
                <th className="px-4 py-3 w-20 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-border/30 hover:bg-primary/[0.02] transition-colors ${
                    i % 2 === 1 ? "bg-muted/20" : ""
                  }`}
                >
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-[10px] text-primary shrink-0 font-semibold">
                      {u.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="text-foreground font-medium">
                      {u.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-[3px] text-[11px] bg-muted rounded-md text-muted-foreground font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.status} size="xs" />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">
                    {u.lastLogin}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <button className="p-1.5 hover:bg-muted rounded-[8px] transition-colors">
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 rounded-[8px] transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "roles" && (
          <div className="p-6 grid grid-cols-2 gap-4">
            {roles.map((r) => (
              <div
                key={r.name}
                className="border border-border/40 rounded-xl p-5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] text-foreground font-medium">
                    {r.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {r.users} user{r.users !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {r.permissions.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-[3px] text-[10px] bg-muted rounded-md text-muted-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "sources" && (
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-card z-10 shadow-[0_1px_0_0_var(--border)]">
              <tr className="text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Last Sync</th>
                <th className="text-left px-4 py-3 font-medium">Interval</th>
                <th className="text-left px-4 py-3 font-medium">Volume</th>
                <th className="px-4 py-3 w-12 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s, i) => (
                <tr
                  key={s.id}
                  className={`border-b border-border/30 hover:bg-primary/[0.02] transition-colors ${
                    i % 2 === 1 ? "bg-muted/20" : ""
                  }`}
                >
                  <td className="px-4 py-3 flex items-center gap-3">
                    <Server className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-foreground font-medium">
                      {s.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} size="xs" />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">
                    {s.lastSync}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.interval}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {s.records}
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 hover:bg-muted rounded-[8px] transition-colors">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
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
