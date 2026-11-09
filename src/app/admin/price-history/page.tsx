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
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
      case "manual_price_override":
        return {
          label: "Manual Override",
          badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
        };
      case "installation_cost":
        return {
          label: "Installation Cost",
          badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        };
      case "additional_costs":
        return {
          label: "Additional Costs",
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        };
      case "component_change":
        return {
          label: "BOM Component",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      default:
        return {
          label: field,
          badge: "bg-slate-800 text-slate-300 border-slate-700",
        };
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-amber-400" />
            Price History & Rate Audit Log
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tamper-proof financial audit trail recording all product and solar
            package pricing updates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>PostgreSQL Trigger Guaranteed</span>
        </div>
      </div>

      {/* Stats & Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            Filter Target:
          </span>
          <Link
            href="/admin/price-history"
            className={`px-3 py-1.5 rounded-lg border font-medium transition ${
              targetTypeFilter === "all"
                ? "bg-amber-500 text-slate-950 border-amber-500 font-semibold"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850"
            }`}
          >
            All ({totalCount})
          </Link>
          <Link
            href="/admin/price-history?target_type=product"
            className={`px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
              targetTypeFilter === "product"
                ? "bg-amber-500 text-slate-950 border-amber-500 font-semibold"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Products ({productCount})
          </Link>
          <Link
            href="/admin/price-history?target_type=package"
            className={`px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
              targetTypeFilter === "package"
                ? "bg-amber-500 text-slate-950 border-amber-500 font-semibold"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Packages ({packageCount})
          </Link>
        </div>

        <div className="text-xs text-slate-400">
          Showing latest{" "}
          <strong className="text-white">{records.length}</strong> records
          (Timezone: <strong className="text-amber-400">Asia/Karachi PKT</strong>
          )
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Date & Time (PKT)</th>
                <th className="py-3.5 px-4 font-semibold">Target & Field</th>
                <th className="py-3.5 px-4 font-semibold">Item & SKU</th>
                <th className="py-3.5 px-4 font-semibold">Previous Price</th>
                <th className="py-3.5 px-4 font-semibold">New Price</th>
                <th className="py-3.5 px-4 font-semibold">Reason</th>
                <th className="py-3.5 px-4 font-semibold">Changed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-500 text-sm"
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
                      className="hover:bg-slate-850/50 transition"
                    >
                      {/* Date & Time */}
                      <td className="py-3 px-4 text-xs font-mono text-slate-300 whitespace-nowrap">
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              <Package className="w-3 h-3" />
                              Product
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Layers className="w-3 h-3" />
                              Package
                            </span>
                          )}
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${fieldBadge.badge}`}
                          >
                            {fieldBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Item Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-white max-w-[200px] truncate">
                          {record.item_name}
                        </div>
                        {record.item_sku && (
                          <div className="text-xs text-slate-400 font-mono">
                            {record.item_sku}
                          </div>
                        )}
                      </td>

                      {/* Previous Price */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-xs">
                        {record.previous_price !== null ? (
                          formatPrice(record.previous_price)
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* New Price */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        {isPriceCleared ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium text-[11px]">
                            Cleared (Dynamic)
                          </span>
                        ) : record.new_price !== null ? (
                          <span className="font-semibold text-white">
                            {formatPrice(record.new_price)}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-4 text-xs text-slate-400 max-w-[260px]">
                        {record.reason || "Price change recorded"}
                      </td>

                      {/* Changed By */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        {record.profiles ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <span className="font-medium text-slate-200">
                                {record.profiles.full_name}
                              </span>
                              <span className="text-[10px] text-slate-400 block uppercase">
                                ({record.profiles.role})
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Bot className="w-3.5 h-3.5 text-amber-400" />
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
    </div>
  );
}
