import { requireStaffAuth, requireAdminOrOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { StockStatus, PublicationStatus } from "@/types/database.types";
import {
  Package,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
} from "lucide-react";

export default async function AdminProductsPage() {
  const profile = await requireStaffAuth();
  const canEdit = profile.role === "owner" || profile.role === "admin";
  const supabase = await createClient();

  const [{ data: products }, { data: categories }, { data: brands }] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "*, categories(name), brands(name), product_images(id, image_url, is_primary)"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("display_order"),
      supabase
        .from("brands")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
    ]);

  // 1. Create Product + Optional Image Upload to Supabase Storage
  async function createProduct(formData: FormData) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const name = String(formData.get("name") || "").trim();
    const sku = String(formData.get("sku") || "").trim().toUpperCase();
    const slug = String(formData.get("slug") || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const category_id = String(formData.get("category_id") || "");
    const brand_id = String(formData.get("brand_id") || "") || null;
    const regular_price = Number(formData.get("regular_price") || 0);
    const inventory_status = String(
      formData.get("inventory_status") || "in_stock"
    ) as StockStatus;
    const publication_status = String(
      formData.get("publication_status") || "published"
    ) as PublicationStatus;
    const short_description =
      String(formData.get("short_description") || "").trim() || null;

    if (!name || !sku || !slug || !category_id) return;

    const { data: newProd, error } = await supabaseServer
      .from("products")
      .insert({
        name,
        sku,
        slug,
        category_id,
        brand_id,
        regular_price,
        inventory_status,
        publication_status,
        short_description,
        is_featured: formData.get("is_featured") === "on",
      })
      .select("id")
      .single();

    if (error || !newProd) return;

    // Handle optional image upload to 'product-images' bucket
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop()?.toLowerCase() || "webp";
      const filePath = `${newProd.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadErr } = await supabaseServer.storage
        .from("product-images")
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (!uploadErr) {
        const { data: pubUrl } = supabaseServer.storage
          .from("product-images")
          .getPublicUrl(filePath);

        await supabaseServer.from("product_images").insert({
          product_id: newProd.id,
          image_url: pubUrl.publicUrl,
          alt_text: name,
          is_primary: true,
          display_order: 0,
        });
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin");
  }

  // 2. Quick Update Price, Stock Status & Publication Status
  async function updateProductQuick(formData: FormData) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const id = String(formData.get("id") || "");
    const regular_price = Number(formData.get("regular_price") || 0);
    const inventory_status = String(
      formData.get("inventory_status")
    ) as StockStatus;
    const publication_status = String(
      formData.get("publication_status")
    ) as PublicationStatus;

    await supabaseServer
      .from("products")
      .update({
        regular_price,
        inventory_status,
        publication_status,
      })
      .eq("id", id);

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/admin/price-history");
  }

  // 3. Upload Image for Existing Product
  async function uploadProductImage(formData: FormData) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const productId = String(formData.get("product_id") || "");
    const productName = String(formData.get("product_name") || "Solar Product");
    const imageFile = formData.get("image") as File | null;

    if (!productId || !imageFile || imageFile.size === 0) return;

    const ext = imageFile.name.split(".").pop()?.toLowerCase() || "webp";
    const filePath = `${productId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabaseServer.storage
      .from("product-images")
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (!uploadErr) {
      const { data: pubUrl } = supabaseServer.storage
        .from("product-images")
        .getPublicUrl(filePath);

      // Clear previous primary flag so unique index idx_product_images_unique_primary is satisfied
      await supabaseServer
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId);

      await supabaseServer.from("product_images").insert({
        product_id: productId,
        image_url: pubUrl.publicUrl,
        alt_text: productName,
        is_primary: true,
        display_order: 0,
      });
    }

    revalidatePath("/admin/products");
  }

  // 4. Delete Product
  async function deleteProduct(id: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();
    await supabaseServer.from("products").delete().eq("id", id);
    revalidatePath("/admin/products");
    revalidatePath("/admin");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Package className="w-6 h-6 text-amber-400" />
          Products, Stock & Price Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Add products, upload images to Supabase Storage, adjust stock levels, and update PKR prices (automatically logged to Price History).
        </p>
      </div>

      {/* Add Product Form */}
      {canEdit && (
        <form
          action={createProduct}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Create New Product
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Product Name *
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Jinko Tiger Neo 585W N-Type"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                SKU (Unique Code) *
              </label>
              <input
                name="sku"
                required
                placeholder="e.g. PNL-JINKO-585W"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                URL Slug *
              </label>
              <input
                name="slug"
                required
                placeholder="e.g. jinko-tiger-neo-585w"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Category *
              </label>
              <select
                name="category_id"
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              >
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Brand</label>
              <select
                name="brand_id"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              >
                <option value="">— Select Brand —</option>
                {brands?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Regular Price (PKR) *
              </label>
              <input
                name="regular_price"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="30500"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Stock Status
              </label>
              <select
                name="inventory_status"
                defaultValue="in_stock"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="available_on_order">Available on Order</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Publication Status
              </label>
              <select
                name="publication_status"
                defaultValue="published"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              >
                <option value="published">Published (Public)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Primary Product Image (JPEG/PNG/WebP, max 5MB)
              </label>
              <input
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                name="is_featured"
                className="rounded border-slate-700"
              />
              Feature this product on Homepage
            </label>

            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg transition cursor-pointer"
            >
              Add Product to Catalogue
            </button>
          </div>
        </form>
      )}

      {/* Product List with Inline Price, Stock & Image Controls */}
      <div className="space-y-4">
        {products?.map((prod: any) => {
          const primaryImage =
            prod.product_images?.find((img: any) => img.is_primary) ||
            prod.product_images?.[0];

          return (
            <div
              key={prod.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              {/* Product Info & Thumbnail */}
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-600" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                      {prod.sku}
                    </span>
                    <span className="text-xs text-slate-400">
                      {prod.categories?.name} • {prod.brands?.name || "Unbranded"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 truncate">
                    {prod.name}
                  </h3>

                  {/* Quick Image Upload Form */}
                  {canEdit && (
                    <form
                      action={uploadProductImage}
                      className="mt-2 flex items-center gap-2"
                    >
                      <input type="hidden" name="product_id" value={prod.id} />
                      <input
                        type="hidden"
                        name="product_name"
                        value={prod.name}
                      />
                      <input
                        type="file"
                        name="image"
                        required
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-slate-800 file:text-slate-200 file:text-xs"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 font-medium cursor-pointer"
                      >
                        Upload Photo
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Inline Price, Stock & Status Editor */}
              {canEdit ? (
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <form
                    action={updateProductQuick}
                    className="flex flex-wrap items-center gap-2.5"
                  >
                    <input type="hidden" name="id" value={prod.id} />

                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 mb-0.5">
                        Price (PKR)
                      </label>
                      <input
                        type="number"
                        name="regular_price"
                        step="0.01"
                        defaultValue={prod.regular_price}
                        className="w-32 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-emerald-400 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 mb-0.5">
                        Stock
                      </label>
                      <select
                        name="inventory_status"
                        defaultValue={prod.inventory_status}
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="available_on_order">On Order</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 mb-0.5">
                        Visibility
                      </label>
                      <select
                        name="publication_status"
                        defaultValue={prod.publication_status}
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </form>

                  <form
                    action={deleteProduct.bind(null, prod.id)}
                    className="mt-4"
                  >
                    <button
                      type="submit"
                      title="Delete Product"
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">
                    PKR {Number(prod.regular_price).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {prod.inventory_status.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}