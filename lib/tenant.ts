import { headers } from "next/headers";
import { resolveBakeryByDomain } from "@/lib/api";
import type { Bakery } from "@/types/api";

// Lets you preview a specific bakery's storefront locally without real
// DNS/custom domains -- set in .env.local, never read in production.
const DEV_TENANT_HOST = process.env.DEV_TENANT_HOST;

export async function getTenantHost(): Promise<string> {
  if (process.env.NODE_ENV !== "production" && DEV_TENANT_HOST) {
    return DEV_TENANT_HOST;
  }
  const h = await headers();
  return h.get("x-tenant-host") ?? h.get("host") ?? "";
}

export async function getCurrentBakery(): Promise<Bakery | null> {
  const host = await getTenantHost();
  if (!host) return null;
  return resolveBakeryByDomain(host);
}
