import React from "react";
import Link from "next/link";
import Image from "next/image";
import PublicShell from "@/components/public/PublicShell";
import {
  HeroCarouselWithTypewriter,
  AnimatedStatsCounter,
} from "@/components/public/HomeInteractive";
import {
  ShieldCheck,
  Award,
  ArrowRight,
  MessageCircle,
  Star,
  Wrench,
  FileText,
  MapPin,
  TrendingUp,
} from "lucide-react";

/* -------------------------------------------------------------------------
   DATA STRUCTURES: FACTUAL INDUSTRIAL B2B HARDWARE
------------------------------------------------------------------------- */

// 14 Solar Brands for Marquee with Industrial Category Tags
const SOLAR_BRANDS = [
  { name: "LONGi Solar", category: "MODULES" },
  { name: "Jinko Solar", category: "MODULES" },
  { name: "GoodWe", category: "HYBRID" },
  { name: "Inverex", category: "INVERTERS" },
  { name: "Canadian Solar", category: "MODULES" },
  { name: "Dyness", category: "LITHIUM" },
  { name: "Growatt", category: "INVERTERS" },
  { name: "Trina Solar", category: "MODULES" },
  { name: "Solis", category: "HYBRID" },
  { name: "Pylontech", category: "LITHIUM" },
  { name: "JA Solar", category: "MODULES" },
  { name: "CoreTech", category: "INVERTERS" },
  { name: "Itel Solar", category: "HYBRID" },
  { name: "Luminous", category: "STORAGE" },
];

// Core Hardware Lines (3 Pillars)
const CORE_HARDWARE_DIVISIONS = [
  {
    title: "Monocrystalline & N-Type Solar Panels",
    capacityPill: "580W – 710W N-TYPE TOPCON",
    description:
      "Direct pallet and container supply of A-Grade monocrystalline N-Type TOPCon and bifacial modules from LONGi, Jinko, Canadian Solar, and JA Solar. Factory-sealed with verifiable QR barcodes.",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    specs: [
      "Cell efficiency up to 22.8% (Dual-Glass & SMBB)",
      "Bifacial generation gain up to 30% from ground albedo",
      "25-Year product / 30-Year linear power warranty",
    ],
    ctaHref: "/products#solar-panels",
  },
  {
    title: "Hybrid, On-Grid & Off-Grid Inverters",
    capacityPill: "3kW – 50kW PURE SINE WAVE",
    description:
      "Single-phase and three-phase solar inverters from GoodWe, Solis, Inverex, and Growatt. Features battery-less direct AC generation, dual MPPT trackers, and PESCO bi-directional net-metering certification.",
    imageUrl:
      "https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=800&q=80",
    specs: [
      "Wide MPPT voltage tracking: 120V – 500V DC",
      "Sub-10ms UPS switchover for seamless computer backup",
      "PESCO net-metering compliant with zero-export limiters",
    ],
    ctaHref: "/products#solar-inverters",
  },
  {
    title: "LiFePO4 Lithium & Tubular Batteries",
    capacityPill: "2.56kWh – 15kWh 51.2V BANKS",
    description:
      "High-density Lithium Iron Phosphate wall-mount and 19-inch rack batteries from Dyness, Pylontech, and Inverex. Built-in Smart BMS with CAN/RS485 auto-protocol handshake with leading hybrid inverters.",
    imageUrl:
      "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=800&q=80",
    specs: [
      "6,000+ Deep cycles @ 80% to 90% Depth of Discharge",
      "Intelligent active cell balancing and dry alarm contacts",
      "Scalable in parallel up to 16 units for C&I backup",
    ],
    ctaHref: "/products#lithium-batteries",
  },
];

// 7 Solar Installation Projects Across KPK
const FIELD_PROJECTS = [
  {
    title: "10kW Hybrid System — Nowshera Cantt",
    capacityBadge: "10kW HYBRID",
    location: "Nowshera Cantt",
    specs: "16× LONGi 585W Hi-MO 6 + GoodWe 10kW Hybrid + 10.2kWh Dyness LiFePO4",
    imageUrl:
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "25kW Commercial Rooftop — GT Road Nowshera",
    capacityBadge: "25kW COMMERCIAL",
    location: "GT Road Nowshera",
    specs: "42× Jinko 580W N-Type + Solis 25kW 3-Phase + PESCO Net-Metering",
    imageUrl:
      "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "6kW Residential Backup — Hakimabad Nowshera",
    capacityBadge: "6kW RESIDENTIAL",
    location: "Hakimabad Nowshera",
    specs: "10× Canadian Solar 550W + Inverex Nitrox 6kW + 5.12kWh Lithium",
    imageUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "15kW Industrial Warehouse — Mardan Industrial Zone",
    capacityBadge: "15kW INDUSTRIAL",
    location: "Mardan Industrial",
    specs: "26× JA Solar 575W + Growatt 15kW MAX + Galvanized GI Elevated Shed",
    imageUrl:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "30kW Agricultural Tube-Well — Charsadda Road",
    capacityBadge: "30kW AGRI TUBE-WELL",
    location: "Charsadda",
    specs: "50× Trina Solar 600W + 30kW VFD Heavy-Duty Solar Pump Inverter",
    imageUrl:
      "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "12kW Turnkey Net-Metering — Peshawar Ring Road",
    capacityBadge: "12kW NET-METERING",
    location: "Peshawar Ring Road",
    specs: "20× LONGi 585W + Solis 12kW Grid-Tie + Bi-Directional Green Meter",
    imageUrl:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "8kW Lithium Villa Storage — Akora Khattak",
    capacityBadge: "8kW LITHIUM BACKUP",
    location: "Akora Khattak",
    specs: "14× Jinko 585W + Inverex 8kW Hybrid + 15.36kWh Lithium Bank",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
  },
];

// 6 Verified Customer & Dealer Testimonials
const CLIENT_FEEDBACK = [
  {
    name: "Engr. Tariq Khattak",
    city: "Nowshera Cantt",
    role: "Homeowner — 10kW Hybrid System",
    stars: 5,
    text: "Purchased a complete 10kW turnkey system with GoodWe hybrid inverter and Dyness lithium battery. The engineering team executed the structure mounting and PESCO bi-directional green meter documentation flawlessly. The generation data matches their engineering proposal exactly.",
    tag: "VERIFIED SYSTEM / RESIDENTIAL",
  },
  {
    name: "Haji Mir Baz Khan",
    city: "Nowshera Kalan",
    role: "Wholesale Electrical Distributor",
    stars: 5,
    text: "We procure full pallets of LONGi Hi-MO 6 panels and Inverex inverters from their GT Road warehouse. Stock is consistently authentic with verified serial barcodes and official manufacturer warranty coverage. Outstanding wholesale fulfillment partner in KP.",
    tag: "VERIFIED SYSTEM / WHOLESALE BUYER",
  },
  {
    name: "Dr. Asfandyar Khan",
    city: "GT Road Nowshera",
    role: "Hospital Operations Director",
    stars: 5,
    text: "Commissioned a 20kW three-phase hybrid backup system for our surgical theater and diagnostic units. The UPS switchover is imperceptible when WAPDA drops out. Robust industrial execution by PEC-certified engineers.",
    tag: "VERIFIED SYSTEM / COMMERCIAL HEALTHCARE",
  },
  {
    name: "Muhammad Bilal",
    city: "Mardan Industrial Zone",
    role: "Flour Mills Managing Director",
    stars: 5,
    text: "Installed a 50kW commercial grid-tied array with Solis inverters and JA Solar bifacial modules. Monthly electricity expense dropped drastically, and the investment payback trajectory is on track to complete in under 16 months.",
    tag: "VERIFIED SYSTEM / INDUSTRIAL C&I",
  },
  {
    name: "Zeeshan Ahmad",
    city: "Peshawar University Town",
    role: "Property Owner",
    stars: 5,
    text: "Transparent pricing with zero hidden contractor markups. The installation team used genuine 16mm² XLPO tinned copper cables, Schneider DC breakers, and Class-2 surge arrestors. Highly professional engineering practice.",
    tag: "VERIFIED SYSTEM / RESIDENTIAL",
  },
  {
    name: "Malik Noor Alam",
    city: "Charsadda",
    role: "Commercial Citrus Farmer",
    stars: 5,
    text: "Replaced our diesel engine tube-well with a 15HP solar VFD pump system powered by 600W Trina Solar panels. Pumping operates with high water discharge from 8:30 AM to 5:00 PM on sunny days, eliminating diesel fuel expenses.",
    tag: "VERIFIED SYSTEM / AGRI SOLAR PUMPING",
  },
];

/* -------------------------------------------------------------------------
   MAIN HOMEPAGE COMPONENT
------------------------------------------------------------------------- */
export default function HomePage() {
  const whatsappUrl =
    "https://wa.me/923000000000?text=Hello%20Nowshera%20Solar%20Solutions,%20I%20would%20like%20to%20request%20today%27s%20pallet%20rates%20and%20hardware%20quote.";

  return (
    <PublicShell>
      {/* -------------------------------------------------------------------
          SECTION 1: ARCHITECTURAL HERO CAROUSEL + TYPEWRITER
      ------------------------------------------------------------------- */}
      <HeroCarouselWithTypewriter />

      {/* -------------------------------------------------------------------
          SECTION 2: EXPOSED-GRID ANIMATED AUTHORITY COUNTER BAR
      ------------------------------------------------------------------- */}
      <AnimatedStatsCounter />

      {/* -------------------------------------------------------------------
          SECTION 3: "WHY CHOOSE US" — 4 Architectural Spec Cards (bg-white)
      ------------------------------------------------------------------- */}
      <section className="bg-white py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          {/* Left-Aligned Technical Header */}
          <div className="max-w-3xl space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600 block">
              01 // WHY PARTNER WITH US
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight leading-[1.15]">
              Engineered for Wholesale Reliability &amp; Long-Term Yield
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We combine factory-direct distribution economics with Pakistan
              Engineering Council (PEC) standard design, delivering verifiable
              hardware, maximum kWh output, and dependable after-sales warranty
              processing.
            </p>
          </div>

          {/* 4-Column Hairline Grid (Exposed Datasheet Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-slate-200 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
            {/* Card 01 */}
            <div className="p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-600">
                    01
                  </span>
                  <div className="w-9 h-9 border border-slate-200 bg-slate-50 flex items-center justify-center rounded">
                    <Award className="w-4 h-4 text-slate-800" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    A-Grade Tier-1 Hardware
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Factory-sealed pallets with verifiable barcode serials,
                    original import documentation, and 10–25 year official
                    manufacturer warranties.
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                VERIFIED SERIAL AUDIT
              </span>
            </div>

            {/* Card 02 */}
            <div className="p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-600">
                    02
                  </span>
                  <div className="w-9 h-9 border border-slate-200 bg-slate-50 flex items-center justify-center rounded">
                    <Wrench className="w-4 h-4 text-slate-800" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    Load &amp; Engineering Guidance
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Accurate kW sizing, string voltage matching, and
                    inverter-to-battery BMS compatibility checks before you
                    purchase.
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                STRING &amp; BMS MATCHING
              </span>
            </div>

            {/* Card 03 */}
            <div className="p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-600">
                    03
                  </span>
                  <div className="w-9 h-9 border border-slate-200 bg-slate-50 flex items-center justify-center rounded">
                    <ShieldCheck className="w-4 h-4 text-slate-800" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    Direct Wholesale &amp; Dealer Rates
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Competitive single-unit, pallet, and container pricing for
                    homeowners, retail installers, and regional EPC contractors.
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                PALLET &amp; CONTAINER PRICING
              </span>
            </div>

            {/* Card 04 */}
            <div className="p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-600">
                    04
                  </span>
                  <div className="w-9 h-9 border border-slate-200 bg-slate-50 flex items-center justify-center rounded">
                    <FileText className="w-4 h-4 text-slate-800" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    Turnkey Net-Metering Support
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Complete GI/Aluminum structure mounting, AC/DC dual
                    earthing, and end-to-end PESCO bi-directional green-meter
                    licensing.
                  </p>
                </div>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                PESCO BI-DIRECTIONAL GREEN METER
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          SECTION 4: CORE HARDWARE LINES — 3 Editorial Hardware Cards (bg-slate-50)
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-1.5 max-w-2xl">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600 block">
                02 // CORE INVENTORY
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight">
                Primary Solar Hardware Divisions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Comprehensive hardware inventory stocked directly at our GT Road
                warehouse for instant dispatch across Khyber Pakhtunkhwa.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-slate-900 hover:text-amber-600 transition shrink-0"
            >
              <span>BROWSE COMPLETE CATALOGUE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3 Large Structured Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {CORE_HARDWARE_DIVISIONS.map((division) => (
              <div
                key={division.title}
                className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-400 transition-colors group"
              >
                <div>
                  {/* Hardware Photograph with Dark Spec Pill Overlay */}
                  <div className="relative h-60 w-full bg-slate-950 overflow-hidden">
                    <Image
                      src={division.imageUrl}
                      alt={division.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 400px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 font-mono text-[11px] font-bold px-2.5 py-1 bg-slate-950 text-amber-400 border border-slate-800 rounded">
                      {division.capacityPill}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-950 group-hover:text-amber-600 transition-colors">
                      {division.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {division.description}
                    </p>

                    {/* Technical Bullets */}
                    <div className="pt-2 space-y-2 border-t border-slate-100">
                      {division.specs.map((spec, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-2 text-xs font-mono text-slate-700"
                        >
                          <span className="text-amber-600 font-bold shrink-0">
                            &gt;
                          </span>
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Full-Width Bottom Link Bar */}
                <Link
                  href={division.ctaHref}
                  className="w-full flex items-center justify-between px-6 py-3.5 bg-slate-50 hover:bg-slate-100 border-t border-slate-200 font-mono text-xs font-bold uppercase text-slate-900 group-hover:text-amber-600 transition-colors"
                >
                  <span>View Specifications &amp; Brands</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          SECTION 5: "BRANDS WE OFFER" — 14-Brand Infinite Technical Marquee (bg-white)
      ------------------------------------------------------------------- */}
      <section className="bg-white py-16 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600 block">
              03 // AUTHORISED &amp; STOCKED MANUFACTURERS
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
              14 Global Tier-1 Brands
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-500">
            DIRECT IMPORT &amp; DEALER DISTRIBUTION
          </span>
        </div>

        {/* Marquee Track */}
        <div className="relative w-full overflow-hidden py-2">
          {/* Edge Fading Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee-left flex items-center gap-4">
            {[...SOLAR_BRANDS, ...SOLAR_BRANDS].map((brand, idx) => (
              <div
                key={`${brand.name}-${idx}`}
                className="w-56 shrink-0 border border-slate-200 bg-slate-50/70 px-5 py-4 rounded-md flex items-center justify-between hover:border-slate-400 transition-colors"
              >
                <span className="text-sm font-bold text-slate-900 tracking-tight">
                  {brand.name}
                </span>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded">
                  {brand.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          SECTION 6: SOLAR INSTALLATION PROJECTS — Infinite Horizontal Project Reel (bg-slate-950)
      ------------------------------------------------------------------- */}
      <section className="bg-slate-950 text-white py-20 border-b border-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              04 // FIELD DEPLOYMENTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Recent Solar Installations Across KPK
            </h2>
          </div>

          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400 hover:text-amber-300 transition shrink-0"
          >
            <span>VIEW COMPLETE PACKAGES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Marquee Right Container */}
        <div className="relative w-full overflow-hidden py-2">
          {/* Edge gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

          {/* Marquee Track */}
          <div className="animate-marquee-right flex items-center gap-6">
            {[...FIELD_PROJECTS, ...FIELD_PROJECTS].map((proj, idx) => (
              <div
                key={`${proj.title}-${idx}`}
                className="w-[380px] shrink-0 border border-slate-800 bg-slate-900 rounded-md overflow-hidden hover:border-slate-700 transition-colors shadow-sm"
              >
                {/* Photo */}
                <div className="relative h-52 w-full bg-slate-950">
                  <Image
                    src={proj.imageUrl}
                    alt={proj.title}
                    fill
                    sizes="380px"
                    className="object-cover object-center brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 font-mono text-xs font-bold px-2.5 py-1 bg-slate-950 text-amber-400 border border-slate-800 rounded">
                    {proj.capacityBadge}
                  </span>
                  <span className="absolute top-3 right-3 font-mono text-[11px] font-medium px-2 py-0.5 bg-slate-950/80 text-slate-300 border border-slate-800 rounded flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {proj.location}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white line-clamp-1">
                    {proj.title}
                  </h3>
                  <p className="font-mono text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {proj.specs}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          SECTION 7: VERIFIED CUSTOMER & DEALER REVIEWS (bg-white)
      ------------------------------------------------------------------- */}
      <section className="bg-white text-slate-900 py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          {/* Header */}
          <div className="max-w-3xl space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600 block">
              05 // CLIENT &amp; DEALER FEEDBACK
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-950 tracking-tight">
              Trusted by Homeowners, Businesses &amp; Solar Installers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Direct verification from regional solar retailers, hospital
              administrators, industrial facilities, and private homeowners
              supplied by Nowshera Solar Solutions.
            </p>
          </div>

          {/* 6 Structured Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CLIENT_FEEDBACK.map((review, idx) => (
              <div
                key={idx}
                className="border border-slate-200 bg-slate-50/50 p-6 rounded-md flex flex-col justify-between space-y-5 hover:border-slate-400 transition-colors shadow-sm"
              >
                <div className="space-y-3">
                  {/* Rating Stars + Monospace Tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(review.stars)].map((_, sIdx) => (
                        <Star
                          key={sIdx}
                          className="w-4 h-4 fill-amber-500 text-amber-500"
                        />
                      ))}
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      VERIFIED BUYER
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-950">
                    {review.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {review.city} • {review.role}
                  </p>
                  <p className="font-mono text-[10px] text-amber-700 font-semibold mt-1">
                    {review.tag}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          SECTION 8: INDUSTRIAL WHATSAPP DISPATCH BANNER
      ------------------------------------------------------------------- */}
      <section className="bg-slate-900 border-t border-slate-800 py-14 px-6 text-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 block">
              DIRECT ENGINEERING &amp; WHOLESALE DESK
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Request Today&apos;s Pallet Rates or a Custom kW System Quote
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Main GT Road Showroom &amp; Warehouse, Near Cantonment Board,
              Nowshera, KPK. Open Monday to Saturday • 9:00 AM – 7:00 PM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>WHATSAPP DISPATCH DESK</span>
            </a>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>BROWSE FULL CATALOGUE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
