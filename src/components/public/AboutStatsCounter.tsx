"use client";

import React, { useState, useEffect, useRef } from "react";

interface StatItem {
  target: number;
  suffix: string;
  metric: string;
}

const ABOUT_STATS: StatItem[] = [
  {
    target: 15,
    suffix: "MW+",
    metric: "Hardware Distributed",
  },
  {
    target: 500,
    suffix: "+",
    metric: "Turnkey Installations",
  },
  {
    target: 100,
    suffix: "%",
    metric: "Tier-1 Genuine Only",
  },
  {
    target: 24,
    suffix: "–48h",
    metric: "KPK Dispatch Time",
  },
];

export default function AboutStatsCounter() {
  const [counts, setCounts] = useState<number[]>(ABOUT_STATS.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1600; // ms
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            setCounts(
              ABOUT_STATS.map((item) => Math.floor(easeProgress * item.target))
            );

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCounts(ABOUT_STATS.map((item) => item.target));
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-slate-700/60"
    >
      {ABOUT_STATS.map((stat, idx) => (
        <div key={stat.metric} className="space-y-0.5">
          <div className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
            {counts[idx]}
            <span className="text-blue-400 ml-0.5">{stat.suffix}</span>
          </div>
          <span className="text-[11px] sm:text-xs font-mono text-slate-300 uppercase tracking-wider block">
            {stat.metric}
          </span>
        </div>
      ))}
    </div>
  );
}
