"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

/* -------------------------------------------------------------------------
   1. HERO CAROUSEL WITH TYPEWRITER EFFECT (Bright & Clean Blue Theme)
------------------------------------------------------------------------- */
interface Slide {
  id: number;
  imageUrl: string;
  alt: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80",
    alt: "Utility-scale monocrystalline solar panel arrays under sunlight",
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1920&q=80",
    alt: "Commercial rooftop solar installation in Pakistan",
  },
  {
    id: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1920&q=80",
    alt: "High-voltage hybrid inverters and lithium battery bank storage",
  },
  {
    id: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1920&q=80",
    alt: "Industrial warehouse solar power system installation",
  },
];

const TYPEWRITER_PHRASES = [
  "N-Type Bifacial Solar Panels.",
  "IP65 Hybrid Solar Inverters.",
  "LiFePO4 Lithium Storage Banks.",
  "Turnkey Commercial Solar Systems.",
];

export function HeroCarouselWithTypewriter() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Typewriter state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Background Carousel 5-second interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Typewriter Effect logic
  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && text === currentPhrase) {
      // Pause at full phrase for 2.2 seconds
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && text === "") {
      // Switch phrase after deleting
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
      }, 300);
    } else {
      // Typing or deleting characters
      const speed = isDeleting ? 30 : 60;
      timeout = setTimeout(() => {
        setText((current) =>
          isDeleting
            ? currentPhrase.substring(0, current.length - 1)
            : currentPhrase.substring(0, current.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex]);

  return (
    <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Images Crossfade - High Visibility & Brightness */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center brightness-[0.88] contrast-[1.05]"
          />
        </div>
      ))}

      {/* Lighter Clean Navy Blue Overlay (Bright & Clear) */}
      <div className="absolute inset-0 bg-slate-950/40 z-10" />

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 w-full py-20 lg:py-24">
        <div className="max-w-3xl space-y-6">
          {/* Headline Line 1 + Dynamic Typewriter Line 2 */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Direct Importers &amp; <br className="hidden sm:inline" />
              Wholesalers of <br />
              <span className="text-blue-400 font-black">
                {text}
              </span>
              <span
                className="inline-block text-blue-400 font-light animate-pulse ml-1 select-none"
                aria-hidden="true"
              >
                |
              </span>
            </h1>
          </div>

          {/* Sub-copy */}
          <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal drop-shadow-sm">
            Supplying A-grade pallet &amp; container stock, verified manufacturer
            warranties, and PEC-compliant turnkey installations across Nowshera,
            Peshawar, Mardan, and Northern Pakistan.
          </p>

          {/* 1-2 Word CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm"
            >
              <span>Catalog</span>
            </Link>

            <Link
              href="/packages"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-semibold text-sm backdrop-blur-sm transition"
            >
              <span>Packages</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   2. SIMPLIFIED EXPERIENCE & STATISTICS COUNTER BAR
------------------------------------------------------------------------- */
interface StatItem {
  target: number;
  suffix: string;
  metric: string;
}

const STATS_DATA: StatItem[] = [
  {
    target: 10,
    suffix: "+ Years",
    metric: "Solar Supply",
  },
  {
    target: 15,
    suffix: "+",
    metric: "Trusted Brands",
  },
  {
    target: 1250,
    suffix: "+",
    metric: "Projects Done",
  },
  {
    target: 25,
    suffix: "+ MW",
    metric: "Power Installed",
  },
];

export function AnimatedStatsCounter() {
  const [counts, setCounts] = useState<number[]>(STATS_DATA.map(() => 0));
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
              STATS_DATA.map((item) => Math.floor(easeProgress * item.target))
            );

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCounts(STATS_DATA.map((item) => item.target));
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div
      ref={containerRef}
      className="bg-slate-900 border-y border-slate-800 text-white relative z-20 py-2"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {STATS_DATA.map((stat, idx) => (
            <div
              key={stat.metric}
              className="py-6 px-4 sm:px-6 flex flex-col justify-center items-center text-center space-y-1"
            >
              <div className="font-mono text-3xl sm:text-4xl font-bold text-white tabular-nums tracking-tight">
                {counts[idx].toLocaleString()}
                <span className="text-blue-400 ml-1">{stat.suffix}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-medium text-slate-300">
                {stat.metric}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
