import type { Bakery, DesignTemplate, Order, Blueprint, CurrentUser } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchCurrentUser(token: string): Promise<CurrentUser | null> {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMyBakery(token: string): Promise<Bakery | null> {
  const res = await fetch(`${API_URL}/bakeries/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMyOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchBakeries(): Promise<Bakery[]> {
  const res = await fetch(`${API_URL}/bakeries`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to load bakeries");
  return res.json();
}

export async function fetchBakeryById(id: string): Promise<Bakery | null> {
  const res = await fetch(`${API_URL}/bakeries/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function resolveBakeryByDomain(host: string): Promise<Bakery | null> {
  const res = await fetch(`${API_URL}/bakeries/resolve?host=${encodeURIComponent(host)}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchTemplates(bakeryId?: string): Promise<DesignTemplate[]> {
  const url = new URL(`${API_URL}/templates`);
  if (bakeryId) url.searchParams.set("bakery_id", bakeryId);
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to load templates");
  return res.json();
}

export async function fetchTemplateById(id: string): Promise<DesignTemplate | null> {
  const res = await fetch(`${API_URL}/templates/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchBlueprintById(id: string): Promise<Blueprint | null> {
  const res = await fetch(`${API_URL}/blueprints/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchOrderById(id: string, token: string): Promise<Order | null> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}
