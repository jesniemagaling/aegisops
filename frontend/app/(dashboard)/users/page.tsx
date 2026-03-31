"use client";

import { useEffect, useCallback, useState } from "react";
import { getUsers } from "@/lib/api";
import { useApi } from "@/hooks";
import { StatusBadge } from "@/components/ui";
import { Search } from "lucide-react";
import type { PaginatedData, User } from "@/types";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const fetchUsers = useCallback(() => getUsers(1, 50), []);
  const { data, loading, error, execute } =
    useApi<PaginatedData<User>>(fetchUsers);

  useEffect(() => {
    execute();
  }, [execute]);

  const filtered = data?.items.filter(
    (u) =>
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 h-full page-enter">
      <div className="flex items-center justify-between">
        <h2>Users</h2>
        <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 w-[260px] border border-border/50">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none flex-1"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-600">
          {error}
        </div>
      )}

      <div className="flex-1 bg-card rounded-xl overflow-auto card-shadow">
        {loading ? (
          <div className="p-4 space-y-3">
            <div className="h-8 bg-muted rounded-lg animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-6 bg-muted rounded-lg animate-pulse w-10" />
                <div className="h-6 bg-muted rounded-lg animate-pulse flex-[2]" />
                <div className="h-6 bg-muted rounded-lg animate-pulse flex-[3]" />
                <div className="h-6 bg-muted rounded-lg animate-pulse flex-1" />
                <div className="h-6 bg-muted rounded-lg animate-pulse flex-1" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-[12px]">
            <thead className="sticky top-0 bg-card z-10 shadow-[0_1px_0_0_var(--border)]">
              <tr className="text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Roles</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered && filtered.length > 0 ? (
                filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b border-border/30 hover:bg-primary/[0.02] transition-colors ${
                      i % 2 === 1 ? "bg-muted/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-[10px] text-primary shrink-0 font-semibold">
                        {u.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-foreground font-medium">
                        {u.fullName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.email}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-[3px] text-[10px] bg-muted rounded-md text-muted-foreground font-medium"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status} size="xs" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {search ? "No users match your search" : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
