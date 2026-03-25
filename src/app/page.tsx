"use client";

import { motion } from "framer-motion";
import {
  FlaskConical, Code, ShieldCheck, Upload, Cpu, BookOpen,
  ArrowRight, Globe, Users, FileText, ChevronDown, Beaker,
  Clock, Heart, Activity, Dna
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
      "Every peer-reviewed epigenetic clock in one analysis. Horvath, Hannum, PhenoAge, GrimAge, DunedinPACE, and 138 more.",
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
      "Your data is processed in-memory and never written to disk. Nothing is stored. Nothing is logged. Your DNA stays yours.",
  },
];

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload",
    description: "Drag & drop your methylation CSV. We accept beta values from any array platform — 450K, EPIC, EPICv2.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "Analyze",
    description:
      "Our engine runs your data through up to 143 epigenetic clocks in seconds. In-memory, zero disk writes.",
  },
  {
    icon: BookOpen,
    step: "03",
    title: "Understand",
    description:
      "Get clear results with uncertainty ranges, cross-clock comparisons, and plain-language interpretation. No black box.",
  },
];

const clockCategories = [
  {
    icon: Clock,
    title: "Biological Age",
    clocks: "Horvath, Hannum, PhenoAge, AltumAge, SkinAndBlood",
    description: "How old is your body compared to your calendar age?",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Activity,
    title: "Pace of Aging",
    clocks: "DunedinPACE",
    description: "How fast are you aging right now? A speedometer, not an odometer.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Dna,
    title: "Telomere Length",
    clocks: "DNAmTL",
    description: "Epigenetic estimate of your telomere length — a marker of cellular aging.",
    color: "text-positive",
    bg: "bg-positive/10",
  },
  {
    icon: Heart,
    title: "Mortality Risk",
    clocks: "GrimAge, GrimAge2",
    description: "Second-generation clocks calibrated on health outcomes, not just age.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const providers = [
  { name: "TruDiagnostic", note: "Download your beta values from your account dashboard" },
  { name: "Elysium Health", note: "Request raw data via support" },
  { name: "NOVOS", note: "Contact support for beta values export" },
  { name: "Any EPIC/450K array", note: "Standard Illumina beta values CSV" },
];

const faqs = [
  {
    q: "What file do I need?",
    a: "A CSV file containing beta values from an Illumina methylation array (450K, EPIC, or EPICv2). Most providers can give you this file — it contains hundreds of thousands of methylation measurements from your DNA sample."
  },
  {
    q: "Why do different clocks give different results?",
    a: "Each clock was trained on different data, measures different aspects of aging, and uses different CpG sites. Horvath measures multi-tissue biological age. DunedinPACE measures your current pace of aging. GrimAge predicts mortality risk. They're different instruments measuring different things — like a thermometer and a blood pressure cuff both tell you about your health, but measure different things."
  },
  {
    q: "Is this a medical diagnosis?",
    a: "No. Epigenetic clocks are research tools that provide statistical estimates. They are not validated for clinical diagnosis. If you have health concerns, consult a healthcare professional. We provide data and context — not medical advice."
  },
  {
    q: "What happens to my data?",
    a: "Nothing. Your file is processed entirely in-memory and never written to disk. No genetic data is stored, logged, or transmitted to third parties. The code is open source — you can verify this yourself on GitHub."
  },
  {
    q: "How accurate are the results?",
    a: "Each clock has a published margin of error (MAE). Horvath: ±3.6 years. Hannum: ±3.9 years. PhenoAge: ±2.7 years. These are averages from the original publications — individual results may vary. We show uncertainty ranges alongside every result."
  },
  {
    q: "Is this free?",
    a: "The core analysis with 5 major clocks is free, with no account required. Extended analysis (143 clocks) and longitudinal tracking will be available as paid features."
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-surface-hover transition-colors"
      >
        <span className="font-medium text-primary">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-6 pb-5 text-muted text-sm leading-relaxed"
        >
          {a}
        </motion.div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="dot-pattern min-h-screen">
      {/* Nav */}
      <nav className="w-full max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight text-primary">
          methylens
        </span>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="#clocks" className="hover:text-foreground transition-colors hidden md:block">
            Clocks
          </Link>
          <Link href="#faq" className="hover:text-foreground transition-colors hidden md:block">
            FAQ
          </Link>
          <a
            href="https://openmethyl.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors hidden md:block"
          >
            Open Source
          </a>
          <Link
            href="/analyze"
            className="px-4 py-2 rounded-full text-white text-sm font-medium
              bg-gradient-to-r from-accent to-secondary
              hover:-translate-y-0.5 transition-all duration-200"
          >
            Analyze Now
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative w-full max-w-[1200px] mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-28 text-center overflow-hidden">
        {/* Background video */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-15">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover rounded-3xl"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
        <motion.div
          className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          Open source epigenetic analysis
        </motion.div>
        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tight text-primary leading-[1.1]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your DNA.
          <br />
          <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
            143 lenses.
          </span>
        </motion.h1>
        <motion.p
          className="mt-6 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Your epigenetic test gave you one number. We give you 143.
          Independent analysis. Open source. Zero data retention.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-lg
              bg-gradient-to-r from-accent to-secondary
              shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30
              hover:-translate-y-0.5 transition-all duration-200"
          >
            Analyze Now <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="https://openmethyl.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg
              border border-border text-primary
              hover:bg-surface hover:-translate-y-0.5 transition-all duration-200"
          >
            <Code className="w-5 h-5" /> View Source
          </a>
        </motion.div>
      </section>

      {/* Social proof numbers */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "143", label: "Epigenetic clocks" },
            { value: "22", label: "With full metadata" },
            { value: "0", label: "Bytes stored" },
            { value: "100%", label: "Open source" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="py-6"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
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

      {/* The problem */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-24">
        <div className="bg-surface rounded-3xl border border-border p-8 md:p-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              You paid $500 for one number.
            </h2>
            <p className="text-muted text-lg leading-relaxed mb-4">
              Your epigenetic test provider used one algorithm, on one platform, calibrated on one population.
              They gave you a single biological age and a PDF. You can&apos;t verify how they calculated it.
              You can&apos;t compare with other methods. You can&apos;t analyze your own data.
            </p>
            <p className="text-muted text-lg leading-relaxed mb-6">
              There are 143 published epigenetic clocks. Each measures something different.
              Each is peer-reviewed and open source. Your provider showed you one.
              <span className="text-primary font-medium"> We show you all of them.</span>
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 text-accent font-medium hover:underline"
            >
              Try it now — it&apos;s free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Clock categories */}
      <section id="clocks" className="w-full max-w-[1200px] mx-auto px-6 pb-24">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-primary text-center mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Not all clocks measure the same thing
        </motion.h2>
        <p className="text-muted text-center max-w-2xl mx-auto mb-12">
          Epigenetic clocks fall into distinct categories. Each answers a different question about your biology.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {clockCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="bg-surface rounded-2xl p-8 border border-border
                shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-5`}>
                <cat.icon className={`w-6 h-6 ${cat.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{cat.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-3">{cat.description}</p>
              <p className="text-xs font-mono text-muted/70">{cat.clocks}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-24">
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

      {/* Supported providers */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-24">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-primary text-center mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Works with your test
        </motion.h2>
        <p className="text-muted text-center max-w-2xl mx-auto mb-12">
          Got beta values from any Illumina array? Upload and analyze.
        </p>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {providers.map((p, i) => (
            <motion.div
              key={p.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-surface rounded-xl p-6 border border-border text-center
                hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="font-semibold text-primary mb-2">{p.name}</div>
              <div className="text-xs text-muted">{p.note}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* For researchers */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-accent/5 to-secondary/5 rounded-3xl border border-border p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
                For researchers
              </div>
              <h2 className="text-3xl font-bold text-primary mb-4">
                API access. Full pipeline. Your data, your infrastructure.
              </h2>
              <p className="text-muted leading-relaxed mb-6">
                Run 143 clocks on your cohort via REST API. Integrate into your pipeline.
                Or clone the repo and run it on your own servers. MIT license — no strings attached.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://openmethyl.org"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium
                    hover:-translate-y-0.5 transition-all duration-200"
                >
                  <FileText className="w-4 h-4" /> API Docs
                </a>
                <a
                  href="https://github.com/cronoagency/methylens"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-primary text-sm font-medium
                    hover:bg-surface hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Code className="w-4 h-4" /> GitHub
                </a>
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-border p-6 font-mono text-sm">
              <div className="text-muted mb-2"># Analyze with Methylens API</div>
              <div className="text-primary">
                curl -X POST methylens.com/api/analyze \
              </div>
              <div className="text-primary pl-4">
                -F &quot;file=@beta_values.csv&quot; \
              </div>
              <div className="text-primary pl-4">
                -F &quot;tier=tier2&quot;
              </div>
              <div className="text-muted mt-4"># Returns JSON with 15 clock results</div>
              <div className="text-muted"># including metadata and interpretation</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="w-full max-w-[800px] mx-auto px-6 pb-24">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-primary text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Questions
        </motion.h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full max-w-[1200px] mx-auto px-6 pb-32 text-center">
        <motion.h2
          className="text-3xl md:text-5xl font-bold text-primary mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Your data. Your analysis.
        </motion.h2>
        <p className="text-muted text-lg mb-10 max-w-xl mx-auto">
          Free. Open source. No account needed. Upload your beta values and see what 143 clocks say about your DNA.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold text-lg
            bg-gradient-to-r from-accent to-secondary
            shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30
            hover:-translate-y-0.5 transition-all duration-200"
        >
          Start Free Analysis <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border py-8">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span>&copy; {new Date().getFullYear()} Methylens &mdash; A Crono Agency project</span>
          <div className="flex gap-6">
            <a
              href="https://openmethyl.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              OpenMethyl
            </a>
            <a
              href="https://github.com/cronoagency/methylens"
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
