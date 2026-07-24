import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-md mx-auto p-6 text-center">
      <p className="text-5xl mb-4">{"\u{1F370}"}</p>
      <h1 className="font-display text-2xl text-cocoa mb-2">Page not found</h1>
      <p className="text-cocoa/60 mb-6">This slice of cake wandered off.</p>
      <Link href="/" className="rounded-xl bg-berry text-white font-display px-6 py-3 inline-block">
        Back to the marketplace
      </Link>
    </main>
  );
}
