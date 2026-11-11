import React from "react";
import { requireStaffAuth, requireAdminOrOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { FolderTree, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";

export default async function AdminCategoriesPage() {
  const profile = await requireStaffAuth();
  const canEdit = profile.role === "owner" || profile.role === "admin";
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  async function createCategory(formData: FormData) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const description = String(formData.get("description") || "").trim() || null;
    const display_order = Number(formData.get("display_order") || 0);

    if (!name || !slug) return;

    await supabaseServer.from("categories").insert({
      name,
      slug,
      description,
      display_order,
      is_active: true,
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin");
    revalidatePath("/products");
  }

  async function toggleCategoryStatus(id: string, currentStatus: boolean) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    await supabaseServer
      .from("categories")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    revalidatePath("/admin/categories");
    revalidatePath("/products");
  }

  async function deleteCategory(id: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    await supabaseServer.from("categories").delete().eq("id", id);
    revalidatePath("/admin/categories");
    revalidatePath("/admin");
    revalidatePath("/products");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <FolderTree className="w-5 h-5" />
          </div>
          Product Categories
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Organize solar panels, inverters, lithium batteries, mounting frames, and accessories.
        </p>
      </div>

      {/* Add Category Form (Owner/Admin only) */}
      {canEdit && (
        <form
          action={createCategory}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Add New Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category Name *
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Solar Cables"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                URL Slug *
              </label>
              <input
                name="slug"
                required
                placeholder="e.g. solar-cables"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Display Order
              </label>
              <input
                name="display_order"
                type="number"
                defaultValue={10}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description
              </label>
              <input
                name="description"
                placeholder="Short category summary..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-lg transition shadow-xs cursor-pointer active:scale-95"
          >
            Create Category
          </button>
        </form>
      )}

      {/* Categories Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-sm min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 text-xs uppercase font-mono tracking-wider bg-slate-50">
              <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Order</th>
              <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Name</th>
              <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Slug</th>
              <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Description</th>
              <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Status</th>
              {canEdit && <th className="py-3.5 px-4 whitespace-nowrap text-right font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories?.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                  #{cat.display_order}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                  {cat.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-xs text-blue-600 font-semibold whitespace-nowrap">
                  {cat.slug}
                </td>
                <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs truncate">
                  {cat.description || "—"}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {cat.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                      <XCircle className="w-3.5 h-3.5" /> Hidden
                    </span>
                  )}
                </td>
                {canEdit && (
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <form
                        action={toggleCategoryStatus.bind(
                          null,
                          cat.id,
                          cat.is_active
                        )}
                      >
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-md bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 shadow-2xs cursor-pointer transition"
                        >
                          {cat.is_active ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={deleteCategory.bind(null, cat.id)}>
                        <button
                          type="submit"
                          title="Delete Category"
                          className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-2xs cursor-pointer transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
