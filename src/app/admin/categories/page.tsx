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
  }

  async function deleteCategory(id: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    await supabaseServer.from("categories").delete().eq("id", id);
    revalidatePath("/admin/categories");
    revalidatePath("/admin");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <FolderTree className="w-6 h-6 text-amber-400" />
          Product Categories
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Organize solar panels, inverters, lithium batteries, mounting frames, and accessories.
        </p>
      </div>

      {/* Add Category Form (Owner/Admin only) */}
      {canEdit && (
        <form
          action={createCategory}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Add New Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Category Name *
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Solar Cables"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                URL Slug *
              </label>
              <input
                name="slug"
                required
                placeholder="e.g. solar-cables"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Display Order
              </label>
              <input
                name="display_order"
                type="number"
                defaultValue={10}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Description
              </label>
              <input
                name="description"
                placeholder="Short category summary..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg transition cursor-pointer"
          >
            Create Category
          </button>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-950/50">
              <th className="py-3.5 px-4">Order</th>
              <th className="py-3.5 px-4">Name</th>
              <th className="py-3.5 px-4">Slug</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4">Status</th>
              {canEdit && <th className="py-3.5 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {categories?.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                  #{cat.display_order}
                </td>
                <td className="py-3.5 px-4 font-semibold text-white">
                  {cat.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-xs text-amber-400">
                  {cat.slug}
                </td>
                <td className="py-3.5 px-4 text-slate-300 text-xs max-w-xs truncate">
                  {cat.description || "—"}
                </td>
                <td className="py-3.5 px-4">
                  {cat.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                      <XCircle className="w-3 h-3" /> Hidden
                    </span>
                  )}
                </td>
                {canEdit && (
                  <td className="py-3.5 px-4 text-right">
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
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
                        >
                          {cat.is_active ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={deleteCategory.bind(null, cat.id)}>
                        <button
                          type="submit"
                          title="Delete Category (if no products attached)"
                          className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
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