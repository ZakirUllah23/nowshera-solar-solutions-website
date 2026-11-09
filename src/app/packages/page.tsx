import React from "react";
import Image from "next/image";
import PublicShell from "@/components/public/PublicShell";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Package as PackageIcon,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
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
    appliances: "Multiple Fridges, Commercial Lighting, Lab Equipment",
    pump: "3.0 HP – 5.0 HP Agricultural/Industrial Pump",
    generation: "1,900 – 2,200 Units / Month",
    netMetering: "Full 3-Phase Commercial Net-Metering",
  },
];

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
          HERO SECTION (High-Res Rooftop Installation Image + Architectural Overlay)
      ------------------------------------------------------------------- */}
      <section className="relative h-[340px] md:h-[400px] flex items-center justify-center overflow-hidden bg-slate-950">
        <Image
          src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1920&q=80"
          alt="Turnkey solar packages and commercial rooftop installations"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-75 contrast-105"
        />
        {/* Dark Slate Architectural Overlay */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>[ TURNKEY HYBRID &amp; NET-METERING SYSTEMS — KPK ]</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Engineered Solar System Packages
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Complete Tier-1 solar systems engineered for residential homes,
            commercial plazas, and tube-wells. Includes high-efficiency
            monocrystalline panels, hybrid inverters, lithium battery banks, and
            turnkey installation.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          LIVE DATABASE-DRIVEN PACKAGES GRID
      ------------------------------------------------------------------- */}
      <section className="bg-slate-950 py-16 sm:py-20 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400 block">
                01 // TURNKEY SOLAR SOLUTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Configured System Packages ({packages.length})
              </h2>
            </div>
            <span className="font-mono text-xs text-slate-400">
              REAL-TIME BOM HARDWARE PRICING
            </span>
          </div>

          {packages.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 rounded-md border border-slate-800 space-y-2">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300 font-medium">
                No turnkey packages published at the moment.
              </p>
              <p className="text-xs text-slate-500">
                Contact our engineering desk on WhatsApp for a custom sizing quote.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    className="bg-slate-900 border border-slate-800 rounded-md overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors"
                  >
                    <div>
                      {/* Optional Package Featured Image */}
                      {pkg.featured_image_url && (
                        <div className="relative h-56 w-full bg-slate-950 overflow-hidden border-b border-slate-800">
                          <Image
                            src={pkg.featured_image_url}
                            alt={pkg.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 600px"
                            className="object-cover object-center"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                        </div>
                      )}

                      {/* Header Badge Row */}
                      <div className="p-6 pb-4 border-b border-slate-800/80 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-amber-500 text-slate-950 rounded">
                              {pkg.capacity_kw} kW SYSTEM
                            </span>
                            {pkg.is_featured && (
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                FEATURED
                              </span>
                            )}
                          </div>

                          <span className="font-mono text-[11px] px-2 py-0.5 rounded border border-slate-700 text-slate-300 bg-slate-950">
                            {pkg.inventory_status === "in_stock"
                              ? "IN STOCK"
                              : pkg.inventory_status === "available_on_order"
                              ? "ON ORDER"
                              : "OUT OF STOCK"}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">
                            {pkg.name}
                          </h3>
                          {pkg.description && (
                            <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Pricing Box (Strict Engineering Monospace) */}
                      <div className="p-6 py-4 bg-slate-950 border-b border-slate-800 space-y-3 font-mono">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                              Total System Price (Turnkey)
                            </span>
                            {hasDiscount ? (
                              <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="line-through text-slate-500 text-sm">
                                  {formatPrice(regularPrice)}
                                </span>
                                <span className="text-2xl font-black text-emerald-400">
                                  {formatPrice(effectivePrice)}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                                  {promo?.offer_title}
                                </span>
                              </div>
                            ) : (
                              <span className="text-2xl font-black text-amber-400 mt-0.5 block">
                                {formatPrice(effectivePrice)}
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] text-slate-500">
                            {pkg.is_manually_overridden
                              ? "PROMOTIONAL PACKAGE OVERRIDE"
                              : "DYNAMIC BOM CALCULATED"}
                          </span>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-900 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">
                              Components Hardware Total:
                            </span>
                            <span className="text-white font-bold">
                              {formatPrice(Number(pkg.component_total))}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase">
                              Installation &amp; BoS Labor:
                            </span>
                            <span className="text-white font-bold">
                              {formatPrice(
                                Number(pkg.installation_cost) +
                                  Number(pkg.additional_costs)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bill of Materials (Included Components List) */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-300">
                          <PackageIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>Bill of Materials (Included Hardware):</span>
                        </div>

                        {items.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            Standard Tier-1 panels, hybrid inverter, and mounting
                            kit included.
                          </p>
                        ) : (
                          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded bg-slate-950/60 overflow-hidden text-xs">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="p-3 flex items-start justify-between gap-3"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-amber-400 shrink-0">
                                      {item.quantity}×
                                    </span>
                                    <span className="font-medium text-slate-200">
                                      {item.product?.name ?? "Hardware Component"}
                                    </span>
                                  </div>
                                  {item.notes && (
                                    <p className="text-[11px] text-slate-400 pl-6">
                                      {item.notes}
                                    </p>
                                  )}
                                </div>

                                {item.product?.sku && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                                    {item.product.sku}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* WhatsApp CTA Action Button */}
                    <div className="p-6 pt-0">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4 fill-slate-950" />
                        <span>Book Package or Inquire on WhatsApp</span>
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
          SYSTEM LOAD COMPARISON TABLE (Technical Reference Matrix)
      ------------------------------------------------------------------- */}
      <section className="bg-white py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-600 block">
              02 // ENGINEERING SIZING MATRIX
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Solar System Capacity &amp; Load Comparison Table
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Technical guideline for selecting the appropriate solar capacity
              based on electrical appliance loads and PESCO net-metering goals.
            </p>
          </div>

          <div className="border border-slate-200 rounded-md overflow-x-auto bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-mono text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Capacity</th>
                  <th className="py-3.5 px-4 font-bold">System Role</th>
                  <th className="py-3.5 px-4 font-bold">Supported Inverter ACs</th>
                  <th className="py-3.5 px-4 font-bold">Refrigeration &amp; Home Loads</th>
                  <th className="py-3.5 px-4 font-bold">Water Pump</th>
                  <th className="py-3.5 px-4 font-bold">Monthly Yield (kWh)</th>
                  <th className="py-3.5 px-4 font-bold">PESCO Net-Metering</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {LOAD_COMPARISON_DATA.map((row) => (
                  <tr key={row.capacity} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-600 text-sm whitespace-nowrap">
                      {row.capacity}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {row.type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {row.inverterAc}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {row.appliances}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {row.pump}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700 whitespace-nowrap">
                      {row.generation}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-800 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
