/**
 * Shared helper for Next.js Route Handlers that proxy to the FastAPI
 * backend: extracts the backend's actual error detail instead of
 * forwarding an opaque, double-encoded string.
 *
 * FastAPI errors come in two shapes:
 * - HTTPException(detail="some string") -- a plain string reason
 * - Pydantic validation errors (422) -- detail is an array of
 *   {loc, msg, type} objects, one per invalid/missing field
 * Only handling the first shape means real validation errors (missing
 * fields, wrong types) silently fall through to a generic fallback
 * message instead of telling you exactly what's wrong.
 */

type FastAPIValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};

export async function extractBackendError(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = await res.json();

    if (typeof data?.detail === "string") return data.detail;

    if (Array.isArray(data?.detail)) {
      const messages = (data.detail as FastAPIValidationError[]).map((err) => {
        const field =
          err.loc?.filter((p) => p !== "body").join(".") || "request";
        return `${field}: ${err.msg}`;
      });
      if (messages.length > 0) return messages.join("; ");
    }
  } catch {
    // response body wasn't JSON -- fall through to the fallback
  }
  return fallback;
}
