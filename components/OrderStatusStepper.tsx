"use client";

import React from "react";

// Lucide-style SVG Icons
const ICONS: Record<string, React.ReactNode> = {
  submitted: (
    <svg
      className="w-5 h-5 stroke-current fill-none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  accepted: (
    <svg
      className="w-5 h-5 stroke-current fill-none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  baking: (
    <svg
      className="w-5 h-5 stroke-current fill-none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  ready: (
    <svg
      className="w-5 h-5 stroke-current fill-none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  delivered: (
    <svg
      className="w-5 h-5 stroke-current fill-none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
};

const STEPS = [
  {
    key: "submitted",
    label: "Submitted",
    timeLog: "09:14 AM",
    animationClass: "animate-pulse",
  },
  {
    key: "accepted",
    label: "Accepted",
    timeLog: "09:22 AM",
    animationClass: "hover:rotate-12 transition-transform",
  },
  {
    key: "baking",
    label: "Baking",
    timeLog: "09:40 AM",
    animationClass: "animate-spin [animation-duration:8s]",
  },
  {
    key: "ready",
    label: "Ready",
    timeLog: "10:15 AM",
    animationClass: "animate-bounce [animation-duration:2s]",
  },
  {
    key: "delivered",
    label: "Delivered",
    timeLog: "10:30 AM",
    animationClass: "animate-bounce [animation-duration:3s]",
  },
];

export default function OrderStatusStepper({ status }: { status: string }) {
  const activeIndex = STEPS.findIndex((s) => s.key === status);
  const rejected = status === "rejected";
  const isDelivered = status === "delivered";

  if (rejected) {
    return (
      <div className="rounded-2xl bg-white border border-rose-100 p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 stroke-current fill-none"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="font-display font-semibold text-cocoa text-base">
          This order was declined by the bakery
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full select-none">
      {/* ========================================================
          CELEBRATORY PARTICLE SYSTEM (Fires on active delivery)
          ======================================================== */}
      {isDelivered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 hidden sm:block">
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-48 h-48 confetti-explosion" />
          <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-48 h-48 confetti-explosion [animation-delay:0.4s]" />
        </div>
      )}

      {/* ========================================================
          DESKTOP WORKSPACE VIEW (Hidden on Mobile)
          ======================================================== */}
      <div className="hidden sm:flex items-start w-full">
        {STEPS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isCurrent = i === activeIndex;
          const isReached = isCompleted || isCurrent;
          const isLineActiveAndLoading = isCurrent && i < STEPS.length - 1;

          return (
            <div
              key={`ds-${step.key}`}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center flex-1 relative group">
                {/* CSS Tooltip Anchor Wrapper */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-10 bg-cocoa text-white text-[10px] font-semibold px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-30">
                  {isReached
                    ? `Completed at ${step.timeLog}`
                    : "Pending tracking update"}
                  <div className="w-1.5 h-1.5 bg-cocoa rotate-45 mx-auto -mb-1 transform translate-y-0.5" />
                </div>

                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative cursor-help
                    ${isCurrent ? "bg-berry border-berry text-white ring-4 ring-berry/20 scale-105 shadow-md shadow-berry/10" : ""}
                    ${isCompleted ? "bg-white border-berry text-berry" : ""}
                    ${!isReached ? "bg-white border-cocoa/10 text-cocoa/30" : ""}
                  `}
                >
                  <div className={isCurrent ? step.animationClass : ""}>
                    {ICONS[step.key]}
                  </div>
                  {isCompleted && (
                    <span className="absolute -bottom-0.5 -right-0.5 bg-berry text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white scale-110">
                      ✓
                    </span>
                  )}
                </div>

                <p
                  className={`text-xs mt-3 font-display text-center font-medium tracking-tight transition-colors duration-300 ${isCurrent ? "text-berry font-bold" : isReached ? "text-cocoa" : "text-cocoa/40"}`}
                >
                  {step.label}
                </p>
              </div>

              {i < STEPS.length - 1 && (
                <div className="h-1 flex-1 -mx-2 rounded-full bg-cocoa/5 overflow-hidden relative top-6 -translate-y-6">
                  {isCompleted && (
                    <div className="h-full bg-berry w-full transition-all ease-out duration-1000" />
                  )}
                  {isLineActiveAndLoading && (
                    <div className="h-full w-full bg-gradient-to-r from-berry via-berry/40 to-cocoa/10 bg-[length:200%_auto] animate-[shimmer_1.5s_infinite_linear]" />
                  )}
                  {!isReached && <div className="h-full w-0" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================
          MOBILE TRACK VIEW (Vertical layout engine optimizations)
          ======================================================== */}
      <div className="flex flex-col w-full sm:hidden space-y-0.5">
        {STEPS.map((step, i) => {
          const isCompleted = i < activeIndex;
          const isCurrent = i === activeIndex;
          const isReached = isCompleted || isCurrent;
          const isLineActiveAndLoading = isCurrent && i < STEPS.length - 1;

          return (
            <div
              key={`mb-${step.key}`}
              className="flex items-stretch w-full gap-4"
            >
              {/* Left Column: Icons and Shimmer Rail Connections */}
              <div className="flex flex-col items-center shrink-0 relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10
                    ${isCurrent ? "bg-berry border-berry text-white ring-4 ring-berry/20 scale-105 shadow-sm" : ""}
                    ${isCompleted ? "bg-white border-berry text-berry" : ""}
                    ${!isReached ? "bg-white border-cocoa/10 text-cocoa/30" : ""}
                  `}
                >
                  <div
                    className={`scale-90 ${isCurrent ? step.animationClass : ""}`}
                  >
                    {ICONS[step.key]}
                  </div>
                  {isCompleted && (
                    <span className="absolute -bottom-0.5 -right-0.5 bg-berry text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white">
                      ✓
                    </span>
                  )}
                </div>

                {/* Vertical Connector Path Line instead of horizontal rail loops */}
                {i < STEPS.length - 1 && (
                  <div className="w-1 absolute top-10 bottom-0 bg-cocoa/5 overflow-hidden rounded-full z-0">
                    {isCompleted && (
                      <div className="w-full bg-berry h-full transition-all duration-700" />
                    )}
                    {isLineActiveAndLoading && (
                      <div className="w-full h-full bg-gradient-to-b from-berry via-berry/40 to-cocoa/10 bg-[size:auto_200%] animate-[vShimmer_1.5s_infinite_linear]" />
                    )}
                    {!isReached && <div className="w-full h-0" />}
                  </div>
                )}
              </div>

              {/* Right Column: Dynamic Text Context Labels & Timestamps */}
              <div className="pt-2 pb-6 flex-1 flex items-start justify-between border-b border-cocoa/[0.03]">
                <div className="space-y-0.5">
                  <h4
                    className={`text-sm font-bold transition-colors ${isCurrent ? "text-berry" : isReached ? "text-cocoa" : "text-cocoa/40"}`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[11px] text-cocoa/50 font-medium">
                    {isCurrent
                      ? "In progress right now"
                      : isCompleted
                        ? "Task finalized successfully"
                        : "Awaiting previous kitchen tasks"}
                  </p>
                </div>
                {isReached && (
                  <span className="text-[10px] font-mono font-bold text-berry bg-berry/5 px-2 py-0.5 rounded-md">
                    {step.timeLog}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global CSS Shimmer and Particle Keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: 0 0;
          }
        }
        @keyframes vShimmer {
          0% {
            background-position: 0 200%;
          }
          100% {
            background-position: 0 0;
          }
        }
        @keyframes blast {
          0% {
            transform: scale(0.3);
            opacity: 1;
            box-shadow:
              inset 0 0 20px rgba(194, 65, 12, 0.6),
              0 0 10px rgba(194, 65, 12, 0.4);
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
            box-shadow:
              inset 0 0 0px rgba(194, 65, 12, 0),
              0 -40px 40px rgba(219, 39, 119, 0.3),
              40px 40px 40px rgba(245, 158, 11, 0.3);
          }
        }
        .confetti-explosion {
          border-radius: 50%;
          border: 2px dashed rgba(219, 39, 119, 0.4);
          animation: blast 2.5s infinite ease-out;
        }
      `}</style>
    </div>
  );
}
