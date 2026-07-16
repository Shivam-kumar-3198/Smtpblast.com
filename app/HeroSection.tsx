"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Mail, BarChart3, ShieldCheck } from "lucide-react";

export function HeroSection() {
  // Animation variants for staggered orchestrations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative min-h-[90vh] w-full bg-[#030712] overflow-hidden flex items-center justify-center py-20 lg:py-32">
      {/* Premium Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">
        {/* Left Side: Dynamic Left Copy & CTA */}
        <motion.div
          className="flex flex-col space-y-8 text-center lg:text-left items-center lg:items-start"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Global Standard Glass Pill Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-inner"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">
              Introducing SMTPblast AI v2.0
            </span>
          </motion.div>

          {/* Masterfully Balanced Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.1]"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              AI-Powered Email
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">
              Delivery at Scale
            </span>
          </motion.h1>

          {/* High-Conversion Supporting Body Text */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-slate-400 max-w-xl lg:max-w-none leading-relaxed font-normal"
          >
            The intelligent SMTP server that guarantees 99% inbox placement. Automated SPF/DKIM/DMARC routing,
            predictive time optimization, and automated IP warm-ups built for hyper-growth teams.
          </motion.p>

          {/* Balanced Call To Actions */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <a
              href="#signup"
              className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 h-12 rounded-full font-medium text-sm text-slate-950 bg-white hover:bg-slate-100 shadow-xl hover:shadow-white/10 transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 h-12 rounded-full font-medium text-sm text-slate-300 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Talk to Deliverability Experts
            </a>
          </motion.div>

          {/* Micro Social Proof Layer */}
          <motion.div
            variants={itemVariants}
            className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 border-t border-slate-900 w-full"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 99.8% Server Uptime
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> No Credit Card Required
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 1-Click Setup
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: High-Fidelity Native Dashboard Mockup */}
        <motion.div
          className="hidden lg:block relative w-full"
          initial={{ opacity: 0, x: 40, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle Outer Shadow Orb */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 rounded-2xl blur-2xl -z-10 transform scale-95" />

          {/* The Dashboard Wrapper */}
          <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Window controls header bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/40 border-b border-slate-900">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
              </div>
              <div className="text-[11px] text-slate-500 font-mono tracking-wider">smtpblast-dashboard</div>
              <div className="w-4" />
            </div>

            {/* Inner App Mock Layout */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {/* Metric Card 1 */}
              <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Inbox Rate</div>
                  <div className="text-lg font-semibold text-white tracking-tight">99.4%</div>
                </div>
              </div>

              {/* Metric Card 2 */}
              <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Outbound</div>
                  <div className="text-lg font-semibold text-white tracking-tight">2.4M</div>
                </div>
              </div>

              {/* Metric Card 3 */}
              <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Reputation</div>
                  <div className="text-lg font-semibold text-white tracking-tight">99/100</div>
                </div>
              </div>

              {/* Visual Simulated Delivery Line Graph */}
              <div className="col-span-3 bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl h-44 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Real-time IP Warmup Analytics</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                    Optimization Active
                  </span>
                </div>

                {/* SVG Curve Vector Representation */}
                <div className="w-full h-24 pt-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 60 Q 40 40 80 55 T 160 25 T 240 15 T 300 5"
                      fill="none"
                      stroke="url(#chartGradient)"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0 60 Q 40 40 80 55 T 160 25 T 240 15 T 300 5"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

