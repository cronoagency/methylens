"use client";

import { useEffect, useState, useRef, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Same interpretations as /results
const INTERPRETATIONS: Record<
  string,
  {
    what_it_measures: string;
    how_to_read: string;
    uncertainty: string;
    category_explanation: string;
  }
> = {
  horvath2013: {
    what_it_measures:
      "Estimates chronological age based on DNA methylation at 353 CpG sites. The first multi-tissue epigenetic clock (2013).",
    how_to_read:
      "Output is estimated biological age in years. Higher than chronological age = faster aging. Lower = slower aging.",
    uncertainty: "MAE \u00b13.6 years on blood.",
    category_explanation:
      "Biological age clocks estimate how old your body appears at the molecular level.",
  },
  hannum: {
    what_it_measures:
      "Estimates chronological age from blood DNA methylation at 71 CpG sites. Optimized for whole blood.",
    how_to_read:
      "Output is estimated biological age in years. Optimized for blood — results from other tissues may be less reliable.",
    uncertainty: "MAE \u00b13.9 years on blood.",
    category_explanation:
      "Biological age clocks estimate how old your body appears at the molecular level.",
  },
  dnamphenoage: {
    what_it_measures:
      "Estimates 'phenotypic age' incorporating clinical biomarkers alongside chronological age. 513 CpG sites.",
    how_to_read:
      "Higher than chronological age suggests elevated risk for age-related diseases. More clinically meaningful than first-gen clocks.",
    uncertainty: "MAE \u00b12.7 years for phenotypic age prediction.",
    category_explanation:
      "Second-generation clock: predicts a composite health measure, not just calendar age.",
  },
  dunedinpace: {
    what_it_measures:
      "Measures the current pace (rate) of biological aging — how fast you are aging right now. 173 CpG sites.",
    how_to_read:
      "1.0 = average rate. Above 1.0 = faster aging. Below 1.0 = slower. Typical range: 0.6\u20131.4.",
    uncertainty: "Test-retest ICC \u22480.89. Meaningful change \u22650.05.",
    category_explanation:
      "Pace clock: speedometer vs. odometer. Tells you how fast, not how far.",
  },
  dnamtl: {
    what_it_measures:
      "Estimates leukocyte telomere length from methylation at 140 CpG sites. Surrogate for qPCR measurement.",
    how_to_read:
      "Higher values = longer telomeres. Typical range: 4\u201310 kb. Longer relative to peers may suggest slower cellular aging.",
    uncertainty:
      "Explains 20\u201340% of variance in measured telomere length (r \u22480.5).",
    category_explanation:
      "Telomere estimation: proxy for chromosome-protective cap length.",
  },
  altumage: {
    what_it_measures:
      "Deep learning clock using same 353 CpG sites as Horvath 2013 with non-linear modeling.",
    how_to_read:
      "Output is estimated biological age in years. May capture patterns linear clocks miss.",
    uncertainty: "MAE \u00b12.2 years on multi-tissue samples.",
    category_explanation:
      "Biological age clock with improved accuracy through deep learning.",
  },
  grimage: {
    what_it_measures:
      "Mortality-focused clock using DNAm surrogates for 7 plasma proteins and smoking pack-years. 1,030 CpG sites.",
    how_to_read:
      "GrimAge acceleration (value minus chronological age) indicates mortality risk. Positive = higher risk.",
    uncertainty:
      "MAE \u00b14 years. Primary value is mortality/disease prediction, not age estimation.",
    category_explanation:
      "Mortality risk clock: captures exposure-related aging (smoking, metabolic stress).",
  },
  grimage2: {
    what_it_measures:
      "Updated GrimAge with additional plasma protein surrogates. Improved mortality prediction.",
    how_to_read:
      "Same as GrimAge. Acceleration indicates relative mortality risk.",
    uncertainty: "Improved over GrimAge v1 in independent validations.",
    category_explanation:
      "Mortality risk clock: captures patterns associated with death and disease.",
  },
  skinandblood: {
    what_it_measures:
      "Epigenetic clock optimized for skin and blood tissues. 391 CpG sites.",
    how_to_read:
      "Output is estimated biological age in years. Particularly useful for skin-derived or blood samples.",
    uncertainty: "MAE \u00b12.5 years on skin and blood tissues.",
    category_explanation:
      "Biological age clock optimized for specific tissue types.",
  },
  dnamfitage: {
    what_it_measures:
      "Composite fitness clock aggregating DNAm surrogates for gait speed, grip strength, FEV1, and VO2max.",
    how_to_read:
      "Lower values relative to chronological age suggest better overall physical fitness.",
    uncertainty:
      "Relatively recent clock (2023) with fewer independent validations.",
    category_explanation:
      "Fitness age clock: estimates biological age through the lens of physical fitness biomarkers.",
  },
};

const DISCREPANCY_TEXT =
  "It is normal for different epigenetic clocks to produce different age estimates from the same sample. " +
  "Each clock was designed to measure a different aspect of aging:\n\n" +
  "First-generation clocks (Horvath, Hannum) predict chronological age. " +
  "Second-generation clocks (PhenoAge, GrimAge) predict health outcomes like mortality. " +
  "Pace clocks (DunedinPACE) measure how fast you are aging right now. " +
  "Telomere estimators (DNAmTL) proxy a different biological mechanism entirely.\n\n" +
  "A discrepancy between clocks is information, not an error. " +
  "The pattern across clocks is often more informative than any single number.";

interface ClockResult {
  value: number;
  unit: string | null;
  category: string | null;
  cpg_coverage: number | null;
  cpg_present: number | null;
  cpg_required: number | null;
  warning: string | null;
  time_seconds: number;
  clock_metadata: Record<string, string> | null;
  mean: number;
  std: number | null;
  values: number[];
}

interface AnalysisData {
  status: string;
  validation: {
    cpg_sites: number;
    samples: number;
    missing_pct: number;
    warnings: string[];
  };
  results: {
    samples: number;
    cpg_sites: number;
    clocks: Record<string, ClockResult>;
    skipped: Record<string, unknown>;
    clock_errors: Record<string, string>;
    total_time: number;
  };
}

interface AnalysisRecord {
  id: string;
  filename: string | null;
  tier: string;
  clocksUsed: string[];
  status: string;
  createdAt: string;
  results: AnalysisData;
}

function CountUp({
  target,
  duration = 1.5,
  decimals = 1,
}: {
  target: number;
  duration?: number;
  decimals?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return <span ref={ref}>{value.toFixed(decimals)}</span>;
}

function ClockCard({
  name,
  result,
  index,
  large,
}: {
  name: string;
  result: ClockResult;
  index: number;
  large?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const interp = INTERPRETATIONS[name];

  const displayName =
    result.clock_metadata?.display_name ||
    name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const unit = result.unit || "years";
  const category = result.category || "biological_age";

  const isAge = category.includes("age") || unit === "years";
  const isPace = name === "dunedinpace";
  const isTelomere = name === "dnamtl";

  let valueColor = "text-primary";
  if (isPace) {
    valueColor = result.value <= 1.0 ? "text-positive" : "text-warning";
  } else if (isTelomere) {
    valueColor = "text-accent";
  }

  // suppress unused var
  void isAge;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`bg-surface rounded-2xl border border-border p-6
        shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
        ${large ? "md:col-span-2 md:row-span-2 p-8" : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            className={`font-semibold text-primary ${large ? "text-xl" : "text-base"}`}
          >
            {displayName}
          </h3>
          <span className="text-xs text-muted capitalize">
            {category.replace(/_/g, " ")}
          </span>
        </div>
        {result.warning && (
          <div className="group relative">
            <Info className="w-4 h-4 text-warning" />
            <div
              className="absolute right-0 top-6 w-64 p-3 bg-surface border border-border rounded-xl shadow-lg
              text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
            >
              {result.warning}
            </div>
          </div>
        )}
      </div>

      <div className={`${large ? "mb-6" : "mb-4"}`}>
        <span
          className={`${large ? "text-5xl" : "text-3xl"} font-bold ${valueColor}`}
        >
          <CountUp target={result.value} decimals={isPace ? 2 : 1} />
        </span>
        <span className="text-muted text-sm ml-2">
          {isPace ? "years/year" : isTelomere ? "kb" : unit}
        </span>
      </div>

      {result.cpg_coverage != null && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span>CpG coverage</span>
            <span>{(result.cpg_coverage * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                result.cpg_coverage >= 0.9 ? "bg-positive" : "bg-warning"
              }`}
              initial={{ width: 0 }}
              whileInView={{ width: `${result.cpg_coverage * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {interp && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
          >
            {expanded ? "Less" : "More"}
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 text-xs text-muted leading-relaxed space-y-2"
            >
              <p>
                <strong className="text-foreground">What it measures:</strong>{" "}
                {interp.what_it_measures}
              </p>
              <p>
                <strong className="text-foreground">How to read:</strong>{" "}
                {interp.how_to_read}
              </p>
              <p>
                <strong className="text-foreground">Uncertainty:</strong>{" "}
                {interp.uncertainty}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { status } = useSession();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [discrepancyOpen, setDiscrepancyOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/analyses/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setAnalysis(data.analysis);
        setLoading(false);
      })
      .catch(() => {
        setError("Analysis not found");
        setLoading(false);
      });
  }, [status, id]);

  if (loading || status === "loading") {
    return (
      <div className="dot-pattern min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="dot-pattern min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-muted text-lg">{error || "Analysis not found"}</p>
        <Link
          href="/dashboard"
          className="text-accent hover:text-accent/80 transition-colors font-medium"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const data = analysis.results;
  const clocks = data.results?.clocks || {};
  const clockEntries = Object.entries(clocks);

  const ageClocks = clockEntries.filter(
    ([name, r]) =>
      name !== "dunedinpace" &&
      name !== "dnamtl" &&
      (r.unit === "years" || r.category?.includes("age") || !r.unit)
  );
  const avgAge =
    ageClocks.length > 0
      ? ageClocks.reduce((sum, [, r]) => sum + r.value, 0) / ageClocks.length
      : null;

  const pace = clocks.dunedinpace;
  const telomere = clocks.dnamtl;

  const featuredNames = ["horvath2013", "dnamphenoage", "dunedinpace"];
  const featured = clockEntries.filter(([name]) =>
    featuredNames.includes(name)
  );
  const rest = clockEntries.filter(
    ([name]) => !featuredNames.includes(name)
  );

  return (
    <div className="dot-pattern min-h-screen">
      <nav className="w-full max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Dashboard</span>
        </Link>
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-primary"
        >
          methylens
        </Link>
        <div className="w-24" />
      </nav>

      {/* Meta bar */}
      <div className="w-full max-w-[1200px] mx-auto px-6 mb-4">
        <div className="flex items-center gap-4 text-sm text-muted">
          {analysis.filename && <span>{analysis.filename}</span>}
          <span>
            {new Date(analysis.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
            {analysis.tier}
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pt-8 pb-16 text-center">
        <motion.p
          className="text-sm text-muted mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Estimated Biological Age
        </motion.p>
        {avgAge != null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-7xl md:text-8xl font-bold text-accent">
              <CountUp target={avgAge} duration={1.8} decimals={1} />
            </span>
            <span className="text-2xl text-muted ml-3">years</span>
          </motion.div>
        )}
        <motion.p
          className="text-muted text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Average across {ageClocks.length} age clock
          {ageClocks.length !== 1 ? "s" : ""} &middot;{" "}
          {(data.results?.cpg_sites || 0).toLocaleString()} CpG sites &middot;{" "}
          {(data.results?.total_time || 0).toFixed(1)}s processing
        </motion.p>

        <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
          {pace && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-xs text-muted mb-1">Pace of Aging</p>
              <p
                className={`text-2xl font-bold ${pace.value <= 1 ? "text-positive" : "text-warning"}`}
              >
                <CountUp target={pace.value} decimals={2} />
              </p>
              <p className="text-xs text-muted">years/year</p>
            </motion.div>
          )}
          {telomere && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <p className="text-xs text-muted mb-1">Telomere Length</p>
              <p className="text-2xl font-bold text-accent">
                <CountUp target={telomere.value} decimals={2} />
              </p>
              <p className="text-xs text-muted">kb</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Clock cards */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-primary mb-8">Clock Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map(([name, result], i) => (
            <ClockCard key={name} name={name} result={result} index={i} large />
          ))}
          {rest.map(([name, result], i) => (
            <ClockCard
              key={name}
              name={name}
              result={result}
              index={featured.length + i}
            />
          ))}
        </div>

        {data.results?.skipped &&
          Object.keys(data.results.skipped).length > 0 && (
            <div className="mt-6 bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-primary mb-2">
                Skipped Clocks
              </h3>
              <p className="text-xs text-muted mb-3">
                These clocks were skipped due to insufficient CpG coverage.
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(data.results.skipped).map((name) => (
                  <span
                    key={name}
                    className="text-xs px-3 py-1 rounded-full bg-surface-hover border border-border text-muted"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

        {data.results?.clock_errors &&
          Object.keys(data.results.clock_errors).length > 0 && (
            <div className="mt-4 bg-alert/5 border border-alert/20 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-alert mb-2">
                Clock Errors
              </h3>
              {Object.entries(data.results.clock_errors).map(([name, err]) => (
                <p key={name} className="text-xs text-muted">
                  <strong>{name}:</strong> {err}
                </p>
              ))}
            </div>
          )}
      </section>

      {/* Why different numbers */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-16">
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
          <button
            onClick={() => setDiscrepancyOpen(!discrepancyOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold text-primary">
              Why different numbers?
            </h3>
            {discrepancyOpen ? (
              <ChevronUp className="w-5 h-5 text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted" />
            )}
          </button>
          {discrepancyOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-muted leading-relaxed whitespace-pre-line"
            >
              {DISCREPANCY_TEXT}
            </motion.div>
          )}
        </div>
      </section>

      {/* Download placeholder */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-32 text-center">
        <button
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold
            bg-gradient-to-r from-accent to-secondary
            shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30
            hover:-translate-y-0.5 transition-all duration-200
            opacity-60 cursor-not-allowed"
          disabled
        >
          <Download className="w-5 h-5" />
          Download Report (coming soon)
        </button>
      </section>

      <footer className="w-full border-t border-border py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span>
            &copy; {new Date().getFullYear()} Methylens &mdash; OpenMethyl
            Project
          </span>
          <div className="flex gap-6">
            <a
              href="https://github.com/openmethyl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
