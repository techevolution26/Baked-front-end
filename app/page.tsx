import Image from "next/image";
import Link from "next/link";
import { getCurrentBakery } from "@/lib/tenant";
import { fetchTemplates } from "@/lib/api";

export default async function StorefrontPage() {
  const bakery = await getCurrentBakery();

  if (!bakery) {
    return (
      <main className="max-w-lg mx-auto p-6 text-center">
        <p className="text-5xl mb-4">{"\u{1F3EA}"}</p>
        <h1 className="font-display text-2xl text-cocoa mb-2">No bakery found for this address</h1>
        <p className="text-cocoa/60 text-sm">
          This domain isn&apos;t connected to a bakery yet. Developing locally? Set{" "}
          <code className="px-1 bg-cocoa/5 rounded">DEV_TENANT_HOST</code> in{" "}
          <code className="px-1 bg-cocoa/5 rounded">.env.local</code> to a seeded bakery&apos;s
          domain (run <code className="px-1 bg-cocoa/5 rounded">python seed.py</code> in the
          backend repo first).
        </p>
      </main>
    );
  }

  const templates = await fetchTemplates(bakery.id);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-cocoa">{bakery.name}</h1>
        <p className="text-cocoa/60">{bakery.location}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/design/${t.id}`}
            className="rounded-2xl bg-white shadow hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="relative aspect-square bg-cocoa/5">
              {t.cover_image_url && (
                <Image src={t.cover_image_url} alt={t.name} fill className="object-cover" />
              )}
            </div>
            <div className="p-3">
              <p className="font-display text-cocoa">{t.name}</p>
              <p className="text-berry font-semibold mt-1">KSh {t.base_price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
        {templates.length === 0 && (
          <p className="text-cocoa/60 col-span-full">No designs listed yet.</p>
        )}
      </div>
    </main>
  );
}
