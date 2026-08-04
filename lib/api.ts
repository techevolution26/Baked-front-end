import type {
  Bakery,
  DesignTemplate,
  Order,
  Blueprint,
  CurrentUser,
  PricingConfig,
} from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function logAndNull(res: Response, label: string): Promise<null> {
  const body = await res.text().catch(() => "");
  console.error(`${label} failed: ${res.status} ${body}`);
  return null;
}

export async function fetchCurrentUser(
  token: string,
): Promise<CurrentUser | null> {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) return null; // expected/frequent (unauthenticated) -- not worth logging as an error
  if (!res.ok) return logAndNull(res, "GET /users/me");
  return res.json();
}

export async function fetchMyBakery(token: string): Promise<Bakery | null> {
  const res = await fetch(`${API_URL}/bakeries/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return logAndNull(res, "GET /bakeries/me");
  return res.json();
}

export async function fetchMyOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    await logAndNull(res, "GET /orders");
    return [];
  }
  return res.json();
}

export async function fetchBakeries(): Promise<Bakery[]> {
  const res = await fetch(`${API_URL}/bakeries`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to load bakeries");
  return res.json();
}

export async function fetchBakeryById(id: string): Promise<Bakery | null> {
  const res = await fetch(`${API_URL}/bakeries/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return logAndNull(res, `GET /bakeries/${id}`);
  return res.json();
}

export async function resolveBakeryByDomain(
  host: string,
): Promise<Bakery | null> {
  const res = await fetch(
    `${API_URL}/bakeries/resolve?host=${encodeURIComponent(host)}`,
    {
      next: { revalidate: 300 },
    },
  );
  if (!res.ok) return null; // expected/frequent (unknown domain) -- not worth logging as an error
  return res.json();
}

export async function fetchTemplates(
  bakeryId?: string,
): Promise<DesignTemplate[]> {
  const url = new URL(`${API_URL}/templates`);
  if (bakeryId) url.searchParams.set("bakery_id", bakeryId);
  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to load templates");
  return res.json();
}

export async function fetchTemplateById(
  id: string,
): Promise<DesignTemplate | null> {
  const res = await fetch(`${API_URL}/templates/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return logAndNull(res, `GET /templates/${id}`);
  return res.json();
}

export async function fetchBlueprintById(
  id: string,
): Promise<Blueprint | null> {
  const res = await fetch(`${API_URL}/blueprints/${id}`, { cache: "no-store" });
  if (!res.ok) return logAndNull(res, `GET /blueprints/${id}`);
  return res.json();
}

export async function fetchOrderById(
  id: string,
  token: string,
): Promise<Order | null> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return logAndNull(res, `GET /orders/${id}`);
  return res.json();
}

export async function fetchPricingConfig(): Promise<PricingConfig> {
  const res = await fetch(`${API_URL}/pricing/config`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to load pricing config");
  return res.json();
}
