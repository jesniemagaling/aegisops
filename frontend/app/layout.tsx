import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AegisOps",
  description: "Transaction Intelligence Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
