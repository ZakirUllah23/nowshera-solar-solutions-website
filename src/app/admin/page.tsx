// import { requireStaffAuth } from "@/lib/auth";
// import { createClient } from "@/lib/supabase/server";
// import { redirect } from "next/navigation";
// import { revalidatePath } from "next/cache";
// import {
//   ShieldCheck,
//   LogOut,
//   User,
//   Package,
//   Tags,
//   Lock,
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";

// export default async function AdminPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ rls_test?: string; msg?: string }>;
// }) {
//   const profile = await requireStaffAuth();
//   const supabase = await createClient();
//   const params = await searchParams;

//   const [
//     { count: productCount },
//     { count: packageCount },
//     { count: inquiryCount },
//   ] = await Promise.all([
//     supabase.from("products").select("*", { count: "exact", head: true }),
//     supabase.from("packages").select("*", { count: "exact", head: true }),
//     supabase.from("inquiries").select("*", { count: "exact", head: true }),
//   ]);

//   async function handleSignOut() {
//     "use server";
//     const supabaseServer = await createClient();
//     await supabaseServer.auth.signOut();
//     redirect("/login");
//   }

//   // Live RLS Security Test: Attempts to update a category's updated_at timestamp
//   async function testCatalogueWriteAccess() {
//     "use server";
//     const supabaseServer = await createClient();
//     const { data: cat } = await supabaseServer
//       .from("categories")
//       .select("id, description")
//       .eq("slug", "solar-panels")
//       .single();

//     if (!cat) {
//       redirect("/admin?rls_test=fail&msg=Category+not+found");
//     }

//     const { data: updated, error } = await supabaseServer
//       .from("categories")
//       .update({ description: cat.description })
//       .eq("id", cat.id)
//       .select();

//     revalidatePath("/admin");

//     if (error || !updated || updated.length === 0) {
//       redirect(
//         "/admin?rls_test=blocked&msg=RLS+Blocked+Catalogue+Write+(Staff+Restriction+Working!)"
//       );
//     }

//     redirect(
//       "/admin?rls_test=allowed&msg=RLS+Allowed+Catalogue+Write+(Owner/Admin+Verified!)"
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 text-white p-8">
//       <div className="max-w-5xl mx-auto space-y-8">
//         {/* Top Profile & Role Bar */}
//         <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
//           <div className="flex items-center gap-4">
//             <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
//               <ShieldCheck className="w-6 h-6 text-amber-400" />
//             </div>
//             <div>
//               <div className="flex items-center gap-2.5">
//                 <h1 className="text-xl font-bold">{profile.full_name}</h1>
//                 <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
//                   {profile.role}
//                 </span>
//               </div>
//               <p className="text-sm text-slate-400">{profile.email}</p>
//             </div>
//           </div>

//           <form action={handleSignOut}>
//             <button
//               type="submit"
//               className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 transition cursor-pointer"
//             >
//               <LogOut className="w-4 h-4" />
//               Sign Out
//             </button>
//           </form>
//         </div>

//         {/* Metrics Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
//             <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
//               <Package className="w-4 h-4 text-amber-400" />
//               Total Products
//             </div>
//             <p className="text-3xl font-bold">{productCount ?? 0}</p>
//           </div>
//           <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
//             <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
//               <Tags className="w-4 h-4 text-emerald-400" />
//               Solar Packages
//             </div>
//             <p className="text-3xl font-bold">{packageCount ?? 0}</p>
//           </div>
//           <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
//             <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
//               <User className="w-4 h-4 text-sky-400" />
//               Customer Enquiries
//             </div>
//             <p className="text-3xl font-bold">{inquiryCount ?? 0}</p>
//           </div>
//         </div>

//         {/* Phase 4 Security & RLS Verification Panel */}
//         <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
//           <div className="flex items-center justify-between flex-wrap gap-4">
//             <div>
//               <h2 className="text-base font-semibold flex items-center gap-2">
//                 <Lock className="w-4 h-4 text-amber-400" />
//                 Phase 4 — Role & Database RLS Verification
//               </h2>
//               <p className="text-sm text-slate-400 mt-1">
//                 Click the button to test if your current role ({profile.role})
//                 is permitted by PostgreSQL RLS to modify catalogue records.
//               </p>
//             </div>

//             <form action={testCatalogueWriteAccess}>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg transition cursor-pointer"
//               >
//                 Test Catalogue Write Access
//               </button>
//             </form>
//           </div>

//           {params.rls_test === "allowed" && (
//             <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
//               <CheckCircle2 className="w-5 h-5 shrink-0" />
//               <span>{params.msg}</span>
//             </div>
//           )}

//           {params.rls_test === "blocked" && (
//             <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
//               <XCircle className="w-5 h-5 shrink-0" />
//               <span>{params.msg}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import Link from "next/link";
import { requireStaffAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Package,
  Layers,
  Percent,
  MessageSquare,
  AlertTriangle,
  History,
  Plus,
  ArrowRight,
  FolderTree,
  Award,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const profile = await requireStaffAuth();
  const supabase = await createClient();
  const canManageCatalogue =
    profile.role === "owner" || profile.role === "admin";

  const [
    { count: productCount },
    { count: outOfStockCount },
    { count: categoryCount },
    { count: brandCount },
    { count: packageCount },
    { count: activeOfferCount },
    { count: newInquiryCount },
    { data: recentPriceChanges },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("inventory_status", "out_of_stock"),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("brands").select("*", { count: "exact", head: true }),
    supabase.from("packages").select("*", { count: "exact", head: true }),
    supabase
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("is_enabled", true),
    supabase
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("price_history")
      .select("id, item_name, price_field, previous_price, new_price, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, {profile.full_name}. Here is what is happening across
            Nowshera Solar Solutions today.
          </p>
        </div>

        {canManageCatalogue && (
          <div className="flex items-center gap-3">
            <Link
              href="/admin/categories"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-200 transition"
            >
              Manage Categories
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition"
            >
              <Plus className="w-4 h-4" />
              Manage Products
            </Link>
          </div>
        )}
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/products"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition"
        >
          <div className="flex items-center justify-between text-slate-400 text-sm mb-3">
            <span>Total Products</span>
            <Package className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-bold">{productCount ?? 0}</p>
          <p className="text-xs text-slate-400 mt-2">
            {outOfStockCount ?? 0} out of stock
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition"
        >
          <div className="flex items-center justify-between text-slate-400 text-sm mb-3">
            <span>Categories & Brands</span>
            <FolderTree className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold">
            {categoryCount ?? 0}{" "}
            <span className="text-lg font-normal text-slate-500">
              / {brandCount ?? 0}
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Active hardware classifications
          </p>
        </Link>

        <Link
          href="/admin/packages"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition"
        >
          <div className="flex items-center justify-between text-slate-400 text-sm mb-3">
            <span>Solar Packages</span>
            <Layers className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-3xl font-bold">{packageCount ?? 0}</p>
          <p className="text-xs text-slate-400 mt-2">
            {activeOfferCount ?? 0} active promotional offers
          </p>
        </Link>

        <Link
          href="/admin/inquiries"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition"
        >
          <div className="flex items-center justify-between text-slate-400 text-sm mb-3">
            <span>New Enquiries</span>
            <MessageSquare className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold">{newInquiryCount ?? 0}</p>
          <p className="text-xs text-slate-400 mt-2">
            Awaiting staff follow-up
          </p>
        </Link>
      </div>

      {/* Recent Price Audit History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold">
              Recent Automated Price History Logs
            </h2>
          </div>
          <Link
            href="/admin/price-history"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Field</th>
                <th className="py-3 px-4">Old Price</th>
                <th className="py-3 px-4">New Price</th>
                <th className="py-3 px-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentPriceChanges?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium text-white">
                    {log.item_name}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                    {log.price_field}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.previous_price !== null
                      ? `PKR ${Number(log.previous_price).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">
                    {log.new_price !== null
                      ? `PKR ${Number(log.new_price).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-xs">
                    {log.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}