import { cookies } from "next/headers";

const COOKIE_NAME = "session";

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
