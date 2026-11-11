import React from "react";
import { requireStaffAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
  History,
  Package,
  Layers,
  Filter,
  ShieldCheck,
  User,
  Bot,
} from "lucide-react";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminPriceHistoryPage(props: PageProps) {
  await requireStaffAuth();
  const searchParams = await props.searchParams;
  const targetTypeFilter =
    typeof searchParams?.target_type === "string"
      ? searchParams.target_type
      : "all";

  const supabase = await createClient();

  // Base query with joined profiles
  let query = supabase
    .from("price_history")
    .select(
      `
      id,
      target_type,
      product_id,
      package_id,
      item_name,
      item_sku,
      price_field,
      previous_price,
      new_price,
      reason,
      changed_by,
      created_at,
      profiles (
        full_name,
        role
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (targetTypeFilter === "product" || targetTypeFilter === "package") {
    query = query.eq("target_type", targetTypeFilter);
  }

  const { data: recordsData } = await query;
  const records = recordsData ?? [];

  // Summary counts
  const totalCount = records.length;
  const productCount = records.filter(
    (r) => r.target_type === "product"
  ).length;
  const packageCount = records.filter(
    (r) => r.target_type === "package"
  ).length;

  // Format Price Field to a readable badge
  function formatPriceField(field: string) {
    switch (field) {
      case "regular_price":
        return {
          label: "Regular Price",
          badge: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "manual_price_override":
        return {
          label: "Manual Override",
          badge: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "installation_cost":
        return {
          label: "Installation Cost",
          badge: "bg-sky-50 text-sky-700 border-sky-200",
        };
      case "additional_costs":
        return {
          label: "Additional Costs",
          badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      case "component_change":
        return {
          label: "BOM Component",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      default:
        return {
          label: field,
          badge: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <History className="w-5 h-5" />
            </div>
            Price History &amp; Rate Audit Log
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tamper-proof financial audit trail recording all product and solar
            package pricing updates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shrink-0 shadow-2xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>PostgreSQL Trigger Guaranteed</span>
        </div>
      </div>

      {/* Stats & Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 mr-1 flex items-center gap-1 font-semibold">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            Filter Target:
          </span>
          <Link
            href="/admin/price-history"
            className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
              targetTypeFilter === "all"
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-blue-600"
            }`}
          >
            All ({totalCount})
          </Link>
          <Link
            href="/admin/price-history?target_type=product"
            className={`px-3 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 ${
              targetTypeFilter === "product"
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-blue-600"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Products ({productCount})
          </Link>
          <Link
            href="/admin/price-history?target_type=package"
            className={`px-3 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1.5 ${
              targetTypeFilter === "package"
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-blue-600"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Packages ({packageCount})
          </Link>
        </div>

        <div className="text-xs text-slate-500">
          Showing latest{" "}
          <strong className="text-slate-900 font-bold">{records.length}</strong> records
          (Timezone: <strong className="text-blue-600 font-semibold font-mono">Asia/Karachi PKT</strong>)
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-700 min-w-[850px]">
          <thead className="bg-slate-50 text-xs uppercase font-mono tracking-wider text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Date &amp; Time (PKT)</th>
              <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Target &amp; Field</th>
              <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Item &amp; SKU</th>
              <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Previous Price</th>
              <th className="py-3.5 px-4 font-semibold whitespace-nowrap">New Price</th>
              <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Reason</th>
              <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Changed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-slate-400 text-sm"
                >
                  No price history records found.
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const fieldBadge = formatPriceField(record.price_field);
                const isPriceCleared =
                  record.new_price === null &&
                  record.previous_price !== null;

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    {/* Date & Time */}
                    <td className="py-3 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(record.created_at).toLocaleString("en-PK", {
                        timeZone: "Asia/Karachi",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </td>

                    {/* Target & Field Badge */}
                    <td className="py-3 px-4 whitespace-nowrap space-y-1">
                      <div className="flex items-center gap-1.5">
                        {record.target_type === "product" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Package className="w-3 h-3" />
                            Product
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            <Layers className="w-3 h-3" />
                            Package
                          </span>
                        )}
                      </div>
                      <div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${fieldBadge.badge}`}
                        >
                          {fieldBadge.label}
                        </span>
                      </div>
                    </td>

                    {/* Item Name & SKU */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 max-w-[200px] truncate">
                        {record.item_name}
                      </div>
                      {record.item_sku && (
                        <div className="text-xs text-slate-500 font-mono">
                          {record.item_sku}
                        </div>
                      )}
                    </td>

                    {/* Previous Price */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-xs">
                      {record.previous_price !== null ? (
                        formatPrice(record.previous_price)
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* New Price */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                      {isPriceCleared ? (
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-[11px]">
                          Cleared (Dynamic)
                        </span>
                      ) : record.new_price !== null ? (
                        <span className="font-bold text-blue-600">
                          {formatPrice(record.new_price)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-[260px]">
                      {record.reason || "Price change recorded"}
                    </td>

                    {/* Changed By */}
                    <td className="py-3 px-4 whitespace-nowrap text-xs">
                      {record.profiles ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <span className="font-semibold text-slate-900">
                              {record.profiles.full_name}
                            </span>
                            <span className="text-[10px] text-slate-500 block uppercase font-mono">
                              ({record.profiles.role})
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Bot className="w-3.5 h-3.5 text-blue-600" />
                          <span>System / Service Role</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
