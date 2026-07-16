import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const RevealMotion = dynamic(() =>
  import("./RevealMotion").then((mod) => mod.RevealMotion)
);

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <RevealMotion delay={delay} className={className}>
      {children}
    </RevealMotion>
  );
}
