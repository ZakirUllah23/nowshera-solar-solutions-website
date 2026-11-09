import { requireStaffAuth, requireAdminOrOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import type { StockStatus, PublicationStatus } from "@/types/database.types";
import {
  Layers,
  Plus,
  Trash2,
  Package as PackageIcon,
  Zap,
  Calculator,
  Save,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminPackagesPage(props: PageProps) {
  const profile = await requireStaffAuth();
  const canEdit = profile.role === "owner" || profile.role === "admin";
  const searchParams = await props.searchParams;
  const errorMessage =
    typeof searchParams?.error === "string" ? searchParams.error : null;
  const successMessage =
    typeof searchParams?.success === "string" ? searchParams.success : null;

  const supabase = await createClient();

  // Fetch flat data without complex relational join dependencies
  const [
    { data: packagesData },
    { data: pricingViewData },
    { data: packageItemsData },
    { data: publishedProducts },
  ] = await Promise.all([
    supabase
      .from("packages")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("package_pricing_view").select("*"),
    supabase.from("package_items").select("*"),
    supabase
      .from("products")
      .select("id, name, sku, regular_price")
      .eq("publication_status", "published")
      .order("name", { ascending: true }),
  ]);

  const packages = packagesData ?? [];
  const pricingViewMap = new Map(
    (pricingViewData ?? []).map((v) => [v.package_id, v])
  );
  const productMap = new Map(
    (publishedProducts ?? []).map((p) => [p.id, p])
  );

  // 1. Create New Package
  async function createPackage(formData: FormData) {
    "use server";
    const authProfile = await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const name = String(formData.get("name") || "").trim();
    const rawSlug = String(formData.get("slug") || "").trim();
    const slug = (rawSlug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const capacity_kw = Number(formData.get("capacity_kw") || 0);
    const installation_cost = Number(formData.get("installation_cost") || 0);
    const additional_costs = Number(formData.get("additional_costs") || 0);
    const manual_override_raw = String(
      formData.get("manual_price_override") || ""
    ).trim();
    const manual_price_override =
      manual_override_raw !== "" ? Number(manual_override_raw) : null;

    // Default to published as requested
    const publication_status = String(
      formData.get("publication_status") || "published"
    ) as PublicationStatus;

    const inventory_status = String(
      formData.get("inventory_status") || "in_stock"
    ) as StockStatus;

    const description =
      String(formData.get("description") || "").trim() || null;

    if (!name || !slug || capacity_kw <= 0) {
      redirect(
        `/admin/packages?error=${encodeURIComponent(
          "Package name, valid slug, and capacity in kW (> 0) are required."
        )}`
      );
    }

    let featured_image_url: string | null = null;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "webp";
      const filePath = `packages/${crypto.randomUUID()}.${ext}`;

      const { error: uploadErr } = await supabaseServer.storage
        .from("package-images")
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (!uploadErr) {
        const { data: pubUrl } = supabaseServer.storage
          .from("package-images")
          .getPublicUrl(filePath);
        featured_image_url = pubUrl.publicUrl;
      }
    }

    const { error } = await supabaseServer.from("packages").insert({
      name,
      slug,
      capacity_kw,
      installation_cost,
      additional_costs,
      manual_price_override,
      inventory_status,
      publication_status,
      description,
      featured_image_url,
      is_featured: formData.get("is_featured") === "on",
      created_by: authProfile.id,
    });

    if (error) {
      redirect(
        `/admin/packages?error=${encodeURIComponent(error.message)}`
      );
    }

    revalidatePath("/packages");
    revalidatePath("/admin/packages");
    redirect(
      `/admin/packages?success=${encodeURIComponent(
        `Package "${name}" created successfully.`
      )}`
    );
  }

  // 2. Full Update Package (Name, kW, Description, Costs, Overrides, Stock & Visibility)
  async function updatePackage(formData: FormData) {
    "use server";
    const authProfile = await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const id = String(formData.get("package_id") || "");
    const name = String(formData.get("name") || "").trim();
    const capacity_kw = Number(formData.get("capacity_kw") || 0);
    const description =
      String(formData.get("description") || "").trim() || null;

    const installation_cost = Number(formData.get("installation_cost") || 0);
    const additional_costs = Number(formData.get("additional_costs") || 0);
    const manual_override_raw = String(
      formData.get("manual_price_override") || ""
    ).trim();
    const manual_price_override =
      manual_override_raw !== "" ? Number(manual_override_raw) : null;

    const inventory_status = String(
      formData.get("inventory_status") || "in_stock"
    ) as StockStatus;

    const publication_status = String(
      formData.get("publication_status") || "published"
    ) as PublicationStatus;

    const is_featured = formData.get("is_featured") === "on";

    if (!id || !name || capacity_kw <= 0) {
      redirect(
        `/admin/packages?error=${encodeURIComponent(
          "Valid package name and capacity (kW > 0) are required."
        )}`
      );
    }

    const { error } = await supabaseServer
      .from("packages")
      .update({
        name,
        capacity_kw,
        description,
        installation_cost,
        additional_costs,
        manual_price_override,
        inventory_status,
        publication_status,
        is_featured,
        updated_by: authProfile.id,
      })
      .eq("id", id);

    if (error) {
      redirect(
        `/admin/packages?error=${encodeURIComponent(error.message)}`
      );
    }

    revalidatePath("/packages");
    revalidatePath("/admin/packages");
    revalidatePath("/admin/price-history");
    redirect(
      `/admin/packages?success=${encodeURIComponent(
        `Package "${name}" updated successfully.`
      )}`
    );
  }

  // 3. Add Component Product to Package BOM
  async function addPackageItem(formData: FormData) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const package_id = String(formData.get("package_id") || "");
    const product_id = String(formData.get("product_id") || "");
    const quantity = Number(formData.get("quantity") || 1);
    const notes = String(formData.get("notes") || "").trim() || null;

    if (!package_id || !product_id || quantity <= 0) return;

    const { error } = await supabaseServer.from("package_items").insert({
      package_id,
      product_id,
      quantity,
      notes,
    });

    if (error) {
      redirect(
        `/admin/packages?error=${encodeURIComponent(
          error.message || "Failed to add component to package BOM."
        )}`
      );
    }

    revalidatePath("/packages");
    revalidatePath("/admin/packages");
    revalidatePath("/admin/price-history");
    redirect(
      `/admin/packages?success=${encodeURIComponent(
        "Component successfully added to package BOM."
      )}`
    );
  }

  // 4. Remove Component from Package BOM
  async function removePackageItem(id: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const { error } = await supabaseServer
      .from("package_items")
      .delete()
      .eq("id", id);

    if (error) {
      redirect(
        `/admin/packages?error=${encodeURIComponent(error.message)}`
      );
    }

    revalidatePath("/packages");
    revalidatePath("/admin/packages");
    revalidatePath("/admin/price-history");
    redirect(
      `/admin/packages?success=${encodeURIComponent(
        "Component removed from package BOM."
      )}`
    );
  }

  // 5. Delete Entire Package
  async function deletePackage(id: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const { error } = await supabaseServer
      .from("packages")
      .delete()
      .eq("id", id);

    if (error) {
      redirect(
        `/admin/packages?error=${encodeURIComponent(error.message)}`
      );
    }

    revalidatePath("/packages");
    revalidatePath("/admin/packages");
    redirect(
      `/admin/packages?success=${encodeURIComponent(
        "Solar package deleted successfully."
      )}`
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-amber-400" />
          Solar Packages &amp; Hybrid BOM Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Create and configure turnkey solar systems. Changes sync immediately to
          the public <code className="text-amber-400 font-mono">/packages</code> page.
        </p>
      </div>

      {/* Prominent Success Banner */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold block text-emerald-200 mb-0.5">
              Success
            </span>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* Prominent Error / Trigger Warning Box */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold block text-rose-200 mb-0.5">
              Notice / Validation Message
            </span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Create New Package Form */}
      {canEdit && (
        <form
          action={createPackage}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Create New Solar Package
            </h2>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              HYBRID BOM PRICING
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Package Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. 6kW Complete Hybrid Residential Solar System"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                name="slug"
                required
                placeholder="e.g. 6kw-hybrid-residential-solar-package"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Capacity (kW) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                name="capacity_kw"
                required
                placeholder="e.g. 6.0"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Installation &amp; Wiring Cost (PKR)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                name="installation_cost"
                defaultValue={45000}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Additional / Net-Metering Costs (PKR)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                name="additional_costs"
                defaultValue={35000}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Manual Override Price (Optional PKR)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                name="manual_price_override"
                placeholder="Leave blank for dynamic calculated sum"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Publication Status (Default: Published)
              </label>
              <select
                name="publication_status"
                defaultValue="published"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="published">Published (Visible on /packages)</option>
                <option value="draft">Draft (Staff only)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Stock Status
              </label>
              <select
                name="inventory_status"
                defaultValue="in_stock"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="in_stock">In Stock</option>
                <option value="available_on_order">Available on Order</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Package Photo (Optional)
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Description / Technical Scope
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="Ideal for standard homes running 2x 1.5-Ton Inverter ACs, water pump, and lights with lithium battery backup."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="is_featured"
                className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-800 focus:ring-amber-500"
              />
              <span>Feature on Public Homepage</span>
            </label>

            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition"
            >
              Create Package
            </button>
          </div>
        </form>
      )}

      {/* Packages List */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-white">
          Configured Solar Packages ({packages.length})
        </h2>

        {packages.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Layers className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="font-medium text-slate-300">
              No solar packages created yet.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Add your turnkey systems above to combine products into complete solutions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {packages.map((pkg) => {
              const pricing = pricingViewMap.get(pkg.id);

              // Join package_items with products in JavaScript
              const items = (packageItemsData ?? [])
                .filter((item) => item.package_id === pkg.id)
                .map((item) => ({
                  ...item,
                  product: productMap.get(item.product_id),
                }));

              const componentTotal = pricing?.component_total ?? 0;
              const fixedCosts =
                (pkg.installation_cost || 0) + (pkg.additional_costs || 0);
              const calculatedPrice =
                pricing?.calculated_price ?? componentTotal + fixedCosts;
              const isOverridden = pkg.manual_price_override !== null;
              const finalSellingPrice =
                pkg.manual_price_override ?? calculatedPrice;

              return (
                <div
                  key={pkg.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-amber-400" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">
                            {pkg.name}
                          </h3>
                          {pkg.is_featured && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              FEATURED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span className="font-semibold text-amber-400 font-mono">
                            {pkg.capacity_kw} kW System
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">
                            /{pkg.slug}
                          </span>
                          <span>•</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border font-mono ${
                              pkg.publication_status === "published"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : pkg.publication_status === "draft"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {pkg.publication_status.toUpperCase()}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-[11px] text-slate-400 uppercase">
                            {pkg.inventory_status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Package Button */}
                    {canEdit && (
                      <form action={deletePackage.bind(null, pkg.id)}>
                        <button
                          type="submit"
                          title="Delete Package"
                          className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition text-xs flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Package</span>
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Hybrid Pricing Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                        Components Total (BOM)
                      </span>
                      <span className="text-base font-bold text-white font-mono mt-0.5 block">
                        {formatPrice(componentTotal)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {items.length} items linked
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                        Labor &amp; Extra Costs
                      </span>
                      <span className="text-base font-bold text-white font-mono mt-0.5 block">
                        {formatPrice(fixedCosts)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatPrice(pkg.installation_cost)} +{" "}
                        {formatPrice(pkg.additional_costs)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                        Calculated Sum
                      </span>
                      <span className="text-base font-bold text-slate-300 font-mono mt-0.5 block">
                        {formatPrice(calculatedPrice)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        BOM + Installation
                      </span>
                    </div>

                    <div className="border-l border-slate-800/80 pl-3">
                      <span className="text-[11px] uppercase tracking-wider text-amber-400 block font-semibold">
                        Final Selling Price
                      </span>
                      <span className="text-lg font-extrabold text-amber-400 font-mono mt-0.5 block">
                        {formatPrice(finalSellingPrice)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isOverridden ? (
                          <span className="text-purple-400 font-medium">
                            Manual Override Active
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">
                            Using Dynamic Calculated Sum
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Bill of Materials (BOM) Component Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                        <PackageIcon className="w-4 h-4 text-amber-400" />
                        Bill of Materials Component Products ({items.length})
                      </h4>
                    </div>

                    {/* Component Items List */}
                    <div className="bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider border-b border-slate-800 font-mono">
                          <tr>
                            <th className="py-2.5 px-3 font-medium">Product</th>
                            <th className="py-2.5 px-3 font-medium">SKU</th>
                            <th className="py-2.5 px-3 font-medium">Quantity</th>
                            <th className="py-2.5 px-3 font-medium">Unit Price</th>
                            <th className="py-2.5 px-3 font-medium">Subtotal</th>
                            <th className="py-2.5 px-3 font-medium">Notes</th>
                            {canEdit && (
                              <th className="py-2.5 px-3 font-medium text-right">
                                Actions
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {items.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                className="py-6 text-center text-slate-500"
                              >
                                No components added to this package yet. Add solar
                                panels or inverters below.
                              </td>
                            </tr>
                          ) : (
                            items.map((item) => {
                              const unitPrice =
                                item.product?.regular_price ?? 0;
                              const subtotal = unitPrice * item.quantity;

                              return (
                                <tr
                                  key={item.id}
                                  className="hover:bg-slate-900/40"
                                >
                                  <td className="py-2.5 px-3 font-medium text-white">
                                    {item.product?.name ?? "Unknown Product"}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-slate-400">
                                    {item.product?.sku ?? "—"}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-semibold text-amber-400">
                                    {item.quantity}×
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-slate-400">
                                    {formatPrice(unitPrice)}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-semibold text-white">
                                    {formatPrice(subtotal)}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-400">
                                    {item.notes ?? "—"}
                                  </td>
                                  {canEdit && (
                                    <td className="py-2.5 px-3 text-right">
                                      <form
                                        action={removePackageItem.bind(
                                          null,
                                          item.id
                                        )}
                                        className="inline"
                                      >
                                        <button
                                          type="submit"
                                          title="Remove from BOM"
                                          className="text-slate-500 hover:text-rose-400 transition"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </form>
                                    </td>
                                  )}
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Component to BOM Form */}
                    {canEdit && (
                      <form
                        action={addPackageItem}
                        className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-3 text-xs"
                      >
                        <input type="hidden" name="package_id" value={pkg.id} />
                        <div className="flex-1 min-w-[200px]">
                          <select
                            name="product_id"
                            required
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="">
                              Select published product to add...
                            </option>
                            {publishedProducts?.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku}) — {formatPrice(p.regular_price)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            name="quantity"
                            min="1"
                            defaultValue={1}
                            required
                            placeholder="Qty"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>

                        <div className="flex-1 min-w-[150px]">
                          <input
                            type="text"
                            name="notes"
                            placeholder="Optional notes (e.g. 10x 580W panels array)"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-lg transition shrink-0 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add to BOM
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Comprehensive Package Editor (Name, Capacity, Costs, Overrides, Status) */}
                  {canEdit && (
                    <form
                      action={updatePackage}
                      className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-4"
                    >
                      <input type="hidden" name="package_id" value={pkg.id} />
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-800/60 pb-2">
                        <span>Edit Package Parameters &amp; Pricing</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          Leave manual override blank to use calculated BOM sum.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Package Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={pkg.name}
                            required
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Capacity (kW)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            name="capacity_kw"
                            defaultValue={pkg.capacity_kw}
                            required
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Manual Override Price (PKR)
                          </label>
                          <input
                            type="number"
                            name="manual_price_override"
                            defaultValue={pkg.manual_price_override ?? ""}
                            placeholder="Empty = Calculated"
                            min="0"
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-amber-400 focus:outline-none focus:border-amber-500 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Installation Cost (PKR)
                          </label>
                          <input
                            type="number"
                            name="installation_cost"
                            defaultValue={pkg.installation_cost}
                            min="0"
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Additional Costs (PKR)
                          </label>
                          <input
                            type="number"
                            name="additional_costs"
                            defaultValue={pkg.additional_costs}
                            min="0"
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Stock Status
                          </label>
                          <select
                            name="inventory_status"
                            defaultValue={pkg.inventory_status}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="in_stock">In Stock</option>
                            <option value="available_on_order">On Order</option>
                            <option value="out_of_stock">Out of Stock</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Description / Appliances Scope
                          </label>
                          <input
                            type="text"
                            name="description"
                            defaultValue={pkg.description || ""}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1 font-medium">
                            Publication Status
                          </label>
                          <select
                            name="publication_status"
                            defaultValue={pkg.publication_status}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            name="is_featured"
                            defaultChecked={pkg.is_featured}
                            className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-800 focus:ring-amber-500"
                          />
                          <span>Feature on Public Homepage</span>
                        </label>

                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Package Changes
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
