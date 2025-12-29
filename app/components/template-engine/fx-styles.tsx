// app/components/template-engine/fx-styles.tsx
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
      }
      .fx-border-scan::before {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: 24px;
        padding: 1px;
        background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.25) 25%,
            rgba(255, 255, 255, 0) 50%
          )
          0% 50% / 200% 200%;
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask: linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        mask-composite: exclude;
        -webkit-mask-composite: xor;
        opacity: 0.55;
        pointer-events: none;
        animation: scanBorder 5s linear infinite;
      }

      .fx-softglow {
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.08);
      }

      @keyframes shimmer {
        0% {
          transform: translateX(-120%) skewX(-18deg);
          opacity: 0;
        }
        20% {
          opacity: 0.55;
        }
        60% {
          opacity: 0.35;
        }
        100% {
          transform: translateX(120%) skewX(-18deg);
          opacity: 0;
        }
      }
      .fx-shimmer {
        position: relative;
        overflow: hidden;
      }
      .fx-shimmer::after {
        content: "";
        position: absolute;
        top: -20%;
        left: -40%;
        width: 40%;
        height: 140%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.35),
          transparent
        );
        animation: shimmer 2.8s ease-in-out infinite;
        pointer-events: none;
      }

      ${ambient
        ? `
        /* ✅ FX AMBIENT SAFE : stacking context isolé */
        .fx-ambient {
          position: relative;
          isolation: isolate; /* clé: protège header + évite z-index qui leak */
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

      /* Reveal one-shot */
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
      }
    `}</style>
  );
}
