import React from "react";
import Image from "next/image";
import PublicShell from "@/components/public/PublicShell";
import InquiryForm from "@/components/public/InquiryForm";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Truck,
  Building2,
  Compass,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Contact Us | Nowshera Solar Solutions — Wholesale Showroom & Engineering Desk",
  description:
    "Contact Nowshera Solar Solutions on GT Road, Nowshera. Call our wholesale hotline, visit our showroom, or submit a site survey request for commercial or residential solar installations across KPK.",
};

export default function ContactPage() {
  return (
    <PublicShell>
      {/* 1. Hero Section (Industrial Authority Dark) */}
      <section className="relative bg-slate-950 text-white border-b border-slate-800 overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80"
            alt="Nowshera Solar Showroom and Engineering Desk"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              <span>WHOLESALE SHOWROOM & ENGINEERING DESK — NOWSHERA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Get in Touch with Our Solar Experts
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Visit our warehouse and showroom on GT Road, Nowshera, call our wholesale hotline, or
              submit a site survey request for a custom commercial or residential solar quotation.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Section 1 — Two-Column Contact Layout (Daylight Light) */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Column 1: Showroom, Warehouse & Contact Channels */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-amber-600 font-semibold uppercase tracking-wider block mb-1">
                  01 // DIRECT CHANNELS & VISITATION
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Headquarters & Wholesale Distribution
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Our regional distribution center houses live inverter testing benches, tier-1 panel
                  pallets, and our certified electrical EPC consultation team.
                </p>
              </div>

              {/* Physical Channels Grid */}
              <div className="space-y-4">
                {/* Address */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-900">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      HEADQUARTERS & SHOWROOM
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Main GT Road, Near Nowshera Cantt
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Nowshera, Khyber Pakhtunkhwa, Pakistan (Direct GT Road corridor access with commercial truck loading bay).
                    </p>
                  </div>
                </div>

                {/* Hotlines */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-900">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      WHOLESALE & RETAIL HOTLINES
                    </span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-mono font-bold text-slate-900">
                      <a
                        href="tel:+923000000000"
                        className="hover:text-amber-600 transition"
                      >
                        +92 (300) 0000000
                      </a>
                      <span className="text-slate-300">|</span>
                      <a
                        href="tel:+92923000000"
                        className="hover:text-amber-600 transition"
                      >
                        +92 (923) 000000
                      </a>
                    </div>
                    <p className="text-xs text-slate-500">
                      Direct engineering desk and container order desk.
                    </p>
                  </div>
                </div>

                {/* Email Channels */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-900">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      OFFICIAL EMAIL DESKS
                    </span>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate-800 font-medium">
                      <a
                        href="mailto:sales@nowshearsolar.com"
                        className="hover:text-amber-600 transition"
                      >
                        sales@nowshearsolar.com
                      </a>
                      <span className="text-slate-300">|</span>
                      <a
                        href="mailto:info@nowshearsolar.com"
                        className="hover:text-amber-600 transition"
                      >
                        info@nowshearsolar.com
                      </a>
                    </div>
                    <p className="text-xs text-slate-500">
                      Commercial tenders, wholesale inquiries, and EPC documentation.
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-900">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      OPERATING HOURS (PKT UTC+5)
                    </span>
                    <div className="text-xs font-mono text-slate-800 space-y-0.5">
                      <p>
                        <strong className="text-slate-900">Monday – Saturday:</strong>{" "}
                        8:30 AM – 6:30 PM PKT
                      </p>
                      <p className="text-slate-500">
                        Friday Prayer Break: 1:00 PM – 2:30 PM (Sunday Closed for Warehouse Restocking)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action Card */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-6 rounded-md space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    DIRECT WHATSAPP DISPATCH DESK
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Instant Technical WhatsApp Support
                  </h3>
                  <p className="text-xs text-emerald-200/80 leading-relaxed">
                    Need instant warehouse inventory status, daily per-watt rate confirmations, or emergency
                    inverter assistance? Chat directly with our Nowshera engineering lead on WhatsApp.
                  </p>
                </div>

                <a
                  href="https://wa.me/923000000000?text=Assalam%20o%20Alaikum,%20I%20would%20like%20to%20request%20a%20solar%20site%20survey%20and%20quotation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md text-xs transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Launch WhatsApp Chat with Engineering Desk</span>
                </a>
              </div>
            </div>

            {/* Column 2: Interactive Quotation & Site Survey Form */}
            <div>
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section 2 — Regional Coverage & Showroom Direction Map Note */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <span className="text-xs font-mono text-amber-600 font-semibold uppercase tracking-wider block mb-1">
              02 // REGIONAL SERVICE TERRITORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Active EPC Deployment & Rapid Dispatch Corridors
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Our logistical fleet and certified installation crews provide same-day or 24-hour on-site
              surveys, hardware deliveries, and PESCO net-metering execution across northern Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Territory 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-3 hover:border-amber-500/40 transition">
              <div className="w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-900">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                Nowshera, Risalpur & Cantt
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Central headquarters zone. Same-day site visits, immediate warehouse pickup, and
                on-demand electronics testing at our Main GT Road workshop.
              </p>
              <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                Coverage: Hakimabad, Nowshera Cantt, Risalpur Airbase Road, Pabbi, Taru Jabba.
              </div>
            </div>

            {/* Territory 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-3 hover:border-amber-500/40 transition">
              <div className="w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-900">
                <Compass className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                Peshawar & Industrial Zone
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                24-hour delivery corridor. Residential turnkey installations in Hayatabad and heavy-duty
                industrial EPC across Hayatabad Industrial Estate & Kohat Road.
              </p>
              <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                Coverage: Hayatabad (Phases 1-7), Ring Road, University Town, Warsak Road, GT Road.
              </div>
            </div>

            {/* Territory 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-3 hover:border-amber-500/40 transition">
              <div className="w-10 h-10 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-900">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                Mardan, Charsadda & Swabi
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated agricultural tube well solarization, hospital power systems, and residential
                hybrid deployments with certified PESCO grid export compliance.
              </p>
              <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                Coverage: Mardan City, Industrial Estate, Charsadda Bazaar, Tangi, Swabi, Topi Gadoon.
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
