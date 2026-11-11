import React from "react";
import Link from "next/link";
import { requireStaffAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Package,
  Layers,
  MessageSquare,
  History,
  Plus,
  ArrowRight,
  FolderTree,
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
    <div className="max-w-6xl mx-auto space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Welcome back, {profile.full_name}. Here is what is happening across
            Nowshera Solar Solutions today.
          </p>
        </div>

        {canManageCatalogue && (
          <div className="flex items-center gap-3">
            <Link
              href="/admin/categories"
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-sm font-semibold text-slate-700 shadow-2xs transition"
            >
              Manage Categories
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Manage Products
            </Link>
          </div>
        )}
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          href="/admin/products"
          className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-5 sm:p-6 transition shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 text-sm mb-3">
            <span className="font-medium">Total Products</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {productCount ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-2 font-mono">
            {outOfStockCount ?? 0} out of stock
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-5 sm:p-6 transition shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 text-sm mb-3">
            <span className="font-medium">Categories &amp; Brands</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {categoryCount ?? 0}{" "}
            <span className="text-lg font-normal text-slate-400">
              / {brandCount ?? 0}
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Active hardware classifications
          </p>
        </Link>

        <Link
          href="/admin/packages"
          className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-5 sm:p-6 transition shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 text-sm mb-3">
            <span className="font-medium">Solar Packages</span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {packageCount ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {activeOfferCount ?? 0} active promotional offers
          </p>
        </Link>

        <Link
          href="/admin/inquiries"
          className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-5 sm:p-6 transition shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-500 text-sm mb-3">
            <span className="font-medium">New Enquiries</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">
            {newInquiryCount ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Awaiting staff follow-up
          </p>
        </Link>
      </div>

      {/* Recent Price Audit History */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Automated Price History Logs
            </h2>
          </div>
          <Link
            href="/admin/price-history"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs uppercase font-mono tracking-wider">
                <th className="py-3 px-4 font-semibold">Item</th>
                <th className="py-3 px-4 font-semibold">Field</th>
                <th className="py-3 px-4 font-semibold">Old Price</th>
                <th className="py-3 px-4 font-semibold">New Price</th>
                <th className="py-3 px-4 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentPriceChanges?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {log.item_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                    {log.price_field}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                    {log.previous_price !== null
                      ? `PKR ${Number(log.previous_price).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-blue-600 font-mono font-bold text-xs">
                    {log.new_price !== null
                      ? `PKR ${Number(log.new_price).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {log.reason}
                  </td>
                </tr>
              ))}
              {(!recentPriceChanges || recentPriceChanges.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No price history changes recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
