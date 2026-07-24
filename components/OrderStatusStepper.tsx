const STEPS: { key: string; label: string; icon: string }[] = [
  { key: "submitted", label: "Submitted", icon: "\u{1F4DD}" },
  { key: "accepted", label: "Accepted", icon: "\u2705" },
  { key: "baking", label: "Baking", icon: "\u{1F382}" },
  { key: "ready", label: "Ready", icon: "\u{1F381}" },
  { key: "delivered", label: "Delivered", icon: "\u{1F69A}" },
];

export default function OrderStatusStepper({ status }: { status: string }) {
  const activeIndex = STEPS.findIndex((s) => s.key === status);
  const rejected = status === "rejected";

  if (rejected) {
    return (
      <div className="rounded-2xl bg-white shadow p-6 text-center">
        <p className="text-3xl mb-2">\u26A0\uFE0F</p>
        <p className="font-display text-cocoa">This order was declined by the bakery</p>
      </div>
    );
  }

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const reached = i <= activeIndex;
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${
                  reached ? "bg-berry border-berry" : "bg-white border-cocoa/20"
                }`}
              >
                {step.icon}
              </div>
              <p
                className={`text-xs mt-2 font-display text-center ${
                  reached ? "text-cocoa" : "text-cocoa/40"
                }`}
              >
                {step.label}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-1 flex-1 mx-1 rounded ${
                  i < activeIndex ? "bg-berry" : "bg-cocoa/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
