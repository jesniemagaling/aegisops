"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppLayoutProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}

export function AppLayout({ children, userName, userRole }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden font-[Inter,system-ui,sans-serif]">
      <Sidebar userName={userName} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
