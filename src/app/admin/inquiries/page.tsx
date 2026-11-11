import React from "react";
import { requireStaffAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import type { EnquiryStatus } from "@/types/database.types";
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Package,
  Layers,
  UserCheck,
  Clock,
  Send,
  Save,
  Filter,
  User,
} from "lucide-react";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminInquiriesPage(props: PageProps) {
  const currentProfile = await requireStaffAuth();
  const searchParams = await props.searchParams;
  const statusFilter =
    typeof searchParams?.status === "string" ? searchParams.status : "all";

  const supabase = await createClient();

  // Base query for inquiries with joined products, packages, and assigned staff profile
  let query = supabase
    .from("inquiries")
    .select(
      `
      *,
      products (
        id,
        name,
        sku
      ),
      packages (
        id,
        name,
        capacity_kw
      ),
      profiles:assigned_to (
        id,
        full_name,
        role
      )
    `
    )
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter as EnquiryStatus);
  }

  const { data: inquiriesData } = await query;
  const inquiries = inquiriesData ?? [];

  // Helper for WhatsApp clean phone & prefilled message
  function cleanWhatsAppNumber(phone: string): string {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "92" + clean.slice(1);
    }
    return clean;
  }

  // Helper for Status Badge styling
  function getStatusBadge(status: EnquiryStatus) {
    switch (status) {
      case "new":
        return {
          label: "New",
          badge: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "contacted":
        return {
          label: "Contacted",
          badge: "bg-sky-50 text-sky-700 border-sky-200",
        };
      case "in_progress":
        return {
          label: "In Progress",
          badge: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "quoted":
        return {
          label: "Quoted",
          badge: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "converted":
        return {
          label: "Converted",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          badge: "bg-rose-50 text-rose-700 border-rose-200",
        };
      default:
        return {
          label: status,
          badge: "bg-slate-100 text-slate-600 border-slate-200",
        };
    }
  }

  // 1. Update Enquiry Status
  async function updateStatus(formData: FormData) {
    "use server";
    await requireStaffAuth();
    const supabaseServer = await createClient();

    const id = String(formData.get("inquiry_id") || "");
    const status = String(formData.get("status") || "") as EnquiryStatus;

    if (!id || !status) return;

    await supabaseServer
      .from("inquiries")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
  }

  // 2. Claim Enquiry (assign to logged in staff member)
  async function claimInquiry(id: string) {
    "use server";
    const profile = await requireStaffAuth();
    const supabaseServer = await createClient();

    await supabaseServer
      .from("inquiries")
      .update({
        assigned_to: profile.id,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
  }

  // 3. Update Internal Notes
  async function updateNotes(formData: FormData) {
    "use server";
    await requireStaffAuth();
    const supabaseServer = await createClient();

    const id = String(formData.get("inquiry_id") || "");
    const internal_notes =
      String(formData.get("internal_notes") || "").trim() || null;

    if (!id) return;

    await supabaseServer
      .from("inquiries")
      .update({ internal_notes, updated_at: new Date().toISOString() })
      .eq("id", id);

    revalidatePath("/admin/inquiries");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-slate-900">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          Customer Enquiries &amp; WhatsApp Leads
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Review consultation requests, manage sales follow-ups, and reach out
          directly via WhatsApp.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl p-4 text-xs shadow-sm">
        <span className="text-slate-500 mr-2 flex items-center gap-1 font-semibold">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          Filter Status:
        </span>
        {[
          { label: "All Enquiries", value: "all" },
          { label: "New", value: "new" },
          { label: "Contacted", value: "contacted" },
          { label: "In Progress", value: "in_progress" },
          { label: "Quoted", value: "quoted" },
          { label: "Converted", value: "converted" },
          { label: "Cancelled", value: "cancelled" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={
              tab.value === "all"
                ? "/admin/inquiries"
                : `/admin/inquiries?status=${tab.value}`
            }
            className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
              statusFilter === tab.value
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-blue-600"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Inquiries List */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900">
          Active Leads ({inquiries.length})
        </h2>

        {inquiries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-sm">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="font-bold text-slate-700">No customer enquiries found.</p>
            <p className="text-xs text-slate-500 mt-1">
              Customer inquiries submitted via the quotation form or website will
              appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Table Overview */}
            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs text-slate-700 min-w-[950px]">
                <thead className="bg-slate-50 text-slate-600 uppercase font-mono tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold whitespace-nowrap">Customer</th>
                    <th className="py-3 px-4 font-semibold whitespace-nowrap">Phone &amp; WhatsApp</th>
                    <th className="py-3 px-4 font-semibold whitespace-nowrap">Location</th>
                    <th className="py-3 px-4 font-semibold whitespace-nowrap">Message Snippet</th>
                    <th className="py-3 px-4 font-semibold whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 font-semibold whitespace-nowrap">Assigned Agent</th>
                    <th className="py-3 px-4 font-semibold whitespace-nowrap">Received (PKT)</th>
                    <th className="py-3 px-4 font-semibold whitespace-nowrap text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((inq) => {
                    const statusBadge = getStatusBadge(inq.status);
                    const cleanPhone = cleanWhatsAppNumber(inq.phone);
                    const inquiredItem =
                      inq.products?.name ?? inq.packages?.name ?? null;

                    const whatsappMessage = encodeURIComponent(
                      `Hello ${inq.customer_name}, thank you for contacting Nowshera Solar Solutions regarding ${
                        inquiredItem ?? "our solar solutions"
                      }. We received your inquiry: "${inq.message}". How can we assist you today?`
                    );

                    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

                    return (
                      <tr key={`table-${inq.id}`} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {inq.customer_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                          {inq.phone}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {inq.city || inq.address || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-[220px] truncate">
                          {inq.message}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-semibold border ${statusBadge.badge}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {inq.profiles?.full_name ?? (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(inq.created_at).toLocaleString("en-PK", {
                            timeZone: "Asia/Karachi",
                            dateStyle: "short",
                            timeStyle: "short",
                          })}{" "}
                          PKT
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-md text-[11px] transition shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-6">
            {inquiries.map((inq) => {
              const statusBadge = getStatusBadge(inq.status);
              const cleanPhone = cleanWhatsAppNumber(inq.phone);
              const inquiredItem =
                inq.products?.name ?? inq.packages?.name ?? null;

              const whatsappMessage = encodeURIComponent(
                `Hello ${inq.customer_name}, thank you for contacting Nowshera Solar Solutions regarding ${
                  inquiredItem ?? "our solar solutions"
                }. We received your inquiry: "${inq.message}". How can we assist you today?`
              );

              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;
              const isAssignedToMe = inq.assigned_to === currentProfile.id;

              return (
                <div
                  key={inq.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900">
                          {inq.customer_name}
                        </h3>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusBadge.badge}`}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <strong className="text-slate-800 font-mono">{inq.phone}</strong>
                        </span>
                        {inq.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {inq.email}
                          </span>
                        )}
                        {(inq.city || inq.address) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {[inq.city, inq.address].filter(Boolean).join(", ")}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(inq.created_at).toLocaleString("en-PK", {
                            timeZone: "Asia/Karachi",
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}{" "}
                          PKT
                        </span>
                      </div>
                    </div>

                    {/* WhatsApp Action & Claim Button */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Direct WhatsApp Button */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply on WhatsApp</span>
                      </a>

                      {/* Claim Button */}
                      {!inq.assigned_to ? (
                        <form action={claimInquiry.bind(null, inq.id)}>
                          <button
                            type="submit"
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Claim Lead</span>
                          </button>
                        </form>
                      ) : (
                        <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5 font-medium">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {isAssignedToMe
                              ? "Assigned to You"
                              : `Assigned: ${inq.profiles?.full_name}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Message & Inquired Item */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-3">
                      {inquiredItem && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                          {inq.products ? (
                            <Package className="w-3.5 h-3.5" />
                          ) : (
                            <Layers className="w-3.5 h-3.5" />
                          )}
                          <span>Inquired Item: {inquiredItem}</span>
                        </div>
                      )}

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Customer Message:
                        </span>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {inq.message}
                        </p>
                      </div>
                    </div>

                    {/* Quick Status & Internal Notes Form */}
                    <div className="space-y-4">
                      {/* Status Update Form */}
                      <form
                        action={updateStatus}
                        className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2"
                      >
                        <input type="hidden" name="inquiry_id" value={inq.id} />
                        <label className="block text-xs font-bold text-slate-700">
                          Update Lead Status
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            name="status"
                            defaultValue={inq.status}
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="in_progress">In Progress</option>
                            <option value="quoted">Quoted</option>
                            <option value="converted">Converted</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-700 font-bold border border-slate-200 rounded-lg text-xs transition shadow-2xs cursor-pointer"
                          >
                            Update
                          </button>
                        </div>
                      </form>

                      {/* Internal Notes Form */}
                      <form
                        action={updateNotes}
                        className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2"
                      >
                        <input type="hidden" name="inquiry_id" value={inq.id} />
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-700">
                            Internal Staff Notes
                          </label>
                          <button
                            type="submit"
                            className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                        <textarea
                          name="internal_notes"
                          rows={2}
                          defaultValue={inq.internal_notes ?? ""}
                          placeholder="e.g. Quoted 5kW Growatt inverter with Longi panels on call..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                        ></textarea>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
