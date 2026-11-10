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
  Clock,
  Mail,
  Award,
} from "lucide-react";

interface PublicShellProps {
  children: React.ReactNode;
}

export default function PublicShell({ children }: PublicShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Navigation Links in exact order
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Packages", href: "/packages" },
    { label: "Offers", href: "/offers" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ];

  const whatsappUrl =
    "https://wa.me/923000000000?text=Hello%20Nowshera%20Solar%20Solutions,%20I%20would%20like%20to%20inquire%20about%20your%20solar%20hardware%20and%20turnkey%20packages.";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      {/* 1. MAIN NAVBAR (Clean White, Corporate Blue Accent) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo: Icon + Nowshera Solar Solutions (No Subtitle) */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition shrink-0">
                <Sun className="w-5 h-5 fill-white text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                Nowshera Solar Solutions
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${
                      isActive
                        ? "text-blue-600 font-semibold"
                        : "text-slate-600 hover:text-blue-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1">
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
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "text-blue-600 bg-blue-50 font-semibold"
                        : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1">{children}</main>

      {/* 3. FOOTER SECTION (Deep Navy Blue, Authoritative & Clean) */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Column 1: Company Overview & Badges */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Sun className="w-4 h-4 fill-white text-white" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">
                  Nowshera Solar Solutions
                </span>
              </Link>

              <p className="text-xs text-slate-400 leading-relaxed">
                Direct wholesale importer and EPC contractor in Nowshera, KPK.
                Supplying verified Tier-1 solar panels, hybrid inverters, and
                LiFePO4 lithium batteries across Pakistan.
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-700 bg-slate-800/80 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  PEC Licensed EPC
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-700 bg-slate-800/80 text-slate-300">
                  <Award className="w-3.5 h-3.5 text-blue-400" />
                  Tier-1 Distributor
                </span>
              </div>
            </div>

            {/* Column 2: Platform Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Platform
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>Products</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/packages"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>Packages</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/offers"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>Offers</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Hardware Divisions */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Hardware
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/products#solar-panels"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>Solar Panels</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products#solar-inverters"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>Inverters</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products#lithium-batteries"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>Batteries</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/packages"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>Turnkey Systems</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products#balance-of-system"
                    className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                  >
                    <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                    <span>Mounting &amp; Cabling</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Showroom & Warehouse Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Showroom
              </h4>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Main GT Road, Near Nowshera Cantt, Khyber Pakhtunkhwa.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href="tel:+923000000000"
                    className="hover:text-white transition font-mono tabular-nums"
                  >
                    +92 (300) 000-0000
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href="mailto:info@nowsherasolar.com"
                    className="hover:text-white transition font-mono"
                  >
                    info@nowsherasolar.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono text-[11px]">
                    Mon – Sat: 8:30 AM – 6:30 PM (PKT)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p className="font-mono text-[11px]">
              &copy; 2026 NOWSHERA SOLAR SOLUTIONS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
              <Link href="/admin" className="hover:text-slate-400 transition">
                Staff Portal
              </Link>
              <span>•</span>
              <span>PESCO Net-Metering Ready</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 4. FLOATING OFFICIAL WHATSAPP BUTTON */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp Consultation"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all text-xs"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
