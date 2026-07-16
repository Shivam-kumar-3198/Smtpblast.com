import { CheckCircle2, XCircle } from "lucide-react";
import { proofFootnote, proofRows } from "@/content/proof-strip";
import { Reveal } from "./Reveal";
import { SectionEyebrow } from "./SectionEyebrow";

export function ProofStrip() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="flex flex-col items-start gap-4">
          <SectionEyebrow>Shared vs. dedicated</SectionEyebrow>
          <h2 className="max-w-2xl text-h3 font-semibold tracking-tight text-ink-950 sm:text-h2">
            Shared IPs put your inbox rate in someone else&apos;s hands.
          </h2>
        </Reveal>

        <Reveal delay={0.05} className="mt-10 overflow-hidden overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-900/[0.08] shadow-[0_24px_64px_-32px_rgba(15,23,42,0.25)]">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-surface-50">
                <th className="py-4 pl-6 pr-4 text-small font-medium text-slate-400">&nbsp;</th>
                <th className="py-4 pr-4 text-small font-medium text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-danger-600" strokeWidth={1.5} />
                    Shared IP
                  </span>
                </th>
                <th className="py-4 pr-6 text-small font-medium text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success-600" strokeWidth={1.5} />
                    Dedicated IP
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {proofRows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 pl-6 pr-4 text-sm font-medium text-ink-950">{row.label}</td>
                  <td className="py-4 pr-4 text-sm text-slate-600">{row.shared}</td>
                  <td className="py-4 pr-6 text-sm text-ink-950">{row.dedicated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <p className="mt-4 text-small text-slate-400">{proofFootnote}</p>
      </div>
    </section>
  );
}
