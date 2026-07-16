import Image from "next/image";
import type { LucideIcon } from "lucide-react";

export function ServiceHeroCollage({
  primary,
  primaryAlt,
  secondary,
  secondaryAlt,
  badgeLabel,
  badgeIcon: BadgeIcon,
}: {
  primary: string;
  primaryAlt: string;
  secondary: string;
  secondaryAlt: string;
  badgeLabel: string;
  badgeIcon: LucideIcon;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[19rem] pb-9 pl-9 pr-3 pt-3 sm:max-w-sm sm:pb-12 sm:pl-12">
      <div className="relative aspect-[4/5] rotate-1 overflow-hidden rounded-[1.75rem] ring-1 ring-slate-900/[0.08] shadow-[0_32px_64px_-28px_rgba(15,23,42,0.35)]">
        <Image
          src={primary}
          alt={primaryAlt}
          fill
          sizes="(min-width: 640px) 24rem, 19rem"
          className="object-cover"
          priority
        />
      </div>

      <div className="absolute bottom-0 left-0 h-32 w-28 -rotate-3 overflow-hidden rounded-2xl ring-[3px] ring-white shadow-[0_24px_48px_-20px_rgba(15,23,42,0.45)] sm:h-40 sm:w-36">
        <Image
          src={secondary}
          alt={secondaryAlt}
          fill
          sizes="9rem"
          className="object-cover"
        />
      </div>

      <div className="absolute right-0 top-0 flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 shadow-[0_12px_28px_-10px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.06]">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white">
          <BadgeIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        <span className="text-xs font-semibold text-ink-950">{badgeLabel}</span>
      </div>
    </div>
  );
}
