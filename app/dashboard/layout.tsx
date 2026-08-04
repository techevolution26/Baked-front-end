import Link from "next/link";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import { fetchCurrentUser } from "@/lib/api";
import {
  LayoutDashboard,
  ShoppingBag,
  Palette,
  Settings,
  ChefHat,
  User,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();
  if (!token) redirect("/login?next=/dashboard");

  const user = await fetchCurrentUser(token);
  if (!user || (user.role !== "bakery_owner" && user.role !== "admin")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      {/* Top Header Layer */}
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-berry" />
            <span className="font-display text-xl font-bold text-cocoa">
              Bakery Portal
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-cocoa/80 bg-stone-100 px-3 py-1.5 rounded-full">
            <User className="w-4 h-4 text-cocoa/60" />
            <span className="font-medium">{user.name || "Owner"}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-6xl mx-auto p-6 flex gap-8">
        <aside className="w-56 shrink-0">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-cocoa/70 hover:bg-white hover:text-berry transition-all group shadow-sm shadow-transparent hover:shadow-stone-100"
            >
              <LayoutDashboard className="w-4 h-4 text-cocoa/40 group-hover:text-berry transition-colors" />
              Overview
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-cocoa/70 hover:bg-white hover:text-berry transition-all group shadow-sm shadow-transparent hover:shadow-stone-100"
            >
              <ShoppingBag className="w-4 h-4 text-cocoa/40 group-hover:text-berry transition-colors" />
              Orders
            </Link>
            <Link
              href="/dashboard/templates"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-cocoa/70 hover:bg-white hover:text-berry transition-all group shadow-sm shadow-transparent hover:shadow-stone-100"
            >
              <Palette className="w-4 h-4 text-cocoa/40 group-hover:text-berry transition-colors" />
              Designs
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-cocoa/70 hover:bg-white hover:text-berry transition-all group shadow-sm shadow-transparent hover:shadow-stone-100"
            >
              <Settings className="w-4 h-4 text-cocoa/40 group-hover:text-berry transition-colors" />
              Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
