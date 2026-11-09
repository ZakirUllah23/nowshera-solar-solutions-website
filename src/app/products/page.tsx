import React from "react";
import Image from "next/image";
import PublicShell from "@/components/public/PublicShell";
import { createClient } from "@/lib/supabase/server";
import {
  ShieldCheck,
  MessageCircle,
  Sliders,
  Tag,
  Layers,
  Sparkles,
  ArrowRight,
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

// Live inventory status badge formatting
function getInventoryBadge(status: string) {
  switch (status) {
    case "in_stock":
      return {
        label: "In Stock",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      };
    case "available_on_order":
      return {
        label: "On Order",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      };
    case "out_of_stock":
    default:
      return {
        label: "Out of Stock",
        className: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      };
  }
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
          HERO SECTION (High-Res Warehouse Image with Slate Overlay)
      ------------------------------------------------------------------- */}
      <section className="relative h-[340px] md:h-[400px] flex items-center justify-center overflow-hidden bg-slate-950">
        <Image
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
          alt="Solar hardware and monocrystalline panels warehouse"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-75 contrast-105"
        />
        {/* Dark Slate Architectural Overlay */}
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Nowshera Wholesale &amp; Retail Hardware Stock</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Solar Hardware &amp; Balance of System Catalogue
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            A-Grade Tier-1 Solar Panels, Hybrid/On-Grid Inverters, LiFePO4
            Storage Banks, and Complete Installation Accessories Available in
            Wholesale &amp; Retail Stock.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          QUICK ANCHOR JUMP BAR (Dynamically Generated from Active Categories)
      ------------------------------------------------------------------- */}
      <nav
        aria-label="Catalogue categories jump navigation"
        className="sticky top-20 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-xs shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-3 gap-2 sm:gap-4 no-scrollbar">
            <span className="text-[11px] uppercase font-bold text-slate-400 shrink-0 hidden md:inline-flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Jump To Category:</span>
            </span>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {categories.map((cat, idx) => (
                <a
                  key={cat.id}
                  href={`#cat-${cat.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-amber-500/10 text-slate-300 hover:text-amber-400 border border-slate-800 font-medium transition"
                >
                  <span className="font-mono text-[11px] text-amber-500">
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
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-semibold transition shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Daily Rate Sheet</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ===================================================================
          LIVE DATABASE-DRIVEN CATEGORY SECTIONS
      =================================================================== */}
      {categories.map((category, catIdx) => {
        const categoryProducts = productsByCategory.get(category.id) || [];
        const isDarkSection = catIdx % 2 === 0;

        return (
          <section
            key={category.id}
            id={`cat-${category.slug}`}
            className={`scroll-mt-32 py-16 sm:py-20 border-b border-slate-800/80 ${
              isDarkSection ? "bg-slate-950 text-white" : "bg-slate-900 text-white"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    Category 0{catIdx + 1} • {category.name}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>
                    {categoryProducts.length}{" "}
                    {categoryProducts.length === 1 ? "Product" : "Products"} in
                    Stock
                  </span>
                </div>
              </div>

              {/* Products Grid */}
              {categoryProducts.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800">
                  <p className="text-sm text-slate-400 italic">
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

                    // Construct WhatsApp consultation link with live product metadata
                    const priceLabel = hasDiscount
                      ? `PKR ${discountedPrice.toLocaleString()} (Promotional Offer: ${activeOffer?.title})`
                      : `PKR ${regularPrice.toLocaleString()}`;
                    const waMessage = `Hello Nowshera Solar Solutions, I would like to inquire about ${prod.name} (SKU: ${prod.sku}) listed at ${priceLabel}. Please confirm wholesale availability and today's dispatch rates.`;
                    const waUrl = `https://wa.me/923000000000?text=${encodeURIComponent(
                      waMessage
                    )}`;

                    return (
                      <div
                        key={prod.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all duration-200 shadow-md group"
                      >
                        <div>
                          {/* Image Banner */}
                          <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={prod.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                            {/* Top Left: Custom Tag Badge */}
                            {tag && (
                              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-slate-700">
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
                            <span className="absolute bottom-3 left-3 text-[11px] font-mono font-bold text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                              {prod.sku}
                            </span>
                          </div>

                          {/* Card Content Body */}
                          <div className="p-5 space-y-4">
                            <div>
                              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                                {prod.name}
                              </h3>
                              {prod.short_description && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {prod.short_description}
                                </p>
                              )}
                            </div>

                            {/* Wattage / Capacity / Spec Variants Pills */}
                            {variants.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-sky-400" />
                                  Available Configurations:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {variants.map((v) => (
                                    <span
                                      key={v}
                                      className="font-mono text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-amber-300 font-bold"
                                    >
                                      {v}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Context Description */}
                            {prod.description && (
                              <p className="text-xs text-slate-400 leading-relaxed pt-1">
                                {prod.description}
                              </p>
                            )}

                            {/* Price & Offer Discount Section */}
                            <div className="pt-3 border-t border-slate-800/80 space-y-1">
                              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                                Pricing &amp; Wholesale Rates:
                              </span>
                              {hasDiscount ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="line-through text-slate-500 font-mono text-xs">
                                      PKR {regularPrice.toLocaleString()}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                      <Sparkles className="w-3 h-3" />
                                      {activeOffer?.title}
                                    </span>
                                  </div>
                                  <div className="flex items-baseline gap-1 text-emerald-400 font-mono">
                                    <span className="text-xs text-slate-400">
                                      Offer:
                                    </span>
                                    <span className="text-lg font-extrabold">
                                      PKR {discountedPrice.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-baseline gap-1.5 font-mono">
                                  <span className="text-xs text-slate-400">
                                    Starting from:
                                  </span>
                                  <span className="text-base font-bold text-emerald-400">
                                    PKR {regularPrice.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Direct WhatsApp Action Button */}
                        <div className="p-5 pt-0">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-950 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 border border-slate-800 hover:border-emerald-500 font-semibold text-xs transition-all duration-200"
                          >
                            <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:text-slate-950" />
                            <span>Check Stock &amp; Rate on WhatsApp</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
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
