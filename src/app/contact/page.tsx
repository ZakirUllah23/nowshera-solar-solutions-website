import React from "react";
import Image from "next/image";
import PublicShell from "@/components/public/PublicShell";
import InquiryForm from "@/components/public/InquiryForm";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Contact Us | Nowshera Solar Solutions — Wholesale Showroom & Engineering Desk",
  description:
    "Contact Nowshera Solar Solutions on GT Road, Nowshera. Call our wholesale hotline, visit our showroom, or submit a site survey request for commercial or residential solar installations across KPK.",
};

export default function ContactPage() {
  return (
    <PublicShell>
      {/* -------------------------------------------------------------------
          1. HERO SECTION (High-Res Solar Panel Array Image, Natural Lighting)
      ------------------------------------------------------------------- */}
      <section className="relative bg-slate-900 text-white border-b border-slate-800 overflow-hidden py-16 sm:py-20 md:py-24">
        {/* Exact same high-resolution solar system & panel array image as Packages/Offers */}
        <Image
          src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1920&q=80"
          alt="Tier-1 Solar System and Monocrystalline PV Arrays"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.92] contrast-[1.03]"
        />
        {/* Subtle Natural Contrast Overlay */}
        <div className="absolute inset-0 bg-slate-950/45 z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Get in Touch with Our Solar Experts
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl mx-auto">
              Visit our warehouse and showroom on GT Road, Nowshera, call our wholesale hotline, or
              submit a site survey request for a custom commercial or residential solar quotation.
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          2. SIDE-BY-SIDE CONTACT DETAILS & GOOGLE MAPS EMBED
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="space-y-1 border-b border-slate-200 pb-4">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider block">
              Direct Channels &amp; Location
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Headquarters &amp; Wholesale Distribution
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Our regional distribution center houses live inverter testing benches, tier-1 panel
              pallets, and our certified electrical EPC consultation team on GT Road.
            </p>
          </div>

          {/* Two-Column Layout: Left Details / Right Google Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            {/* Left Column: 4 Key Contact Channels with Corporate Blue Icons */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* Channel 1: Headquarters Address */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex items-start gap-4 shadow-sm hover:border-blue-300 transition">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600 shadow-2xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-widest block">
                    Headquarters &amp; Showroom
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Main GT Road, Near Nowshera Cantt
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Nowshera, Khyber Pakhtunkhwa, Pakistan (Direct GT Road corridor access with commercial truck loading bay).
                  </p>
                </div>
              </div>

              {/* Channel 2: Wholesale & Retail Hotlines */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex items-start gap-4 shadow-sm hover:border-blue-300 transition">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600 shadow-2xs">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-widest block">
                    Wholesale &amp; Retail Hotlines
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-mono font-bold text-slate-900">
                    <a
                      href="tel:+923000000000"
                      className="hover:text-blue-600 transition"
                    >
                      +92 (300) 0000000
                    </a>
                    <span className="text-slate-300">|</span>
                    <a
                      href="tel:+92923000000"
                      className="hover:text-blue-600 transition"
                    >
                      +92 (923) 000000
                    </a>
                  </div>
                  <p className="text-xs text-slate-500">
                    Direct engineering desk and container order desk available during working hours.
                  </p>
                </div>
              </div>

              {/* Channel 3: Official Email Desks */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex items-start gap-4 shadow-sm hover:border-blue-300 transition">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600 shadow-2xs">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-widest block">
                    Official Email Desks
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm font-mono text-slate-800 font-medium">
                    <a
                      href="mailto:sales@nowshearsolar.com"
                      className="hover:text-blue-600 transition"
                    >
                      sales@nowshearsolar.com
                    </a>
                    <span className="text-slate-300">|</span>
                    <a
                      href="mailto:info@nowshearsolar.com"
                      className="hover:text-blue-600 transition"
                    >
                      info@nowshearsolar.com
                    </a>
                  </div>
                  <p className="text-xs text-slate-500">
                    Commercial tenders, wholesale inquiries, and EPC documentation.
                  </p>
                </div>
              </div>

              {/* Channel 4: Working Hours */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex items-start gap-4 shadow-sm hover:border-blue-300 transition">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600 shadow-2xs">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-widest block">
                    Operating Hours (PKT UTC+5)
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

            {/* Right Column: Clean Responsive Google Maps Embed */}
            <div className="w-full h-full min-h-[380px] sm:min-h-[440px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white flex flex-col">
              <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-800 font-bold truncate">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">Nowshera Solar Solutions — GT Road Showroom</span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  Interactive Map
                </span>
              </div>
              <div className="flex-1 w-full relative min-h-[320px]">
                <iframe
                  title="Nowshera Solar Solutions GT Road Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105885.17865768565!2d71.91689264157074!3d34.01538355609351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df2c6c06df2ab5%3A0x6b306a4b1fa0cfae!2sNowshera%2C%20Khyber%20Pakhtunkhwa%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          3. PROFESSIONAL INQUIRY FORM & STREAMLINED WHATSAPP BANNER
      ------------------------------------------------------------------- */}
      <section className="bg-white py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="space-y-1 border-b border-slate-200 pb-4">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider block">
              Consultation &amp; Quotation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Request a Site Survey or Wholesale Quotation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Submit your hardware specifications or residential load requirements. Our lead engineers
              will review your project and provide a turnkey bill of materials.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left: Streamlined WhatsApp Action Card + Showroom Visitation note */}
            <div className="lg:col-span-5 space-y-6">
              {/* Streamlined Professional WhatsApp Dispatch Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-ping" />
                    <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider">
                      Engineering WhatsApp Dispatch
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Desk
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Instant Technical WhatsApp Consultation
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Need instant warehouse inventory confirmation, daily per-watt wholesale rates, or
                    emergency inverter diagnostic support? Connect directly with our engineering lead on
                    WhatsApp.
                  </p>
                </div>

                <a
                  href="https://wa.me/923000000000?text=Assalam%20o%20Alaikum,%20I%20would%20like%20to%20request%20a%20solar%20site%20survey%20and%20quotation."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-sm active:scale-95 text-center"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Connect with Engineering Desk on WhatsApp</span>
                </a>
              </div>

              {/* Showroom & Warehouse Direct Loading Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
                <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-widest block">
                  Showroom &amp; Logistics Assurance
                </span>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Commercial truck &amp; container loading bay on GT Road</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Live electronic diagnostic bench for inverter verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Immediate barcode warranty registration &amp; dispatch</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right: Database-Connected Inquiry Form */}
            <div className="lg:col-span-7">
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------
          4. STREAMLINED REGIONAL SERVICE ZONES GRID (Clean City Naming & Uniform Icons)
      ------------------------------------------------------------------- */}
      <section className="bg-slate-50 py-16 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="space-y-1 border-b border-slate-200 pb-4">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider block">
              Regional Dispatch Corridors
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Active Regional Coverage Across 6 Key Zones
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Our engineering crews and logistical fleet provide same-day or 24-hour on-site surveys,
              hardware deliveries, and PESCO net-metering execution across the 6 zones nearest to our Nowshera hub:
            </p>
          </div>

          {/* 6-Card Regional Grid: 3 cols desktop (lg:grid-cols-3), 2 tablet (md:grid-cols-2), 1 mobile (grid-cols-1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Zone 1: Nowshera */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Standardized Location Pin Marker */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight text-center">
                  Nowshera
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 text-justify leading-relaxed">
                  Central headquarters zone on GT Road. Immediate warehouse stock pickups, on-site electronics
                  diagnostics bench, and rapid same-day residential surveys and installation handling.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-100">
                <strong className="text-slate-700">Coverage:</strong> Hakimabad, Nowshera Cantt, GT Road Corridor, Pabbi, Taru Jabba.
              </div>
            </div>

            {/* Zone 2: Risalpur */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Standardized Location Pin Marker */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight text-center">
                  Risalpur
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 text-justify leading-relaxed">
                  Commercial and industrial manufacturing zone. High-capacity commercial solarization, industrial rooftop PV arrays, and heavy-duty three-phase hybrid installations.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-100">
                <strong className="text-slate-700">Coverage:</strong> Risalpur Airbase Road, Industrial Park, Rashakai Interchange area.
              </div>
            </div>

            {/* Zone 3: Mardan */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Standardized Location Pin Marker */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight text-center">
                  Mardan
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 text-justify leading-relaxed">
                  Comprehensive agricultural and residential corridor. Dedicated agricultural solar tube-wells, multi-acre VFD pumps, and net-metered residential turnkey installations.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-100">
                <strong className="text-slate-700">Coverage:</strong> Mardan City, Gujjar Garhi, Takht-i-Bahi, Rustam, Katlang.
              </div>
            </div>

            {/* Zone 4: Peshawar */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Standardized Location Pin Marker */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight text-center">
                  Peshawar
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 text-justify leading-relaxed">
                  Commercial and urban residential hub. High-efficiency commercial plazas, healthcare facilities, and premium residential hybrid solar systems with zero-export protection.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-100">
                <strong className="text-slate-700">Coverage:</strong> Hayatabad (Phases 1–7), University Town, Ring Road, Warsak Road.
              </div>
            </div>

            {/* Zone 5: Charsadda */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Standardized Location Pin Marker */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight text-center">
                  Charsadda
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 text-justify leading-relaxed">
                  Agricultural and residential solar corridor. Agricultural pumping systems, crop irrigation solarization, and PESCO-synchronized residential systems engineered for daily reliability.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-100">
                <strong className="text-slate-700">Coverage:</strong> Charsadda Bazaar, Tangi, Shabqadar, Utmanzai.
              </div>
            </div>

            {/* Zone 6: Swabi */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-3.5 shadow-sm hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                {/* Standardized Location Pin Marker */}
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight text-center">
                  Swabi
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 text-justify leading-relaxed">
                  Residential, institutional, and industrial corridor. Institutional solar installations, university housing arrays, and commercial off-grid battery backup across Swabi and Topi Gadoon.
                </p>
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-slate-100">
                <strong className="text-slate-700">Coverage:</strong> Swabi City, Topi Gadoon Industrial Estate, Zaida, Marghuz.
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
