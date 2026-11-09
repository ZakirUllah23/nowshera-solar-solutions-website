"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

/* -------------------------------------------------------------------------
   1. HERO CAROUSEL WITH TYPEWRITER EFFECT (Industrial Architecture)
------------------------------------------------------------------------- */
interface Slide {
  id: number;
  imageUrl: string;
  alt: string;
  technicalLabel: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80",
    alt: "Utility-scale monocrystalline solar panel arrays under sunlight",
    technicalLabel: "PV MODULE IMPORT & CONTAINER STOCK",
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1920&q=80",
    alt: "Commercial rooftop solar installation in Pakistan",
    technicalLabel: "COMMERCIAL & INDUSTRIAL EPC COMMISSIONING",
  },
  {
    id: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1920&q=80",
    alt: "High-voltage hybrid inverters and lithium battery bank storage",
    technicalLabel: "HIGH-DENSITY LiFePO4 STORAGE ARCHITECTURE",
  },
  {
    id: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1920&q=80",
    alt: "Industrial warehouse solar power system installation",
    technicalLabel: "PESCO NET-METERING THREE-PHASE ARRAYS",
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
      const speed = isDeleting ? 32 : 65;
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
    <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Images Crossfade */}
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
            className="object-cover object-center filter brightness-[0.60] contrast-[1.08]"
          />
        </div>
      ))}

      {/* Dark Architectural Slate Overlay & Technical Hairline Grid Pattern */}
      <div className="absolute inset-0 bg-slate-950/75 z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] z-10 pointer-events-none" />

      {/* Content Container (Left-Aligned Industrial Swiss Grid) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 w-full py-20 lg:py-28">
        <div className="max-w-3xl space-y-6">
          {/* Top Monospace Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-900/90 border border-slate-700/80 font-mono text-xs text-amber-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>[ AUTHORISED TIER-1 WHOLESALE &amp; EPC DISTRIBUTOR — KPK ]</span>
          </div>

          {/* Static Headline Line 1 + Dynamic Typewriter Line 2 */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Direct Importers &amp; <br className="hidden sm:inline" />
              Wholesalers of <br />
              <span className="text-amber-400 font-black">
                {text}
              </span>
              <span
                className="inline-block text-amber-400 font-light animate-pulse ml-1 select-none"
                aria-hidden="true"
              >
                |
              </span>
            </h1>
          </div>

          {/* Sub-copy: Concrete B2B/B2C Value Proposition */}
          <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
            Supplying A-grade pallet &amp; container stock, verified manufacturer
            warranties, and PEC-compliant turnkey installations across Nowshera,
            Peshawar, Mardan, and Northern Pakistan.
          </p>

          {/* CTAs: Sharp Industrial Rounded-MD Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              <span>Explore Hardware Catalogue &rarr;</span>
            </Link>

            <Link
              href="/packages"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs uppercase tracking-wider transition-colors"
            >
              <span>View Turnkey Packages</span>
            </Link>
          </div>

          {/* Technical Verification Monospace Strip */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>FACTORY-SEALED PALLETS</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">✓</span>
              <span>VERIFIABLE QR BARCODES</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sky-400 font-bold">✓</span>
              <span>PESCO NET-METERING APPROVED</span>
            </div>
          </div>
        </div>

        {/* Bottom Slide-Indicator Bar (01 / 02 / 03 / 04) */}
        <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-8 z-20 flex items-center gap-2 bg-slate-950/90 p-2 rounded border border-slate-800 font-mono text-xs">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`px-2.5 py-1 rounded transition-colors ${
                idx === currentSlide
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            >
              0{idx + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   2. EXPOSED-GRID ANIMATED AUTHORITY COUNTER BAR (Section 2)
------------------------------------------------------------------------- */
interface StatItem {
  target: number;
  suffix: string;
  metric: string;
  sub: string;
}

const STATS_DATA: StatItem[] = [
  {
    target: 10,
    suffix: "+",
    metric: "YEARS IN SOLAR SUPPLY",
    sub: "Wholesale & EPC Track Record",
  },
  {
    target: 15,
    suffix: "+",
    metric: "TIER-1 GLOBAL BRANDS",
    sub: "Direct Factory-Verified Stock",
  },
  {
    target: 1250,
    suffix: "+",
    metric: "SYSTEMS COMMISSIONED",
    sub: "Residential, Industrial & Tube-Wells",
  },
  {
    target: 25,
    suffix: "+ MW",
    metric: "CLEAN POWER DEPLOYED",
    sub: "Across KPK & Northern Districts",
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
      className="bg-slate-950 border-y border-slate-800 text-white relative z-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {STATS_DATA.map((stat, idx) => (
            <div
              key={stat.metric}
              className="p-6 sm:p-8 flex flex-col justify-between space-y-2"
            >
              <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-bold text-white tabular-nums tracking-tight">
                {counts[idx].toLocaleString()}
                <span className="text-amber-500 ml-0.5">{stat.suffix}</span>
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  {stat.metric}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {stat.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
