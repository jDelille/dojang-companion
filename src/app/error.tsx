"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";
import { BORDER, BTN_GHOST, BTN_PRIMARY, RADIUS, SURFACE, TEXT, TEXT_MUTED } from "@/components/common/tokens";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error boundary caught an error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className={`${SURFACE} border ${BORDER} ${RADIUS} p-6 sm:p-8 max-w-md w-full text-center`}>
        <div className="mx-auto mb-4 flex items-center justify-center size-12 rounded-full bg-[rgba(var(--gold-rgb),0.12)]">
          <AlertTriangle className="size-6 text-[var(--gold)]" aria-hidden="true" />
        </div>
        <h2 className={`text-lg font-bold mb-2 ${TEXT}`}>Something went wrong</h2>
        <p className={`text-sm mb-6 ${TEXT_MUTED}`}>
          This part of the page hit a snag. You can try again, or reload the page if the problem
          sticks around.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <button type="button" onClick={() => reset()} className={BTN_PRIMARY}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={BTN_GHOST}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}
