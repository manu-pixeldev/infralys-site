"use client";

import React from "react";

/** FX styles (global) */
export function FxStyles({
  enabled,
  ambient,
}: {
  enabled: boolean;
  ambient: boolean;
}) {
  if (!enabled) return null;

  return (
    <style jsx global>{`
      /* ============================================================
         BORDER SCAN (needs .fx-border-scan on wrapper)
         ============================================================ */
      @keyframes scanBorder {
        0% {
          background-position: 0% 50%;
        }
        100% {
          background-position: 200% 50%;
        }
      }

      .fx-border-scan {
        position: relative;
        isolation: isolate;
      }

      .fx-border-scan::before {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        padding: 1px;

        background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.55) 25%,
            rgba(255, 255, 255, 0) 50%
          )
          0% 50% / 200% 200%;

        mix-blend-mode: screen;

        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask: linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        mask-composite: exclude;
        -webkit-mask-composite: xor;

        opacity: 0.75;
        pointer-events: none;
        animation: scanBorder 4.2s linear infinite;
        z-index: 2;
      }

      /* ============================================================
         SOFT GLOW
         ============================================================ */
      .fx-softglow {
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.08);
      }

      /* ============================================================
         SHIMMER CTA (OPT-IN ONLY)
         - No longer applied to whole wrappers.
         - Apply class .fx-cta on buttons/CTAs.
         ============================================================ */
      @keyframes shimmer {
        0% {
          transform: translateX(-140%) skewX(-18deg);
          opacity: 0;
        }
        18% {
          opacity: 0.55;
        }
        60% {
          opacity: 0.28;
        }
        100% {
          transform: translateX(140%) skewX(-18deg);
          opacity: 0;
        }
      }

      /* opt-in target */
      .fx-cta {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }
      .fx-cta::after {
        content: "";
        position: absolute;
        top: -35%;
        left: -55%;
        width: 55%;
        height: 170%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.55),
          transparent
        );
        pointer-events: none;
        z-index: 2;
        animation: shimmer 2.8s ease-in-out infinite;
      }

      /* if you still want wrappers to shimmer, keep this alias
         BUT it will not be auto-added anymore by TemplateEngine */
      .fx-shimmer,
      .fx-shimmer-cta {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }
      .fx-shimmer::after,
      .fx-shimmer-cta::after {
        content: "";
        position: absolute;
        top: -35%;
        left: -55%;
        width: 55%;
        height: 170%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.55),
          transparent
        );
        animation: shimmer 2.8s ease-in-out infinite;
        pointer-events: none;
        z-index: 2;
      }

      /* ============================================================
         AMBIENT
         ============================================================ */
      ${ambient
        ? `
        .fx-ambient {
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }
        .fx-ambient::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: -1;
          background:
            radial-gradient(circle at 20% 20%, rgba(0,0,0,0.06), transparent 40%),
            radial-gradient(circle at 80% 10%, rgba(0,0,0,0.05), transparent 45%),
            radial-gradient(circle at 60% 90%, rgba(0,0,0,0.04), transparent 50%);
        }
      `
        : ``}

      /* ============================================================
         Reveal one-shot
         ============================================================ */
      .reveal {
        will-change: opacity, transform;
        transition: opacity 520ms ease, transform 520ms ease;
      }
      .reveal[data-reveal="pending"] {
        opacity: 0;
        transform: translateY(14px);
      }
      .reveal.is-in {
        opacity: 1;
        transform: translateY(0);
      }

      @media (prefers-reduced-motion: reduce) {
        .reveal,
        .reveal[data-reveal="pending"] {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
        .fx-border-scan::before,
        .fx-shimmer::after,
        .fx-shimmer-cta::after,
        .fx-cta::after {
          animation: none !important;
        }
      }
    `}</style>
  );
}
