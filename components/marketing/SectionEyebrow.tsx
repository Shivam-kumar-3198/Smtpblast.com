export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 py-1.5 pl-3.5 pr-4 text-[0.8rem] font-medium text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
      {children}
    </span>
  );
}
