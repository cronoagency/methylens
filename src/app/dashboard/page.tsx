"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Clock,
  LogOut,
  Plus,
  ChevronRight,
  FlaskConical,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface AnalysisSummary {
  id: string;
  filename: string | null;
  tier: string;
  clocksUsed: string[];
  status: string;
  cpgCount: number | null;
  sampleCount: number | null;
  processingMs: number | null;
  createdAt: string;
  results: {
    results?: {
      clocks?: Record<string, { value: number; unit: string | null; category: string | null }>;
    };
  };
}

function getAvgAge(analysis: AnalysisSummary): number | null {
  const clocks = analysis.results?.results?.clocks;
  if (!clocks) return null;
  const ageValues = Object.entries(clocks)
    .filter(
      ([name, r]) =>
        name !== "dunedinpace" &&
        name !== "dnamtl" &&
        (r.unit === "years" || r.category?.includes("age") || !r.unit)
    )
    .map(([, r]) => r.value);
  if (ageValues.length === 0) return null;
  return ageValues.reduce((a, b) => a + b, 0) / ageValues.length;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/analyses")
      .then((r) => r.json())
      .then((data) => {
        setAnalyses(data.analyses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="dot-pattern min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const lastAnalysis = analyses[0];
  const lastAvgAge = lastAnalysis ? getAvgAge(lastAnalysis) : null;

  return (
    <div className="dot-pattern min-h-screen">
      {/* Header */}
      <nav className="w-full max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          methylens
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted hidden sm:block">
            {session?.user?.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>

      <main className="w-full max-w-[1200px] mx-auto px-6 pt-8 pb-32">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-primary mb-2">
            Welcome back
          </h1>
          <p className="text-muted">{session?.user?.email}</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted">Total Analyses</span>
            </div>
            <p className="text-3xl font-bold text-primary">{analyses.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-surface rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm text-muted">Last Analysis</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {lastAnalysis
                ? new Date(lastAnalysis.createdAt).toLocaleDateString()
                : "--"}
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
                <FlaskConical className="w-5 h-5 text-positive" />
              </div>
              <span className="text-sm text-muted">Latest Bio Age</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {lastAvgAge != null ? `${lastAvgAge.toFixed(1)}y` : "--"}
            </p>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-primary">Your Analyses</h2>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-medium text-sm
              bg-gradient-to-r from-accent to-secondary
              shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30
              hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </Link>
        </div>

        {/* Analysis list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : analyses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-surface rounded-2xl border border-border"
          >
            <FlaskConical className="w-12 h-12 text-muted/30 mx-auto mb-4" />
            <p className="text-muted mb-4">No analyses yet</p>
            <Link
              href="/analyze"
              className="text-accent hover:text-accent/80 transition-colors font-medium"
            >
              Upload your first sample
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis, i) => {
              const avgAge = getAvgAge(analysis);
              return (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/dashboard/analysis/${analysis.id}`}
                    className="block bg-surface rounded-xl border border-border p-5
                      hover:border-accent/30 hover:shadow-sm hover:-translate-y-0.5
                      transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-primary truncate">
                            {analysis.filename || "Unnamed analysis"}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium shrink-0">
                            {analysis.tier}
                          </span>
                          {analysis.status === "failed" && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-alert/10 text-alert font-medium shrink-0">
                              failed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted">
                          <span>
                            {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {analysis.clocksUsed.length > 0 && (
                            <span>{analysis.clocksUsed.length} clocks</span>
                          )}
                          {analysis.cpgCount != null && (
                            <span className="hidden sm:inline">
                              {analysis.cpgCount.toLocaleString()} CpGs
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        {avgAge != null && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-accent">
                              {avgAge.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted">bio age</p>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
