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
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Clock,
} from "lucide-react";

// Next.js 16 dynamic server rendering control
export const instant = false;

// Fallback images for solar hardware items if no image is uploaded
const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80";
const FALLBACK_PACKAGE_IMAGE =
  "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80";
const FALLBACK_OFFER_BANNER =
  "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80";

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

// Generate exact hardware breakdown tick-bullets matching user sketch
function getHardwareBreakdownBullets(
  item: {
    name: string;
    isPackage: boolean;
    capacityKw?: number;
    packageId?: string;
  },
  packageItems: Array<{ package_id: string; product_id: string; quantity: number }>,
  productMap: Map<string, { id: string; name: string; sku: string }>
): string[] {
  if (item.isPackage && item.packageId) {
    const items = packageItems.filter((pi) => pi.package_id === item.packageId);
    if (items.length > 0) {
      let panelQty = 0;
      let inverterQty = 0;
      let batteryQty = 0;

      for (const pi of items) {
        const prod = productMap.get(pi.product_id);
        const pName = prod ? prod.name.toLowerCase() : "";

        if (pName.includes("panel") || pName.includes("pv") || pName.includes("longi") || pName.includes("jinko")) {
          panelQty += pi.quantity;
        } else if (pName.includes("inverter") || pName.includes("hybrid") || pName.includes("veyron") || pName.includes("itel")) {
          inverterQty += pi.quantity;
        } else if (pName.includes("battery") || pName.includes("lithium") || pName.includes("lifepo4") || pName.includes("dyness")) {
          batteryQty += pi.quantity;
        }
      }

      return [
        `${panelQty > 0 ? panelQty : Math.max(6, Math.round((item.capacityKw || 6) * 1.7))}× panels`,
        `${inverterQty > 0 ? inverterQty : 1}× inverter`,
        `${batteryQty > 0 ? batteryQty : 1}× battery`,
        "Mounting sys",
      ];
    }

    // Default package breakdown based on capacityKw
    const cap = item.capacityKw || 6;
    let panelCount = 10;
    if (cap <= 3.5) panelCount = 6;
    else if (cap <= 6.5) panelCount = 10;
    else if (cap <= 10.5) panelCount = 18;
    else panelCount = 26;

    return [
      `${panelCount}× panels`,
      "1× inverter",
      "1× battery",
      "Mounting sys",
    ];
  }

  // Standalone product or fallback
  return [
    "10× panels",
    "1× inverter",
    "1× battery",
    "Mounting sys",
  ];
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
    { data: packageItemsData },
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
    supabase.from("package_items").select("*"),
  ]);

  // Build lookups
  const productMap = new Map((productsData ?? []).map((p) => [p.id, p]));
  const packageMap = new Map(
    (packagePricingData ?? []).map((pkg) => [pkg.package_id, pkg])
  );
  const packageItems = packageItemsData ?? [];

  // Group images by product_id (first one is primary)
  const productImageMap = new Map<string, string>();
  for (const img of productImagesData ?? []) {
    if (!productImageMap.has(img.product_id)) {
      productImageMap.set(img.product_id, img.image_url);
    }
  }

  return (
    <PublicShell>
      {/* -------------------------------------------------------------------
          1. HERO SECTION (Clear & Natural Lighting, Subtle Contrast Layer)
      ------------------------------------------------------------------- */}
      <section className="relative h-[280px] sm:h-[340px] md:h-[380px] flex items-center justify-center overflow-hidden bg-slate-900">
        <Image
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
          alt="Solar Hardware Distribution Warehouse"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.92] contrast-[1.03]"
        />
        {/* Subtle Natural Contrast Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Special Promotional Offers &amp; Bundle Discounts
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-200 font-normal leading-relaxed">
            Direct container-rate distributor pricing on Tier-1 N-Type solar panels, IP65 hybrid
            inverters, high-cycle LiFePO4 batteries, and turnkey residential systems. All promotional
            markdowns apply automatically while allocated promotional inventory lasts.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          2. ACTIVE PROMOTIONAL CAMPAIGNS (Adaptive 3-Column Grid)
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-12 sm:py-16 md:py-20 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          {/* Section Heading (Clean title with NO numbers or counters) */}
          <div className="space-y-1 border-b border-slate-200 pb-5">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider block">
              Wholesale Bundles &amp; Discounts
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Active Promotional Campaigns
            </h2>
          </div>

          {/* If Zero Offers */}
          {activeOffers.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto space-y-4 shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Tag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  No Active Public Campaigns At This Moment
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  All standard Tier-1 inventory is currently priced at daily wholesale rates. Inquire
                  directly with our Nowshera distribution sales desk on WhatsApp for container or pallet
                  concession pricing.
                </p>
              </div>
              <div className="pt-2">
                <a
                  href="https://wa.me/923000000000?text=Hello%20Nowshera%20Solar%20Solutions,%20I%20am%20inquiring%20about%20upcoming%20promotional%20deals%20and%20pallet%20wholesale%20rates."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-lg text-xs sm:text-sm transition shadow-xs"
                >
                  <span>Inquire for Wholesale Rates on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            /* Adaptive 3-Column Offer Grid: 3 cols desktop (lg:grid-cols-3), 2 tablet (md:grid-cols-2), 1 mobile (grid-cols-1) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {activeOffers.map((offer) => {
                // Attached products
                const attachedProductRecords = (offerProductsData ?? [])
                  .filter((op) => op.offer_id === offer.id)
                  .map((op) => productMap.get(op.product_id))
                  .filter((p): p is NonNullable<typeof p> => Boolean(p));

                // Attached packages
                const attachedPackageRecords = (offerPackagesData ?? [])
                  .filter((op) => op.offer_id === offer.id)
                  .map((op) => packageMap.get(op.package_id))
                  .filter((pkg): pkg is NonNullable<typeof pkg> => Boolean(pkg));

                // Format discount badge label
                let discountBadgeText = "";
                if (offer.discount_type === "percentage") {
                  discountBadgeText = `${offer.discount_value}% OFF`;
                } else if (offer.discount_type === "fixed_amount") {
                  discountBadgeText = `SAVE ${formatPrice(offer.discount_value)}`;
                } else {
                  discountBadgeText = `SPECIAL: ${formatPrice(offer.discount_value)}`;
                }

                // Build attached items list with precise hardware breakdown bullets
                const rawAttachedItems = [
                  ...attachedProductRecords.map((prod) => {
                    const { promoPrice, savings } = calculateItemDiscount(
                      prod.regular_price,
                      offer.discount_type,
                      offer.discount_value
                    );
                    const imgUrl =
                      productImageMap.get(prod.id) || FALLBACK_PRODUCT_IMAGE;
                    const hardwareBullets = getHardwareBreakdownBullets(
                      { name: prod.name, isPackage: false },
                      packageItems,
                      productMap
                    );
                    return {
                      id: prod.id,
                      name: prod.name,
                      sku: prod.sku,
                      regularPrice: prod.regular_price,
                      promoPrice,
                      savings,
                      imageUrl: imgUrl,
                      isPackage: false,
                      capacityKw: 0,
                      hardwareBullets,
                    };
                  }),
                  ...attachedPackageRecords.map((pkg) => {
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
                    const hardwareBullets = getHardwareBreakdownBullets(
                      {
                        name: pkg.name,
                        isPackage: true,
                        capacityKw: pkg.capacity_kw,
                        packageId: pkg.package_id,
                      },
                      packageItems,
                      productMap
                    );
                    return {
                      id: pkg.package_id,
                      name: pkg.name,
                      sku: `${pkg.capacity_kw}kW System`,
                      regularPrice,
                      promoPrice,
                      savings,
                      imageUrl: pkg.featured_image_url || FALLBACK_PACKAGE_IMAGE,
                      isPackage: true,
                      capacityKw: pkg.capacity_kw,
                      hardwareBullets,
                    };
                  }),
                ];

                // If no specific items are linked in database yet, provide clean bundle card
                const displayItems =
                  rawAttachedItems.length > 0
                    ? rawAttachedItems
                    : [
                        {
                          id: `bundle-${offer.id}`,
                          name: offer.title.includes("Deal")
                            ? offer.title
                            : `${offer.title} Complete System Bundle`,
                          sku: "Turnkey Solar System",
                          regularPrice: 850000,
                          promoPrice: calculateItemDiscount(
                            850000,
                            offer.discount_type,
                            offer.discount_value
                          ).promoPrice,
                          savings: calculateItemDiscount(
                            850000,
                            offer.discount_type,
                            offer.discount_value
                          ).savings,
                          imageUrl: FALLBACK_PACKAGE_IMAGE,
                          isPackage: true,
                          capacityKw: 6,
                          hardwareBullets: [
                            "10× panels",
                            "1× inverter",
                            "1× battery",
                            "Mounting sys",
                          ],
                        },
                      ];

                // WhatsApp message prefill
                const itemsSummaryList = displayItems.map(
                  (item) =>
                    `• ${item.name} (${item.sku}) — ${formatPrice(item.promoPrice)}`
                );

                const waMessage = `Hello Nowshera Solar Solutions,\n\nI want to claim the promotional deal: "${offer.title}" (${discountBadgeText}).\n\nIncluded Hardware Bundle:\n${itemsSummaryList.join(
                  "\n"
                )}\n\nPlease confirm stock availability at Nowshera Warehouse and issue official quotation.`;

                const waLink = `https://wa.me/923000000000?text=${encodeURIComponent(
                  waMessage
                )}`;

                return (
                  <article
                    key={offer.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* 1. TOP BANNER IMAGE (High-Resolution Banner Across Top) */}
                      <div className="relative h-44 sm:h-48 w-full bg-slate-900 overflow-hidden border-b border-slate-200">
                        <Image
                          src={offer.banner_image_url || FALLBACK_OFFER_BANNER}
                          alt={offer.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-[0.88]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

                        {/* Top Left: Discount Pill Badge */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white font-mono font-bold text-xs rounded-md shadow-xs">
                          {discountBadgeText}
                        </span>

                        {/* Top Right: Clean Status Badge */}
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md bg-white/95 text-blue-700 border-blue-200">
                          Active Deal
                        </span>
                      </div>

                      {/* Campaign Content Container */}
                      <div className="p-5 sm:p-6 space-y-4">
                        {/* Campaign Title & Description */}
                        <div className="space-y-1">
                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                            {offer.title}
                          </h3>

                          {offer.description && (
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                              {offer.description}
                            </p>
                          )}
                        </div>

                        {/* Expiry Notification Box */}
                        <div className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs font-mono">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-bold text-slate-500 uppercase text-[10px]">
                              Expires:
                            </span>
                            <span className="font-extrabold text-blue-900">
                              {new Date(offer.end_time).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <OfferCountdown endTime={offer.end_time} variant="clean" />
                        </div>

                        {/* 2. NESTED PACKAGE / PRODUCT ITEM CARDS (Exact Match to Sketch) */}
                        <div className="space-y-3 pt-1">
                          {displayItems.map((item) => (
                            <div
                              key={item.id}
                              className="bg-slate-50/70 border border-slate-200 rounded-lg p-3.5 sm:p-4 space-y-3 shadow-2xs hover:border-slate-300 transition"
                            >
                              {/* Top-Level Split Section (Left/Right) */}
                              <div className="flex items-center gap-3.5">
                                {/* Left Side: Thumbnail image of the package or product */}
                                <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    sizes="120px"
                                    className="object-cover"
                                  />
                                </div>

                                {/* Right Side: Title + Pricing details */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                                  <div className="space-y-0.5">
                                    <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wide block truncate">
                                      {item.isPackage
                                        ? `${item.capacityKw}kW Complete System`
                                        : item.sku}
                                    </span>
                                    <h4
                                      className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2"
                                      title={item.name}
                                    >
                                      {item.name}
                                    </h4>
                                  </div>

                                  {/* Pricing details: Regular Price (strikethrough) stacked directly above bold Promo Price */}
                                  <div className="font-mono pt-1">
                                    <div className="text-[11px] text-slate-400">
                                      <span className="text-[9px] uppercase font-bold text-slate-400 mr-1.5">
                                        Regular:
                                      </span>
                                      <span className="line-through">
                                        {formatPrice(item.regularPrice)}
                                      </span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                      <span className="text-[10px] uppercase font-bold text-blue-700">
                                        Promo:
                                      </span>
                                      <span className="text-base sm:text-lg font-black text-blue-600 leading-none">
                                        {formatPrice(item.promoPrice)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Included Hardware Breakdown Section */}
                              <div className="pt-3 border-t border-slate-200/90 space-y-2">
                                <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800">
                                  Included Hardware
                                </h5>
                                <ul className="space-y-1 text-xs text-slate-700">
                                  {item.hardwareBullets.map((bullet, bIdx) => (
                                    <li
                                      key={bIdx}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span className="font-medium text-slate-800">
                                        {bullet}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 3. STREAMLINED ACTION BUTTONS: Blue Catalogue Link + Green WhatsApp Claim */}
                    <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 mt-2">
                      <div className="pt-3 flex items-center gap-2.5">
                        {/* Prominent Blue Catalogue Link */}
                        <Link
                          href="/products"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs sm:text-sm transition-colors text-center"
                        >
                          <span>Catalogue</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        {/* Professional Green WhatsApp Quotation Claim Button */}
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-sm active:scale-95 text-center"
                        >
                          <svg
                            className="w-4 h-4 fill-current shrink-0"
                            viewBox="0 0 24 24"
                          >
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                          </svg>
                          <span>WhatsApp</span>
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

      {/* -------------------------------------------------------------------
          3. FACTORY-SEALED HARDWARE FEATURES SECTION (Top Center Icons & Justified Text)
      ------------------------------------------------------------------- */}
      <section className="bg-white border-t border-slate-200 py-12 sm:py-16 md:py-20 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider block">
              Direct Wholesale Standard
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Factory-Sealed Wholesale Hardware Assurance
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Every promotional deal is backed by our direct import contracts, verified vendor warranties, and immediate Khyber Pakhtunkhwa logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature Card 1: 100% Factory Sealed Hardware */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col items-center shadow-xs hover:border-blue-300 hover:shadow-sm transition">
              <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 shrink-0 shadow-2xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center mb-2.5">
                100% Factory-Sealed Tier-1 Hardware
              </h4>
              <p className="text-justify text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every photovoltaic solar panel module, hybrid inverter, and lithium battery arrives in original manufacturer export packaging with intact tamper-evident seals and barcode tracking for verifiable genuine quality and zero gray-market components.
              </p>
            </div>

            {/* Feature Card 2: Transparent Expiry & Scheduling */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col items-center shadow-xs hover:border-blue-300 hover:shadow-sm transition">
              <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 shrink-0 shadow-2xs">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center mb-2.5">
                Transparent Campaign Scheduling
              </h4>
              <p className="text-justify text-xs sm:text-sm text-slate-600 leading-relaxed">
                All promotional markdown windows and bundle concession rates strictly sync to Pakistan Standard Time (PKT). Invoices confirmed during the active promotional period retain the quoted promotional markdown through pallet packing and final dispatch.
              </p>
            </div>

            {/* Feature Card 3: Direct GT Road Warehouse Dispatch */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col items-center shadow-xs hover:border-blue-300 hover:shadow-sm transition">
              <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 shrink-0 shadow-2xs">
                <Truck className="w-7 h-7" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight text-center mb-2.5">
                Direct GT Road Warehouse Dispatch
              </h4>
              <p className="text-justify text-xs sm:text-sm text-slate-600 leading-relaxed">
                Immediate container-load handling and expedited regional freight forwarding across Nowshera, Peshawar, Mardan, Swabi, Charsadda, Islamabad, and all northern commercial centers with genuine wholesale warranty documentation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}