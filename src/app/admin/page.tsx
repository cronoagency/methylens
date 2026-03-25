"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  BarChart3,
  Calendar,
  LogOut,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface AdminStats {
  totalUsers: number;
  totalAnalyses: number;
  analysesToday: number;
  users: {
    id: string;
    email: string;
    plan: string;
    role: string;
    createdAt: string;
    _count: { analyses: number };
  }[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (
      status === "authenticated" &&
      (session?.user as Record<string, unknown>)?.role !== "admin"
    ) {
      router.push("/dashboard");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Forbidden");
        return r.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Access denied");
        setLoading(false);
      });
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="dot-pattern min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dot-pattern min-h-screen flex flex-col items-center justify-center gap-6">
        <Shield className="w-12 h-12 text-alert" />
        <p className="text-muted text-lg">{error}</p>
        <Link
          href="/dashboard"
          className="text-accent hover:text-accent/80 transition-colors font-medium"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="dot-pattern min-h-screen">
      <nav className="w-full max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-primary"
          >
            methylens
          </Link>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
            admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <main className="w-full max-w-[1200px] mx-auto px-6 pt-8 pb-32">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-primary mb-10"
        >
          Admin Panel
        </motion.h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {stats.totalUsers}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-surface rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm text-muted">Total Analyses</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {stats.totalAnalyses}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-positive/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-positive" />
              </div>
              <span className="text-sm text-muted">Analyses Today</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {stats.analysesToday}
            </p>
          </motion.div>
        </div>

        {/* Users list */}
        <h2 className="text-xl font-bold text-primary mb-4">Users</h2>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted px-5 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-muted px-5 py-3">
                    Plan
                  </th>
                  <th className="text-left text-xs font-medium text-muted px-5 py-3">
                    Analyses
                  </th>
                  <th className="text-left text-xs font-medium text-muted px-5 py-3">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-primary">
                      {user.email}
                      {user.role === "admin" && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">
                          admin
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted">
                      {user._count.analyses}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Privacy notice */}
        <div className="mt-6 bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-muted flex items-center gap-2">
            <Shield className="w-4 h-4 text-positive shrink-0" />
            Privacy by design: admin panel shows only metadata. User analysis
            results are never accessible from this view.
          </p>
        </div>
      </main>
    </div>
  );
}
