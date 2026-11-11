import React from "react";
import Image from "next/image";
import PublicShell from "@/components/public/PublicShell";
import SolarLoadCalculator from "@/components/public/SolarLoadCalculator";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import {
  CheckCircle2,
  Package as PackageIcon,
  ArrowRight,
  Cpu,
  Sun,
  BatteryCharging,
  Wrench,
  Sparkles,
  Zap,
} from "lucide-react";

// Next.js 16 dynamic server rendering control
export const instant = false;

// Expanded 6-Tier vertical system load comparison data (3kW, 5kW, 6kW, 10kW, 15kW, 20kW)
const VERTICAL_COMPARISON_CARDS = [
  {
    capacity: "3.2 kW",
    role: "Residential Off-Grid Starter",
    generation: "380 – 440 Units / Month",
    bestFor: "Small Home / Upper Portion",
    loads: [
      "1× 1.5-Ton Inverter AC",
      "1× Refrigerator & LED Lights",
      "5× Ceiling Fans & Wi-Fi Router",
      "0.5 HP – 1.0 HP Water Pump",
    ],
  },
  {
    capacity: "5.0 kW",
    role: "Medium Home Hybrid System",
    generation: "600 – 700 Units / Month",
    bestFor: "5 Marla Double-Story Home",
    loads: [
      "1× to 2× 1.5-Ton Inverter ACs",
      "1× Refrigerator & Deep Freezer",
      "6× Ceiling Fans & LED Lighting",
      "1.0 HP Water Pump",
    ],
  },
  {
    capacity: "6.0 kW",
    role: "Complete Residential Solar System",
    generation: "720 – 850 Units / Month",
    bestFor: "Standard 7 to 10 Marla Home",
    loads: [
      "2× 1.5-Ton Inverter ACs",
      "1× Refrigerator + 1× Deep Freezer",
      "Full House Fans & Complete LED Lighting",
      "1.0 HP – 1.5 HP Water Pump",
    ],
  },
  {
    capacity: "10.0 kW",
    role: "Commercial & Executive Hybrid",
    generation: "1,250 – 1,450 Units / Month",
    bestFor: "1 Kanal Luxury Home / Commercial Plaza",
    loads: [
      "3× to 4× 1.5-Ton Inverter ACs",
      "Dual Refrigerators & Washing Machine",
      "Kitchen Microwave & Computer Racks",
      "2.0 HP Submersible Water Pump",
    ],
  },
  {
    capacity: "15.0 kW",
    role: "Heavy Commercial & Farmhouse",
    generation: "1,900 – 2,200 Units / Month",
    bestFor: "Farmhouses, Showrooms & Offices",
    loads: [
      "5× to 6× Inverter ACs + Server Rooms",
      "3.0 HP Agricultural Pump / Motor",
      "Multiple Commercial Chillers & Freezers",
      "Complete Facility & Perimeter Lighting",
    ],
  },
  {
    capacity: "20.0 kW",
    role: "Industrial & Tubewell Heavy-Duty",
    generation: "2,500 – 2,900 Units / Month",
    bestFor: "Tubewells, Cold Storage & Factories",
    loads: [
      "7.5 HP – 10 HP Tubewell Motor",
      "8× to 10× Inverter ACs + Heavy Workshop",
      "Continuous 3-Phase Industrial Machinery",
      "High-Bay Lighting & Air Compressors",
    ],
  },
];

// Simplify package title to maximum 4-5 words
function simplifyPackageTitle(name: string, capacityKw: number): string {
  const lower = name.toLowerCase();
  if (capacityKw <= 3.5 || lower.includes("3.2") || lower.includes("starter")) {
    return "3.2kW Residential Off-Grid System";
  }
  if ((capacityKw > 3.5 && capacityKw <= 7) || lower.includes("6kw")) {
    return "6kW Complete Residential Solar System";
  }
  if ((capacityKw > 7 && capacityKw <= 12) || lower.includes("10kw")) {
    return "10kW Commercial Hybrid System";
  }
  if (capacityKw > 12 || lower.includes("15kw")) {
    return "15kW Industrial Hybrid System";
  }
  const words = name.split(/\s+/);
  return words.slice(0, 5).join(" ");
}

// Tick bullet points for appliance loads
function getApplianceLoadBullets(capacityKw: number): string[] {
  if (capacityKw <= 3.5) {
    return [
      "Runs 1× 1.5-Ton Inverter AC",
      "1× Refrigerator, Ceiling Fans & LEDs",
      "0.5 HP – 1.0 HP Water Pump & Wi-Fi",
    ];
  }
  if (capacityKw <= 7) {
    return [
      "Runs 2× 1.5-Ton Inverter ACs",
      "1× Refrigerator + 1× Deep Freezer",
      "1.0 HP Water Pump & Full Home Lighting",
    ];
  }
  if (capacityKw <= 12) {
    return [
      "Runs 3× to 4× 1.5-Ton Inverter ACs",
      "Dual Refrigerators, Kitchen & Washing",
      "2.0 HP Submersible Water Pump",
    ];
  }
  return [
    "Runs 5× to 6× Inverter ACs + Machinery",
    "3.0 HP – 5.0 HP Tubewell Motor",
    "Commercial Facility & Lighting Backup",
  ];
}

// Clean and streamline hardware item names
function simplifyBOMName(name: string = ""): string {
  const lower = name.toLowerCase();
  if (lower.includes("longi")) return "LONGi 580W Panels";
  if (lower.includes("canadian")) return "Canadian Solar 585W Panels";
  if (lower.includes("jinko")) return "Jinko 585W Panels";
  if (lower.includes("ja solar") || lower.includes("ja ")) return "JA Solar 585W Panels";
  if (lower.includes("panel") || lower.includes("pv") || lower.includes("module")) {
    return "Tier-1 Mono PERC Panels";
  }
  if (lower.includes("inverex") && lower.includes("veyron")) return "Inverex Veyron Inverter";
  if (lower.includes("itel")) return "Itel Hybrid Inverter";
  if (lower.includes("knox")) return "Knox Hybrid Inverter";
  if (lower.includes("crown")) return "Crown Hybrid Inverter";
  if (lower.includes("inverter")) return "Hybrid Solar Inverter";
  if (lower.includes("dyness")) return "Dyness LiFePO4 Battery";
  if (lower.includes("pylontech")) return "Pylontech Lithium Battery";
  if (lower.includes("narada")) return "Narada LiFePO4 Battery";
  if (lower.includes("battery") || lower.includes("lithium")) return "LiFePO4 Lithium Battery";
  if (lower.includes("tubular")) return "Deep Cycle Tubular Battery";
  if (lower.includes("structure") || lower.includes("mount") || lower.includes("rail")) {
    return "Mounting Structure";
  }
  if (lower.includes("cable") || lower.includes("wire")) return "Pure Copper DC Cable";
  if (lower.includes("breaker") || lower.includes("spd") || lower.includes("box")) {
    return "Distribution DB Box";
  }
  return name.split(/\s+/).slice(0, 4).join(" ");
}

// Unique distinct hardware category icons
function getComponentIconInfo(name: string = ""): {
  Icon: typeof Sun;
  colorClass: string;
} {
  const lower = name.toLowerCase();
  if (
    lower.includes("panel") ||
    lower.includes("pv") ||
    lower.includes("module") ||
    lower.includes("longi") ||
    lower.includes("canadian") ||
    lower.includes("jinko") ||
    lower.includes("ja solar")
  ) {
    return {
      Icon: Sun,
      colorClass: "text-amber-500 bg-amber-50 border-amber-200",
    };
  }
  if (
    lower.includes("inverter") ||
    lower.includes("veyron") ||
    lower.includes("nitrox") ||
    lower.includes("aerox") ||
    lower.includes("knox") ||
    lower.includes("crown") ||
    lower.includes("itel") ||
    lower.includes("growatt") ||
    lower.includes("huawei")
  ) {
    return {
      Icon: Cpu,
      colorClass: "text-blue-600 bg-blue-50 border-blue-200",
    };
  }
  if (
    lower.includes("battery") ||
    lower.includes("storage") ||
    lower.includes("dyness") ||
    lower.includes("pylontech") ||
    lower.includes("narada") ||
    lower.includes("lifepo4") ||
    lower.includes("lithium") ||
    lower.includes("tubular")
  ) {
    return {
      Icon: BatteryCharging,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
    };
  }
  return {
    Icon: Wrench,
    colorClass: "text-slate-600 bg-slate-100 border-slate-200",
  };
}

export default async function PublicPackagesPage() {
  const supabase = await createClient();

  // 1. Fetch live published packages from package_pricing_view
  const { data: packagesData } = await supabase
    .from("package_pricing_view")
    .select("*")
    .eq("publication_status", "published")
    .order("capacity_kw", { ascending: true });

  const packages = packagesData ?? [];

  // 2. Fetch package items and products
  const [{ data: packageItemsData }, { data: productsData }] =
    await Promise.all([
      supabase.from("package_items").select("*"),
      supabase.from("products").select("id, name, sku, regular_price"),
    ]);

  const productMap = new Map((productsData ?? []).map((p) => [p.id, p]));

  // 3. For each package, call get_effective_package_price for active promotions
  const promoResults = await Promise.all(
    packages.map((pkg) =>
      supabase.rpc("get_effective_package_price", {
        p_package_id: pkg.package_id,
      })
    )
  );

  const promoMap = new Map(
    packages.map((pkg, idx) => [
      pkg.package_id,
      promoResults[idx].data?.[0] ?? null,
    ])
  );

  return (
    <PublicShell>
      {/* -------------------------------------------------------------------
          1. HERO SECTION (High-Res Solar Array Image, Clean Title & Subtext, No Badges)
      ------------------------------------------------------------------- */}
      <section className="relative h-[280px] sm:h-[340px] md:h-[380px] flex items-center justify-center overflow-hidden bg-slate-900">
        <Image
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
          alt="Photovoltaic solar panels and clean commercial rooftop arrays"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.88] contrast-[1.05]"
        />
        {/* Bright Daylight Slate Overlay */}
        <div className="absolute inset-0 bg-slate-950/45 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Engineered Solar System Packages
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-200 font-normal leading-relaxed">
            Complete Tier-1 solar systems engineered for residential homes,
            commercial plazas, and tube-wells. Includes high-efficiency
            monocrystalline panels, hybrid inverters, lithium battery banks, and
            turnkey installation.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          2. LIVE DATABASE-DRIVEN PACKAGES GRID (3 Cols Desktop, 2 Tablet, 1 Mobile)
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-12 sm:py-16 md:py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          {/* Section Heading (Clean title with NO numbers or counts) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600 block">
                01 // Turnkey Solar Solutions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Configured System Packages
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-500">
              Live BOM Hardware Pricing
            </span>
          </div>

          {packages.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <PackageIcon className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-700 font-semibold">
                No turnkey packages published at the moment.
              </p>
              <p className="text-xs text-slate-500">
                Contact our engineering desk on WhatsApp for a custom sizing quote.
              </p>
            </div>
          ) : (
            /* Strict 3-col Desktop, 2-col Tablet, 1-col Mobile Responsive Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {packages.map((pkg) => {
                const promo = promoMap.get(pkg.package_id);
                const hasDiscount =
                  Boolean(promo?.offer_id) &&
                  Number(promo?.discount_amount || 0) > 0;

                const regularPrice = Number(
                  promo?.regular_selling_price ?? pkg.final_selling_price
                );
                const effectivePrice = hasDiscount
                  ? Number(promo?.promotional_price)
                  : regularPrice;

                const shortTitle = simplifyPackageTitle(pkg.name, pkg.capacity_kw);
                const applianceBullets = getApplianceLoadBullets(pkg.capacity_kw);

                // Filter BOM items linked to this package
                const items = (packageItemsData ?? [])
                  .filter((item) => item.package_id === pkg.package_id)
                  .map((item) => ({
                    ...item,
                    product: productMap.get(item.product_id),
                  }));

                // Pre-fill WhatsApp message
                const waMessage = `Hello Nowshera Solar Solutions, I am interested in booking the ${shortTitle} (${pkg.capacity_kw}kW System) listed at PKR ${effectivePrice.toLocaleString()}. Please provide turnkey installation schedule and site survey details.`;
                const waUrl = `https://wa.me/923000000000?text=${encodeURIComponent(
                  waMessage
                )}`;

                return (
                  <div
                    key={pkg.package_id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      {/* Optional Package Image */}
                      {pkg.featured_image_url && (
                        <div className="relative h-48 w-full bg-slate-100 overflow-hidden border-b border-slate-200">
                          <Image
                            src={pkg.featured_image_url}
                            alt={shortTitle}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                            className="object-cover object-center"
                          />
                        </div>
                      )}

                      {/* Header Badge & Title Row */}
                      <div className="p-5 sm:p-6 pb-3 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black px-2.5 py-1 bg-blue-600 text-white rounded-md shadow-xs">
                              {pkg.capacity_kw} kW
                            </span>
                            {pkg.is_featured && (
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-blue-600" />
                                FEATURED
                              </span>
                            )}
                          </div>

                          <span className="font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 bg-slate-50">
                            {pkg.inventory_status === "in_stock"
                              ? "IN STOCK"
                              : pkg.inventory_status === "available_on_order"
                              ? "ON ORDER"
                              : "OUT OF STOCK"}
                          </span>
                        </div>

                        {/* Short Package Title (Max 4-5 words) */}
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                          {shortTitle}
                        </h3>

                        {/* Tick Bullet Points for Appliance Loads */}
                        <ul className="space-y-1.5 pt-1 text-xs text-slate-700">
                          {applianceBullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="font-medium">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Price & Cost Breakdown (Separate rows for Hardware and Installation) */}
                      <div className="p-5 sm:p-6 py-4 bg-slate-50/80 border-y border-slate-200 space-y-2.5 font-mono">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
                            Total System Price:
                          </span>
                          {hasDiscount ? (
                            <div className="text-right">
                              <span className="line-through text-slate-400 text-xs block">
                                {formatPrice(regularPrice)}
                              </span>
                              <span className="text-xl sm:text-2xl font-black text-blue-600 block">
                                {formatPrice(effectivePrice)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xl sm:text-2xl font-black text-slate-900">
                              {formatPrice(effectivePrice)}
                            </span>
                          )}
                        </div>

                        {/* Individual rows for Hardware and Labor transparency */}
                        <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-[11px] font-medium text-slate-500">
                              Hardware Components:
                            </span>
                            <span className="font-bold text-slate-900">
                              {formatPrice(Number(pkg.component_total))}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="text-[11px] font-medium text-slate-500">
                              Installation &amp; Labor:
                            </span>
                            <span className="font-bold text-slate-900">
                              {formatPrice(
                                Number(pkg.installation_cost) +
                                  Number(pkg.additional_costs)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Streamlined Bill of Materials (BOM) */}
                      <div className="p-5 sm:p-6 space-y-3">
                        <span className="text-[11px] font-mono font-bold uppercase text-slate-500 flex items-center gap-1.5">
                          <PackageIcon className="w-3.5 h-3.5 text-blue-600" />
                          Included Hardware:
                        </span>

                        {items.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            Standard Tier-1 panels, hybrid inverter, and mounting included.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {items.map((item) => {
                              const originalName = item.product?.name ?? "Hardware";
                              const cleanName = simplifyBOMName(originalName);
                              const { Icon, colorClass } =
                                getComponentIconInfo(originalName);

                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-slate-50 border border-slate-100 text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`p-1 rounded border shrink-0 ${colorClass}`}
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-mono font-bold text-blue-600 shrink-0">
                                      {item.quantity}×
                                    </span>
                                    <span className="font-semibold text-slate-900 truncate">
                                      {cleanName}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Clean "Book" Action Button (Single word, corporate blue #0284C7) */}
                    <div className="p-5 sm:p-6 pt-0 flex items-center justify-between gap-3 border-t border-slate-100 mt-2">
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        Turnkey Warranty Included
                      </span>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-sm active:scale-95 shrink-0"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------------------
          3. INTERACTIVE SOLAR LOAD CALCULATOR (Dedicated Separated Section)
      ------------------------------------------------------------------- */}
      <section className="bg-white py-12 sm:py-16 md:py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <SolarLoadCalculator />
        </div>
      </section>

      {/* -------------------------------------------------------------------
          4. SIMPLIFIED VERTICAL SYSTEM LOAD COMPARISON SECTION (6 Cards, 3 Cols Desktop)
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-12 sm:py-16 md:py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="max-w-3xl space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600 block">
              02 // System Yield &amp; Sizing Matrix
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Solar Capacity &amp; Appliance Yield Breakdown
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600">
              Clear technical comparison across 6 system tiers for Pakistani homes and businesses to understand expected monthly units and electrical appliance coverage.
            </p>
          </div>

          {/* Clean Vertical Stacked Cards: 3 cards desktop (lg:grid-cols-3), 2 tablet (md:grid-cols-2), 1 mobile (grid-cols-1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {VERTICAL_COMPARISON_CARDS.map((card) => {
              const waCardMsg = `Hello Nowshera Solar Solutions, I would like to inquire about your ${card.capacity} (${card.role}) package generating ${card.generation}. Please share current hardware prices and survey availability.`;
              const waCardUrl = `https://wa.me/923000000000?text=${encodeURIComponent(
                waCardMsg
              )}`;

              return (
                <div
                  key={card.capacity}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 space-y-5"
                >
                  <div className="space-y-4">
                    {/* Capacity & Role */}
                    <div className="space-y-1 border-b border-slate-100 pb-3">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-blue-600 block">
                        {card.capacity}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {card.role}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Best For: {card.bestFor}
                      </p>
                    </div>

                    {/* Monthly Yield Highlight */}
                    <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                          Monthly Output Yield:
                        </span>
                        <span className="font-mono text-xs font-black text-emerald-700">
                          {card.generation}
                        </span>
                      </div>
                    </div>

                    {/* Supported Appliance Loads List with Checkmarks */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold uppercase text-slate-500 block">
                        Supported Loads:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {card.loads.map((load, lIdx) => (
                          <li key={lIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-medium">{load}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href={waCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs transition-colors"
                    >
                      <span>Inquire About {card.capacity}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
