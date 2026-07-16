import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="text-2xl font-bold text-white">
      SMTP<span className="text-accent-500">blast</span>
    </Link>
  );
}