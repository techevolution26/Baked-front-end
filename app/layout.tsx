import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { getToken } from "@/lib/session";
import { getCurrentBakery } from "@/lib/tenant";
import { fetchCurrentUser } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";
import { Analytics } from "@vercel/analytics/next";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Cake Marketplace",
  description: "Design your cake, tap and drag -- no typing required.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();
  let bakery = null;
  let user = null;
  let backendUnavailable = false;

  try {
    bakery = await getCurrentBakery();
  } catch (error) {
    console.error("Backend unavailable while resolving bakery:", error);
    backendUnavailable = true;
  }

  if (!backendUnavailable && token) {
    try {
      user = await fetchCurrentUser(token);
    } catch (error) {
      console.error("Backend unavailable while fetching current user:", error);
      backendUnavailable = true;
    }
  }

  if (backendUnavailable) {
    return (
      <html lang="en">
        <body
          className={`${fraunces.variable} ${inter.variable} font-sans bg-buttercream`}
        >
          <main className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-2xl rounded-[2rem] border border-cocoa/10 bg-white/95 p-10 shadow-2xl">
              <h1 className="text-3xl font-display text-cocoa mb-4">
                Service unavailable
              </h1>
              <p className="text-cocoa/75 leading-relaxed mb-6">
                {process.env.NODE_ENV === "production"
                  ? "We are having trouble connecting to our servers. Please check your internet connection and try refreshing the page."
                  : "The bakery backend is currently unreachable. Please check that the backend is running on port 8000 and reload the page."}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
                <a
                  href="/"
                  className="inline-flex justify-center rounded-xl bg-berry px-5 py-3 text-sm font-semibold text-white transition hover:bg-berry/90"
                >
                  Reload
                </a>
                <a
                  href="/"
                  className="inline-flex justify-center rounded-xl border border-cocoa/20 bg-white px-5 py-3 text-sm font-semibold text-cocoa transition hover:bg-cocoa/5"
                >
                  Back to home
                </a>
              </div>
            </div>
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${inter.variable} font-sans bg-buttercream`}
      >
        <SiteHeader
          isLoggedIn={!!user}
          isBakeryOwner={
            user?.role === "bakery_owner" || user?.role === "admin"
          }
          isCustomer={user?.role === "customer"}
          siteName={bakery?.name ?? "Cake Marketplace"}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
