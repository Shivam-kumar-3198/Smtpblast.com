"use client";

import { motion, useReducedMotion } from "framer-motion";

const POINTS = [4, 10, 7, 14, 11, 18, 15, 22, 19, 26];
const WIDTH = 120;
const HEIGHT = 40;

function buildPath() {
  const max = Math.max(...POINTS);
  const step = WIDTH / (POINTS.length - 1);
  return POINTS.map((p, i) => {
    const x = i * step;
    const y = HEIGHT - (p / max) * HEIGHT;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

export function MiniSparkline() {
  const shouldReduceMotion = useReducedMotion();
  const path = buildPath();

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="overflow-visible"
      aria-hidden
    >
      <motion.path
        d={path}
        fill="none"
        stroke="var(--color-accent-600)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={shouldReduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
    </svg>
  );
}
