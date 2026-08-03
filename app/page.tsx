import Image from "next/image";
import Link from "next/link";
import { getCurrentBakery } from "@/lib/tenant";
import { fetchTemplates } from "@/lib/api";

export default async function StorefrontPage() {
  const bakery = await getCurrentBakery();

  if (!bakery) {
    return (
      <main className="max-w-lg mx-auto p-6 text-center py-16">
        <p className="text-6xl mb-4 drop-shadow-sm">{"\u{1F3EA}"}</p>
        <h1 className="font-display text-2xl font-bold text-cocoa mb-2">
          No bakery found for this address
        </h1>
        <p className="text-cocoa/60 text-sm leading-relaxed">
          This domain isn&apos;t connected to a bakery yet. Developing locally?
          Set{" "}
          <code className="px-1.5 py-0.5 bg-cocoa/5 rounded font-mono text-xs text-berry">
            DEV_TENANT_HOST
          </code>{" "}
          in{" "}
          <code className="px-1.5 py-0.5 bg-cocoa/5 rounded font-mono text-xs text-berry">
            .env.local
          </code>{" "}
          to a seeded bakery&apos;s domain (run{" "}
          <code className="px-1.5 py-0.5 bg-cocoa/5 rounded font-mono text-xs text-berry">
            python seed.py
          </code>{" "}
          in the backend repo first).
        </p>
      </main>
    );
  }

  const templates = await fetchTemplates(bakery.id);

  return (
    <main className="max-w-5xl mx-auto p-6">
      {/* Header Area with Soft Color Accents */}
      <div className="mb-8 border-b border-cocoa/10 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-cocoa font-bold tracking-tight">
            {/* {bakery.name} */}
          </h1>
          <p className="text-cocoa/60 mt-1 flex items-center gap-1.5 text-sm font-medium">
            <span className="text-berry">📍</span> {bakery.location}
          </p>
        </div>

        {/* Colorful Badge indicator for total catalog */}
        {templates.length > 0 && (
          <span className="self-start sm:self-auto bg-berry/10 text-berry font-semibold text-xs px-3 py-1.5 rounded-full border border-berry/20">
            {templates.length} Custom Designs Available
          </span>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/design/${t.id}`}
            className="group rounded-2xl bg-white border border-cocoa/5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out overflow-hidden flex flex-col"
          >
            {/* Image Wrapper with Zoom Animation */}
            <div className="relative aspect-square bg-gradient-to-tr from-cocoa/5 to-berry/5 overflow-hidden">
              {t.cover_image_url ? (
                <Image
                  src={t.cover_image_url}
                  alt={t.name}
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
              {/* Fresh Colorful Visual Anchor */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-cocoa font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm border border-cocoa/5 group-hover:bg-berry group-hover:text-white transition-colors duration-300">
                Customize
              </div>
            </div>

            {/* Info Section */}
            <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-cocoa/[0.01]">
              <p className="font-display font-semibold text-cocoa text-base line-clamp-1 group-hover:text-berry transition-colors duration-200">
                {t.name}
              </p>
              <p className="text-berry font-bold mt-1.5 text-lg tracking-tight">
                KSh {t.base_price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}

        {/* Playful, Colorful Empty State */}
        {templates.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gradient-to-br from-cocoa/[0.02] to-berry/[0.02] rounded-3xl border-2 border-dashed border-cocoa/10 px-4">
            <div className="text-5xl mb-3 animate-bounce duration-1000">🧑‍🍳</div>
            <h3 className="font-display text-xl text-cocoa font-bold">
              Kitchen is getting ready
            </h3>
            <p className="text-cocoa/60 text-sm max-w-xs mx-auto mt-1.5">
              We are currently mixing ingredients! No custom designs are listed
              right now.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
