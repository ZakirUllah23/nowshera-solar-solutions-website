import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database.types";

export interface AuthenticatedProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  is_active: boolean;
}

/**
 * Ensures the caller is authenticated and has an active profile ('owner', 'admin', or 'staff').
 */
export async function requireStaffAuth(): Promise<AuthenticatedProfile> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, is_active")
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.is_active) {
    redirect("/login?error=account_disabled");
  }

  return {
    id: profile.id,
    email: user.email ?? "",
    role: profile.role,
    full_name: profile.full_name,
    phone: profile.phone,
    is_active: profile.is_active,
  };
}

/**
 * Ensures the caller is an active 'owner' or 'admin' (blocks regular 'staff').
 */
export async function requireAdminOrOwner(): Promise<AuthenticatedProfile> {
  const profile = await requireStaffAuth();

  if (profile.role !== "owner" && profile.role !== "admin") {
    redirect("/admin?error=insufficient_permissions");
  }

  return profile;
}