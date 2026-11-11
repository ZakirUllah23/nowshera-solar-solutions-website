"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  Plus,
  Minus,
  Zap,
  Sun,
  Cpu,
  BatteryCharging,
  ArrowRight,
  Sparkles,
  Info,
  RotateCcw,
  Home,
  Building2,
  Tractor,
  Factory,
} from "lucide-react";

type CategoryKey = "residential" | "commercial" | "agricultural" | "industrial";

interface ApplianceConfig {
  id: string;
  name: string;
  category: CategoryKey;
  watts: number;
  hint: string;
}

const APPLIANCES_BY_CATEGORY: Record<CategoryKey, ApplianceConfig[]> = {
  residential: [
    {
      id: "res_led",
      name: "LED Lights / Bulbs",
      category: "residential",
      watts: 15,
      hint: "15W per energy-saver/LED bulb",
    },
    {
      id: "res_fan",
      name: "Ceiling Fans",
      category: "residential",
      watts: 80,
      hint: "80W per standard ceiling fan",
    },
    {
      id: "res_fridge",
      name: "Refrigerator / Fridge",
      category: "residential",
      watts: 350,
      hint: "300W – 400W running wattage",
    },
    {
      id: "res_freezer",
      name: "Deep Freezer",
      category: "residential",
      watts: 350,
      hint: "350W running wattage",
    },
    {
      id: "res_pump",
      name: "Water Pump (1 HP)",
      category: "residential",
      watts: 750,
      hint: "750W (1 Horsepower motor)",
    },
    {
      id: "res_ac10",
      name: "Inverter AC (1.0-Ton)",
      category: "residential",
      watts: 1000,
      hint: "900W – 1,100W running load",
    },
    {
      id: "res_ac15",
      name: "Inverter AC (1.5-Ton)",
      category: "residential",
      watts: 1400,
      hint: "1,200W – 1,500W running load",
    },
    {
      id: "res_washing",
      name: "Washing Machine / Iron",
      category: "residential",
      watts: 500,
      hint: "400W – 600W intermittent load",
    },
  ],
  commercial: [
    {
      id: "com_ac20",
      name: "Office Split AC (2.0-Ton)",
      category: "commercial",
      watts: 1800,
      hint: "1,800W continuous cooling load",
    },
    {
      id: "com_pc",
      name: "Desktop PC / Workstation",
      category: "commercial",
      watts: 150,
      hint: "150W including monitor",
    },
    {
      id: "com_light",
      name: "Commercial LED Ceiling Panels",
      category: "commercial",
      watts: 50,
      hint: "50W high-output office panel",
    },
    {
      id: "com_display_fridge",
      name: "Commercial Display Fridge",
      category: "commercial",
      watts: 600,
      hint: "600W continuous retail chiller",
    },
    {
      id: "com_server",
      name: "CCTV Security & Servers",
      category: "commercial",
      watts: 400,
      hint: "400W 24/7 security rack",
    },
    {
      id: "com_printer",
      name: "Heavy Photocopier / Printer",
      category: "commercial",
      watts: 600,
      hint: "600W running load",
    },
  ],
  agricultural: [
    {
      id: "agr_pump5hp",
      name: "Tubewell Motor (5 HP)",
      category: "agricultural",
      watts: 3750,
      hint: "3,750W continuous water lifting",
    },
    {
      id: "agr_pump10hp",
      name: "Tubewell Motor (10 HP)",
      category: "agricultural",
      watts: 7500,
      hint: "7,500W heavy irrigation pump",
    },
    {
      id: "agr_drip",
      name: "Drip Irrigation Booster Pump",
      category: "agricultural",
      watts: 1500,
      hint: "1,500W pressure booster",
    },
    {
      id: "agr_farmhouse",
      name: "Farmhouse General Electric Loads",
      category: "agricultural",
      watts: 1000,
      hint: "1,000W lighting & fans",
    },
  ],
  industrial: [
    {
      id: "ind_motor3p",
      name: "3-Phase Industrial Motor (5kW)",
      category: "industrial",
      watts: 5000,
      hint: "5,000W heavy workshop motor",
    },
    {
      id: "ind_compressor",
      name: "Industrial Air Compressor",
      category: "industrial",
      watts: 3000,
      hint: "3,000W pneumatic compressor",
    },
    {
      id: "ind_highbay",
      name: "High-Bay Facility Lighting",
      category: "industrial",
      watts: 1200,
      hint: "1,200W factory flood lighting",
    },
    {
      id: "ind_machinery",
      name: "Heavy Production Machinery",
      category: "industrial",
      watts: 7500,
      hint: "7,500W industrial processing unit",
    },
  ],
};

const CATEGORY_TABS: { key: CategoryKey; label: string; icon: typeof Home }[] = [
  { key: "residential", label: "Residential", icon: Home },
  { key: "commercial", label: "Commercial", icon: Building2 },
  { key: "agricultural", label: "Agricultural", icon: Tractor },
  { key: "industrial", label: "Industrial", icon: Factory },
];

export default function SolarLoadCalculator() {
  const [activeTab, setActiveTab] = useState<CategoryKey>("residential");

  // 1. ISOLATED TAB STATES:
  // Residential starts with typical home appliances.
  // Commercial, Agricultural, and Industrial start at zero when switched to for the first time.
  // When switching back to a previously modified tab, its exact quantities and calculation restore.
  const [quantitiesByTab, setQuantitiesByTab] = useState<
    Record<CategoryKey, Record<string, number>>
  >({
    residential: {
      res_led: 8,
      res_fan: 4,
      res_fridge: 1,
      res_pump: 1,
      res_ac15: 1,
    },
    commercial: {},
    agricultural: {},
    industrial: {},
  });

  // Current tab appliances and active quantity map
  const currentAppliances = useMemo(() => {
    return APPLIANCES_BY_CATEGORY[activeTab];
  }, [activeTab]);

  const currentTabQuantities = useMemo(() => {
    return quantitiesByTab[activeTab] || {};
  }, [quantitiesByTab, activeTab]);

  // Update quantity strictly within the active tab
  const updateQty = (id: string, delta: number) => {
    setQuantitiesByTab((prev) => {
      const currentTabMap = { ...(prev[activeTab] || {}) };
      const currentVal = currentTabMap[id] || 0;
      const newVal = Math.max(0, currentVal + delta);
      currentTabMap[id] = newVal;
      return {
        ...prev,
        [activeTab]: currentTabMap,
      };
    });
  };

  // Reset active tab to zero
  const resetActiveTab = () => {
    setQuantitiesByTab((prev) => ({
      ...prev,
      [activeTab]: {},
    }));
  };

  // Calculate total wattage strictly for the active tab
  const activeTotalWatts = useMemo(() => {
    return currentAppliances.reduce((sum, app) => {
      const qty = currentTabQuantities[app.id] || 0;
      return sum + qty * app.watts;
    }, 0);
  }, [currentAppliances, currentTabQuantities]);

  const activeTotalKw = (activeTotalWatts / 1000).toFixed(2);

  // Active tab item count
  const activeTabTotalItems = useMemo(() => {
    return Object.values(currentTabQuantities).reduce((sum, q) => sum + q, 0);
  }, [currentTabQuantities]);

  // Tab badge counts
  const tabItemCounts = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      residential: 0,
      commercial: 0,
      agricultural: 0,
      industrial: 0,
    };
    CATEGORY_TABS.forEach((tab) => {
      const tabMap = quantitiesByTab[tab.key] || {};
      counts[tab.key] = Object.values(tabMap).reduce((sum, q) => sum + q, 0);
    });
    return counts;
  }, [quantitiesByTab]);

  // Dynamic system recommendation (shifts up/down between 3kW, 5kW, 6kW, 10kW, 15kW, 20kW+)
  const recommendation = useMemo(() => {
    if (activeTotalWatts === 0) {
      return {
        capacity: "0 kW",
        name: "Add Appliances to Calculate System",
        inverter: "Select running appliances on the left",
        panels: "Solar PV sizing will appear here",
        battery: "Storage capacity will appear here",
        generation: "0 Units / Month",
        badge: "START SIZING",
        isZero: true,
      };
    } else if (activeTotalWatts <= 2800) {
      return {
        capacity: "3.2 kW",
        name: "3.2kW Residential Off-Grid System",
        inverter: "3.2kW Pure Sine Wave Hybrid Inverter",
        panels: "6× 585W N-Type Bifacial Panels (3,510W PV)",
        battery: "2.5kWh – 5.12kWh LiFePO4 Lithium Bank",
        generation: "380 – 440 Units / Month",
        badge: "RECOMMENDED: 3.2kW STARTER",
        isZero: false,
      };
    } else if (activeTotalWatts <= 4800) {
      return {
        capacity: "5.0 kW",
        name: "5kW Medium Home Hybrid System",
        inverter: "5kW Dual-MPPT IP65 Hybrid Inverter",
        panels: "8× 585W N-Type Bifacial Panels (4,680W PV)",
        battery: "5.12kWh 48V LiFePO4 Lithium Bank",
        generation: "600 – 700 Units / Month",
        badge: "RECOMMENDED: 5kW HYBRID",
        isZero: false,
      };
    } else if (activeTotalWatts <= 7200) {
      return {
        capacity: "6.0 kW",
        name: "6kW Complete Residential Solar System",
        inverter: "6kW Dual-MPPT IP65 Hybrid Inverter",
        panels: "10× 585W N-Type Bifacial Panels (5,850W PV)",
        battery: "5.12kWh 48V 100Ah LiFePO4 Wall Mount",
        generation: "720 – 850 Units / Month",
        badge: "RECOMMENDED: 6kW POPULAR",
        isZero: false,
      };
    } else if (activeTotalWatts <= 11500) {
      return {
        capacity: "10.0 kW",
        name: "10kW Commercial Hybrid System",
        inverter: "10kW Three-Phase IP65 Dual-MPPT Hybrid",
        panels: "16× 585W N-Type Bifacial Panels (9,360W PV)",
        battery: "10.24kWh High-Voltage LiFePO4 Lithium Bank",
        generation: "1,250 – 1,450 Units / Month",
        badge: "RECOMMENDED: 10kW THREE-PHASE",
        isZero: false,
      };
    } else if (activeTotalWatts <= 17000) {
      return {
        capacity: "15.0 kW",
        name: "15kW Industrial Hybrid System",
        inverter: "15kW Three-Phase Industrial Solar Inverter",
        panels: "24× 585W N-Type Bifacial Panels (14,040W PV)",
        battery: "15kWh+ Lithium Storage Bank",
        generation: "1,900 – 2,200 Units / Month",
        badge: "RECOMMENDED: 15kW HEAVY-DUTY",
        isZero: false,
      };
    } else {
      return {
        capacity: "20.0 kW+",
        name: "20kW+ Industrial High-Capacity Solution",
        inverter: "20kW – 50kW Industrial Inverter Bank",
        panels: "32+× 585W High-Output Bifacial Panels",
        battery: "High-Capacity Industrial Battery Bank",
        generation: "2,500 – 3,500+ Units / Month",
        badge: "RECOMMENDED: 20kW+ INDUSTRIAL",
        isZero: false,
      };
    }
  }, [activeTotalWatts]);

  // Construct WhatsApp pre-filled consultation link
  const waUrl = useMemo(() => {
    const activeList = currentAppliances.filter(
      (a) => (currentTabQuantities[a.id] || 0) > 0
    );
    const breakdown = activeList
      .map(
        (a) =>
          `• ${currentTabQuantities[a.id]}× ${a.name} (${
            (currentTabQuantities[a.id] || 0) * a.watts
          }W)`
      )
      .join("\n");

    const categoryTitle =
      activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

    const message = `Hello Nowshera Solar Solutions, I used your ${categoryTitle} Solar Load Calculator:

My Running ${categoryTitle} Appliances:
${breakdown || "• Basic Electrical Load"}

Total Running Load: ${activeTotalWatts} Watts (~${activeTotalKw} kW)
Suggested System Tier: ${recommendation.name} (${recommendation.capacity})
Expected Monthly Output: ${recommendation.generation}

Please share a custom turnkey quotation with today's hardware prices and survey schedule.`;

    return `https://wa.me/923000000000?text=${encodeURIComponent(message)}`;
  }, [
    currentAppliances,
    currentTabQuantities,
    activeTab,
    activeTotalWatts,
    activeTotalKw,
    recommendation,
  ]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Widget Header Banner */}
      <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              Sizing &amp; Load Calculator
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Custom Solar Load Calculator
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Choose your category tab below to calculate your running wattage with isolated state per category and match the optimal solar system tier.
            </p>
          </div>

          {/* Real-Time Running Load for the Active Tab */}
          <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 shrink-0">
            <span className="text-[11px] uppercase font-mono font-bold text-slate-500">
              {activeTab} Running Load
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-blue-600">
              {activeTotalWatts.toLocaleString()}{" "}
              <span className="text-sm font-bold text-slate-600">W</span>
            </span>
            <span className="text-xs font-mono font-semibold text-slate-700">
              (~{activeTotalKw} kW Required)
            </span>
          </div>
        </div>

        {/* Category Tabs: Residential, Commercial, Agricultural, Industrial */}
        <div className="flex items-center gap-2 overflow-x-auto pt-6 no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count = tabItemCounts[tab.key];

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:text-blue-600"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-slate-500"
                  }`}
                />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full font-mono text-[10px] font-black ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating / Side-by-Side Responsive Layout */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Category Appliances */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 uppercase pb-1 border-b border-slate-100">
            <span className="capitalize">{activeTab} Electrical Load</span>
            <div className="flex items-center gap-3">
              {activeTabTotalItems > 0 && (
                <button
                  type="button"
                  onClick={resetActiveTab}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition cursor-pointer lowercase"
                  title="Clear this tab's appliances"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>clear</span>
                </button>
              )}
              <span>Quantity</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {currentAppliances.map((app) => {
              const qty = currentTabQuantities[app.id] || 0;
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

                  {/* Quantity Stepper (+ and - buttons) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQty(app.id, -1)}
                      disabled={qty === 0}
                      className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none text-slate-700 font-bold flex items-center justify-center transition active:scale-95 cursor-pointer"
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
                      className="w-9 h-9 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center justify-center transition active:scale-95 shadow-xs cursor-pointer"
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

        {/* Right Column: Floating Sticky Recommendation Side Panel */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-gradient-to-br from-blue-50/70 via-white to-slate-50 rounded-xl border border-blue-200 p-6 space-y-5 shadow-xs">
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
                  {recommendation.isZero
                    ? "Adjust quantities"
                    : "Optimal System Match"}
                </span>
              </div>
            </div>

            {/* Hardware Specification Breakdown */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200 text-xs">
              <div className="flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Hybrid Inverter:
                  </span>
                  <span className="text-slate-600">
                    {recommendation.inverter}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Solar PV Array:
                  </span>
                  <span className="text-slate-600">
                    {recommendation.panels}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Battery Storage:
                  </span>
                  <span className="text-slate-600">
                    {recommendation.battery}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Monthly Output Yield:
                  </span>
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

            {/* Direct WhatsApp CTA Action */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <svg
                className="w-4 h-4 fill-current shrink-0"
                viewBox="0 0 24 24"
              >
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
