"use client";

import React, { useActionState, useState } from "react";
import { submitPublicInquiry, type InquiryActionResult } from "@/app/contact/actions";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  RotateCcw,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";

export default function InquiryForm() {
  const [state, formAction, isPending] = useActionState(
    submitPublicInquiry,
    null
  );
  const [isReset, setIsReset] = useState(false);

  if (state?.success && !isReset) {
    return (
      <div className="bg-white border border-emerald-500/30 rounded-lg p-8 space-y-6 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono text-emerald-700 font-bold uppercase tracking-wider block">
            REQUEST LOGGED & ASSIGNED
          </span>
          <h3 className="text-xl font-bold text-slate-950 tracking-tight">
            Quotation Request Received Successfully
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Thank you for reaching out. Your project specifications have been submitted to our
            Nowshera engineering and commercial sales desk. One of our lead technicians will
            review your requirements and contact you within 2–4 business hours.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>Nowshera Solar Solutions — Desk Reference</span>
          </div>
          <p>Location: Main GT Road, Nowshera Cantt, Khyber Pakhtunkhwa</p>
          <p>Priority: Commercial / Residential Site Survey</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <a
            href="https://wa.me/923000000000?text=Assalam%20o%20Alaikum,%20I%20just%20submitted%20a%20solar%20site%20survey%20inquiry%20on%20your%20website.%20Please%20review%20it."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md text-xs transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Notify Us Instantly on WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setIsReset(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-semibold rounded-md border border-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Submit Another Request</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-xs font-mono text-blue-600 font-semibold uppercase tracking-wider block mb-1">
          Direct Engineering Inquiry
        </span>
        <h3 className="text-xl font-bold text-slate-950 tracking-tight">
          Request a Quotation &amp; Site Survey
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Submit your hardware bill of materials or turnkey system load details for a transparent
          wholesale quotation.
        </p>
      </div>

      {state?.error && (
        <div className="bg-rose-50 border border-rose-200 rounded-md p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-rose-900">Submission Notice</span>
            <span>{state.error}</span>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="customer_name"
                required
                placeholder="e.g. Engr. Ahmad Khan"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              WhatsApp / Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                required
                placeholder="e.g. 0300 1234567"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="ahmad@company.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              District / City *
            </label>
            <div className="relative">
              <select
                name="city"
                required
                defaultValue="Nowshera"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
              >
                <option value="Nowshera">Nowshera (Cantt, City, Risalpur)</option>
                <option value="Peshawar">Peshawar (Hayatabad, City, Ring Road)</option>
                <option value="Mardan">Mardan (City, Industrial Estate)</option>
                <option value="Charsadda">Charsadda / Tangi</option>
                <option value="Swabi">Swabi / Topi</option>
                <option value="Kohat">Kohat</option>
                <option value="Islamabad / Rawalpindi">Islamabad / Rawalpindi</option>
                <option value="Other KPK">Other KPK Region</option>
              </select>
              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Site Location / Complete Address
          </label>
          <input
            type="text"
            name="address"
            placeholder="e.g. Near Hakimabad, Main GT Road, Nowshera"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
          />
        </div>

        {/* Project Details */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Project Details &amp; System Requirements *
          </label>
          <div className="relative">
            <textarea
              name="message"
              required
              rows={4}
              placeholder="e.g. Looking for a 10kW three-phase hybrid solar system for my residence with PESCO net-metering. Please include 15kWh LiFePO4 battery storage and Tier-1 N-Type TOPCon panels."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
            />
            <FileText className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-sm active:scale-95"
        >
          {isPending ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Transmitting Request to Engineering Desk...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit Site Survey &amp; Quotation Request</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
