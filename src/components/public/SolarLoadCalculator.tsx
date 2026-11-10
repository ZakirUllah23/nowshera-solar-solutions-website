"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  Plus,
  Minus,
  Zap,
  Sun,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";

interface ApplianceConfig {
  id: string;
  name: string;
  category: string;
  watts: number;
  defaultQty: number;
  iconName: string;
  hint: string;
}

const APPLIANCES: ApplianceConfig[] = [
  {
    id: "led",
    name: "LED Lights / Bulbs",
    category: "Lighting",
    watts: 15,
    defaultQty: 8,
    iconName: "lightbulb",
    hint: "15W per energy saver/LED bulb",
  },
  {
    id: "fan",
    name: "Ceiling Fans",
    category: "Cooling",
    watts: 80,
    defaultQty: 4,
    iconName: "fan",
    hint: "80W per standard ceiling fan",
  },
  {
    id: "fridge",
    name: "Refrigerator / Fridge",
    category: "Kitchen",
    watts: 350,
    defaultQty: 1,
    iconName: "refrigerator",
    hint: "300W – 400W running wattage",
  },
  {
    id: "deepfreezer",
    name: "Deep Freezer",
    category: "Kitchen",
    watts: 350,
    defaultQty: 0,
    iconName: "freezer",
    hint: "350W running wattage",
  },
  {
    id: "waterpump",
    name: "Water Pump / Motor (1 HP)",
    category: "Heavy",
    watts: 750,
    defaultQty: 1,
    iconName: "pump",
    hint: "750W (1 Horsepower motor)",
  },
  {
    id: "ac15",
    name: "Inverter AC (1.5-Ton)",
    category: "Heavy",
    watts: 1400,
    defaultQty: 1,
    iconName: "ac",
    hint: "1,200W – 1,500W running load",
  },
  {
    id: "washing",
    name: "Washing Machine / Iron",
    category: "Household",
    watts: 500,
    defaultQty: 0,
    iconName: "washing",
    hint: "400W – 600W intermittent load",
  },
];

export default function SolarLoadCalculator() {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    APPLIANCES.forEach((app) => {
      initial[app.id] = app.defaultQty;
    });
    return initial;
  });

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  // Calculate total wattage
  const totalWatts = useMemo(() => {
    return APPLIANCES.reduce((sum, app) => {
      const qty = quantities[app.id] || 0;
      return sum + qty * app.watts;
    }, 0);
  }, [quantities]);

  const totalKw = (totalWatts / 1000).toFixed(2);

  // Determine system recommendation with buffer
  const recommendation = useMemo(() => {
    if (totalWatts <= 2600) {
      return {
        capacity: "3.2 kW",
        name: "3.2kW Residential Hybrid Starter System",
        inverter: "3.2kW Pure Sine Wave Hybrid Inverter",
        panels: "6× 585W N-Type Bifacial Panels (3,510W PV)",
        battery: "2.5kWh – 5.12kWh LiFePO4 Lithium Bank",
        generation: "380 – 440 Units / Month",
        badge: "STARTER RESIDENTIAL",
      };
    } else if (totalWatts <= 5200) {
      return {
        capacity: "6.0 kW",
        name: "6.0kW Complete Hybrid Residential System",
        inverter: "6kW Dual-MPPT IP65 Hybrid Inverter",
        panels: "10× 585W N-Type Bifacial Panels (5,850W PV)",
        battery: "5.12kWh 48V 100Ah LiFePO4 Wall Mount",
        generation: "720 – 850 Units / Month",
        badge: "MOST POPULAR FOR HOMES",
      };
    } else if (totalWatts <= 8500) {
      return {
        capacity: "10.0 kW",
        name: "10.0kW Three-Phase Net-Metering Executive System",
        inverter: "10kW Three-Phase IP65 Dual-MPPT Hybrid",
        panels: "16× 585W N-Type Bifacial Panels (9,360W PV)",
        battery: "10.24kWh High-Voltage LiFePO4 Lithium Bank",
        generation: "1,250 – 1,450 Units / Month",
        badge: "3-PHASE PESCO READY",
      };
    } else {
      return {
        capacity: "15.0 kW+",
        name: "15.0kW Heavy-Duty Commercial System",
        inverter: "15kW Three-Phase Industrial Solar Inverter",
        panels: "24× 585W N-Type Bifacial Panels (14,040W PV)",
        battery: "15kWh+ Lithium Storage Bank",
        generation: "1,900 – 2,200 Units / Month",
        badge: "COMMERCIAL & TUBE-WELL",
      };
    }
  }, [totalWatts]);

  // Construct direct WhatsApp message
  const waUrl = useMemo(() => {
    const activeList = APPLIANCES.filter((a) => (quantities[a.id] || 0) > 0);
    const breakdown = activeList
      .map((a) => `• ${quantities[a.id]}x ${a.name} (${(quantities[a.id] || 0) * a.watts}W)`)
      .join("\n");

    const message = `Hello Nowshera Solar Solutions, I used your Solar Load Calculator:

My Household Running Appliances:
${breakdown || "• Basic Home Load"}

Total Running Load: ${totalWatts} Watts (~${totalKw} kW)
Recommended Package: ${recommendation.name} (${recommendation.capacity})
Estimated Monthly Generation: ${recommendation.generation}

Please send me a customized turnkey quotation with today's dispatch rates and installation schedule.`;

    return `https://wa.me/923000000000?text=${encodeURIComponent(message)}`;
  }, [quantities, totalWatts, totalKw, recommendation]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Widget Header */}
      <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              Interactive Sizing Tool
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Custom Solar Load Calculator
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Adjust your appliances below to instantly calculate your total running load and match the engineered solar package for your home.
            </p>
          </div>

          <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 shrink-0">
            <span className="text-[11px] uppercase font-mono font-bold text-slate-500">
              Total Running Load
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-blue-600">
              {totalWatts.toLocaleString()} <span className="text-sm font-bold text-slate-600">W</span>
            </span>
            <span className="text-xs font-mono text-slate-500">
              (~{totalKw} kW Required)
            </span>
          </div>
        </div>
      </div>

      {/* Calculator Body: 2-Column Responsive Layout */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Appliance Quantity Selectors (Mobile-First) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 uppercase pb-1 border-b border-slate-100">
            <span>Electrical Appliance</span>
            <span>Quantity</span>
          </div>

          <div className="divide-y divide-slate-100">
            {APPLIANCES.map((app) => {
              const qty = quantities[app.id] || 0;
              const runningWatts = qty * app.watts;

              return (
                <div
                  key={app.id}
                  className="py-3.5 flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {app.name}
                      </span>
                      {qty > 0 && (
                        <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                          {runningWatts}W
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{app.hint}</p>
                  </div>

                  {/* Quantity Stepper (Generous touch targets for mobile) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQty(app.id, -1)}
                      disabled={qty === 0}
                      className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-700 font-bold flex items-center justify-center transition active:scale-95"
                      aria-label={`Decrease ${app.name}`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-8 text-center font-mono font-black text-slate-900 text-base">
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateQty(app.id, 1)}
                      className="w-9 h-9 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center justify-center transition active:scale-95 shadow-xs"
                      aria-label={`Increase ${app.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Recommendation Card */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="bg-gradient-to-br from-blue-50/60 via-white to-slate-50 rounded-xl border border-blue-200 p-6 space-y-5 shadow-xs">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                {recommendation.badge}
              </span>

              <h4 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                {recommendation.name}
              </h4>

              <div className="pt-2 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black text-blue-600">
                  {recommendation.capacity}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Ideal System Sizing
                </span>
              </div>
            </div>

            {/* Hardware Specification Breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/80 text-xs">
              <div className="flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Hybrid Inverter:</span>
                  <span className="text-slate-600">{recommendation.inverter}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Solar PV Array:</span>
                  <span className="text-slate-600">{recommendation.panels}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Battery Storage Bank:</span>
                  <span className="text-slate-600">{recommendation.battery}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Monthly Generation:</span>
                  <span className="text-slate-600 font-mono font-semibold">
                    {recommendation.generation}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-100/50 border border-blue-200/60 text-[11px] text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                Calculated with 25% safety surge margin for motor startup and battery backup charging.
              </span>
            </div>

            {/* Direct WhatsApp CTA Button */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Get Custom Quotation on WhatsApp</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
