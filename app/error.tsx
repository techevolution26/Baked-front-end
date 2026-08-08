"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-buttercream flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-[2rem] border border-cocoa/10 bg-white/95 p-10 shadow-2xl">
        <h1 className="text-3xl font-display text-cocoa mb-4">Something went wrong</h1>
        <p className="text-cocoa/75 leading-relaxed mb-6">
          We couldn’t load the page because the bakery service is unavailable or there was a problem communicating with the backend. Please try again in a few moments.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex justify-center rounded-xl bg-berry px-5 py-3 text-sm font-semibold text-white transition hover:bg-berry/90"
          >
            Reload
          </button>
          <a
            href="/"
            className="inline-flex justify-center rounded-xl border border-cocoa/20 bg-white px-5 py-3 text-sm font-semibold text-cocoa transition hover:bg-cocoa/5"
          >
            Back to storefront
          </a>
        </div>
        <p className="mt-6 text-xs text-cocoa/40">
          If this keeps happening, the bakery backend may be temporarily down.
        </p>
      </div>
    </main>
  );
}
