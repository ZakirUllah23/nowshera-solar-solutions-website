import React from "react";
import Image from "next/image";
import Link from "next/link";
import PublicShell from "@/components/public/PublicShell";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import OfferCountdown from "@/components/public/OfferCountdown";
import type { DiscountType } from "@/types/database.types";
import {
  Tag,
  Percent,
  Sparkles,
  Package as PackageIcon,
  Layers,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Truck,
  FileCheck,
  Clock,
} from "lucide-react";

// Next.js 16 dynamic server rendering control
export const instant = false;

// Fallback images for solar hardware items if no image is uploaded
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80";
const FALLBACK_PACKAGE_IMAGE =
  "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=800&q=80";

function calculateItemDiscount(
  regularPrice: number,
  discountType: DiscountType,
  discountValue: number
) {
  let promoPrice = regularPrice;
  if (discountType === "percentage") {
    const discount = (regularPrice * discountValue) / 100;
    promoPrice = Math.max(0, regularPrice - discount);
  } else if (discountType === "fixed_amount") {
    promoPrice = Math.max(0, regularPrice - discountValue);
  } else if (discountType === "special_price") {
    promoPrice = discountValue;
  }
  const savings = Math.max(0, regularPrice - promoPrice);
  return { promoPrice, savings };
}

export default async function PublicOffersPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Fetch active offers: is_enabled = true, start_time <= now(), end_time > now()
  const { data: offersData } = await supabase
    .from("offers")
    .select("*")
    .eq("is_enabled", true)
    .lte("start_time", now)
    .gt("end_time", now)
    .order("end_time", { ascending: true });

  const activeOffers = offersData ?? [];

  // 2. Fetch junction records and catalog items in parallel flat queries
  const [
    { data: offerProductsData },
    { data: offerPackagesData },
    { data: productsData },
    { data: productImagesData },
    { data: packagePricingData },
  ] = await Promise.all([
    supabase.from("offer_products").select("offer_id, product_id"),
    supabase.from("offer_packages").select("offer_id, package_id"),
    supabase
      .from("products")
      .select("id, name, sku, regular_price, publication_status")
      .eq("publication_status", "published"),
    supabase
      .from("product_images")
      .select("product_id, image_url, is_primary, display_order")
      .order("is_primary", { ascending: false })
      .order("display_order", { ascending: true }),
    supabase
      .from("package_pricing_view")
      .select("*")
      .eq("publication_status", "published"),
  ]);

  // Build lookups
  const productMap = new Map((productsData ?? []).map((p) => [p.id, p]));
  const packageMap = new Map(
    (packagePricingData ?? []).map((pkg) => [pkg.package_id, pkg])
  );

  // Group images by product_id (first one is primary)
  const productImageMap = new Map<string, string>();
  for (const img of productImagesData ?? []) {
    if (!productImageMap.has(img.product_id)) {
      productImageMap.set(img.product_id, img.image_url);
    }
  }

  return (
    <PublicShell>
      {/* 1. Hero Section (Industrial Authority Dark) */}
      <section className="relative bg-slate-950 text-white border-b border-slate-800 overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
            alt="Solar Hardware Distribution Warehouse"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>LIMITED-TIME WHOLESALE & SEASONAL DEALS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Special Promotional Offers & Bundle Discounts
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Direct container-rate distributor pricing on Tier-1 N-Type solar panels, IP65 hybrid
              inverters, high-cycle LiFePO4 batteries, and turnkey residential systems. All promotional
              markdowns apply automatically while allocated promotional inventory lasts.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>100% Tier-1 Guaranteed Genuine</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Nowshera & KPK Rapid Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded">
                <FileCheck className="w-4 h-4 text-sky-400" />
                <span>PESCO Net-Metering Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Promotional Campaigns Section (Crisp Daylight Light) */}
      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-xs font-mono text-amber-600 font-semibold uppercase tracking-wider block mb-1">
                01 // ACTIVE PROMOTIONAL CAMPAIGNS
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Current Wholesale Discounts & Hardware Bundles
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Active Campaigns: <span className="font-bold text-slate-900">{activeOffers.length}</span>
            </div>
          </div>

          {/* If Zero Offers */}
          {activeOffers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Tag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-950 tracking-tight">
                  No Active Public Campaigns At This Moment
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  All standard Tier-1 inventory is currently priced at daily wholesale rates. Inquire
                  directly with our Nowshera distribution sales desk on WhatsApp for container/pallet
                  concession pricing.
                </p>
              </div>
              <div className="pt-2">
                <a
                  href="https://wa.me/923000000000?text=Hello%20Nowshera%20Solar%20Solutions,%20I%20am%20inquiring%20about%20upcoming%20promotional%20deals%20and%20pallet%20wholesale%20rates."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md text-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire for Wholesale Rates on WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {activeOffers.map((offer, offerIdx) => {
                // Get attached products
                const attachedProductRecords = (offerProductsData ?? [])
                  .filter((op) => op.offer_id === offer.id)
                  .map((op) => productMap.get(op.product_id))
                  .filter((p): p is NonNullable<typeof p> => Boolean(p));

                // Get attached packages
                const attachedPackageRecords = (offerPackagesData ?? [])
                  .filter((op) => op.offer_id === offer.id)
                  .map((op) => packageMap.get(op.package_id))
                  .filter((pkg): pkg is NonNullable<typeof pkg> => Boolean(pkg));

                const totalItemsCount =
                  attachedProductRecords.length + attachedPackageRecords.length;

                // Format discount label
                let discountBadgeText = "";
                if (offer.discount_type === "percentage") {
                  discountBadgeText = `${offer.discount_value}% OFF`;
                } else if (offer.discount_type === "fixed_amount") {
                  discountBadgeText = `SAVE ${formatPrice(offer.discount_value)}`;
                } else {
                  discountBadgeText = `SPECIAL PRICE: ${formatPrice(offer.discount_value)}`;
                }

                // Build pre-filled WhatsApp message
                const itemsSummaryList = [
                  ...attachedProductRecords.map((prod) => {
                    const { promoPrice } = calculateItemDiscount(
                      prod.regular_price,
                      offer.discount_type,
                      offer.discount_value
                    );
                    return `• ${prod.name} (${prod.sku}) — ${formatPrice(promoPrice)}`;
                  }),
                  ...attachedPackageRecords.map((pkg) => {
                    const regularPrice =
                      pkg.final_selling_price ??
                      pkg.manual_price_override ??
                      pkg.calculated_price ??
                      0;
                    const { promoPrice } = calculateItemDiscount(
                      regularPrice,
                      offer.discount_type,
                      offer.discount_value
                    );
                    return `• ${pkg.name} (${pkg.capacity_kw}kW System) — ${formatPrice(promoPrice)}`;
                  }),
                ];

                const waMessage = `Hello Nowshera Solar Solutions,\n\nI want to claim the promotional bundle deal: "${offer.title}" (${discountBadgeText}).\n\nIncluded Promotional Items:\n${itemsSummaryList.join(
                  "\n"
                )}\n\nPlease confirm stock availability at Nowshera Warehouse and issue official invoice.`;

                const waLink = `https://wa.me/923000000000?text=${encodeURIComponent(
                  waMessage
                )}`;

                return (
                  <article
                    key={offer.id}
                    className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm"
                  >
                    {/* Campaign Header Bar */}
                    <div className="relative bg-slate-950 text-white p-6 sm:p-8">
                      {offer.banner_image_url && (
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                          <Image
                            src={offer.banner_image_url}
                            alt={offer.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/50" />
                        </div>
                      )}

                      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 bg-amber-600 text-slate-950 font-mono font-bold text-xs rounded">
                              {discountBadgeText}
                            </span>
                            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                              DEAL #0{offerIdx + 1}
                            </span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                            {offer.title}
                          </h3>

                          {offer.description && (
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {offer.description}
                            </p>
                          )}
                        </div>

                        {/* Expiry Clock */}
                        <div className="shrink-0 flex flex-col items-start lg:items-end gap-2">
                          <OfferCountdown endTime={offer.end_time} />
                          <span className="text-[11px] font-mono text-slate-400">
                            Valid until{" "}
                            {new Date(offer.end_time).toLocaleDateString("en-PK", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            (23:59 PKT)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attached Items Grid */}
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h4 className="text-xs font-mono text-slate-900 font-bold uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Eligible Bundle Hardware & Turnkey Systems ({totalItemsCount})</span>
                        </h4>
                        <span className="text-xs font-mono text-slate-500">
                          Automatic markdown applied at checkout / invoice
                        </span>
                      </div>

                      {totalItemsCount === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 rounded p-6 text-center text-xs text-slate-500 italic">
                          Hardware items are currently being allocated by the warehouse desk. Inquire
                          via WhatsApp for full package specifications.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Attached Products */}
                          {attachedProductRecords.map((prod) => {
                            const { promoPrice, savings } = calculateItemDiscount(
                              prod.regular_price,
                              offer.discount_type,
                              offer.discount_value
                            );
                            const imgUrl =
                              productImageMap.get(prod.id) || FALLBACK_PRODUCT_IMAGE;

                            return (
                              <div
                                key={prod.id}
                                className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between hover:border-amber-500/50 hover:shadow-sm transition"
                              >
                                <div>
                                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-200">
                                    <Image
                                      src={imgUrl}
                                      alt={prod.name}
                                      fill
                                      className="object-cover"
                                    />
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 text-white text-[10px] font-mono rounded">
                                      HARDWARE PRODUCT
                                    </div>
                                    {savings > 0 && (
                                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-mono font-bold rounded">
                                        SAVE {formatPrice(savings)}
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-4 space-y-2">
                                    <span className="text-[11px] font-mono text-slate-500 block">
                                      SKU: {prod.sku}
                                    </span>
                                    <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                      {prod.name}
                                    </h5>
                                  </div>
                                </div>

                                <div className="p-4 pt-0 border-t border-slate-100 mt-2 bg-slate-50/50">
                                  <div className="flex items-baseline justify-between pt-3">
                                    <div>
                                      <span className="block text-[10px] font-mono uppercase text-slate-400">
                                        Regular Price
                                      </span>
                                      <span className="line-through text-slate-400 font-mono text-xs">
                                        {formatPrice(prod.regular_price)}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="block text-[10px] font-mono uppercase text-amber-700 font-bold">
                                        Promotional Rate
                                      </span>
                                      <span className="text-amber-600 font-mono font-bold text-base">
                                        {formatPrice(promoPrice)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Attached Packages */}
                          {attachedPackageRecords.map((pkg) => {
                            const regularPrice =
                              pkg.final_selling_price ??
                              pkg.manual_price_override ??
                              pkg.calculated_price ??
                              0;
                            const { promoPrice, savings } = calculateItemDiscount(
                              regularPrice,
                              offer.discount_type,
                              offer.discount_value
                            );

                            return (
                              <div
                                key={pkg.package_id}
                                className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between hover:border-amber-500/50 hover:shadow-sm transition"
                              >
                                <div>
                                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden border-b border-slate-200">
                                    <Image
                                      src={pkg.featured_image_url || FALLBACK_PACKAGE_IMAGE}
                                      alt={pkg.name}
                                      fill
                                      className="object-cover"
                                    />
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-600 text-slate-950 text-[10px] font-mono font-bold rounded">
                                      TURNKEY SOLAR SYSTEM
                                    </div>
                                    {savings > 0 && (
                                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-mono font-bold rounded">
                                        SAVE {formatPrice(savings)}
                                      </div>
                                    )}
                                  </div>

                                  <div className="p-4 space-y-2">
                                    <span className="text-[11px] font-mono text-amber-700 font-bold block">
                                      {pkg.capacity_kw} kW System Rating
                                    </span>
                                    <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                      {pkg.name}
                                    </h5>
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                      Complete system with Tier-1 panels, inverter, mounting, and wiring.
                                    </p>
                                  </div>
                                </div>

                                <div className="p-4 pt-0 border-t border-slate-100 mt-2 bg-slate-50/50">
                                  <div className="flex items-baseline justify-between pt-3">
                                    <div>
                                      <span className="block text-[10px] font-mono uppercase text-slate-400">
                                        System Price
                                      </span>
                                      <span className="line-through text-slate-400 font-mono text-xs">
                                        {formatPrice(regularPrice)}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="block text-[10px] font-mono uppercase text-amber-700 font-bold">
                                        Deal Price
                                      </span>
                                      <span className="text-amber-600 font-mono font-bold text-base">
                                        {formatPrice(promoPrice)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* WhatsApp CTA Action Bar */}
                      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-lg">
                        <div className="space-y-1 text-center sm:text-left">
                          <span className="text-xs font-mono text-slate-900 font-bold block">
                            PROMOTIONAL INVOICE & DISPATCH
                          </span>
                          <p className="text-xs text-slate-500">
                            Lock in this campaign price today before promotion expires or inventory sells out.
                          </p>
                        </div>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-md text-sm transition shrink-0 shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Claim Bundle on WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. Wholesale Terms & Engineering Verification Strip */}
      <section className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-900">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                  100% Factory Sealed Hardware
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Every solar panel, hybrid inverter, and lithium battery comes with original manufacturer
                  serial barcodes verifiable directly through tier-1 vendor warranty portals.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-900">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                  Transparent Expiry & Scheduling
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Campaign timers operate automatically on Pakistan Standard Time (PKT). Invoices confirmed
                  during the campaign window retain quoted promotional rates through dispatch.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-900">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                  Secure GT Road Warehouse Dispatch
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Immediate pallet packing and insured dispatch across Nowshera, Peshawar, Mardan, Swabi,
                  Islamabad, and the greater Khyber Pakhtunkhwa corridor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
