"use client";

import { useSession } from "@/hooks";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading, logout } = useSession();

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <header>
        <span>{user.fullName}</span>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </header>
      <main>{children}</main>
    </div>
  );
}
