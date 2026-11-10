import { requireStaffAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminSidebar";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireStaffAuth();

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <AdminShell
      role={profile.role}
      fullName={profile.full_name}
      email={profile.email}
      signOutAction={handleSignOut}
    >
      {children}
    </AdminShell>
  );
}
