import React from "react";
import Image from "next/image";
import { requireStaffAuth, requireAdminOrOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import type { DiscountType } from "@/types/database.types";
import {
  Percent,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  Package,
  Layers,
  Power,
  X,
  Clock,
  Sparkles,
  Tag,
  ImageIcon,
} from "lucide-react";

// Next.js 16 dynamic server rendering control
export const instant = false;

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminOffersPage(props: PageProps) {
  const profile = await requireStaffAuth();
  const canEdit = profile.role === "owner" || profile.role === "admin";
  const searchParams = await props.searchParams;
  const errorMessage =
    typeof searchParams?.error === "string" ? searchParams.error : null;

  const supabase = await createClient();

  // Fetch offers, flat junction tables, and catalog items to avoid nested join metadata issues
  const [
    { data: offersData },
    { data: offerProductsData },
    { data: offerPackagesData },
    { data: productsData },
    { data: packagesData },
  ] = await Promise.all([
    supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("offer_products").select("offer_id, product_id"),
    supabase.from("offer_packages").select("offer_id, package_id"),
    supabase
      .from("products")
      .select("id, name, sku, regular_price, publication_status")
      .order("name", { ascending: true }),
    supabase
      .from("packages")
      .select("id, name, slug, capacity_kw, publication_status")
      .order("name", { ascending: true }),
  ]);

  const offers = offersData ?? [];
  const products = productsData ?? [];
  const packagesList = packagesData ?? [];

  const productMap = new Map(products.map((p) => [p.id, p]));
  const packageMap = new Map(packagesList.map((pkg) => [pkg.id, pkg]));

  const publishedProducts = products.filter(
    (p) => p.publication_status === "published"
  );
  const publishedPackages = packagesList.filter(
    (pkg) => pkg.publication_status === "published"
  );

  // Helper function to calculate automatic live status
  function getOfferStatus(offer: {
    is_enabled: boolean;
    start_time: string;
    end_time: string;
  }) {
    const now = new Date();
    const start = new Date(offer.start_time);
    const end = new Date(offer.end_time);

    if (!offer.is_enabled) {
      return {
        label: "Disabled",
        badge: "bg-slate-800 text-slate-400 border-slate-700",
      };
    }
    if (now < start) {
      return {
        label: "Scheduled",
        badge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
      };
    }
    if (now >= start && now < end) {
      return {
        label: "Active Now",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      };
    }
    return {
      label: "Expired Automatically",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    };
  }

  // 1. Create New Offer
  async function createOffer(formData: FormData) {
    "use server";
    const authProfile = await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const title = String(formData.get("title") || "").trim();
    const description =
      String(formData.get("description") || "").trim() || null;
    const discount_type = String(
      formData.get("discount_type") || "percentage"
    ) as DiscountType;
    const discount_value = Number(formData.get("discount_value") || 0);
    const start_time_raw = String(formData.get("start_time") || "");
    const end_time_raw = String(formData.get("end_time") || "");

    if (!title || !discount_value || !start_time_raw || !end_time_raw) {
      redirect(
        `/admin/offers?error=${encodeURIComponent(
          "Please fill in all required fields (title, discount value, start time, end time)."
        )}`
      );
    }

    const start_time = new Date(start_time_raw).toISOString();
    const end_time = new Date(end_time_raw).toISOString();

    if (new Date(end_time) <= new Date(start_time)) {
      redirect(
        `/admin/offers?error=${encodeURIComponent(
          "Offer end time must be after start time."
        )}`
      );
    }

    let banner_image_url: string | null = null;
    const bannerFile = formData.get("banner") as File | null;
    if (bannerFile && bannerFile.size > 0) {
      const ext = bannerFile.name.split(".").pop()?.toLowerCase() || "webp";
      const filePath = `offers/${crypto.randomUUID()}.${ext}`;

      const { error: uploadErr } = await supabaseServer.storage
        .from("category-banners")
        .upload(filePath, bannerFile, {
          contentType: bannerFile.type,
          upsert: false,
        });

      if (!uploadErr) {
        const { data: pubUrl } = supabaseServer.storage
          .from("category-banners")
          .getPublicUrl(filePath);
        banner_image_url = pubUrl.publicUrl;
      }
    }

    const { error: insertErr } = await supabaseServer.from("offers").insert({
      title,
      description,
      discount_type,
      discount_value,
      start_time,
      end_time,
      banner_image_url,
      is_enabled: true,
      created_by: authProfile.id,
    });

    if (insertErr) {
      redirect(
        `/admin/offers?error=${encodeURIComponent(insertErr.message)}`
      );
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");
    revalidatePath("/admin");
    redirect("/admin/offers");
  }

  // 2. Assign Product to Offer (Trigger validates overlaps & special prices)
  async function assignProductToOffer(formData: FormData) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const offer_id = String(formData.get("offer_id") || "");
    const product_id = String(formData.get("product_id") || "");

    if (!offer_id || !product_id) return;

    const { error } = await supabaseServer.from("offer_products").insert({
      offer_id,
      product_id,
    });

    if (error) {
      redirect(
        `/admin/offers?error=${encodeURIComponent(
          error.message || "Failed to assign product to offer."
        )}`
      );
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");
  }

  // 3. Assign Package to Offer
  async function assignPackageToOffer(formData: FormData) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const offer_id = String(formData.get("offer_id") || "");
    const package_id = String(formData.get("package_id") || "");

    if (!offer_id || !package_id) return;

    const { error } = await supabaseServer.from("offer_packages").insert({
      offer_id,
      package_id,
    });

    if (error) {
      redirect(
        `/admin/offers?error=${encodeURIComponent(
          error.message || "Failed to assign package to offer."
        )}`
      );
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");
  }

  // 4. Remove Assigned Product
  async function removeOfferProduct(offerId: string, productId: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const { error } = await supabaseServer
      .from("offer_products")
      .delete()
      .match({ offer_id: offerId, product_id: productId });

    if (error) {
      redirect(
        `/admin/offers?error=${encodeURIComponent(
          error.message || "Failed to remove product from offer."
        )}`
      );
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");
  }

  // 5. Remove Assigned Package
  async function removeOfferPackage(offerId: string, packageId: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const { error } = await supabaseServer
      .from("offer_packages")
      .delete()
      .match({ offer_id: offerId, package_id: packageId });

    if (error) {
      redirect(
        `/admin/offers?error=${encodeURIComponent(
          error.message || "Failed to remove package from offer."
        )}`
      );
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");
  }

  // 6. Toggle Offer Status
  async function toggleOfferStatus(id: string, currentEnabled: boolean) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const { error } = await supabaseServer
      .from("offers")
      .update({ is_enabled: !currentEnabled })
      .eq("id", id);

    if (error) {
      redirect(`/admin/offers?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");
  }

  // 7. Delete Offer
  async function deleteOffer(id: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const { error } = await supabaseServer.from("offers").delete().eq("id", id);

    if (error) {
      redirect(`/admin/offers?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");
    revalidatePath("/admin");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-500 uppercase tracking-widest mb-1">
          <Tag className="w-3.5 h-3.5" />
          <span>PROMOTIONAL CAMPAIGNS & BUNDLE ENGINE</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Percent className="w-6 h-6 text-amber-500" />
          Promotional Offers & Bundle Discounts
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure automated percentage, fixed amount, and special price markdown campaigns.
          Discounts are automatically synchronized to public catalog cards and turnkey packages.
        </p>
      </div>

      {/* Prominent Error / Trigger Warning Box */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-md p-4 flex items-start gap-3 text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold block text-rose-200 mb-0.5">
              Validation / Database Rule Notice
            </span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Create New Offer (Owner/Admin only) */}
      {canEdit && (
        <form
          action={createOffer}
          className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
              <Plus className="w-4 h-4 text-amber-500" />
              Create New Promotional Offer
            </h2>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Automated Start & Expiry (PKT UTC+5)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Offer Title *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Monsoon Mega Sale — 10% OFF Tier-1 Inverters"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Banner Image (Optional)
              </label>
              <input
                type="file"
                name="banner"
                accept="image/*"
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Discount Type *
              </label>
              <select
                name="discount_type"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="fixed_amount">Fixed Amount Discount (PKR)</option>
                <option value="special_price">Special Promotional Price (PKR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Discount Value *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                name="discount_value"
                required
                placeholder="e.g. 15 for 15% or 10000 for PKR"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Start Timestamp *
              </label>
              <input
                type="datetime-local"
                name="start_time"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                End Timestamp (Expiry) *
              </label>
              <input
                type="datetime-local"
                name="end_time"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Offer Description / Terms (Optional)
              </label>
              <input
                type="text"
                name="description"
                placeholder="Applicable while promotional warehouse stock lasts or during current billing cycle..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-md text-sm transition"
            >
              Publish Scheduled Offer
            </button>
          </div>
        </form>
      )}

      {/* Offers List */}
      <div className="space-y-6">
        <h2 className="text-base font-semibold text-white flex items-center justify-between uppercase tracking-wide">
          <span>Configured Promotional Offers ({offers.length})</span>
        </h2>

        {offers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-slate-400">
            <Percent className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-slate-300">
              No promotional offers configured yet.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Create an offer above to schedule discounts on hardware products and complete solar packages.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {offers.map((offer) => {
              const status = getOfferStatus(offer);
              const assignedProducts = (offerProductsData ?? [])
                .filter((op) => op.offer_id === offer.id)
                .map((op) => ({
                  product_id: op.product_id,
                  product: productMap.get(op.product_id),
                }));
              const assignedPackages = (offerPackagesData ?? [])
                .filter((op) => op.offer_id === offer.id)
                .map((op) => ({
                  package_id: op.package_id,
                  package: packageMap.get(op.package_id),
                }));

              return (
                <div
                  key={offer.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 relative overflow-hidden"
                >
                  {/* Banner Preview if available */}
                  {offer.banner_image_url && (
                    <div className="relative w-full h-36 bg-slate-950 border border-slate-800 rounded-md overflow-hidden">
                      <Image
                        src={offer.banner_image_url}
                        alt={offer.title}
                        fill
                        className="object-cover opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs font-mono text-amber-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>CAMPAIGN BANNER ATTACHED</span>
                      </div>
                    </div>
                  )}

                  {/* Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">
                          {offer.title}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded font-mono font-medium border ${status.badge}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      {offer.description && (
                        <p className="text-xs text-slate-400 mt-1">
                          {offer.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Discount Value Badge */}
                      <div className="px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold font-mono flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        {offer.discount_type === "percentage" &&
                          `${offer.discount_value}% OFF`}
                        {offer.discount_type === "fixed_amount" &&
                          `${formatPrice(offer.discount_value)} OFF`}
                        {offer.discount_type === "special_price" &&
                          `Special Price: ${formatPrice(offer.discount_value)}`}
                      </div>

                      {/* Toggle & Delete */}
                      {canEdit && (
                        <div className="flex items-center gap-2">
                          <form
                            action={toggleOfferStatus.bind(
                              null,
                              offer.id,
                              offer.is_enabled
                            )}
                          >
                            <button
                              type="submit"
                              title={
                                offer.is_enabled
                                  ? "Disable Offer"
                                  : "Enable Offer"
                              }
                              className={`p-2 rounded-md border transition text-xs font-mono flex items-center gap-1.5 ${
                                offer.is_enabled
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                  : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span>
                                {offer.is_enabled ? "Enabled" : "Disabled"}
                              </span>
                            </button>
                          </form>

                          <form action={deleteOffer.bind(null, offer.id)}>
                            <button
                              type="submit"
                              title="Delete Offer"
                              className="p-2 rounded-md bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates Schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-400 bg-slate-950 p-3.5 rounded-md border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>
                        <strong className="text-slate-200">STARTS:</strong>{" "}
                        {new Date(offer.start_time).toLocaleString("en-PK", {
                          timeZone: "Asia/Karachi",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}
                        PKT
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-rose-500" />
                      <span>
                        <strong className="text-slate-200">EXPIRES:</strong>{" "}
                        {new Date(offer.end_time).toLocaleString("en-PK", {
                          timeZone: "Asia/Karachi",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}
                        PKT
                      </span>
                    </div>
                  </div>

                  {/* Assigned Products & Packages Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Products Target */}
                    <div className="space-y-3 min-w-0 bg-slate-950/60 p-4 rounded-md border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-amber-500" />
                          Attached Products ({assignedProducts.length})
                        </span>
                      </div>

                      {/* Attach Product Form */}
                      {canEdit && (
                        <form
                          action={assignProductToOffer}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="hidden"
                            name="offer_id"
                            value={offer.id}
                          />
                          <select
                            name="product_id"
                            required
                            className="flex-1 min-w-0 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:border-amber-500 truncate"
                          >
                            <option value="">Select published product...</option>
                            {publishedProducts.map((prod) => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name} ({prod.sku}) —{" "}
                                {formatPrice(prod.regular_price)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-md text-xs transition shrink-0"
                          >
                            Assign Product
                          </button>
                        </form>
                      )}

                      {/* List of Attached Products */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {assignedProducts.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            No individual products attached to this offer yet.
                          </p>
                        ) : (
                          assignedProducts.map((item) => (
                            <span
                              key={item.product_id}
                              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-200"
                            >
                              <span className="font-medium">
                                {item.product?.name ?? "Hardware Product"}
                              </span>
                              <span className="text-slate-400 font-mono text-[11px]">
                                ({item.product?.sku ?? "N/A"})
                              </span>
                              {canEdit && (
                                <form
                                  action={removeOfferProduct.bind(
                                    null,
                                    offer.id,
                                    item.product_id
                                  )}
                                  className="inline ml-1"
                                >
                                  <button
                                    type="submit"
                                    title="Remove from offer"
                                    className="text-slate-400 hover:text-rose-400 transition"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </form>
                              )}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Solar Packages Target */}
                    <div className="space-y-3 min-w-0 bg-slate-950/60 p-4 rounded-md border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-500" />
                          Attached Solar Packages ({assignedPackages.length})
                        </span>
                      </div>

                      {/* Attach Package Form */}
                      {canEdit && (
                        <form
                          action={assignPackageToOffer}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="hidden"
                            name="offer_id"
                            value={offer.id}
                          />
                          <select
                            name="package_id"
                            required
                            className="flex-1 min-w-0 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:border-amber-500 truncate"
                          >
                            <option value="">Select published package...</option>
                            {publishedPackages.map((pkg) => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} ({pkg.capacity_kw} kW)
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-md text-xs transition shrink-0"
                          >
                            Assign Package
                          </button>
                        </form>
                      )}

                      {/* List of Attached Packages */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {assignedPackages.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">
                            No complete packages attached to this offer yet.
                          </p>
                        ) : (
                          assignedPackages.map((item) => (
                            <span
                              key={item.package_id}
                              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-200"
                            >
                              <span className="font-medium">
                                {item.package?.name ?? "Solar Package"}
                              </span>
                              <span className="text-amber-400 font-mono text-[11px]">
                                {item.package?.capacity_kw}kW
                              </span>
                              {canEdit && (
                                <form
                                  action={removeOfferPackage.bind(
                                    null,
                                    offer.id,
                                    item.package_id
                                  )}
                                  className="inline ml-1"
                                >
                                  <button
                                    type="submit"
                                    title="Remove from offer"
                                    className="text-slate-400 hover:text-rose-400 transition"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </form>
                              )}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
