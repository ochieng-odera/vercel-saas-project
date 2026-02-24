import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, FileText, Settings } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userInitials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="font-bold text-xl">
            Lipa<span className="text-primary">Insight</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-md font-medium transition-colors">
            <LayoutDashboard size={20} />
            Analytics
          </Link>
          <Link href="/dashboard/reports" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted rounded-md font-medium transition-colors">
            <FileText size={20} />
            Saved Reports
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-muted rounded-md font-medium transition-colors">
            <Settings size={20} />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center px-6 justify-between md:justify-end">
          <div className="md:hidden font-bold text-xl">LipaInsight</div>
          <div className="flex items-center gap-4">
            <div className="text-sm border px-2 py-1 rounded-md bg-muted font-medium">Free Plan</div>
            <div
              className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm"
              title={user.email ?? ""}
            >
              {userInitials}
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
