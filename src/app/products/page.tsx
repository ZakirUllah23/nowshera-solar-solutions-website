import React from "react";
import Image from "next/image";
import PublicShell from "@/components/public/PublicShell";
import { createClient } from "@/lib/supabase/server";
import {
  MessageCircle,
  Sliders,
  Tag,
  Layers,
} from "lucide-react";

// In Next.js 16 with cacheComponents enabled, instant = false controls dynamic rendering
export const instant = false;

interface ProductSpecs {
  variants?: string[];
  tag?: string | null;
  [key: string]: unknown;
}

// Category-appropriate fallback image if no image has been uploaded to Supabase Storage yet
function getCategoryFallbackImage(categorySlug: string, categoryName: string) {
  const s = (categorySlug + " " + categoryName).toLowerCase();
  if (s.includes("panel") || s.includes("module") || s.includes("pv")) {
    return "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80";
  }
  if (s.includes("invert")) {
    return "https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=800&q=80";
  }
  if (s.includes("batter") || s.includes("storage") || s.includes("lithium")) {
    return "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=800&q=80";
  }
  if (
    s.includes("structure") ||
    s.includes("mount") ||
    s.includes("cable") ||
    s.includes("accessor")
  ) {
    return "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80";
  }
  return "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80";
}

// Live inventory status badge formatting in clean Blue & White theme
function getInventoryBadge(status: string) {
  switch (status) {
    case "in_stock":
      return {
        label: "In Stock",
        className: "bg-emerald-50 text-emerald-700 border-emerald-300",
      };
    case "available_on_order":
      return {
        label: "On Order",
        className: "bg-amber-50 text-amber-700 border-amber-300",
      };
    case "out_of_stock":
    default:
      return {
        label: "Out of Stock",
        className: "bg-rose-50 text-rose-700 border-rose-300",
      };
  }
}

// Short Card Title Simplifier (2-4 words max, easy for Pakistani buyers)
function simplifyProductName(fullName: string, categoryName: string = ""): string {
  if (!fullName) return "";
  const clean = fullName.trim();
  const lower = clean.toLowerCase();

  // 1. Panels & PV Modules
  if (lower.includes("longi")) return "LONGi Panels";
  if (lower.includes("canadian")) return "Canadian Solar";
  if (lower.includes("jinko")) return "Jinko Solar";
  if (lower.includes("ja solar") || lower.startsWith("ja ")) return "JA Solar";
  if (lower.includes("trina")) return "Trina Solar";

  // 2. Inverters
  if (lower.includes("inverex")) {
    if (lower.includes("veyron")) return "Inverex Veyron";
    if (lower.includes("nitrox")) return "Inverex Nitrox";
    if (lower.includes("aerox")) return "Inverex Aerox";
    return "Inverex Inverter";
  }
  if (lower.includes("knox")) return "Knox Inverter";
  if (lower.includes("crown")) return "Crown Inverter";
  if (lower.includes("itel")) return "Itel Inverter";
  if (lower.includes("growatt")) return "Growatt Inverter";
  if (lower.includes("huawei")) return "Huawei Inverter";
  if (lower.includes("sungrow")) return "Sungrow Inverter";
  if (lower.includes("goodwe")) return "GoodWe Inverter";
  if (lower.includes("solis")) return "Solis Inverter";
  if (lower.includes("fronus")) return "Fronus Inverter";
  if (lower.includes("tesla")) return "Tesla Inverter";

  // 3. Batteries & Storage
  if (lower.includes("dyness")) return "Dyness Battery";
  if (lower.includes("pylontech")) return "Pylontech Battery";
  if (lower.includes("narada")) return "Narada Battery";
  if (lower.includes("shoto")) return "Shoto Battery";
  if (lower.includes("phoenix")) return "Phoenix Battery";
  if (lower.includes("volta")) return "Volta Battery";
  if (lower.includes("daewoo")) return "Daewoo Battery";
  if (lower.includes("ags")) return "AGS Battery";

  // 4. Mounting & Electrical Accessories
  if (
    lower.includes("structure") ||
    lower.includes("mount") ||
    lower.includes("frame") ||
    lower.includes("channel") ||
    lower.includes("l2") ||
    lower.includes("l3")
  ) {
    return "Mounting Structure";
  }
  if (lower.includes("cable") || lower.includes("wire")) {
    return "Solar DC Cable";
  }
  if (
    lower.includes("breaker") ||
    lower.includes("spd") ||
    lower.includes("protection") ||
    lower.includes("distribution") ||
    lower.includes("db box")
  ) {
    return "Protection DB Box";
  }

  // 5. If title already has <= 4 words, keep it
  const words = clean.split(/\s+/);
  if (words.length <= 4) return clean;

  // 6. Otherwise filter technical spec tokens and take first 2-3 words
  const specTokens =
    /^(mono|perc|bifacial|topcon|n-type|p-type|\d+w|\d+kw|\d+v|\d+ah|series|model|high|voltage|solar|inverter|battery|panel)$/i;
  const filtered = words.filter(
    (w, idx) => idx === 0 || !specTokens.test(w.replace(/[^a-zA-Z0-9-]/g, ""))
  );
  return filtered.slice(0, 3).join(" ") || words.slice(0, 3).join(" ");
}

export default async function ProductsPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Fetch live active categories, published products, and active offers
  const [
    { data: categoriesData },
    { data: productsData },
    { data: activeOffersData },
    { data: offerProductsData },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("products")
      .select("*, product_images(id, image_url, is_primary)")
      .eq("publication_status", "published")
      .order("created_at", { ascending: true }),
    supabase
      .from("offers")
      .select("*")
      .eq("is_enabled", true)
      .lte("start_time", now)
      .gte("end_time", now),
    supabase.from("offer_products").select("offer_id, product_id"),
  ]);

  const categories = categoriesData ?? [];
  const products = productsData ?? [];
  const activeOffers = activeOffersData ?? [];
  const offerProducts = offerProductsData ?? [];

  // Map active promotional offers by product_id
  const offerMap = new Map(activeOffers.map((o) => [o.id, o]));
  const productOfferMap = new Map<string, (typeof activeOffers)[0]>();
  for (const op of offerProducts) {
    const offer = offerMap.get(op.offer_id);
    if (offer && !productOfferMap.has(op.product_id)) {
      productOfferMap.set(op.product_id, offer);
    }
  }

  // Group published products by category_id
  const productsByCategory = new Map<string, typeof products>();
  for (const cat of categories) {
    productsByCategory.set(cat.id, []);
  }
  for (const prod of products) {
    if (prod.category_id && productsByCategory.has(prod.category_id)) {
      productsByCategory.get(prod.category_id)!.push(prod);
    }
  }

  return (
    <PublicShell>
      {/* -------------------------------------------------------------------
          HERO SECTION (High-Res Warehouse Image with Clean Clear Overlay)
      ------------------------------------------------------------------- */}
      <section className="relative h-[280px] sm:h-[340px] md:h-[380px] flex items-center justify-center overflow-hidden bg-slate-900">
        <Image
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
          alt="Solar hardware and monocrystalline panels warehouse"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.88] contrast-[1.05]"
        />
        {/* Clean Navy Slate Overlay (Bright & Clear, matching homepage) */}
        <div className="absolute inset-0 bg-slate-950/45 z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Solar Hardware &amp; Balance of System
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-slate-200 font-normal leading-relaxed">
            A-Grade Tier-1 Solar Panels, Hybrid &amp; On-Grid Inverters, LiFePO4
            Storage Banks, and Installation Accessories in Direct Wholesale Stock.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          CATEGORY JUMP BAR (Zero-Gap Sticky under Smart-Scroll Navbar)
      ------------------------------------------------------------------- */}
      <nav
        aria-label="Catalogue categories jump navigation"
        className="sticky z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-xs shadow-xs transition-[top] duration-300 ease-in-out"
        style={{ top: "var(--nav-offset, 56px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2.5 gap-2 sm:gap-3 no-scrollbar">
            <span className="text-[11px] uppercase font-bold text-slate-500 shrink-0 hidden md:inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Categories:</span>
            </span>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {categories.map((cat, idx) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-medium text-xs transition"
                >
                  <span className="font-mono text-[11px] text-blue-600 font-bold">
                    0{idx + 1}.
                  </span>
                  <span>{cat.name}</span>
                </a>
              ))}
            </div>

            <a
              href="https://wa.me/923000000000?text=Hello%20Nowshera%20Solar,%20please%20send%20me%20today%27s%20daily%20solar%20rate%20sheet."
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold text-xs transition shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Daily Rate Sheet</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ===================================================================
          LIVE DATABASE-DRIVEN CATEGORY SECTIONS (Blue & White Theme)
      =================================================================== */}
      {categories.map((category, catIdx) => {
        const categoryProducts = productsByCategory.get(category.id) || [];
        const isLightAlternate = catIdx % 2 === 1;

        return (
          <section
            key={category.id}
            id={`cat-${category.slug}`}
            className={`scroll-mt-28 py-12 sm:py-16 border-b border-slate-200 ${
              isLightAlternate ? "bg-slate-50" : "bg-white"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
                <div className="space-y-1.5 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    Category 0{catIdx + 1} • {category.name}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    {categoryProducts.length}{" "}
                    {categoryProducts.length === 1 ? "Product" : "Products"} Available
                  </span>
                </div>
              </div>

              {/* Products Grid (Mobile-First: 1 col mobile, 2 col tablet, 3 col desktop) */}
              {categoryProducts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-500 italic">
                    No products published in {category.name} yet. Direct
                    wholesale stock arriving soon. Contact WhatsApp desk for
                    advance booking.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {categoryProducts.map((prod) => {
                    const primaryImage =
                      prod.product_images?.find((img) => img.is_primary) ||
                      prod.product_images?.[0];
                    const imageUrl =
                      primaryImage?.image_url ||
                      getCategoryFallbackImage(category.slug, category.name);

                    const specs = (prod.specifications as ProductSpecs) || {};
                    const variants = specs.variants || [];
                    const tag = (specs.tag as string) || null;
                    const stockBadge = getInventoryBadge(prod.inventory_status);

                    // Clean, simplified card title (2-4 words max)
                    const shortTitle = simplifyProductName(prod.name, category.name);

                    // Check live offer discount
                    const activeOffer = productOfferMap.get(prod.id);
                    const regularPrice = Number(prod.regular_price || 0);
                    let discountedPrice = regularPrice;
                    if (activeOffer) {
                      if (activeOffer.discount_type === "percentage") {
                        discountedPrice = Math.round(
                          regularPrice * (1 - activeOffer.discount_value / 100)
                        );
                      } else if (activeOffer.discount_type === "fixed_amount") {
                        discountedPrice = Math.max(
                          0,
                          regularPrice - activeOffer.discount_value
                        );
                      } else if (activeOffer.discount_type === "special_price") {
                        discountedPrice = activeOffer.discount_value;
                      }
                    }
                    const hasDiscount =
                      Boolean(activeOffer) && discountedPrice < regularPrice;

                    // WhatsApp link with live product metadata
                    const priceLabel = hasDiscount
                      ? `PKR ${discountedPrice.toLocaleString()} (Promotional Offer: ${activeOffer?.title})`
                      : `PKR ${regularPrice.toLocaleString()}`;
                    const waMessage = `Hello Nowshera Solar Solutions, I would like to inquire about ${shortTitle} (${prod.name}, SKU: ${prod.sku}) listed at ${priceLabel}. Please confirm wholesale availability and today's dispatch rates.`;
                    const waUrl = `https://wa.me/923000000000?text=${encodeURIComponent(
                      waMessage
                    )}`;

                    return (
                      <div
                        key={prod.id}
                        className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
                      >
                        <div>
                          {/* Image Banner */}
                          <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={prod.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Top Left: Custom Tag Badge */}
                            {tag && (
                              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-md text-[11px] font-bold text-white border border-slate-700">
                                {tag}
                              </span>
                            )}

                            {/* Top Right: Stock Status */}
                            <span
                              className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${stockBadge.className}`}
                            >
                              {stockBadge.label}
                            </span>

                            {/* Bottom Left: SKU Tag */}
                            <span className="absolute bottom-3 left-3 text-[11px] font-mono font-bold text-slate-700 bg-white/95 px-2 py-0.5 rounded border border-slate-200 shadow-xs">
                              {prod.sku}
                            </span>
                          </div>

                          {/* Card Content Body */}
                          <div className="p-5 space-y-3">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                {shortTitle}
                              </h3>
                              {prod.short_description && (
                                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                  {prod.short_description}
                                </p>
                              )}
                            </div>

                            {/* Wattage / Capacity / Spec Variants Pills */}
                            {variants.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-blue-600" />
                                  Available Models:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {variants.map((v) => (
                                    <span
                                      key={v}
                                      className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-bold"
                                    >
                                      {v}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Context Description (Short 1-paragraph overview) */}
                            {prod.description && (
                              <p className="text-xs text-slate-600 leading-relaxed pt-1 line-clamp-3">
                                {prod.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Card Action Footer: Wholesale Price on Left, Circular WhatsApp on Right */}
                        <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/60">
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 block">
                              Wholesale Rate:
                            </span>
                            {hasDiscount ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="line-through text-slate-400 font-mono text-[11px]">
                                    PKR {regularPrice.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 truncate">
                                    {activeOffer?.title}
                                  </span>
                                </div>
                                <div className="text-base sm:text-lg font-black font-mono text-blue-600">
                                  PKR {discountedPrice.toLocaleString()}
                                </div>
                              </div>
                            ) : (
                              <div className="text-base sm:text-lg font-black font-mono text-slate-900">
                                PKR {regularPrice.toLocaleString()}
                              </div>
                            )}
                          </div>

                          {/* Perfectly Circular WhatsApp Action Button */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Inquire about ${shortTitle} on WhatsApp`}
                            title={`Inquire about ${shortTitle} on WhatsApp`}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all shrink-0"
                          >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </PublicShell>
  );
}
