import React from "react";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/public/PublicShell";
import AboutStatsCounter from "@/components/public/AboutStatsCounter";
import {
  ShieldCheck,
  Zap,
  Cpu,
  CheckCircle2,
  Truck,
  Wrench,
  Compass,
  FileCheck,
  Building2,
  Award,
  PhoneCall,
  Gauge,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "About Us | Nowshera Solar Solutions — Tier-1 Wholesale Distributor & EPC",
  description:
    "Learn about Nowshera Solar Solutions, Managing Director Zakir Ullah Khan, our certified electrical engineering team, local diagnostic repair workshop, and direct wholesale solar distribution across Khyber Pakhtunkhwa.",
};

export default function AboutPage() {
  return (
    <PublicShell>
      {/* -------------------------------------------------------------------
          1. HERO SECTION (Natural Lighting, Clean Title & Subtext, Animated Counters)
      ------------------------------------------------------------------- */}
      <section className="relative bg-slate-900 text-white border-b border-slate-800 overflow-hidden py-16 sm:py-20 md:py-24">
        {/* High-Resolution Engineering Background with Natural Lighting */}
        <Image
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
          alt="Solar Hardware Distribution Facility"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.92] contrast-[1.03]"
        />
        {/* Natural Subtle Contrast Overlay */}
        <div className="absolute inset-0 bg-slate-950/45 z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-3xl space-y-4 sm:space-y-5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Powering Northern Pakistan with A-Grade Solar Infrastructure
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed font-normal">
              From container-load wholesale distribution of Tier-1 photovoltaic modules to
              PEC-compliant industrial installations and local diagnostic repair, we are committed to
              long-term energy independence.
            </p>

            {/* Animated Count-Up Numbers */}
            <div className="pt-2">
              <AboutStatsCounter />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          2. MISSION, VISION & CORE VALUES SECTION (3 Aligned Cards)
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="space-y-1 border-b border-slate-200 pb-4">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider block">
              Purpose &amp; Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Engineered for Enduring Energy Independence
            </h2>
          </div>

          {/* 3-Card Grid: Desktop (lg:grid-cols-3), Tablet (md:grid-cols-2), Mobile (grid-cols-1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Strategic Mission */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Header: Title on Left, Clean Icon on Right */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-widest block">
                      Strategic Mission
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                      Accelerating Clean Power with Industrial Integrity
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  To accelerate the adoption of clean, reliable renewable energy across KPK by supplying
                  genuine Tier-1 hardware at direct wholesale rates and executing flawless,
                  PEC-standard installations. We eliminate distributor markups and verify every module
                  at our Nowshera hub.
                </p>
              </div>

              {/* Blue Tick-Bullets */}
              <ul className="pt-3 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Direct Factory Imports &amp; Container Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>PEC-Certified Turnkey EPC Execution</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Zero-Compromise Hardware Verification</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Long-Term Vision */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Header: Title on Left, Clean Icon on Right */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-widest block">
                      Long-Term Vision
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                      Pakistan&apos;s Most Trusted Wholesaler &amp; EPC Partner
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  To be Pakistan’s most trusted solar wholesaler and engineering partner, recognized for
                  technical precision, transparent pricing, and unmatched local after-sales warranty
                  backing. We envision an uninterrupted regional power ecosystem built on solid engineering.
                </p>
              </div>

              {/* Blue Tick-Bullets */}
              <ul className="pt-3 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Regional KPK Diagnostic &amp; Warranty Hub</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Transparent B2B Wholesale Margins</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>25-Year Long-Term Asset Durability</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Core Values */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Header: Title on Left, Clean Icon on Right */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-widest block">
                      Core Values
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                      Engineering Rigor &amp; Ethical Governance
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We operate with absolute transparency, technical rigor, and commercial accountability.
                  Every module barcode is verified against official factory manifests, and every installation
                  is sized to withstand harsh northern Pakistani environmental conditions.
                </p>
              </div>

              {/* Blue Tick-Bullets */}
              <ul className="pt-3 border-t border-slate-100 space-y-2 text-xs font-medium text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>100% Genuine Barcode Traceability</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Engineering-First Diagnostic Precision</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Rapid GT Road Warehouse Logistics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          3. MANAGING DIRECTOR & LEADERSHIP SPOTLIGHT
      ------------------------------------------------------------------- */}
      <section className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="space-y-1 border-b border-slate-200 pb-4">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider block">
              Executive Leadership
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Technical Rigor Meets Wholesale Supply Chain
            </h2>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Executive Portrait Card */}
              <div className="lg:col-span-5 relative min-h-[320px] sm:min-h-[380px] lg:min-h-[460px] bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                  alt="Zakir Ullah Khan — Managing Director & Technical Lead"
                  fill
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-cover object-top brightness-[0.95]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden" />
                <div className="absolute bottom-4 left-4 lg:hidden bg-slate-950/90 backdrop-blur-sm px-3.5 py-2 rounded-md border border-slate-700 text-white">
                  <span className="text-[10px] font-mono text-blue-400 font-bold uppercase block">
                    Managing Director
                  </span>
                  <span className="text-sm font-bold">Zakir Ullah Khan</span>
                </div>
              </div>

              {/* Bio & Professional Profile */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="hidden lg:block space-y-1">
                    <span className="text-xs font-mono text-blue-600 font-bold tracking-widest uppercase block">
                      Managing Director &amp; Technical Lead
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Zakir Ullah Khan
                    </h3>
                  </div>

                  {/* Concise 2-Sentence Executive Summary */}
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                    With an advanced background in computer science and commercial power systems,
                    Zakir Ullah Khan founded Nowshera Solar Solutions with a singular objective: to
                    replace speculative retail markups with transparent, data-driven wholesale
                    distribution and precision engineering. Under his technical leadership, the company
                    has established direct Tier-1 factory supply agreements with global manufacturers,
                    stringent EPC execution standards, and localized diagnostic after-sales support across
                    Khyber Pakhtunkhwa.
                  </p>
                </div>

                {/* Small Professional Supporting Milestone Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-slate-200">
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-xs font-mono text-blue-600 font-bold block mb-1">
                      Direct Imports
                    </span>
                    <span className="text-xs text-slate-600 leading-snug block">
                      Tier-1 container tracking and bulk warehouse allocation on GT Road.
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-xs font-mono text-blue-600 font-bold block mb-1">
                      EPC Compliance
                    </span>
                    <span className="text-xs text-slate-600 leading-snug block">
                      Strict adherence to PEC and AEDB safety and net-metering protocols.
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-xs font-mono text-blue-600 font-bold block mb-1">
                      Local Diagnostics
                    </span>
                    <span className="text-xs text-slate-600 leading-snug block">
                      Dedicated electronic testing bench for prompt after-sales support.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          4. CERTIFIED ENGINEERING & INSTALLATION TEAM SECTION
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="space-y-1 border-b border-slate-200 pb-4">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider block">
              EPC Workforce
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Certified Engineering &amp; Installation Leads
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Our in-house technical units handle every phase of deployment internally — from electrical
              string calculations and structural steel wind-load anchoring to regional container dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* 1. Electrical & Net-Metering Engineers */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Centered Icon with Uniform Blue Coloring */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <Zap className="w-6 h-6" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center">
                  Electrical &amp; Net-Metering Engineers
                </h3>

                {/* Justified Text */}
                <p className="text-xs sm:text-sm text-slate-600 text-justify leading-relaxed">
                  Dedicated specialists managing PESCO green-meter grid synchronization, single and
                  three-phase hybrid inverter programming, lightning surge protection (SPD), and
                  earthing resistance testing certified below 5 Ohms for maximum safety.
                </p>
              </div>

              {/* Blue Checkmark Ticks */}
              <ul className="text-xs text-slate-700 space-y-1.5 pt-3 border-t border-slate-100 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>PESCO Net-Metering Synchronization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>IP65 Inverter Firmware Flashing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Thermal String Sizing Calculations</span>
                </li>
              </ul>
            </div>

            {/* 2. Site Survey & Structure Technicians */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Centered Icon with Uniform Blue Coloring */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <Wrench className="w-6 h-6" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center">
                  Site Survey &amp; Structure Technicians
                </h3>

                {/* Justified Text */}
                <p className="text-xs sm:text-sm text-slate-600 text-justify leading-relaxed">
                  Certified technicians executing customized rooftop and ground-mount solutions using
                  hot-dipped galvanized iron (GI) and structural aluminum frames engineered to withstand
                  130 km/h wind gusts across northern valleys.
                </p>
              </div>

              {/* Blue Checkmark Ticks */}
              <ul className="text-xs text-slate-700 space-y-1.5 pt-3 border-t border-slate-100 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Custom Elevated Structures (L2/L3)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Hilti Chemical Anchor Bolting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Azimuth &amp; Shadow Modeling</span>
                </li>
              </ul>
            </div>

            {/* 3. Logistics & Wholesale Dispatch */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Centered Icon with Uniform Blue Coloring */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <Truck className="w-6 h-6" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center">
                  Logistics &amp; Wholesale Dispatch
                </h3>

                {/* Justified Text */}
                <p className="text-xs sm:text-sm text-slate-600 text-justify leading-relaxed">
                  Warehouse handling crew managing pallet integrity, container offloading, and rapid
                  regional distribution across Peshawar, Mardan, Charsadda, Nowshera, Swabi, and
                  all surrounding commercial districts.
                </p>
              </div>

              {/* Blue Checkmark Ticks */}
              <ul className="text-xs text-slate-700 space-y-1.5 pt-3 border-t border-slate-100 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Zero-Breakage Pallet Packaging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>KPK Corridor Daily Dispatch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Barcode Warranty Registration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          5. DEDICATED IN-HOUSE TESTING & REPAIR CENTER SECTION
      ------------------------------------------------------------------- */}
      <section className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          {/* Header without upper badges */}
          <div className="space-y-1 border-b border-slate-200 pb-4">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider block">
              Diagnostic Workshop
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Dedicated In-House Testing &amp; Repair Workshop
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Unlike retail middlemen who ship faulty equipment abroad for months, Nowshera Solar Solutions
              maintains a fully equipped electronics repair bench right here on GT Road.
            </p>
          </div>

          {/* 4:3 Aspect Ratio Horizontal Workshop Image */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80"
              alt="Solar Electronics Diagnostic Bench"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover brightness-[0.92]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
              <span className="bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-700">
                LAB BENCH #01 — NOWSHERA GT ROAD
              </span>
              <span className="text-blue-400 font-bold bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-700">
                24–48h TURNAROUND
              </span>
            </div>
          </div>

          {/* 4 Structured Capability Cards in 4-column responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {/* Capability 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-2xs hover:border-blue-400 transition">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                Component-Level Inverter Diagnostics
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                Mainboard trace repair, IGBT replacement, and manufacturer firmware re-flashing for pure sine wave reliability.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-2xs hover:border-blue-400 transition">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Gauge className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                LiFePO4 BMS &amp; Cell Balancing
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                Individual 3.2V prismatic cell impedance checks, active high-current balancing, and state-of-charge restoration.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-2xs hover:border-blue-400 transition">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                MPPT &amp; Surge Verification
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                Dual-MPPT tracking efficiency audits, DC disconnect isolation tests, and high-voltage lightning surge protection checks.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-2xs hover:border-blue-400 transition">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                Original OEM Spare Parts
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed text-justify">
                Stocked authentic cooling fans, control relays, DC terminal blocks, and smart communication cards directly from Tier-1 suppliers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          6. TRUST & RELIABILITY SECTION ("Why Northern Pakistan Relies on Us")
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="space-y-1 border-b border-slate-200 pb-4">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider block">
              Market Authority
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Why Northern Pakistan Relies on Nowshera Solar
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              We stand apart through authentic manufacturer traceability, engineering certifications, and
              direct wholesale commercial pricing with zero hidden margins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tile 1: AEDB & PEC Standards */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Centered Icon with Corporate Blue Coloring */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide text-center">
                  AEDB &amp; PEC Standards
                </h3>
                {/* Justified Text */}
                <p className="text-xs text-slate-600 text-justify leading-relaxed">
                  Full compliance with Alternative Energy Development Board (AEDB) guidelines and Pakistan
                  Engineering Council standards for seamless PESCO green-meter grid interconnection.
                </p>
              </div>
            </div>

            {/* Tile 2: 10–25 Year Warranty */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Centered Icon with Corporate Blue Coloring */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide text-center">
                  10–25 Year Warranty
                </h3>
                {/* Justified Text */}
                <p className="text-xs text-slate-600 text-justify leading-relaxed">
                  Direct factory warranty documentation providing 12-year hardware replacement and 25-30
                  year linear power generation yield guarantees on all Tier-1 N-Type modules.
                </p>
              </div>
            </div>

            {/* Tile 3: Transparent Wholesale */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Centered Icon with Corporate Blue Coloring */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide text-center">
                  Transparent Wholesale
                </h3>
                {/* Justified Text */}
                <p className="text-xs text-slate-600 text-justify leading-relaxed">
                  Genuine container and pallet wholesale rates for contractors, installers, and corporate
                  clients with published daily price transparency and zero deceptive markups.
                </p>
              </div>
            </div>

            {/* Tile 4: 24/7 Hotline Support */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Centered Icon with Corporate Blue Coloring */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide text-center">
                  24/7 Hotline Support
                </h3>
                {/* Justified Text */}
                <p className="text-xs text-slate-600 text-justify leading-relaxed">
                  Direct access to our Nowshera technical sales and emergency engineering support line for
                  rapid fault-finding, system maintenance, and warranty dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          7. CTA BANNER (Corporate Blue Theme Alignment)
      ------------------------------------------------------------------- */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-950 text-white border border-slate-800 rounded-xl p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider block">
                Partner with Nowshera Solar Solutions
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Ready to engineer your residential or commercial solar project?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Consult with our engineering team for free site surveys, bill-of-materials analysis, and PESCO net-metering feasibility.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/packages"
                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                Browse Turnkey Packages
              </Link>
              <a
                href="https://wa.me/923000000000?text=Hello%20Nowshera%20Solar%20Solutions,%20I%20would%20like%20to%20consult%20with%20your%20engineering%20team%20regarding%20a%20solar%20system%20installation."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-lg transition flex items-center gap-2 shadow-xs hover:shadow-sm active:scale-95"
              >
                <span>Consult on WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
