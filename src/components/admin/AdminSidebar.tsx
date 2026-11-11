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
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col lg:flex-row relative">
      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5 text-blue-600" />
            ) : (
              <Menu className="w-5 h-5 text-blue-600" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Sun className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                Nowshera Solar
              </h2>
              <p className="text-[10px] font-mono text-slate-500">Admin Portal</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded bg-blue-50 text-blue-700 border border-blue-200">
            {role}
          </span>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:hidden shadow-xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Nowshera Solar</h2>
                <p className="text-xs font-mono text-slate-500">Admin Portal</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
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
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:text-blue-600 hover:border-blue-300 transition shadow-2xs"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {fullName}
              </p>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-blue-50 text-blue-700 border border-blue-200">
                {role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{email}</p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-xs font-medium text-slate-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col justify-between shrink-0 min-h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out sticky top-0 h-screen ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
            {!isCollapsed ? (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5 text-blue-600" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-sm font-bold text-slate-900 truncate tracking-tight">
                    Nowshera Solar
                  </h2>
                  <p className="text-xs font-mono text-slate-500 truncate">
                    Admin Portal
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div
                  title="Nowshera Solar Admin Portal"
                  className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0"
                >
                  <Sun className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            )}

            {/* Collapse / Expand Toggle Button */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={toggleCollapse}
                title="Collapse sidebar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
            {isCollapsed && (
              <div className="flex justify-center pb-2 border-b border-slate-200 mb-2">
                <button
                  type="button"
                  onClick={toggleCollapse}
                  title="Expand sidebar"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-blue-600" />
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
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <Icon
                    className={`shrink-0 ${
                      isCollapsed ? "w-5 h-5" : "w-4 h-4"
                    } ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-blue-600"
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
        <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50">
          {!isCollapsed ? (
            <>
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:text-blue-600 hover:border-blue-300 transition shadow-2xs"
              >
                <span>View Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {fullName}
                  </p>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {role}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                  {email}
                </p>
              </div>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-xs font-medium text-slate-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
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
                className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 transition shadow-2xs"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>

              <div
                title={`${fullName} (${role})\n${email}`}
                className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 font-mono cursor-default"
              >
                {fullName.charAt(0).toUpperCase()}
              </div>

              <form action={signOutAction} className="w-full flex justify-center">
                <button
                  type="submit"
                  title="Sign Out"
                  className="p-2.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area - Light Slate Alabaster Canvas with High Contrast */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-slate-50 text-slate-900 overflow-y-auto transition-all duration-300">
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
