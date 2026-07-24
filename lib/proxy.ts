/**
 * Shared helper for Next.js Route Handlers that proxy to the FastAPI
 * backend: extracts the backend's actual error detail (FastAPI's
 * {"detail": "..."} convention) instead of forwarding an opaque,
 * double-encoded string that the client can't do anything useful with.
 */
export async function extractBackendError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") return data.detail;
  } catch {
    // response body wasn't JSON -- fall through to the fallback
  }
  return fallback;
}
