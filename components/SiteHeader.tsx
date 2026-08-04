"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function SiteHeader({
  isLoggedIn,
  isBakeryOwner,
  isCustomer,
  siteName,
  userInitial = "U", // Added optional fallback initial for the visual avatar placeholder
}: {
  isLoggedIn: boolean;
  isBakeryOwner: boolean;
  isCustomer: boolean;
  siteName: string;
  userInitial?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function logout() {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      setIsMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  }

  const isActive = (path: string) => pathname === path;

  // Desktop link styling utility
  const desktopLinkStyles = (path: string) => `
    relative font-medium transition-colors duration-200 py-1
    ${isActive(path) ? "text-berry" : "text-cocoa/70 hover:text-berry"}
    after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 
    after:bg-berry after:rounded-full after:transform after:origin-right after:scale-x-0 
    after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-left
    ${isActive(path) ? "after:scale-x-100" : ""}
  `;

  // Mobile link styling utility
  const mobileLinkStyles = (path: string) => `
    w-full block px-4 py-3 rounded-xl font-medium transition-all duration-200
    ${isActive(path) ? "bg-berry/10 text-berry pl-6" : "text-cocoa/80 hover:bg-cocoa/5 hover:text-cocoa"}
  `;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cocoa/5 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Brand Identity / Logo & Site Icon */}
        <Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-cocoa to-berry bg-clip-text text-transparent hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          {/* Site Icon (Uses visual gradient backdrop wrapper) */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-berry to-cocoa flex items-center justify-center text-white text-base shadow-sm group-hover:scale-105 transition-transform">
            🧁
          </div>
          <span>{siteName}</span>
        </Link>

        {/* ========================================================
            DESKTOP NAVIGATION (Visible on medium screens and up)
            ======================================================== */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {isLoggedIn ? (
            <>
              {isCustomer && (
                <Link href="/orders" className={desktopLinkStyles("/orders")}>
                  My orders
                </Link>
              )}

              {isBakeryOwner && (
                <Link
                  href="/dashboard"
                  className="font-semibold text-xs text-white bg-cocoa hover:bg-cocoa/90 px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all"
                >
                  Bakery dashboard
                </Link>
              )}

              <Link href="/account" className={desktopLinkStyles("/account")}>
                Account
              </Link>

              {/* Log Out CTA */}
              <button
                onClick={logout}
                disabled={isLoggingOut}
                className="font-medium text-cocoa/50 hover:text-red-500 transition-colors duration-200 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isLoggingOut && (
                  <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                )}
                {isLoggingOut ? "Leaving..." : "Log out"}
              </button>

              {/* Logged-In User Profile Avatar Anchor */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-berry/20 to-cocoa/10 border border-berry/30 flex items-center justify-center font-bold text-xs text-berry shadow-inner select-none">
                {userInitial.toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-cocoa/70 hover:text-berry transition-colors duration-200"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="rounded-xl font-semibold bg-berry hover:bg-berry-dark text-white px-4 py-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        {/* ========================================================
            MOBILE HAMBURGER TRIGGER BUTTON
            ======================================================== */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Profile Avatar Visual Anchor (Shown outside menu when logged in) */}
          {isLoggedIn && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-berry/20 to-cocoa/10 border border-berry/30 flex items-center justify-center font-bold text-xs text-berry shadow-inner select-none">
              {userInitial.toUpperCase()}
            </div>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl text-cocoa/80 hover:bg-cocoa/5 focus:outline-none transition-colors"
            aria-label="Toggle navigation menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between relative">
              <span
                className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-left ${isMenuOpen ? "rotate-45 translate-x-1" : ""}`}
              />
              <span
                className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? "opacity-0 scale-0" : ""}`}
              />
              <span
                className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-left ${isMenuOpen ? "-rotate-45 translate-x-1" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================
          COLLAPSIBLE MOBILE DROPDOWN NAVIGATION MENU
          ======================================================== */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-cocoa/5 bg-white
          ${isMenuOpen ? "max-h-[400px] border-t opacity-100 visible" : "max-h-0 opacity-0 invisible"}`}
      >
        <div className="px-4 py-4 space-y-2 flex flex-col items-start text-sm">
          {isLoggedIn ? (
            <>
              {isCustomer && (
                <Link
                  href="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className={mobileLinkStyles("/orders")}
                >
                  📦 My orders
                </Link>
              )}

              <Link
                href="/account"
                onClick={() => setIsMenuOpen(false)}
                className={mobileLinkStyles("/account")}
              >
                👤 Account settings
              </Link>

              {isBakeryOwner && (
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center font-semibold text-white bg-cocoa hover:bg-cocoa/90 px-4 py-3 rounded-xl shadow-sm transition-all block"
                >
                  Dashboard Overview
                </Link>
              )}

              {/* Mobile Logout Row */}
              <div className="w-full pt-2 border-t border-cocoa/5 flex items-center justify-between px-4">
                <button
                  onClick={logout}
                  disabled={isLoggingOut}
                  className="font-medium text-red-500 disabled:opacity-50 py-2 flex items-center gap-2"
                >
                  {isLoggingOut && (
                    <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className={mobileLinkStyles("/login")}
              >
                🔑 Log in
              </Link>

              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center rounded-xl font-semibold bg-berry text-white px-4 py-3 shadow-sm block mt-2"
              >
                Create an account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
