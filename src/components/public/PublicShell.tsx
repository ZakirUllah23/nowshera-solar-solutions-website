"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  MapPin,
  Phone,
  ShieldCheck,
  Menu,
  X,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  Clock,
  Mail,
  Zap,
  BatteryCharging,
  Layers,
  Award,
} from "lucide-react";

interface PublicShellProps {
  children: React.ReactNode;
}

export default function PublicShell({ children }: PublicShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Hardware Catalogue", href: "/products" },
    { label: "Solar Packages", href: "/packages" },
    { label: "Special Offers", href: "/offers" },
    { label: "About Us", href: "/about" },
    { label: "Contact & Showroom", href: "/contact" },
  ];

  const whatsappUrl =
    "https://wa.me/923000000000?text=Hello%20Nowshera%20Solar%20Solutions,%20I%20would%20like%20to%20inquire%20about%20your%20solar%20hardware%20and%20turnkey%20packages.";

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* 1. TOP UTILITY BAR (Deep Slate, Crisp Monospace Accents) */}
      <div className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          {/* Left: Location & Technical Wholesale Hotline */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>MAIN GT ROAD, NOWSHERA, KPK</span>
            </div>
            <span className="hidden sm:inline text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-500">HOTLINE:</span>
              <a
                href="tel:+923000000000"
                className="text-amber-400 hover:text-amber-300 font-bold transition tabular-nums"
              >
                +92 (300) 000-0000
              </a>
            </div>
          </div>

          {/* Right: Authorised Distributor Monospace Badge & Staff Portal */}
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              TIER-1 AUTHORISED DISTRIBUTOR
            </span>
            <span className="hidden md:inline text-slate-800">|</span>
            <Link
              href="/admin"
              className="text-slate-400 hover:text-amber-400 transition font-medium flex items-center gap-1"
            >
              <span>STAFF PORTAL</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STICKY MAIN NAVBAR (Architectural Engineering Header) */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo: Clean Monogram & Sharp Technical Lettering */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 shadow-sm group-hover:bg-amber-400 transition-colors shrink-0">
                <Sun className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                    NOWSHERA SOLAR
                  </span>
                  <span className="text-xs font-mono font-semibold text-amber-500 uppercase tracking-wider">
                    SOLUTIONS
                  </span>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  WHOLESALE HARDWARE &amp; EPC ENGINEERING
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links (Swiss Grid Discipline) */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isActive
                        ? "text-amber-400 bg-slate-800/90 border border-slate-700/80"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action CTAs */}
            <div className="hidden sm:flex items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold transition"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WHATSAPP DESK</span>
              </a>

              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
              >
                <span>CATALOGUE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition flex items-center justify-between ${
                      isActive
                        ? "text-amber-400 bg-slate-800 border border-slate-700"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold uppercase"
              >
                <MessageCircle className="w-4 h-4" />
                <span>DIRECT WHATSAPP DESK</span>
              </a>

              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                <span>EXPLORE CATALOGUE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">{children}</main>

      {/* 3. PROFESSIONAL B2B FOOTER (Exposed Hairline Grid, Engineering Structure) */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Column 1: Company Overview & Badges */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                  <Sun className="w-4 h-4 fill-slate-950" />
                </div>
                <div>
                  <span className="text-sm font-black text-white tracking-tight">
                    NOWSHERA SOLAR
                  </span>{" "}
                  <span className="text-xs font-mono font-semibold text-amber-500">
                    SOLUTIONS
                  </span>
                </div>
              </Link>

              <p className="text-xs text-slate-400 leading-relaxed">
                Direct importer &amp; wholesale distributor in Nowshera, Khyber
                Pakhtunkhwa. Supplying factory-certified Tier-1 monocrystalline
                modules, European &amp; Asian hybrid inverters, and high-density
                LiFePO4 battery banks across Pakistan.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-emerald-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  PEC LICENSED EPC
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-800 bg-slate-900 text-amber-400">
                  <Award className="w-3 h-3 text-amber-400" />
                  TIER-1 DISTRIBUTOR
                </span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                {"// PLATFORM NAVIGATION"}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>Home &amp; Overview</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>Hardware Catalogue</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/packages"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>Turnkey Solar Packages</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offers"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>Wholesale Offers &amp; Discounts</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>About Company &amp; Engineers</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>Contact &amp; Showroom Location</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin"
                    className="text-slate-500 hover:text-amber-400 transition flex items-center gap-1.5 pt-1 font-mono text-[11px]"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-700" />
                    <span>Staff Portal</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Core Product Lines */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                {"// HARDWARE DIVISIONS"}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/products#solar-panels"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Tier-1 N-Type Monocrystalline Modules</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products#solar-inverters"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    <span>Hybrid &amp; On-Grid Inverters (3kW – 50kW)</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products#lithium-batteries"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>LiFePO4 Lithium Storage Banks (51.2V)</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/packages"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-violet-400" />
                    <span>Turnkey Hybrid System Packages</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products#balance-of-system"
                    className="hover:text-amber-400 transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>GI Mounting, DC Cables &amp; Breakers</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Showroom */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                {"// SHOWROOM & WAREHOUSE"}
              </h4>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Showroom #4, Solar Market, Main GT Road, Near Cantonment
                    Board, Nowshera, KPK.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href="tel:+923000000000"
                    className="hover:text-amber-400 transition font-mono tabular-nums"
                  >
                    +92 (300) 000-0000 / (0923) 555-123
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <a
                    href="mailto:info@nowsherasolar.com"
                    className="hover:text-amber-400 transition font-mono"
                  >
                    info@nowsherasolar.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-mono text-[11px]">
                    MON – SAT: 9:00 AM – 7:00 PM (PKT)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright & Technical Disclaimers */}
          <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p className="font-mono text-[11px]">
              &copy; 2026 NOWSHERA SOLAR SOLUTIONS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
              <span>PEC LICENSED</span>
              <span>•</span>
              <span>PESCO NET-METERING READY</span>
              <span>•</span>
              <span>CONTAINER &amp; PALLET WHOLESALE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 4. INDUSTRIAL FLOATING WHATSAPP BUTTON (Crisp Badge, High-Contrast) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp Consultation"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-md shadow-lg border border-emerald-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all group font-mono text-xs"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
        </span>
        <MessageCircle className="w-4 h-4 fill-slate-950 text-slate-950" />
        <span>WHATSAPP DESK</span>
      </a>
    </div>
  );
}
