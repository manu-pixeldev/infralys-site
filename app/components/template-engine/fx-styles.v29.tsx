// app/components/template-engine/fx-styles.tsx
"use client";

import React from "react";

export function FxStyles({
  enabled,
  ambient,
  shimmer,
}: {
  enabled: boolean;
  ambient: boolean;
  shimmer?: boolean;
}) {
  const fxEnabled = !!enabled;
  const fxShimmer = fxEnabled && !!shimmer;

  return (
    <style jsx global>{`
      /* ============================================================
         Divider + BorderScan anchor (te-sep + fx-rail)
         ============================================================ */

      .ui-divider {
        position: relative;
      }

      /* ✅ the real separator line */
      .ui-divider > .te-sep {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 1px;
        pointer-events: none;
        opacity: 1;
        background: linear-gradient(
          to right,
          transparent,
          rgba(0, 0, 0, 0.1),
          transparent
        );
      }

      /* dark line */
      [data-ui="dark"] .ui-divider > .te-sep {
        background: linear-gradient(
          to right,
          transparent,
          rgba(255, 255, 255, 0.1),
          transparent
        );
      }

      /* ✅ scan rail pinned EXACTLY on the same y (top:0) */
      .ui-divider > .fx-rail {
        position: absolute;
        left: 0;
        right: 0;
        top: 0; /* IMPORTANT: same as te-sep */
        height: 1px;
        pointer-events: none;
        overflow: hidden;
        opacity: 1;
      }

      /* The moving highlight */
      .ui-divider > .fx-rail::before {
        content: "";
        position: absolute;
        top: -6px;
        height: 13px;
        width: 220px;

        /* ✅ start OUTSIDE right, move to OUTSIDE left (premium) */
        left: 100%;
        transform: translateX(40%);

        background: radial-gradient(
          closest-side,
          rgba(255, 255, 255, 0.55),
          rgba(255, 255, 255, 0.16) 55%,
          transparent 75%
        );
        filter: blur(0.2px);

        opacity: 0.95;
        animation: te-border-scan 3.6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        will-change: transform;
      }

      [data-ui="light"] .ui-divider > .fx-rail::before {
        background: radial-gradient(
          closest-side,
          rgba(0, 0, 0, 0.28),
          rgba(0, 0, 0, 0.1) 55%,
          transparent 75%
        );
        opacity: 0.55; /* light: subtle */
      }

      /* only when scan enabled */
      .ui-divider[data-scan="off"] > .fx-rail {
        display: none;
      }

      @keyframes te-border-scan {
        0% {
          transform: translateX(40%);
        }
        58% {
          transform: translateX(-140vw);
        }
        100% {
          transform: translateX(-140vw);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-divider > .fx-rail::before {
          animation: none;
          opacity: 0;
        }
      }

      /* ============================================================
         Shimmer CTA (gated by data-fx-shimmer + fx-cta class)
         ============================================================ */

      .fx-cta {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }

      /* IMPORTANT: only when enabled */
      [data-fx-shimmer="1"] .fx-cta::after {
        content: "";
        position: absolute;
        inset: -70%;
        pointer-events: none;

        background: linear-gradient(
          120deg,
          transparent 38%,
          rgba(255, 255, 255, 0.28),
          transparent 62%
        );

        transform: translateX(-140%) rotate(0.001deg);
        animation: te-shimmer 5.2s ease-in-out infinite;
        mix-blend-mode: soft-light;
        opacity: 0.45;
      }

      @keyframes te-shimmer {
        0% {
          transform: translateX(-140%) rotate(0.001deg);
        }
        52% {
          transform: translateX(140%) rotate(0.001deg);
        }
        100% {
          transform: translateX(140%) rotate(0.001deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        [data-fx-shimmer="1"] .fx-cta::after {
          animation: none;
          opacity: 0;
        }
      }
    `}</style>
  );
}
