import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ href }: { href?: string | null }) {
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      aria-label="Message SMTPblast on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-success-600 text-white shadow-hover transition-colors hover:bg-success-500 print:hidden"
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
    </a>
  );
}
