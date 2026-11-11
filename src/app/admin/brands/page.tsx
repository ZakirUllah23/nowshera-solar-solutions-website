import React from "react";
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
    const tier_rating = String(formData.get("tier_rating") || "").trim() || "Tier 1";
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
    revalidatePath("/products");
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
    revalidatePath("/products");
  }

  async function deleteBrand(id: string) {
    "use server";
    await requireAdminOrOwner();
    const supabaseServer = await createClient();

    await supabaseServer.from("brands").delete().eq("id", id);
    revalidatePath("/admin/brands");
    revalidatePath("/admin");
    revalidatePath("/products");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-slate-900">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Award className="w-5 h-5" />
          </div>
          Solar Manufacturers &amp; Brands
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage Tier-1 solar panel, inverter, and lithium battery brands.
        </p>
      </div>

      {canEdit && (
        <form
          action={createBrand}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Add Manufacturer Brand
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Brand Name *
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Canadian Solar"
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
                placeholder="e.g. canadian-solar"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tier Rating
              </label>
              <input
                name="tier_rating"
                defaultValue="Tier 1"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description
              </label>
              <input
                name="description"
                placeholder="Manufacturer overview..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-lg transition shadow-xs cursor-pointer active:scale-95"
          >
            Add Brand
          </button>
        </form>
      )}

      {/* Brands Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-sm min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600 text-xs uppercase font-mono tracking-wider bg-slate-50">
              <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Brand</th>
              <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Slug</th>
              <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Tier</th>
              <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Description</th>
              <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Status</th>
              {canEdit && <th className="py-3.5 px-4 whitespace-nowrap text-right font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {brands?.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/80 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                  {b.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-xs text-blue-600 font-semibold whitespace-nowrap">
                  {b.slug}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {b.tier_rating || "Standard"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs truncate">
                  {b.description || "—"}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {b.is_active ? (
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
                        action={toggleBrandStatus.bind(
                          null,
                          b.id,
                          b.is_active
                        )}
                      >
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-md bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 shadow-2xs cursor-pointer transition"
                        >
                          {b.is_active ? "Disable" : "Enable"}
                        </button>
                      </form>
                      <form action={deleteBrand.bind(null, b.id)}>
                        <button
                          type="submit"
                          title="Delete Brand"
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
