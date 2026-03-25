"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Proxy via Next.js API route — il backend non è esposto al browser
const API_URL = "";

const DISCLAIMER_SHORT =
  "The results are produced by peer-reviewed, open-source scientific algorithms. " +
  "They are NOT a medical diagnosis. Biological age is a statistical estimate with a margin of error. " +
  "Different clocks may produce different age estimates from the same sample — this is expected. " +
  "These results should not be used to make medical decisions without consulting a qualified healthcare professional.";

type UploadState = "idle" | "selected" | "uploading" | "processing" | "error";

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) {
      setError("Please upload a CSV file with methylation beta values.");
      setState("error");
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setError("File too large. Maximum 100MB.");
      setState("error");
      return;
    }
    setFile(f);
    setError("");
    setState("selected");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const analyze = useCallback(async () => {
    if (!file) return;

    setState("uploading");
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tier", "tier1");

    try {
      setProgress(30);
      setState("processing");

      const res = await fetch(`/api/analyze`, {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(
          typeof body.detail === "string"
            ? body.detail
            : body.detail?.message || JSON.stringify(body.detail) || "Analysis failed"
        );
      }

      const data = await res.json();
      setProgress(100);

      // Store results in sessionStorage and navigate
      sessionStorage.setItem("methylens_results", JSON.stringify(data));
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }, [file, router]);

  const reset = useCallback(() => {
    setFile(null);
    setState("idle");
    setError("");
    setProgress(0);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isProcessing = state === "uploading" || state === "processing";

  return (
    <div className="dot-pattern min-h-screen">
      {/* Nav */}
      <nav className="w-full max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
        <span className="text-xl font-bold tracking-tight text-primary">methylens</span>
        <div className="w-16" />
      </nav>

      <main className="w-full max-w-[640px] mx-auto px-6 pt-16 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            Upload your data
          </h1>
          <p className="text-muted mb-10">
            CSV file with methylation beta values. Columns as CpG sites (cg########), rows as samples.
          </p>
        </motion.div>

        {/* Drop zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => !isProcessing && inputRef.current?.click()}
            className={`
              relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer
              transition-all duration-200
              ${dragOver
                ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                : state === "selected"
                  ? "border-accent/50 bg-surface"
                  : state === "error"
                    ? "border-alert/50 bg-alert/5"
                    : "border-border bg-surface hover:border-accent/30 hover:bg-surface-hover"
              }
              ${isProcessing ? "pointer-events-none" : ""}
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={onFileChange}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <Loader2 className="w-10 h-10 text-accent animate-spin" />
                  <p className="text-primary font-medium">
                    {state === "uploading" ? "Uploading..." : "Analyzing your data..."}
                  </p>
                  <p className="text-muted text-sm">
                    Running epigenetic clocks. This may take up to 2 minutes.
                  </p>
                  {/* Progress bar */}
                  <div className="w-full max-w-xs h-2 bg-border rounded-full overflow-hidden mt-2">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent to-secondary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ) : file && state === "selected" ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <FileText className="w-10 h-10 text-accent" />
                  <p className="text-primary font-medium">{file.name}</p>
                  <p className="text-muted text-sm">{formatSize(file.size)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                    className="text-sm text-muted hover:text-foreground transition-colors mt-1"
                  >
                    Choose a different file
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <Upload className={`w-10 h-10 ${state === "error" ? "text-alert" : "text-muted"}`} />
                  <p className="text-primary font-medium">
                    Drag & drop your CSV here
                  </p>
                  <p className="text-muted text-sm">
                    or click to browse &middot; max 100MB
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-start gap-3 bg-alert/5 border border-alert/20 rounded-xl p-4"
            >
              <AlertTriangle className="w-5 h-5 text-alert shrink-0 mt-0.5" />
              <p className="text-sm text-alert">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-surface border border-border rounded-xl p-5"
        >
          <p className="text-xs text-muted leading-relaxed">{DISCLAIMER_SHORT}</p>
        </motion.div>

        {/* Analyze button */}
        <AnimatePresence>
          {state === "selected" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8 text-center"
            >
              <button
                onClick={analyze}
                className="inline-block px-10 py-4 rounded-full text-white font-semibold text-lg
                  bg-gradient-to-r from-accent to-secondary
                  shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30
                  hover:-translate-y-0.5 transition-all duration-200"
              >
                Analyze
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
