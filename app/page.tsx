import Image from "next/image";
import Link from "next/link";
import { getCurrentBakery, BackendUnavailableError } from "@/lib/tenant";
import { fetchTemplates } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default async function StorefrontPage() {
  let bakery = null;

  try {
    bakery = await getCurrentBakery();
  } catch (error) {
    if (error instanceof BackendUnavailableError) {
      return (
        <main className="min-h-screen bg-buttercream flex items-center justify-center p-6">
          <div className="w-full max-w-2xl rounded-[2rem] border border-cocoa/10 bg-white/95 p-10 shadow-2xl">
            <h1 className="text-3xl font-display text-cocoa mb-4">
              Service unavailable
            </h1>
            <p className="text-cocoa/75 leading-relaxed mb-6">
              We couldn&apos;t connect to the bakery backend. Please start the
              backend on port 8000 and reload.
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
      );
    }
    throw error;
  }

  if (!bakery) {
    return (
      <main className="max-w-lg mx-auto p-6 text-center py-16">
        <p className="text-6xl mb-4 drop-shadow-sm">{"\u{1F3EA}"}</p>
        <h1 className="font-display text-2xl font-bold text-cocoa mb-2">
          No bakery found for this address
        </h1>
        <p className="text-cocoa/60 text-sm leading-relaxed">
          Set DEV_TENANT_HOST in .env.local to a seeded bakery&apos;s domain and
          restart the backend.
        </p>
      </main>
    );
  }

  const templates = await fetchTemplates(bakery.id);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="mb-8 border-b border-cocoa/10 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-cocoa font-bold tracking-tight">
            {/* {bakery.name} */}
          </h1>
          <p className="text-cocoa/60 mt-1 flex items-center gap-1.5 text-sm font-medium">
            <span className="text-berry">📍</span> {bakery.location}
          </p>
        </div>
        {templates.length > 0 && (
          <span className="self-start sm:self-auto bg-berry/10 text-berry font-semibold text-xs px-3 py-1.5 rounded-full border border-berry/20">
            {templates.length} Custom Designs Available
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/design/${template.id}`}
            className="group rounded-2xl bg-white border border-cocoa/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out overflow-hidden flex flex-col"
          >
            <div className="relative aspect-square bg-gradient-to-tr from-cocoa/5 to-berry/5 overflow-hidden">
              {template.cover_image_url ? (
                <Image
                  src={template.cover_image_url}
                  alt={template.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">
                  🧁
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-cocoa/[0.01]">
              <p className="font-display font-semibold text-cocoa text-base line-clamp-1 group-hover:text-berry transition-colors duration-200">
                {template.name}
              </p>
              <p className="text-berry font-bold mt-1.5 text-lg tracking-tight">
                KSh {template.base_price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
