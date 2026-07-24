import Link from "next/link";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import { fetchCurrentUser } from "@/lib/api";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  if (!token) redirect("/login?next=/dashboard");

  // Role gate: this is the bakery-owner area. The backend independently
  // enforces this too (require_role on the mutating endpoints) -- this
  // redirect is the UX layer, not the security boundary.
  const user = await fetchCurrentUser(token);
  if (!user || (user.role !== "bakery_owner" && user.role !== "admin")) {
    redirect("/");
  }

  return (
    <div className="max-w-6xl mx-auto p-6 flex gap-8">
      <aside className="w-48 shrink-0">
        <p className="font-display text-lg text-cocoa mb-4">Bakery</p>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/dashboard" className="rounded-lg px-3 py-2 text-cocoa/70 hover:bg-white hover:text-berry">
            Overview
          </Link>
          <Link href="/dashboard/orders" className="rounded-lg px-3 py-2 text-cocoa/70 hover:bg-white hover:text-berry">
            Orders
          </Link>
          <Link href="/dashboard/templates" className="rounded-lg px-3 py-2 text-cocoa/70 hover:bg-white hover:text-berry">
            Designs
          </Link>
          <Link href="/dashboard/settings" className="rounded-lg px-3 py-2 text-cocoa/70 hover:bg-white hover:text-berry">
            Settings
          </Link>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
