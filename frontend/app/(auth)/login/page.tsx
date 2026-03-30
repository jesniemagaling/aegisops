"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { authStore } from "@/lib/auth";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await login({ email, password });
      authStore.setAuth(response.accessToken, response.user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shadow-primary/25 mb-4">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-[20px] font-semibold text-foreground tracking-tight">
            AegisOps
          </h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            Transaction Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl p-8 card-shadow">
          <h2 className="text-[15px] font-semibold text-foreground mb-1">
            Sign in
          </h2>
          <p className="text-[12px] text-muted-foreground mb-6">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full bg-background border border-border/50 rounded-lg px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-colors hover:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-background border border-border/50 rounded-lg px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-colors hover:border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-[12px] text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-[13px] font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-6">
          AegisOps &copy; {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
