"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

// global-error replaces the root layout when it fires, so it can't rely on
// ThemeProvider/tokens.ts (those live inside the layout it's replacing) —
// styling is inlined and defaults to the dark palette used across the app.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout error boundary caught an error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#0f0f12",
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            background: "#18181B",
            border: "1px solid #2E2E34",
            borderRadius: "10px",
            padding: "2rem",
            maxWidth: "28rem",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              margin: "0 auto 1rem",
              width: "3rem",
              height: "3rem",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(212,175,55,0.12)",
            }}
          >
            <span style={{ color: "#D4AF37", fontSize: "1.5rem" }}>!</span>
          </div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#6B7280", marginBottom: "1.5rem" }}>
            The app hit a snag loading. You can try again, or reload the page if the problem
            sticks around.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0 0.75rem",
                height: "2rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "8px",
                border: "1px solid rgba(212,175,55,0.9)",
                background: "rgba(212,175,55,0.9)",
                color: "#111",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: "0 0.75rem",
                height: "2rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "8px",
                border: "1px solid #2E2E34",
                background: "transparent",
                color: "#FFFFFF",
                cursor: "pointer",
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
