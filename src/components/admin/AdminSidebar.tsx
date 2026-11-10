"use client";

import React, { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
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

export interface AdminShellProps {
  role: UserRole;
  fullName: string;
  email: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}

export function AdminShell({
  role,
  fullName,
  email,
  signOutAction,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer whenever the route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Load collapse preference from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nss_admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // Ignore storage errors in private mode
    }
  }, []);

  function toggleCollapse() {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("nss_admin_sidebar_collapsed", String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }

  return (
    <div
      style={{ colorScheme: "dark" }}
      className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col lg:flex-row relative"
    >
      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5 text-amber-400" />
            ) : (
              <Menu className="w-5 h-5 text-amber-400" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight">
                Nowshera Solar
              </h2>
              <p className="text-[10px] font-mono text-slate-400">Admin Portal</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {role}
          </span>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Nowshera Solar</h2>
                <p className="text-xs font-mono text-slate-400">Admin Portal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
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
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
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

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-white truncate">
                {fullName}
              </p>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{email}</p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border border-transparent text-xs font-medium text-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 min-h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out sticky top-0 h-screen ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5 text-amber-400" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-sm font-bold text-white truncate tracking-tight">
                    Nowshera Solar
                  </h2>
                  <p className="text-xs font-mono text-slate-400 truncate">
                    Admin Portal
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div
                  title="Nowshera Solar Admin Portal"
                  className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0"
                >
                  <Sun className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            )}

            {/* Collapse / Expand Toggle Button */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={toggleCollapse}
                title="Collapse sidebar (icon-only mode)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {isCollapsed && (
              <div className="flex justify-center pb-2 border-b border-slate-800/80 mb-2">
                <button
                  type="button"
                  onClick={toggleCollapse}
                  title="Expand sidebar"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            )}

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
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-lg transition group ${
                    isCollapsed
                      ? "justify-center p-3"
                      : "gap-3 px-3.5 py-2.5 text-sm font-medium"
                  } ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-semibold shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`shrink-0 ${
                      isCollapsed ? "w-5 h-5" : "w-4 h-4"
                    } ${
                      isActive
                        ? "text-slate-950"
                        : "text-slate-400 group-hover:text-amber-400"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Sign Out */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-900/60">
          {!isCollapsed ? (
            <>
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
              >
                <span>View Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-white truncate">
                    {fullName}
                  </p>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {role}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  {email}
                </p>
              </div>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border border-transparent text-xs font-medium text-slate-300 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/"
                target="_blank"
                title="View Public Website"
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>

              <div
                title={`${fullName} (${role})\n${email}`}
                className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400 font-mono cursor-default"
              >
                {fullName.charAt(0).toUpperCase()}
              </div>

              <form action={signOutAction} className="w-full flex justify-center">
                <button
                  type="submit"
                  title="Sign Out"
                  className="p-2.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area - dynamically expands/contracts with sidebar */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 overflow-y-auto transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

// Backwards-compatible export
export function AdminSidebar(props: {
  role: UserRole;
  fullName: string;
  email: string;
  signOutAction: () => Promise<void>;
}) {
  return null;
}
