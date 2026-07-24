"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SiteHeader({
  isLoggedIn,
  isBakeryOwner,
  siteName,
}: {
  isLoggedIn: boolean;
  isBakeryOwner: boolean;
  siteName: string;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      <Link href="/" className="font-display text-xl text-cocoa">
        {siteName}
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {isLoggedIn ? (
          <>
            <Link href="/orders" className="text-cocoa/70 hover:text-berry">
              My orders
            </Link>
            <Link href="/account" className="text-cocoa/70 hover:text-berry">
              Account
            </Link>
            {isBakeryOwner && (
              <Link href="/dashboard" className="text-cocoa/70 hover:text-berry">
                Bakery dashboard
              </Link>
            )}
            <button onClick={logout} className="text-cocoa/70 hover:text-berry">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-cocoa/70 hover:text-berry">
              Log in
            </Link>
            <Link href="/register" className="rounded-lg bg-berry text-white px-4 py-2">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
