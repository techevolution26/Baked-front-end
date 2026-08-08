"use client";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function CheckoutError({ error, reset }: ErrorProps) {
  return (
    <main className="min-h-screen bg-buttercream flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-[2rem] border border-cocoa/10 bg-white/95 p-10 shadow-2xl">
        <h1 className="text-3xl font-display text-cocoa mb-4">Checkout unavailable</h1>
        <p className="text-cocoa/75 leading-relaxed mb-6">
          We couldn’t load your checkout because the bakery backend is currently unavailable. Your design is still saved — try reloading or return to the homepage.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex justify-center rounded-xl bg-berry px-5 py-3 text-sm font-semibold text-white transition hover:bg-berry/90"
          >
            Reload checkout
          </button>
          <a
            href="/"
            className="inline-flex justify-center rounded-xl border border-cocoa/20 bg-white px-5 py-3 text-sm font-semibold text-cocoa transition hover:bg-cocoa/5"
          >
            Back to storefront
          </a>
        </div>
        <p className="mt-6 text-xs text-cocoa/40">If this happens again, the backend server may be down.</p>
      </div>
    </main>
  );
}
