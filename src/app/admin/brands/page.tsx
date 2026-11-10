import { requireStaffAuth, requireAdminOrOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Award, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";

export default async function AdminBrandsPage() {
  const profile = await requireStaffAuth();
  const canEdit = profile.role === "owner" || profile.role === "admin";
  const supabase = await createClient();

  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true });

  async function createBrand(formData: FormData) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const tier_rating = String(formData.get("tier_rating") || "Tier 1").trim();
    const description = String(formData.get("description") || "").trim() || null;

    if (!name || !slug) return;

    await supabaseServer.from("brands").insert({
      name,
      slug,
      tier_rating,
      description,
      is_active: true,
    });

    revalidatePath("/admin/brands");
    revalidatePath("/admin");
  }

  async function toggleBrandStatus(id: string, currentStatus: boolean) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    await supabaseServer
      .from("brands")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    revalidatePath("/admin/brands");
  }

  async function deleteBrand(id: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    await supabaseServer.from("brands").delete().eq("id", id);
    revalidatePath("/admin/brands");
    revalidatePath("/admin");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Award className="w-6 h-6 text-amber-400" />
          Solar Manufacturers & Brands
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage Tier-1 solar panel, inverter, and lithium battery brands.
        </p>
      </div>

      {canEdit && (
        <form
          action={createBrand}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Add Manufacturer Brand
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Brand Name *
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Canadian Solar"
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
                placeholder="e.g. canadian-solar"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Tier Rating
              </label>
              <input
                name="tier_rating"
                defaultValue="Tier 1"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Description
              </label>
              <input
                name="description"
                placeholder="Manufacturer overview..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg transition cursor-pointer"
          >
            Add Brand
          </button>
        </form>
      )}

      {/* Brands Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
        <table className="w-full text-left border-collapse text-sm min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-mono tracking-wider bg-slate-950/70">
              <th className="py-3.5 px-4 whitespace-nowrap">Brand</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Slug</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Tier</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Description</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
              {canEdit && <th className="py-3.5 px-4 whitespace-nowrap text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {brands?.map((b) => (
              <tr key={b.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                  {b.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-xs text-amber-400 whitespace-nowrap">
                  {b.slug}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 text-xs rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {b.tier_rating || "Standard"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 text-xs max-w-xs truncate">
                  {b.description || "—"}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {b.is_active ? (
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
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <form
                        action={toggleBrandStatus.bind(null, b.id, b.is_active)}
                      >
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer transition"
                        >
                          {b.is_active ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={deleteBrand.bind(null, b.id)}>
                        <button
                          type="submit"
                          className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition"
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