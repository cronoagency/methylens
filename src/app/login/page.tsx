"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const isVerify = searchParams.get("verify") === "true";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent || isVerify) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-full bg-positive/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-positive" />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-3">Check your email</h1>
        <p className="text-muted max-w-sm mx-auto">
          We sent a magic link to <strong className="text-foreground">{email || "your email"}</strong>.
          Click the link to sign in.
        </p>
        <p className="text-muted text-sm mt-6">
          Didn&apos;t receive it?{" "}
          <button
            onClick={() => { setSent(false); }}
            className="text-accent hover:text-accent/80 transition-colors font-medium"
          >
            Try again
          </button>
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm"
    >
      <h1 className="text-3xl font-bold text-primary mb-2">Sign in</h1>
      <p className="text-muted mb-8">
        Enter your email to receive a magic link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-border
                text-foreground placeholder:text-muted/50
                focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                transition-all"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 rounded-xl text-white font-semibold
            bg-gradient-to-r from-accent to-secondary
            shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30
            hover:-translate-y-0.5 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
            flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send magic link"
          )}
        </button>
      </form>

      <p className="text-xs text-muted text-center mt-8">
        No password needed. We&apos;ll send a secure link to your email.
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="dot-pattern min-h-screen">
      <nav className="w-full max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </Link>
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          methylens
        </Link>
        <div className="w-16" />
      </nav>

      <main className="flex items-center justify-center px-6 pt-24 pb-32">
        <Suspense fallback={<div className="text-muted">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
