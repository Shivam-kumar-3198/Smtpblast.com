import { Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-semibold tracking-tight text-ink-950", className)}
      aria-label="SMTPblast home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent-600 text-white">
        <Send className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <span className="text-lg">
        SMTP<span className="text-accent-600">blast</span>
      </span>
    </Link>
  );
}
