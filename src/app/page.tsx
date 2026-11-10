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
  Star,
  Wrench,
  FileText,
  MapPin,
  Check,
} from "lucide-react";

/* -------------------------------------------------------------------------
   14 AUTHENTIC COLORED SOLAR BRANDS (Arranged into 2 Infinite Scroll Rows)
------------------------------------------------------------------------- */
interface BrandInfo {
  name: string;
  category: string;
  color: string;
  textColor?: string;
  badge: React.ReactNode;
}

const BRANDS_ROW_1: BrandInfo[] = [
  {
    name: "LONGi Solar",
    category: "Tier-1 Modules",
    color: "#E50012",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <polygon points="12,2 22,8.5 22,17.5 12,23 2,17.5 2,8.5" fill="#E50012" />
        <circle cx="12" cy="12.5" r="4" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: "JinkoSolar",
    category: "N-Type TOPCon",
    color: "#008C3A",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#008C3A" />
        <path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Canadian Solar",
    category: "Bifacial Modules",
    color: "#CC0000",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#CC0000" />
        <path d="M12 5l2 5h5l-4 3 1.5 5-4.5-3.5L7.5 18 9 13 5 10h5z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: "JA Solar",
    category: "High-Yield Modules",
    color: "#D71920",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <polygon points="12,3 21,12 12,21 3,12" fill="#D71920" />
        <rect x="8" y="8" width="8" height="8" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: "Trina Solar",
    category: "Ultra-High Power",
    color: "#00205B",
    textColor: "#00205B",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#00205B" />
        <circle cx="12" cy="12" r="5" fill="#F59E0B" />
      </svg>
    ),
  },
  {
    name: "GoodWe",
    category: "Hybrid Inverters",
    color: "#E60012",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#E60012" />
        <path d="M7 12a5 5 0 0 1 10 0v2H7v-2z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: "Solis",
    category: "On-Grid & Hybrid",
    color: "#D97706",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#D97706" strokeWidth="3" />
        <circle cx="12" cy="12" r="4" fill="#D97706" />
      </svg>
    ),
  },
];

const BRANDS_ROW_2: BrandInfo[] = [
  {
    name: "INVEREX",
    category: "Hybrid Power",
    color: "#004B87",
    textColor: "#004B87",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#004B87" />
        <polygon points="6,16 12,8 18,16" fill="#EF4444" />
      </svg>
    ),
  },
  {
    name: "Growatt",
    category: "Smart Inverters",
    color: "#2BA84A",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#2BA84A" />
        <path d="M12 6v12M7 11l5-5 5 5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "CoreTech",
    category: "Power Electronics",
    color: "#0284C7",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#0284C7" />
        <circle cx="12" cy="12" r="5" stroke="#FFFFFF" strokeWidth="2" />
        <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: "itel solar",
    category: "Hybrid Solutions",
    color: "#FF0033",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#FF0033" />
        <path d="M8 12h8M12 8v8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Dyness",
    category: "LiFePO4 Storage",
    color: "#00A859",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#00A859" />
        <rect x="7" y="7" width="10" height="10" rx="2" fill="#FFFFFF" />
        <circle cx="12" cy="12" r="2" fill="#00A859" />
      </svg>
    ),
  },
  {
    name: "PYLONTECH",
    category: "Lithium Banks",
    color: "#0066CC",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#0066CC" />
        <rect x="6" y="9" width="12" height="3" fill="#FFFFFF" />
        <rect x="6" y="14" width="12" height="3" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: "LUMINOUS",
    category: "Battery Storage",
    color: "#003399",
    textColor: "#003399",
    badge: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#003399" />
        <polygon points="13,5 7,13 12,13 11,19 17,11 12,11" fill="#F59E0B" />
      </svg>
    ),
  },
];

/* -------------------------------------------------------------------------
   PRIMARY SOLAR DIVISIONS (3 Clear Cards with 3-4 word specs)
------------------------------------------------------------------------- */
const PRIMARY_DIVISIONS = [
  {
    title: "Solar Panels",
    description:
      "Direct pallet and container imports of Tier-1 monocrystalline N-Type modules.",
    imageUrl:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    specs: ["N-Type Bifacial", "Tier-1 Grade", "25-Year Warranty"],
    ctaHref: "/products#solar-panels",
  },
  {
    title: "Inverters",
    description:
      "Single-phase and three-phase hybrid inverters with net-metering compatibility.",
    imageUrl:
      "https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=800&q=80",
    specs: ["Hybrid & On-Grid", "Dual MPPT Trackers", "Net-Metering Ready"],
    ctaHref: "/products#solar-inverters",
  },
  {
    title: "Batteries",
    description:
      "High-cycle Lithium Iron Phosphate (LiFePO4) storage banks and tubular batteries.",
    imageUrl:
      "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=800&q=80",
    specs: ["LiFePO4 Lithium Cells", "6000+ Deep Cycles", "Smart BMS Built-in"],
    ctaHref: "/products#lithium-batteries",
  },
];

/* -------------------------------------------------------------------------
   RECENT FIELD PROJECTS
------------------------------------------------------------------------- */
const FIELD_PROJECTS = [
  {
    title: "10kW Hybrid System",
    location: "Nowshera Cantt",
    specs: "16× LONGi 585W + GoodWe 10kW + Dyness Lithium",
    imageUrl:
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "25kW Commercial Rooftop",
    location: "GT Road Nowshera",
    specs: "42× Jinko 580W + Solis 25kW 3-Phase Net-Metering",
    imageUrl:
      "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "6kW Residential Backup",
    location: "Hakimabad Nowshera",
    specs: "10× Canadian Solar 550W + Inverex 6kW Hybrid",
    imageUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "15kW Industrial Warehouse",
    location: "Mardan Industrial Zone",
    specs: "26× JA Solar 575W + Growatt 15kW MAX Shed",
    imageUrl:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "30kW Agricultural Tube-Well",
    location: "Charsadda",
    specs: "50× Trina Solar 600W + 30kW Heavy-Duty VFD Pump",
    imageUrl:
      "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "12kW Turnkey Net-Metering",
    location: "Peshawar Ring Road",
    specs: "20× LONGi 585W + Solis 12kW Grid-Tie Green Meter",
    imageUrl:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
  },
];

/* -------------------------------------------------------------------------
   6 VERIFIED CUSTOMER REVIEWS
------------------------------------------------------------------------- */
const CLIENT_FEEDBACK = [
  {
    name: "Engr. Tariq Khattak",
    city: "Nowshera Cantt",
    role: "10kW Hybrid System",
    stars: 5,
    text: "Purchased a complete 10kW turnkey system with GoodWe inverter and Dyness lithium battery. PESCO green meter was installed smoothly.",
  },
  {
    name: "Haji Mir Baz Khan",
    city: "Nowshera Kalan",
    role: "Wholesale Distributor",
    stars: 5,
    text: "We buy full pallets of LONGi panels and Inverex inverters regularly. Authentic stock with official manufacturer warranty.",
  },
  {
    name: "Dr. Asfandyar Khan",
    city: "GT Road Nowshera",
    role: "Hospital Operations",
    stars: 5,
    text: "Installed a 20kW three-phase backup for our surgical theater. Seamless power switchover when WAPDA cuts off.",
  },
  {
    name: "Muhammad Bilal",
    city: "Mardan Industrial",
    role: "Flour Mills Director",
    stars: 5,
    text: "Installed a 50kW commercial grid-tied system with Solis inverters. Monthly electricity expenses dropped drastically.",
  },
  {
    name: "Zeeshan Ahmad",
    city: "Peshawar",
    role: "Property Owner",
    stars: 5,
    text: "Transparent wholesale pricing without hidden charges. Installation team used genuine copper wiring and Schneider DC breakers.",
  },
  {
    name: "Malik Noor Alam",
    city: "Charsadda",
    role: "Commercial Farmer",
    stars: 5,
    text: "Replaced our diesel engine tube-well with a 15HP solar VFD pump. Runs with high water pressure all day, saving fuel costs.",
  },
];

export default function HomePage() {
  const whatsappUrl =
    "https://wa.me/923000000000?text=Hello%20Nowshera%20Solar%20Solutions,%20I%20would%20like%20to%20request%20today%27s%20pallet%20rates%20and%20hardware%20quote.";

  return (
    <PublicShell>
      {/* 1. HERO CAROUSEL + TYPEWRITER */}
      <HeroCarouselWithTypewriter />

      {/* 2. EXPERIENCE & STATISTICS COUNTER BAR */}
      <AnimatedStatsCounter />

      {/* 3. "WHY PARTNER WITH US" (4 Free-Standing Rounded Cards) */}
      <section className="bg-white py-16 sm:py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Why Partner With Us
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Direct factory imports, engineering precision, and reliable wholesale distribution across KPK.
            </p>
          </div>

          {/* 4 Floating Separate Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-6 flex flex-col items-center text-center space-y-3 hover:border-blue-500 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                A-Grade Tier-1 Hardware
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Factory-sealed pallets with verifiable barcode serials and 10–25 year manufacturer warranties.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-6 flex flex-col items-center text-center space-y-3 hover:border-blue-500 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Engineering Guidance
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accurate kW sizing, string voltage calculations, and inverter-to-battery BMS matching.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-6 flex flex-col items-center text-center space-y-3 hover:border-blue-500 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Wholesale Rates
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Competitive pallet and container pricing for homeowners, installers, and corporate clients.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-6 flex flex-col items-center text-center space-y-3 hover:border-blue-500 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Net-Metering Support
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Structure mounting, AC/DC dual earthing, and end-to-end PESCO green meter licensing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRIMARY SOLAR DIVISIONS (Core Inventory: Panels, Inverters, Batteries) */}
      <section className="bg-slate-50 py-16 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Primary Solar Divisions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              High-efficiency solar hardware stocked at our Nowshera warehouse.
            </p>
          </div>

          {/* 3 Structured Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRIMARY_DIVISIONS.map((division) => (
              <div
                key={division.title}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-blue-400 hover:shadow-md transition group"
              >
                <div>
                  {/* Photo */}
                  <div className="relative h-56 w-full bg-slate-950 overflow-hidden">
                    <Image
                      src={division.imageUrl}
                      alt={division.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">
                      {division.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {division.description}
                    </p>

                    {/* 3 to 4 Word Specs */}
                    <div className="pt-2 space-y-1.5 border-t border-slate-100">
                      {division.specs.map((spec, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-2 text-xs font-medium text-slate-700"
                        >
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rounded Button at Bottom */}
                <div className="p-6 pt-0">
                  <Link
                    href={division.ctaHref}
                    className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <span>View Brands</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRUSTED BRANDS LOGO MARQUEE (Two Infinite Scrolling Rows) */}
      <section className="bg-white py-10 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-6 text-center">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Trusted Brands
          </h2>
        </div>

        {/* Row 1: Scrolling Left */}
        <div className="relative w-full overflow-hidden py-1.5">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee-left flex items-center gap-4">
            {[...BRANDS_ROW_1, ...BRANDS_ROW_1, ...BRANDS_ROW_1].map(
              (brand, idx) => (
                <div
                  key={`${brand.name}-${idx}`}
                  className="w-52 shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs flex items-center gap-3 hover:border-blue-400 hover:shadow-sm transition"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100">
                    {brand.badge}
                  </div>
                  <div>
                    <span
                      className="text-sm font-bold tracking-tight block"
                      style={{ color: brand.textColor || brand.color }}
                    >
                      {brand.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {brand.category}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Row 2: Scrolling Right (Opposite Direction) */}
        <div className="relative w-full overflow-hidden py-1.5 mt-2">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee-right flex items-center gap-4">
            {[...BRANDS_ROW_2, ...BRANDS_ROW_2, ...BRANDS_ROW_2].map(
              (brand, idx) => (
                <div
                  key={`${brand.name}-r2-${idx}`}
                  className="w-52 shrink-0 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs flex items-center gap-3 hover:border-blue-400 hover:shadow-sm transition"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 border border-slate-100">
                    {brand.badge}
                  </div>
                  <div>
                    <span
                      className="text-sm font-bold tracking-tight block"
                      style={{ color: brand.textColor || brand.color }}
                    >
                      {brand.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {brand.category}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* 6. RECENT SOLAR INSTALLATIONS (Field Deployments, Compact & Center-Aligned) */}
      <section className="bg-slate-900 text-white py-12 sm:py-14 border-b border-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-8 text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Recent Solar Installations
          </h2>
          <p className="text-xs text-slate-400">
            Commercial and residential projects commissioned across Khyber Pakhtunkhwa.
          </p>
        </div>

        {/* Horizontal Project Reel */}
        <div className="relative w-full overflow-hidden py-1">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee-right flex items-center gap-5">
            {[...FIELD_PROJECTS, ...FIELD_PROJECTS].map((proj, idx) => (
              <div
                key={`${proj.title}-${idx}`}
                className="w-[320px] sm:w-[350px] shrink-0 border border-slate-800 bg-slate-950 rounded-xl overflow-hidden hover:border-blue-500/50 transition shadow-sm"
              >
                {/* Photo */}
                <div className="relative h-48 w-full bg-slate-900">
                  <Image
                    src={proj.imageUrl}
                    alt={proj.title}
                    fill
                    sizes="350px"
                    className="object-cover object-center brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 font-mono text-[11px] font-medium px-2 py-0.5 bg-slate-900/90 text-slate-200 border border-slate-800 rounded flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    {proj.location}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-1">
                  <h3 className="text-sm font-bold text-white truncate">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {proj.specs}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS (Continuous Smooth Horizontal Infinite Scroll) */}
      <section className="bg-white text-slate-900 py-16 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mb-8 text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Customer Reviews
          </h2>
          <p className="text-xs text-slate-600">
            Feedback from homeowners and commercial partners across Pakistan.
          </p>
        </div>

        {/* Continuous Horizontal Review Carousel */}
        <div className="relative w-full overflow-hidden py-2">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee-left flex items-center gap-6">
            {[...CLIENT_FEEDBACK, ...CLIENT_FEEDBACK].map((review, idx) => (
              <div
                key={idx}
                className="w-[320px] sm:w-[360px] shrink-0 border border-slate-200 bg-white p-6 rounded-xl flex flex-col justify-between space-y-4 hover:border-blue-400 hover:shadow-md transition shadow-xs"
              >
                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(review.stars)].map((_, sIdx) => (
                      <Star
                        key={sIdx}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic line-clamp-3">
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {review.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {review.city} • {review.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. WHATSAPP CTA BANNER (With Official WhatsApp Logo & Catalog Button) */}
      <section className="bg-slate-900 text-white py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Ready to Upgrade to Solar Energy?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Get wholesale container rates, pallet quotes, or turnkey installation assistance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {/* Official WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Catalog Button */}
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition backdrop-blur-sm"
            >
              <span>Catalog</span>
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
