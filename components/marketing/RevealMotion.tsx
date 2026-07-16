"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function RevealMotion({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
