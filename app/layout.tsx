import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { getToken } from "@/lib/session";
import { getCurrentBakery } from "@/lib/tenant";
import { fetchCurrentUser } from "@/lib/api";
import SiteHeader from "@/components/SiteHeader";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Cake Marketplace",
  description: "Design your cake, tap and drag -- no typing required.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  const [bakery, user] = await Promise.all([
    getCurrentBakery(),
    token ? fetchCurrentUser(token) : Promise.resolve(null),
  ]);

  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${inter.variable} font-sans bg-buttercream`}>
        <SiteHeader
          isLoggedIn={!!user}
          isBakeryOwner={user?.role === "bakery_owner" || user?.role === "admin"}
          siteName={bakery?.name ?? "Cake Marketplace"}
        />
        {children}
      </body>
    </html>
  );
}
