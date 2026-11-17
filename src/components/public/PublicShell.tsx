"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  MapPin,
  Phone,
  Menu,
  X,
  Clock,
  Mail,
} from "lucide-react";

interface PublicShellProps {
  children: React.ReactNode;
}

export default function PublicShell({ children }: PublicShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const pathname = usePathname();

  // Smart Hide-on-Scroll navbar logic
  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      // Always show if mobile menu is open or near top of the page
      if (mobileMenuOpen || currentY < 60) {
        setIsNavVisible(true);
        document.documentElement.style.setProperty("--nav-offset", "56px");
        lastY = currentY;
        return;
      }

      if (currentY > lastY + 8) {
        // Scrolling down -> hide navbar & collapse offset
        setIsNavVisible(false);
        document.documentElement.style.setProperty("--nav-offset", "0px");
      } else if (currentY < lastY - 8) {
        // Scrolling up -> reveal navbar & restore offset
        setIsNavVisible(true);
        document.documentElement.style.setProperty("--nav-offset", "56px");
      }
      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

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
    "https://wa.me/923195092003?text=Hello%20Nowshera%20Solar%20Solutions,%20I%20would%20like%20to%20inquire%20about%20your%20solar%20hardware%20and%20turnkey%20packages.";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      {/* 1. SLIM STICKY SMART-SCROLL NAVBAR (56px Height, Centered Menu, Mobile-First) */}
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-transform duration-300 ease-in-out ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 items-center h-14">
            {/* Left: Brand Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition shrink-0">
                  <Sun className="w-4 h-4 fill-white text-white" />
                </div>
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition truncate">
                  Nowshera Solar Solutions
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links Centered Horizontally */}
            <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
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

            {/* Right: Mobile Hamburger Toggle / Desktop Balanced Spacer */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition focus:outline-none"
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
        </div>

        {/* Mobile Navigation Drawer (Centered Links) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-sm animate-fade-in">
            <nav className="flex flex-col items-center text-center space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition ${
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

      {/* 3. CLEAN MOBILE-FIRST FOOTER (Deep Navy Blue, Centered Copyright) */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: Company Overview */}
            <div className="space-y-3">
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

              {/* Social Media Links: Facebook, Instagram, TikTok, LinkedIn, WhatsApp, Google */}
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="https://www.facebook.com/share/1ChVF421vN/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Nowshera Solar on Facebook"
                  title="Facebook"
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Nowshera Solar on Instagram"
                  title="Instagram"
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-[#E4405F] hover:border-[#E4405F] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                <a
                  href="https://www.tiktok.com/@nowsherasolarsolution"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Nowshera Solar on TikTok"
                  title="TikTok"
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-black hover:border-slate-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.49V8.75a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.87-.18z" />
                  </svg>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect with Nowshera Solar on LinkedIn"
                  title="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Nowshera Solar on WhatsApp"
                  title="WhatsApp"
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-[#25D366] hover:border-[#25D366] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>

                <a
                  href="https://www.google.com/search?kgmid=%2Fg%2F11z8r752bn&hl=en-PK&q=Nowshera%20Solar%20solution&shem=epsd1%2Cltae%2Crimspwouoe&shndl=30&source=sh%2Fx%2Floc%2Fosrp%2Fm1%2F4&kgs=5ae9bfab95735fc4"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Nowshera Solar Solution on Google"
                  title="Google Business Listing"
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Platform
              </h4>
              <ul className="space-y-1.5 text-xs">
                {navLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="hover:text-white transition flex items-center gap-1.5 text-slate-400"
                    >
                      <span className="text-slate-500 font-mono text-sm leading-none">›</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Hardware Divisions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Hardware
              </h4>
              <ul className="space-y-1.5 text-xs">
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
              </ul>
            </div>

            {/* Column 4: Showroom & Warehouse Info */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Showroom
              </h4>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <a
                    href="https://www.google.com/search?kgmid=%2Fg%2F11z8r752bn&hl=en-PK&q=Nowshera%20Solar%20solution&shem=epsd1%2Cltae%2Crimspwouoe&shndl=30&source=sh%2Fx%2Floc%2Fosrp%2Fm1%2F4&kgs=5ae9bfab95735fc4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition"
                  >
                    Main GT Road, Near Nowshera Cantt, Khyber Pakhtunkhwa.
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href="tel:+923195092003"
                    className="hover:text-white transition font-mono tabular-nums"
                  >
                    +92 (319) 509-2003
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

          {/* Centered Copyright Only */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
            <p>&copy; 2026 Nowshera Solar Solutions. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* 4. FLOATING CIRCULAR WHATSAPP BUTTON WITH EXPANDING PULSE WAVE RING */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center">
        {/* Radiating wave ring */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-wave pointer-events-none"
          aria-hidden="true"
        />

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Direct WhatsApp Consultation"
          title="Direct WhatsApp Consultation"
          className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
        >
          <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
