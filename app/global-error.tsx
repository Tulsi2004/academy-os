"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffcf9",
          fontFamily:
            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          padding: "1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            borderRadius: "1.25rem",
            border: "1px solid #ece3f7",
            background: "#ffffff",
            padding: "1.5rem",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "#241b3a",
              fontFamily:
                "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            Academy OS hit a snag
          </h2>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#6b6280" }}>
            {error.message || "The application failed to load."}
          </p>
          {error.digest && (
            <p style={{ marginTop: "0.5rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#9c92b3" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.25rem",
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "999px",
              background: "#6754bd",
              color: "#ffffff",
              border: "none",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              fontFamily:
                "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
