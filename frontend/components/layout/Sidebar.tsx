"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  GitCompare,
  AlertTriangle,
  Sparkles,
  ScrollText,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react";

const navItems: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/reconciliation", icon: GitCompare, label: "Reconciliation" },
  { href: "/alerts", icon: AlertTriangle, label: "Alerts" },
  { href: "/ai", icon: Sparkles, label: "AI Copilot" },
  { href: "/audit", icon: ScrollText, label: "Audit Logs" },
  { href: "/admin", icon: Settings, label: "Admin" },
];

interface SidebarProps {
  userName: string;
  userRole: string;
}

export function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="w-[240px] min-w-[240px] bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-chart-2 flex items-center justify-center shadow-md shadow-primary/20">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="text-[15px] tracking-tight text-foreground font-semibold">
          AegisOps
        </span>
      </div>

      <div className="px-5 mb-2">
        <div className="h-px bg-gradient-to-r from-sidebar-border via-sidebar-border/50 to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-1 px-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 group ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground font-normal"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full gradient-accent" />
              )}
              <item.icon
                className={`w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  active ? "" : "group-hover:text-primary/60"
                }`}
                strokeWidth={active ? 2 : 1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 mb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
      </div>

      {/* User */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/25 to-chart-2/15 flex items-center justify-center text-[11px] text-primary shrink-0 font-semibold ring-2 ring-primary/10">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] text-foreground truncate font-medium">
              {userName}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
