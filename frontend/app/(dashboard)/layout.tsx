"use client";

import { useSession } from "@/hooks";
import { AppLayout } from "@/components/layout";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-[13px] text-muted-foreground">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout userName={user.fullName} userRole={user.roles[0] ?? "User"}>
      {children}
    </AppLayout>
  );
}
