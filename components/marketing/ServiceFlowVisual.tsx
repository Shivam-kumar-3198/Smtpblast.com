import {
  Server,
  ShieldCheck,
  Send,
  Inbox,
  Plug,
  LineChart,
  MessageCircle,
  ClipboardList,
  Users,
  Rocket,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { ServiceFlowNode } from "@/lib/services-content";

const ICON_MAP: Record<string, LucideIcon> = {
  Server,
  ShieldCheck,
  Send,
  Inbox,
  Plug,
  LineChart,
  MessageCircle,
  ClipboardList,
  Users,
  Rocket,
  TrendingUp,
};

export function ServiceFlowVisual({
  nodes,
  windowLabel,
  caption,
}: {
  nodes: ServiceFlowNode[];
  windowLabel: string;
  caption?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-900/[0.08] shadow-[0_48px_100px_-40px_rgba(15,23,42,0.35),0_2px_8px_rgba(15,23,42,0.05)]">
      {/* window chrome, matching the hero product window */}
      <div className="flex items-center gap-4 border-b border-slate-100 px-5 py-3">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        </span>
        <span className="mx-auto flex items-center gap-2 rounded-md bg-slate-50 px-8 py-1 font-mono text-[0.72rem] text-slate-400">
          {windowLabel}
        </span>
        <span aria-hidden className="w-[3.25rem]" />
      </div>

      <div
        role="img"
        aria-label={`How it flows: ${nodes.map((n) => n.label).join(" → ")}`}
        className="px-6 py-10 sm:px-10 sm:py-14"
      >
        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          {/* connecting line — vertical on mobile, horizontal on desktop */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent-500/40 to-transparent sm:left-6 sm:right-6 sm:top-6 sm:bottom-auto sm:h-px sm:w-auto sm:bg-gradient-to-r"
          />

          {nodes.map((node, i) => {
            const Icon = ICON_MAP[node.icon] ?? Server;
            const isOrigin = i === 0;
            const isDestination = i === nodes.length - 1;

            return (
              <div
                key={`${node.label}-${i}`}
                className="relative flex items-center gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-0 sm:text-center"
              >
                <span
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                    isOrigin
                      ? "bg-slate-900 text-white"
                      : isDestination
                        ? "border border-accent-500 bg-accent-50 text-accent-600"
                        : "bg-accent-600 text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="sm:mt-3 sm:max-w-[9rem]">
                  <p className="text-sm font-semibold text-ink-950">{node.label}</p>
                  {node.sublabel && (
                    <p className="mt-0.5 text-xs text-slate-500">{node.sublabel}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {caption && (
          <p className="mt-10 border-t border-slate-100 pt-6 text-center text-small text-slate-500 sm:mt-12">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
