import { requireStaffAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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
    <div
      style={{ colorScheme: "dark" }}
      className="min-h-screen w-full bg-slate-950 text-slate-100 flex"
    >
      <AdminSidebar
        role={profile.role}
        fullName={profile.full_name}
        email={profile.email}
        signOutAction={handleSignOut}
      />
      <main className="flex-1 min-w-0 p-8 bg-slate-950 text-slate-100 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}