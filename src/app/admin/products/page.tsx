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
  Tag,
  Layers,
} from "lucide-react";

interface ProductSpecs {
  variants?: string[];
  tag?: string | null;
  [key: string]: unknown;
}

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

  // 1. Create Product with Full Card Metadata & Image Upload
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

    // Card subtitle & body
    const short_description =
      String(formData.get("short_description") || "").trim() || null;
    const description =
      String(formData.get("description") || "").trim() || null;

    // Parse comma-separated variants and tag badge
    const variantsRaw = String(formData.get("variants") || "").trim();
    const variantsArray = variantsRaw
      ? variantsRaw
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
    const tag = String(formData.get("tag") || "").trim() || null;

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
        description,
        specifications: { variants: variantsArray, tag },
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
    revalidatePath("/products");
  }

  // 2. Full Quick Update: Title, Subtitle, Description, Variants, Tag, Price & Status
  async function updateProductQuick(formData: FormData) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const id = String(formData.get("id") || "");
    const name = String(formData.get("name") || "").trim();
    const short_description =
      String(formData.get("short_description") || "").trim() || null;
    const description =
      String(formData.get("description") || "").trim() || null;

    const variantsRaw = String(formData.get("variants") || "").trim();
    const variantsArray = variantsRaw
      ? variantsRaw
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
    const tag = String(formData.get("tag") || "").trim() || null;

    const regular_price = Number(formData.get("regular_price") || 0);
    const inventory_status = String(
      formData.get("inventory_status")
    ) as StockStatus;
    const publication_status = String(
      formData.get("publication_status")
    ) as PublicationStatus;

    if (!id) return;

    await supabaseServer
      .from("products")
      .update({
        ...(name ? { name } : {}),
        short_description,
        description,
        specifications: { variants: variantsArray, tag },
        regular_price,
        inventory_status,
        publication_status,
      })
      .eq("id", id);

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/admin/price-history");
    revalidatePath("/products");
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

      // Clear previous primary flag so unique index is satisfied
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
    revalidatePath("/products");
  }

  // 4. Delete Product
  async function deleteProduct(id: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();
    await supabaseServer.from("products").delete().eq("id", id);
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/products");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Package className="w-6 h-6 text-amber-400" />
          Products, Stock &amp; Public Catalogue Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Add and edit hardware cards, upload images to Supabase Storage, customize wattage/kW variant pills, adjust stock levels, and set PKR prices. All changes sync live to the public{" "}
          <code className="text-amber-400 font-mono">/products</code> page.
        </p>
      </div>

      {/* Add Product Form */}
      {canEdit && (
        <form
          action={createProduct}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              Create New Hardware Product
            </h2>
            <span className="text-xs font-mono text-slate-400">
              SUPABASE DB SYNC
            </span>
          </div>

          {/* Row 1: Core Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Product Title (Card Heading) *
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Canadian Solar TOPBiHiKu7"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                SKU (Unique Code) *
              </label>
              <input
                name="sku"
                required
                placeholder="e.g. PNL-CS-700W"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                URL Slug *
              </label>
              <input
                name="slug"
                required
                placeholder="e.g. canadian-solar-topbihiku7"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 2: Category, Brand, Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Category *
              </label>
              <select
                name="category_id"
                required
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
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
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
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
                Regular Selling Price (PKR) *
              </label>
              <input
                name="regular_price"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="e.g. 32000"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-emerald-400 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 3: Public Card Content & Spec Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Card Badge / Tag</span>
              </label>
              <input
                name="tag"
                placeholder="e.g. Tier-1 Top Yield or IP65 Hybrid"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Card Subtitle (Short Description)
              </label>
              <input
                name="short_description"
                placeholder="e.g. N-Type TOPCon Bifacial Series"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Wattage / Capacity Pills (Comma-separated)</span>
              </label>
              <input
                name="variants"
                placeholder="e.g. 330W, 555W, 580W, 620W, 700W"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 4: Card Context Description */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Card Description (Technical Details &amp; Engineering Context)
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="e.g. High-efficiency monocrystalline bifacial dual-glass module with SMBB half-cut technology and anti-PID resistance. 25-year official warranty."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Row 5: Stock Status, Visibility & Image */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Stock Status
              </label>
              <select
                name="inventory_status"
                defaultValue="in_stock"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
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
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="published">Published (Visible on /products)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Primary Hardware Image (JPEG/PNG/WebP)
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

      {/* Product List with Full Inline Card & Spec Editor */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-base font-bold text-white">
            Existing Products ({products?.length || 0})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            EDIT FIELDS BELOW TO INSTANTLY UPDATE /PRODUCTS
          </span>
        </div>

        {products?.map((prod) => {
          const primaryImage =
            prod.product_images?.find((img) => img.is_primary) ||
            prod.product_images?.[0];

          const specs = (prod.specifications as ProductSpecs) || {};
          const variantsStr = (specs.variants || []).join(", ");
          const tagStr = (specs.tag as string) || "";

          return (
            <div
              key={prod.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              {/* Product Header Row: Thumbnail, SKU & Upload */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-4">
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

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800 font-bold">
                        {prod.sku}
                      </span>
                      <span className="text-xs text-slate-400">
                        {prod.categories?.name} •{" "}
                        {prod.brands?.name || "Unbranded"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {prod.name}
                    </h3>
                  </div>
                </div>

                {/* Image Upload & Delete */}
                {canEdit && (
                  <div className="flex items-center gap-3">
                    <form
                      action={uploadProductImage}
                      className="flex items-center gap-2"
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

                    <form action={deleteProduct.bind(null, prod.id)}>
                      <button
                        type="submit"
                        title="Delete Product"
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Comprehensive Inline Product & Public Card Editor */}
              {canEdit ? (
                <form action={updateProductQuick} className="space-y-3">
                  <input type="hidden" name="id" value={prod.id} />

                  {/* Grid 1: Name, Subtitle, Tag */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Card Title (Name)
                      </label>
                      <input
                        name="name"
                        defaultValue={prod.name}
                        required
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Card Subtitle
                      </label>
                      <input
                        name="short_description"
                        defaultValue={prod.short_description || ""}
                        placeholder="e.g. N-Type TOPCon Bifacial Series"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Badge / Tag
                      </label>
                      <input
                        name="tag"
                        defaultValue={tagStr}
                        placeholder="e.g. Tier-1 or IP65 Hybrid"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Grid 2: Variants Pills, Price, Stock & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Variants Pills (Comma-separated)
                      </label>
                      <input
                        name="variants"
                        defaultValue={variantsStr}
                        placeholder="550W, 580W, 700W"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-sky-400 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Price (PKR)
                      </label>
                      <input
                        type="number"
                        name="regular_price"
                        step="0.01"
                        defaultValue={prod.regular_price}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Stock Status
                      </label>
                      <select
                        name="inventory_status"
                        defaultValue={prod.inventory_status}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="available_on_order">Available on Order</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Visibility Status
                      </label>
                      <select
                        name="publication_status"
                        defaultValue={prod.publication_status}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="published">Published (Public)</option>
                        <option value="draft">Draft (Hidden)</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Card Context Description + Save Button */}
                  <div className="flex flex-col sm:flex-row items-end gap-3 pt-1">
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Card Description (Context / Technical Features)
                      </label>
                      <input
                        name="description"
                        defaultValue={prod.description || ""}
                        placeholder="e.g. High-efficiency module with SMBB half-cut technology and anti-PID resistance."
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-slate-400">
                    {prod.short_description || prod.description}
                  </p>
                  <p className="text-base font-bold text-emerald-400 font-mono">
                    PKR {Number(prod.regular_price).toLocaleString()}
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
