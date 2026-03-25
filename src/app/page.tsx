"use client";

import { motion } from "framer-motion";
import { FlaskConical, Code, ShieldCheck, Upload, Cpu, BookOpen } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: FlaskConical,
    title: "143 Clocks",
    description:
      "Every peer-reviewed epigenetic clock in one analysis. First-gen, second-gen, pace, telomere, fitness.",
  },
  {
    icon: Code,
    title: "Open Source",
    description:
      "Full pipeline on GitHub. Every coefficient, every imputation step, every line of code. Verify everything.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Retention",
    description:
      "Your data is processed in-memory and never written to disk. Nothing is stored. Nothing is logged.",
  },
];

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload",
    description: "Drag & drop your methylation CSV. We accept beta values from any array platform.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Analyze",
    description:
      "Our engine runs your data through up to 143 epigenetic clocks in under two minutes. In-memory, zero disk.",
  },
  {
    icon: BookOpen,
    step: "03",
    title: "Understand",
    description:
      "Get clear, contextualized results with uncertainty ranges, cross-clock comparisons, and plain-language interpretation.",
  },
];

export default function LandingPage() {
  return (
    <div className="dot-pattern min-h-screen">
      {/* Nav */}
      <nav className="w-full max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-primary">
          methylens
        </span>
        <div className="flex items-center gap-6 text-sm text-muted">
          <a
            href="https://github.com/openmethyl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <Link href="/analyze" className="hover:text-foreground transition-colors">
            Analyze
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pt-24 pb-20 md:pt-36 md:pb-32 text-center">
        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your DNA. 143 lenses.
        </motion.h1>
        <motion.p
          className="mt-6 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Upload your epigenetic data. Get independent analysis across 143
          scientific clocks. Open source. Zero data retention.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <Link
            href="/analyze"
            className="inline-block px-8 py-4 rounded-full text-white font-semibold text-lg
              bg-gradient-to-r from-accent to-secondary
              shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30
              hover:-translate-y-0.5 transition-all duration-200"
          >
            Analyze Now
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="bg-surface rounded-2xl p-8 border border-border
                shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                <f.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-32">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-primary text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          How it works
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border shadow-sm
                flex items-center justify-center mx-auto mb-6
                hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <s.icon className="w-7 h-7 text-accent" />
              </div>
              <span className="text-xs font-mono text-accent tracking-widest">{s.step}</span>
              <h3 className="text-xl font-semibold text-primary mt-2 mb-3">{s.title}</h3>
              <p className="text-muted text-sm leading-relaxed max-w-xs mx-auto">
                {s.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span>&copy; {new Date().getFullYear()} Methylens &mdash; OpenMethyl Project</span>
          <div className="flex gap-6">
            <a
              href="https://github.com/openmethyl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
