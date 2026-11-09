import React from "react";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/public/PublicShell";
import {
  ShieldCheck,
  Zap,
  Cpu,
  Layers,
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
  Users,
  Activity,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "About Us | Nowshera Solar Solutions — Tier-1 Wholesale Distributor & EPC",
  description:
    "Learn about Nowshera Solar Solutions, Managing Director Zakir Ullah Khan, our certified electrical engineering team, local diagnostic repair workshop, and direct wholesale solar distribution across Khyber Pakhtunkhwa.",
};

export default function AboutPage() {
  return (
    <PublicShell>
      {/* 1. Hero Section (Industrial Authority Dark) */}
      <section className="relative bg-slate-950 text-white border-b border-slate-800 overflow-hidden py-18 sm:py-24">
        {/* Engineering Background Image Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
            alt="Solar Hardware Distribution Facility"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              <span>ESTABLISHED WHOLESALE DISTRIBUTOR & EPC FIRM — NOWSHERA, KPK</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Powering Northern Pakistan with A-Grade Solar Infrastructure
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              From container-load wholesale distribution of Tier-1 photovoltaic modules to
              PEC-compliant industrial installations and local diagnostic repair, we are committed to
              long-term energy independence.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
              <div>
                <span className="block font-mono text-xl sm:text-2xl font-bold text-amber-400 tabular-nums">
                  15MW+
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Hardware Distributed
                </span>
              </div>
              <div>
                <span className="block font-mono text-xl sm:text-2xl font-bold text-white tabular-nums">
                  500+
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Turnkey Installs
                </span>
              </div>
              <div>
                <span className="block font-mono text-xl sm:text-2xl font-bold text-emerald-400 tabular-nums">
                  100%
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  A-Grade Tier-1 Only
                </span>
              </div>
              <div>
                <span className="block font-mono text-xl sm:text-2xl font-bold text-sky-400 tabular-nums">
                  24–48h
                </span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  KPK Dispatch Time
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Section 1 — Mission & Vision (Structured Architectural Cards) */}
      <section className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <span className="text-xs font-mono text-amber-600 font-semibold uppercase tracking-wider block mb-1">
              01 // CORE PURPOSE & STRATEGIC DIRECTION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Engineered for Enduring Energy Independence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-8 space-y-4 shadow-sm hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                  STRATEGIC MISSION
                </span>
                <div className="w-8 h-8 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-950 tracking-tight">
                Accelerating Clean Power with Industrial Integrity
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To accelerate the adoption of clean, reliable renewable energy across KPK by supplying
                genuine Tier-1 hardware at direct wholesale rates and executing flawless,
                PEC-standard installations. We eliminate distributor markups and verify every module
                at our Nowshera hub.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-slate-700">
                <span className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
                  • Direct Factory Imports
                </span>
                <span className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
                  • PEC Certified EPC
                </span>
                <span className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
                  • Zero Compromise Testing
                </span>
              </div>
            </div>

            {/* Vision Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-8 space-y-4 shadow-sm hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                  LONG-TERM VISION
                </span>
                <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-950 tracking-tight">
                Pakistan’s Most Trusted Wholesaler & Engineering Partner
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                To be Pakistan’s most trusted solar wholesaler and engineering partner, known for
                technical precision, transparent pricing, and unmatched local after-sales warranty
                support. We envision an uninterrupted regional power ecosystem built on solid engineering.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-slate-700">
                <span className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
                  • Regional Warranty Hub
                </span>
                <span className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
                  • Transparent B2B Margins
                </span>
                <span className="px-2.5 py-1 bg-slate-100 rounded border border-slate-200">
                  • 25-Year Reliability
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section 2 — Managing Director & Executive Leadership Spotlight */}
      <section className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <span className="text-xs font-mono text-amber-600 font-semibold uppercase tracking-wider block mb-1">
              02 // EXECUTIVE LEADERSHIP & TECHNICAL GOVERNANCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Technical Rigor Meets Wholesale Supply Chain
            </h2>
          </div>

          <div className="bg-slate-950 text-white border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Executive Portrait */}
              <div className="lg:col-span-5 relative min-h-[360px] lg:min-h-[460px] bg-slate-900">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                  alt="Zakir Ullah Khan — Managing Director & Technical Lead"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:hidden" />
                <div className="absolute bottom-4 left-4 lg:hidden bg-slate-950/90 backdrop-blur-sm px-3 py-1.5 rounded border border-slate-800">
                  <span className="text-xs font-mono text-amber-400 font-bold block">
                    MANAGING DIRECTOR
                  </span>
                  <span className="text-sm font-bold text-white">Zakir Ullah Khan</span>
                </div>
              </div>

              {/* Bio & Professional Profile */}
              <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="hidden lg:block space-y-1">
                    <span className="text-xs font-mono text-amber-500 font-bold tracking-widest uppercase">
                      MANAGING DIRECTOR & TECHNICAL LEAD
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      Zakir Ullah Khan
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    With an advanced background in computer science and commercial power systems,
                    Zakir Ullah Khan founded Nowshera Solar Solutions with a singular objective: to
                    replace speculative retail markups with transparent, data-driven wholesale
                    distribution and precision engineering.
                  </p>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Under his technical leadership, the company has established direct Tier-1 factory
                    supply agreements with global PV giants (Longi, JA Solar, Jinko) and premier hybrid
                    inverter manufacturers. Zakir oversees all EPC technical sizing, computerized string
                    voltage matching, and PESCO net-metering synchronization protocols across northern Pakistan.
                  </p>
                </div>

                {/* Key Executive Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  <div className="bg-slate-900/80 p-3.5 rounded border border-slate-800">
                    <span className="text-xs font-mono text-amber-400 font-bold block mb-0.5">
                      DIRECT IMPORTS
                    </span>
                    <span className="text-xs text-slate-300">
                      Tier-1 container tracking & bulk warehouse allocation.
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-3.5 rounded border border-slate-800">
                    <span className="text-xs font-mono text-emerald-400 font-bold block mb-0.5">
                      EPC COMPLIANCE
                    </span>
                    <span className="text-xs text-slate-300">
                      Strict adherence to PEC & AEDB safety standards.
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-3.5 rounded border border-slate-800">
                    <span className="text-xs font-mono text-sky-400 font-bold block mb-0.5">
                      LOCAL R&D
                    </span>
                    <span className="text-xs text-slate-300">
                      Pioneering local inverter diagnostics and testing.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section 3 — Certified Engineering & Installation Team */}
      <section className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <span className="text-xs font-mono text-amber-600 font-semibold uppercase tracking-wider block mb-1">
              03 // MULTIDISCIPLINARY EPC WORKFORCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Certified Engineering & Installation Leads
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Our in-house technical units handle every phase of deployment internally — from electrical
              string calculations and structural steel wind-load anchoring to regional container dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. Electrical & Net-Metering */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm hover:border-amber-500/40 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950 tracking-tight">
                  Electrical & Net-Metering Engineers
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dedicated specialists managing PESCO green-meter grid synchronization, single and
                  three-phase hybrid inverter programming, lightning surge protection (SPD), and
                  earthing resistance testing below 5 Ohms.
                </p>
              </div>
              <ul className="text-xs font-mono text-slate-700 space-y-1.5 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>PESCO Net-Metering Dossiers</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>IP65 Inverter Firmware Flashing</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Thermal String Sizing</span>
                </li>
              </ul>
            </div>

            {/* 2. Site Survey & Structure Technicians */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm hover:border-amber-500/40 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
                  <Wrench className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-slate-950 tracking-tight">
                  Site Survey & Structure Technicians
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Certified technicians executing customized rooftop and ground-mount solutions using
                  hot-dipped galvanized iron (GI) and structural aluminum rated for 130 km/h wind loads.
                </p>
              </div>
              <ul className="text-xs font-mono text-slate-700 space-y-1.5 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Custom Elevated Structures (L2/L3)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Hilti Chemical Anchor Bolting</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Azimuth & Shadow Analysis</span>
                </li>
              </ul>
            </div>

            {/* 3. Logistics & Wholesale Dispatch */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm hover:border-amber-500/40 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-950 tracking-tight">
                  Logistics & Wholesale Dispatch
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Warehouse handling crew managing pallet integrity, container offloading, and rapid
                  regional distribution across Peshawar, Mardan, Charsadda, Nowshera, and Swabi.
                </p>
              </div>
              <ul className="text-xs font-mono text-slate-700 space-y-1.5 pt-3 border-t border-slate-100">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero-Breakage Pallet Packaging</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>KPK Corridor Daily Dispatch</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Barcode Warranty Registration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 4 — Dedicated Local Repair & Testing Center (In-House Diagnostics) */}
      <section className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <span className="text-xs font-mono text-amber-600 font-semibold uppercase tracking-wider block mb-1">
              04 // LOCAL WARRANTY & COMPONENT-LEVEL DIAGNOSTICS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Dedicated In-House Testing & Repair Workshop
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Unlike retail middlemen who ship faulty equipment abroad for months, Nowshera Solar Solutions
              maintains a fully equipped electronics repair bench right here on GT Road.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Workshop Bench Image */}
              <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-[420px] bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200">
                <Image
                  src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                  alt="Solar Electronics Diagnostic Bench"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
                  <span className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-700">
                    LAB BENCH #01 — NOWSHERA
                  </span>
                  <span className="text-amber-400 font-bold">24-48h TURNAROUND</span>
                </div>
              </div>

              {/* Technical Capabilities List */}
              <div className="lg:col-span-7 p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-xs font-mono text-amber-700 uppercase font-semibold">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span>PRECISION HARDWARE VERIFICATION</span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-950 tracking-tight">
                    Zero Downtime Local After-Sales Warranty Backing
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Our certified electrical technicians perform oscilloscope wave analysis, MOSFET
                    replacement, BMS re-calibration, and DC load stress testing locally. Clients enjoy
                    immediate diagnosis and prompt warranty fulfillment without prolonged downtime.
                  </p>
                </div>

                {/* 4 Technical Capabilities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
                      <Cpu className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Component-Level Inverter Diagnostics</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Mainboard trace repair, IGBT replacement, and manufacturer firmware re-flashing.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
                      <Gauge className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>LiFePO4 BMS & Cell Balancing</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Individual 3.2V prismatic cell impedance checks, active balancing, and SoC restoration.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
                      <Zap className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>MPPT & Surge Verification</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Dual-MPPT tracking efficiency audits and high-voltage DC protection stress tests.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-950">
                      <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Original OEM Spare Parts</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Stocked genuine cooling fans, relays, terminals, and communication boards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 5 — Why KPK Businesses & Homeowners Trust Us (Trust Badges & Standards) */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <span className="text-xs font-mono text-amber-600 font-semibold uppercase tracking-wider block mb-1">
              05 // QUALITY ASSURANCE & MARKET AUTHORITY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Why Northern Pakistan Relies on Nowshera Solar
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              We stand apart through authentic manufacturer traceability, engineering certifications, and
              direct wholesale commercial pricing with zero hidden margins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tile 1 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-sm hover:border-amber-500/50 transition">
              <div className="w-10 h-10 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                AEDB & PEC Standards
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full compliance with Alternative Energy Development Board (AEDB) guidelines and Pakistan
                Engineering Council standards for seamless PESCO green-meter grid interconnection.
              </p>
            </div>

            {/* Tile 2 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-sm hover:border-amber-500/50 transition">
              <div className="w-10 h-10 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                10–25 Year Warranty
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct factory warranty documentation providing 12-year hardware replacement and 25-30
                year linear power generation yield guarantees on all Tier-1 N-Type modules.
              </p>
            </div>

            {/* Tile 3 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-sm hover:border-amber-500/50 transition">
              <div className="w-10 h-10 rounded bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                Transparent Wholesale
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Genuine container and pallet wholesale rates for contractors, installers, and corporate
                clients with published daily price transparency and zero deceptive markups.
              </p>
            </div>

            {/* Tile 4 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-sm hover:border-amber-500/50 transition">
              <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
                <PhoneCall className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                24/7 Hotline Support
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct access to our Nowshera technical sales and emergency engineering support line for
                rapid fault-finding, system maintenance, and warranty dispatch.
              </p>
            </div>
          </div>

          {/* Direct CTA Bar */}
          <div className="bg-slate-950 text-white border border-slate-800 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">
                PARTNER WITH NOWSHERA SOLAR SOLUTIONS
              </span>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Ready to engineer your residential or commercial solar project?
              </h3>
              <p className="text-xs text-slate-400">
                Consult with our engineering team for free site surveys, bill-of-materials analysis, and PESCO net-metering feasibility.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/packages"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold rounded border border-slate-700 transition"
              >
                Browse Turnkey Packages
              </Link>
              <a
                href="https://wa.me/923000000000?text=Hello%20Nowshera%20Solar%20Solutions,%20I%20would%20like%20to%20consult%20with%20your%20engineering%20team%20regarding%20a%20solar%20system%20installation."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition flex items-center gap-2"
              >
                <span>Consult on WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
