export default function StorefrontLoading() {
  // Generate an array of 6 placeholder cards
  const skeletons = Array.from({ length: 6 });

  return (
    <main className="max-w-5xl mx-auto p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 border-b border-cocoa/10 pb-6">
        <div className="h-9 w-64 bg-cocoa/10 rounded-xl mb-2" />
        <div className="h-5 w-40 bg-cocoa/5 rounded-lg" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {skeletons.map((_, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white border border-cocoa/5 overflow-hidden shadow-sm"
          >
            {/* Image Placeholder */}
            <div className="relative aspect-square bg-gradient-to-tr from-cocoa/5 to-berry/5" />

            {/* Content Placeholders */}
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-cocoa/10 rounded-md" />
              <div className="h-6 w-1/3 bg-berry/10 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
