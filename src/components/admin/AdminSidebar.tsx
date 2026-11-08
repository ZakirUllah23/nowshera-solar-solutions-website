"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types/database.types";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Award,
  Layers,
  Percent,
  History,
  MessageSquare,
  Sun,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products & Stock", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Brands", href: "/admin/brands", icon: Award },
  { label: "Solar Packages", href: "/admin/packages", icon: Layers },
  { label: "Promotional Offers", href: "/admin/offers", icon: Percent },
  { label: "Price History", href: "/admin/price-history", icon: History },
  { label: "Customer Enquiries", href: "/admin/inquiries", icon: MessageSquare },
];

export function AdminSidebar({
  role,
  fullName,
  email,
  signOutAction,
}: {
  role: UserRole;
  fullName: string;
  email: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5 text-amber-400" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-white truncate">
              Nowshera Solar
            </h2>
            <p className="text-xs text-slate-400 truncate">Admin Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-semibold shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Sign Out */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-white transition"
        >
          <span>View Public Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white truncate">
              {fullName}
            </p>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">{email}</p>
        </div>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 border border-transparent text-xs font-medium text-slate-300 transition cursor-pointer"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}