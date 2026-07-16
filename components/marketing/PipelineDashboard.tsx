"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Inbox,
  Send,
  ArrowUpRight,
  Lock,
  ShieldCheck,
  Mail,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* SMTPblast — Live Delivery Pipeline                                 */
/* ------------------------------------------------------------------ */

const CYCLE_DURATION = 3.6;
const CYCLE_GAP = 0.5;
const PERIOD = CYCLE_DURATION + CYCLE_GAP;
const PACKETS = [0, 1, 2];

const ORIGIN_PCT = 5;
const INBOX_PCT = 95;

const CHECKPOINTS = [
  { id: "spf", label: "SPF", positionPct: 27 },
  { id: "dkim", label: "DKIM", positionPct: 50 },
  { id: "dmarc", label: "DMARC", positionPct: 73 },
] as const;

const GAUGE_TARGET = 99.4;
const GAUGE_RADIUS = 26;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

const TICK_MS = 1400;
const LATENCY_BASELINE = 42;
const LATENCY_BARS = 16;
const DELIVERED_BASE = 1_428_910;

const COMPLIANCE_ITEMS = [
  "SPF · DKIM · DMARC aligned",
  "TLS 1.3 in transit",
  "rDNS (PTR) configured",
  "One-click unsubscribe (RFC 8058)",
  "Spam rate < 0.08%",
];

/* ---------------- Live Figures Hook ---------------- */

function useLiveFigures(paused: boolean) {
  const [rate, setRate] = useState(9240);
  const [latency, setLatency] = useState(LATENCY_BASELINE);
  const [latencyHistory, setLatencyHistory] = useState<number[]>(() =>
    Array.from({ length: LATENCY_BARS }, () => LATENCY_BASELINE)
  );
  const [delivered, setDelivered] = useState(DELIVERED_BASE);
  const rateRef = useRef(rate);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setRate((prev) => {
        const drift = Math.round((Math.random() - 0.5) * 280);
        return Math.min(10500, Math.max(8200, prev + drift));
      });
      setLatency(() => {
        const next = Math.round(LATENCY_BASELINE + (Math.random() - 0.5) * 6);
        setLatencyHistory((hist) => [...hist.slice(1), next]);
        return next;
      });
      setDelivered((prev) => {
        const perTick = (rateRef.current / 60) * (TICK_MS / 1000);
        const jitter = (Math.random() - 0.5) * 20;
        return Math.round(prev + perTick + jitter);
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [paused]);

  return { rate, latency, latencyHistory, delivered };
}

/* ---------------- Pipeline Checkpoint ---------------- */

function CheckpointNode({
  label,
  positionPct,
  done,
}: {
  label: string;
  positionPct: number;
  done: boolean;
}) {
  return (
    <div
      className="absolute top-0 flex flex-col items-center"
      style={{ left: `${positionPct}%`, transform: "translateX(-50%)" }}
    >
      <div
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border bg-white transition-all duration-500 ${
          done
            ? "border-orange-500 shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)] ring-4 ring-orange-50"
            : "border-slate-200"
        }`}
      >
        <span
          className={`absolute inset-[3px] rounded-full bg-gradient-to-br from-orange-500 to-amber-500 transition-all duration-500 ${
            done ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
          aria-hidden
        />
        <Check
          className={`relative h-4 w-4 transition-colors duration-500 ${
            done ? "text-white" : "text-slate-300"
          }`}
          strokeWidth={2.5}
        />
      </div>

      <div className="mt-2.5 flex flex-col items-center text-center">
        <span
          className={`text-[0.68rem] font-bold uppercase tracking-wider transition-colors duration-500 ${
            done ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {label}
        </span>
        <span
          className={`mt-0.5 text-[0.62rem] font-semibold uppercase tracking-widest text-orange-600 transition-all duration-500 ${
            done ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
          }`}
          aria-hidden={!done}
        >
          Verified
        </span>
      </div>
    </div>
  );
}

/* ---------------- Circular Gauge ---------------- */

function GaugeRing({ animate }: { animate: boolean }) {
  const targetOffset = GAUGE_CIRCUMFERENCE * (1 - GAUGE_TARGET / 100);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        className="-rotate-90 shrink-0 transform"
        aria-hidden
      >
        <circle
          cx="32"
          cy="32"
          r={GAUGE_RADIUS}
          fill="none"
          stroke="currentColor"
          className="text-slate-100"
          strokeWidth="5"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={GAUGE_RADIUS}
          fill="none"
          stroke="currentColor"
          className="text-orange-500"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={GAUGE_CIRCUMFERENCE}
          initial={animate ? { strokeDashoffset: GAUGE_CIRCUMFERENCE } : false}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
    </div>
  );
}

/* ---------------- Main Dashboard ---------------- */

export function PipelineDashboard() {
  const shouldReduceMotion = useReducedMotion();
  const staticMode = Boolean(shouldReduceMotion);
  const { rate, latency, latencyHistory, delivered } = useLiveFigures(staticMode);

  const [doneMap, setDoneMap] = useState<Record<string, boolean>>(() =>
    staticMode
      ? { spf: true, dkim: true, dmarc: true }
      : { spf: false, dkim: false, dmarc: false }
  );

  useEffect(() => {
    if (staticMode) return;
    const travelSpan = INBOX_PCT - ORIGIN_PCT;
    const timers = CHECKPOINTS.map((cp) => {
      const travelSeconds =
        ((cp.positionPct - ORIGIN_PCT) / travelSpan) * CYCLE_DURATION;
      return setTimeout(
        () => setDoneMap((prev) => ({ ...prev, [cp.id]: true })),
        travelSeconds * 1000
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [staticMode]);

  const progressPct = useMemo(() => {
    if (doneMap.dmarc) return INBOX_PCT;
    if (doneMap.dkim) return CHECKPOINTS[2].positionPct;
    if (doneMap.spf) return CHECKPOINTS[1].positionPct;
    return ORIGIN_PCT;
  }, [doneMap]);

  const packetDelay = (i: number) => i * PERIOD * 0.34;

  return (
    <div className="mx-auto max-w-5xl">
      {/* ================= Main Card ================= */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100/60 sm:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20">
              <Mail className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  SMTP<span className="font-medium text-orange-500">blast</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-200/60 bg-orange-50 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-orange-700">
                  Live
                </span>
              </div>
              <p className="text-xs font-medium text-slate-400">
                Real-time delivery telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-flex">
              <Lock className="h-3 w-3 text-slate-400" strokeWidth={2.5} aria-hidden />
              TLS 1.3 Enforced
            </span>
            <div className="flex items-baseline gap-1.5 whitespace-nowrap rounded-xl bg-slate-900 px-3.5 py-1.5 text-white shadow-sm">
              <span className="font-mono text-sm font-bold tabular-nums tracking-tight text-orange-400">
                {rate.toLocaleString("en-US")}
              </span>
              <span className="text-xs font-medium text-slate-300">sends/min</span>
            </div>
          </div>
        </div>

        {/* Pipeline Visualizer */}
        <div
          className="relative mt-8 h-24 select-none"
          role="img"
          aria-label="Emails travelling from send, passing SPF, DKIM and DMARC authentication, to the inbox"
        >
          {/* Base track */}
          <div
            aria-hidden
            className="absolute top-[20px] h-0.5 -translate-y-1/2 rounded-full bg-slate-100"
            style={{ left: `${ORIGIN_PCT}%`, right: `${100 - INBOX_PCT}%` }}
          />

          {/* Active progress */}
          <div
            aria-hidden
            className="absolute top-[20px] h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 transition-all duration-700 ease-out"
            style={{ left: `${ORIGIN_PCT}%`, width: `${progressPct - ORIGIN_PCT}%` }}
          />

          {/* Origin node */}
          <div
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${ORIGIN_PCT}%`, transform: "translateX(-50%)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-md shadow-slate-900/25 ring-4 ring-slate-100">
              <Send
                className="h-4 w-4 -translate-x-[1px] translate-y-[1px] text-orange-400"
                strokeWidth={2.25}
              />
            </div>
            <span className="mt-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-700">
              MTA Outbound
            </span>
            <span className="mt-0.5 text-[0.62rem]" aria-hidden>
              &nbsp;
            </span>
          </div>

          {/* Animated packets */}
          {!staticMode &&
            PACKETS.map((i) => (
              <motion.div
                key={i}
                aria-hidden
                className="absolute top-[20px] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-md border-2 border-white bg-orange-500 shadow-sm shadow-orange-500/50"
                initial={{ left: `${ORIGIN_PCT}%`, opacity: 0 }}
                animate={{ left: `${INBOX_PCT}%`, opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: CYCLE_DURATION,
                  times: [0, 0.05, 0.95, 1],
                  repeat: Infinity,
                  repeatDelay: CYCLE_GAP,
                  delay: packetDelay(i),
                  ease: "linear",
                }}
              />
            ))}

          {/* Destination ping rings */}
          {!staticMode &&
            PACKETS.map((i) => (
              <motion.span
                key={`ring-${i}`}
                aria-hidden
                className="absolute top-[20px] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400/60"
                style={{ left: `${INBOX_PCT}%` }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.5, 1.8] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatDelay: PERIOD - 0.8,
                  delay: packetDelay(i) + CYCLE_DURATION - 0.15,
                  ease: "easeOut",
                }}
              />
            ))}

          {/* Checkpoints */}
          {CHECKPOINTS.map((cp) => (
            <CheckpointNode
              key={cp.id}
              label={cp.label}
              positionPct={cp.positionPct}
              done={doneMap[cp.id]}
            />
          ))}

          {/* Inbox node */}
          <div
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${INBOX_PCT}%`, transform: "translateX(-50%)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-500 bg-orange-50 text-orange-600 shadow-sm ring-4 ring-orange-50/60">
              <Inbox className="h-4 w-4" strokeWidth={2.25} />
            </div>
            <span className="mt-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-900">
              Inbox
            </span>
            <span className="mt-0.5 text-[0.62rem]" aria-hidden>
              &nbsp;
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-8 grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 pt-2 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {/* Inbox placement */}
          <div className="flex items-center justify-between gap-4 py-5 sm:py-6 sm:pr-8">
            <div className="min-w-0">
              <div className="font-mono text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
                {GAUGE_TARGET}
                <span className="ml-0.5 font-sans text-base font-medium text-orange-500">
                  %
                </span>
              </div>
              <div className="mt-1 text-xs font-medium text-slate-500">
                Inbox placement rate
              </div>
            </div>
            <GaugeRing animate={!staticMode} />
          </div>

          {/* Delivery latency */}
          <div className="flex items-center justify-between gap-4 py-5 sm:px-8 sm:py-6">
            <div className="min-w-0">
              <div className="font-mono text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
                {latency}
                <span className="ml-1 font-sans text-base font-medium text-slate-400">
                  ms
                </span>
              </div>
              <div className="mt-1 text-xs font-medium text-slate-500">
                Average MTA latency
              </div>
            </div>
            <div aria-hidden className="flex h-9 shrink-0 items-end gap-1">
              {latencyHistory.map((v, i) => {
                const isLast = i === latencyHistory.length - 1;
                return (
                  <span
                    key={i}
                    className={`w-1 rounded-full transition-all duration-500 ease-out ${
                      isLast ? "bg-orange-500" : "bg-slate-100"
                    }`}
                    style={{
                      height: `${Math.max(20, Math.min(100, ((v - 25) / 20) * 100))}%`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Total delivered */}
          <div className="flex items-center justify-between gap-4 py-5 sm:py-6 sm:pl-8">
            <div className="min-w-0">
              <div className="font-mono text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
                {delivered.toLocaleString("en-US")}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-500">
                Delivered today
              </div>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-orange-50 text-orange-600">
              <ArrowUpRight className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </span>
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="mt-2 flex flex-col gap-3 border-t border-slate-100 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex shrink-0 items-center gap-2">
            <ShieldCheck
              className="h-4 w-4 text-orange-500"
              strokeWidth={2.5}
              aria-hidden
            />
            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-800">
              Gmail · Yahoo · Outlook Compliant
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {COMPLIANCE_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-500"
              >
                <Check
                  className="h-3.5 w-3.5 shrink-0 text-orange-500"
                  strokeWidth={2.5}
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}