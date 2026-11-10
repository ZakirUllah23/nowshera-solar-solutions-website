import React from "react";
import Image from "next/image";
import PublicShell from "@/components/public/PublicShell";
import SolarLoadCalculator from "@/components/public/SolarLoadCalculator";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  Package as PackageIcon,
  Layers,
  ArrowRight,
  Cpu,
  Sun,
  Sparkles,
} from "lucide-react";

// Next.js 16 dynamic server rendering control
export const instant = false;

// Technical system load comparison data for reference table
const LOAD_COMPARISON_DATA = [
  {
    capacity: "3.2 kW",
    type: "Residential Hybrid Starter",
    inverterAc: "1× 1.5-Ton Inverter AC",
    appliances: "1× Refrigerator, 5× Fans, LED Lights, Wi-Fi",
    pump: "0.5 HP – 1.0 HP Water Pump",
    generation: "380 – 440 Units / Month",
    netMetering: "Optional / Typical Off-Grid",
  },
  {
    capacity: "6.0 kW",
    type: "Popular Home Hybrid",
    inverterAc: "2× 1.5-Ton Inverter ACs",
    appliances: "1× Refrigerator + 1× Deep Freezer, Full Home Lighting",
    pump: "1.0 HP – 1.5 HP Water Pump",
    generation: "720 – 850 Units / Month",
    netMetering: "Eligible (1-Phase / 3-Phase)",
  },
  {
    capacity: "10.0 kW",
    type: "Three-Phase Net-Metering Executive",
    inverterAc: "3× to 4× 1.5-Ton Inverter ACs",
    appliances: "2× Refrigerators, Microwave, Kitchen Loads, Washing",
    pump: "2.0 HP Submersible Pump",
    generation: "1,250 – 1,450 Units / Month",
    netMetering: "Full 3-Phase PESCO Green Meter Export",
  },
  {
    capacity: "15.0 kW",
    type: "Commercial & Industrial Heavy Duty",
    inverterAc: "5× to 6× Inverter ACs + Office Equipment",
    appliances: "Multiple Fridges, Commercial Lighting, Plazas & Shops",
    pump: "3.0 HP – 5.0 HP Agricultural/Industrial Pump",
    generation: "1,900 – 2,200 Units / Month",
    netMetering: "Full 3-Phase Commercial Net-Metering",
  },
];

// Determine component category icon & color for BOM breakdown
function getComponentDetails(name: string = ""): {
  Icon: typeof Sun;
  colorClass: string;
  categoryLabel: string;
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
      colorClass: "text-amber-600 bg-amber-50 border-amber-200",
      categoryLabel: "Solar Panels",
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
      categoryLabel: "Hybrid Inverter",
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
      Icon: Layers,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
      categoryLabel: "Battery Storage",
    };
  }
  return {
    Icon: ShieldCheck,
    colorClass: "text-slate-600 bg-slate-100 border-slate-200",
    categoryLabel: "Structure & BoS",
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

  // 2. Fetch package items and products as flat queries and join in JavaScript
  const [{ data: packageItemsData }, { data: productsData }] =
    await Promise.all([
      supabase.from("package_items").select("*"),
      supabase.from("products").select("id, name, sku, regular_price"),
    ]);

  const productMap = new Map(
    (productsData ?? []).map((p) => [p.id, p])
  );

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
          1. HERO SECTION (Clean, Bright Lighting, No Top Badge)
      ------------------------------------------------------------------- */}
      <section className="relative h-[280px] sm:h-[340px] md:h-[380px] flex items-center justify-center overflow-hidden bg-slate-900">
        <Image
          src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1920&q=80"
          alt="Turnkey solar packages and commercial rooftop installations"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.88] contrast-[1.05]"
        />
        {/* Clean Navy Slate Overlay (Bright & Clear, matching homepage) */}
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
          2. LIVE DATABASE-DRIVEN PACKAGES GRID (Blue & White Wholesale Theme)
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-12 sm:py-16 md:py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600 block">
                01 // Turnkey Solar Solutions
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Configured System Packages ({packages.length})
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-500">
              Live BOM Hardware Pricing
            </span>
          </div>

          {packages.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-700 font-semibold">
                No turnkey packages published at the moment.
              </p>
              <p className="text-xs text-slate-500">
                Contact our engineering desk on WhatsApp for a custom sizing quote.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
              {packages.map((pkg) => {
                const promo = promoMap.get(pkg.package_id);
                const hasDiscount =
                  Boolean(promo?.offer_id) &&
                  Number(promo?.discount_amount || 0) > 0;

                const regularPrice =
                  Number(promo?.regular_selling_price ?? pkg.final_selling_price);
                const effectivePrice = hasDiscount
                  ? Number(promo?.promotional_price)
                  : regularPrice;

                // Filter BOM items linked to this package
                const items = (packageItemsData ?? [])
                  .filter((item) => item.package_id === pkg.package_id)
                  .map((item) => ({
                    ...item,
                    product: productMap.get(item.product_id),
                  }));

                // Pre-fill WhatsApp message
                const waMessage = `Hello Nowshera Solar Solutions, I am interested in the ${pkg.name} (${pkg.capacity_kw}kW System) listed at PKR ${effectivePrice.toLocaleString()}. Please provide turnkey installation timelines and site survey availability.`;
                const waUrl = `https://wa.me/923000000000?text=${encodeURIComponent(
                  waMessage
                )}`;

                return (
                  <div
                    key={pkg.package_id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      {/* Optional Package Featured Image */}
                      {pkg.featured_image_url && (
                        <div className="relative h-52 sm:h-60 w-full bg-slate-100 overflow-hidden border-b border-slate-200">
                          <Image
                            src={pkg.featured_image_url}
                            alt={pkg.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 600px"
                            className="object-cover object-center"
                          />
                        </div>
                      )}

                      {/* Header Badge Row */}
                      <div className="p-6 md:p-8 pb-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black px-3 py-1 bg-blue-600 text-white rounded-md shadow-xs">
                              {pkg.capacity_kw} kW SYSTEM
                            </span>
                            {pkg.is_featured && (
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-blue-600" />
                                FEATURED
                              </span>
                            )}
                          </div>

                          <span className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-700 bg-slate-50">
                            {pkg.inventory_status === "in_stock"
                              ? "IN STOCK"
                              : pkg.inventory_status === "available_on_order"
                              ? "ON ORDER"
                              : "OUT OF STOCK"}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {pkg.name}
                          </h3>
                          {pkg.description && (
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Pricing Box (Clean Blue & White Theme) */}
                      <div className="p-6 md:p-8 py-4 bg-slate-50/70 border-y border-slate-200 space-y-3 font-mono">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                              Total Turnkey System Price:
                            </span>
                            {hasDiscount ? (
                              <div className="flex flex-wrap items-baseline gap-2 mt-1">
                                <span className="line-through text-slate-400 text-sm">
                                  {formatPrice(regularPrice)}
                                </span>
                                <span className="text-2xl sm:text-3xl font-black text-blue-600">
                                  {formatPrice(effectivePrice)}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                                  <Sparkles className="w-3 h-3 text-blue-600" />
                                  {promo?.offer_title}
                                </span>
                              </div>
                            ) : (
                              <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                                {formatPrice(effectivePrice)}
                              </span>
                            )}
                          </div>

                          <span className="text-xs text-slate-500 font-medium">
                            {pkg.is_manually_overridden
                              ? "Promotional Package"
                              : "Calculated BOM"}
                          </span>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">
                              Hardware Total:
                            </span>
                            <span className="text-slate-900 font-bold">
                              {formatPrice(Number(pkg.component_total))}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">
                              Turnkey Labor &amp; BoS:
                            </span>
                            <span className="text-slate-900 font-bold">
                              {formatPrice(
                                Number(pkg.installation_cost) +
                                  Number(pkg.additional_costs)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bill of Materials (Included Components List with Clear Icons) */}
                      <div className="p-6 md:p-8 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-slate-700">
                          <PackageIcon className="w-4 h-4 text-blue-600" />
                          <span>Bill of Materials (Included Hardware):</span>
                        </div>

                        {items.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            Standard Tier-1 panels, hybrid inverter, and mounting kit included.
                          </p>
                        ) : (
                          <div className="space-y-2.5">
                            {items.map((item) => {
                              const componentName =
                                item.product?.name ?? "Hardware Component";
                              const { Icon, colorClass, categoryLabel } =
                                getComponentDetails(componentName);

                              return (
                                <div
                                  key={item.id}
                                  className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 flex items-start justify-between gap-3 text-xs transition"
                                >
                                  <div className="flex items-start gap-3 min-w-0">
                                    <div
                                      className={`p-2 rounded-md border shrink-0 ${colorClass}`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-blue-600 shrink-0">
                                          {item.quantity}×
                                        </span>
                                        <span className="font-bold text-slate-900 truncate">
                                          {componentName}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                        <span className="font-semibold text-slate-600">
                                          {categoryLabel}
                                        </span>
                                        {item.notes && (
                                          <>
                                            <span>•</span>
                                            <span className="truncate">{item.notes}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {item.product?.sku && (
                                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shrink-0">
                                      {item.product.sku}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Compact WhatsApp Button & Net-Metering Included */}
                    <div className="p-6 md:p-8 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-slate-100 mt-2">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>PESCO Net-Metering Ready</span>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-sm active:scale-95 shrink-0"
                      >
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        <span>Book on WhatsApp</span>
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
          3. INTERACTIVE SOLAR LOAD CALCULATOR WIDGET SECTION
      ------------------------------------------------------------------- */}
      <section className="bg-white py-12 sm:py-16 md:py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SolarLoadCalculator />
        </div>
      </section>

      {/* -------------------------------------------------------------------
          4. ENLARGED SYSTEM LOAD COMPARISON TABLE (High Readability)
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-12 sm:py-16 md:py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-600 block">
              02 // Engineering Sizing Matrix
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Solar System Capacity &amp; Load Comparison Table
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600">
              Clear technical reference to match your home appliances and electricity bill targets with the appropriate solar system.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-800 font-mono text-xs sm:text-sm uppercase border-b border-slate-200">
                <tr>
                  <th className="py-4 px-5 font-bold whitespace-nowrap">Capacity</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap">System Role</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap">Supported Inverter ACs</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap">Refrigeration &amp; Home Loads</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap">Water Pump</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap">Monthly Yield (kWh)</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap">PESCO Net-Metering</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans text-sm md:text-base">
                {LOAD_COMPARISON_DATA.map((row) => (
                  <tr key={row.capacity} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-5 font-mono font-black text-blue-600 text-base md:text-lg whitespace-nowrap">
                      {row.capacity}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap">
                      {row.type}
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-800">
                      {row.inverterAc}
                    </td>
                    <td className="py-4 px-5 text-slate-600">
                      {row.appliances}
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-800 whitespace-nowrap">
                      {row.pump}
                    </td>
                    <td className="py-4 px-5 font-mono font-bold text-emerald-600 whitespace-nowrap">
                      {row.generation}
                    </td>
                    <td className="py-4 px-5 text-slate-800 whitespace-nowrap font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{row.netMetering}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
