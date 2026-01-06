"use client";

import React from "react";

/**
 * FxStyles
 * - Base UI polish (divider + reveal) ALWAYS ON
 * - FX opt-in via data attrs + classes
 *
 * DATA FLAGS (set by app/layout.tsx script):
 * - html[data-reveal-ready="1"]  -> reveal system allowed
 * - html[data-reveal-skip="1"]   -> disables pending hide for 1 frame after refresh mid-scroll
 */
export function FxStyles({
  enabled,
  ambient,
  shimmer,
}: {
  enabled: boolean;
  ambient: boolean;
  shimmer?: boolean;
}) {
  return (
    <style jsx global>{`
      /* ============================================================
         BASE — Premium section divider (TOUJOURS)
         ============================================================ */

      .fx-divider {
        position: relative;
        isolation: isolate;
      }

      .fx-divider::before {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 26px;
        pointer-events: none;
        z-index: 1;
        opacity: 1;
      }

      [data-ui="dark"] .fx-divider::before {
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.04) 35%,
          rgba(255, 255, 255, 0) 100%
        );
      }

      [data-ui="light"] .fx-divider::before {
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.06),
          rgba(0, 0, 0, 0.025) 35%,
          rgba(0, 0, 0, 0) 100%
        );
      }

      /* ============================================================
         FX — Border scan (OPTIONNEL)
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

        --fx-scan-opacity: 0.65;
        --fx-scan-speed: 5.4s;
        --fx-scan-a: 0.7;
        --fx-scan-blend: screen;

        --fx-scan-r: 255;
        --fx-scan-g: 255;
        --fx-scan-b: 255;
      }

      [data-ui="light"] .fx-border-scan {
        --fx-scan-opacity: 0.38;
        --fx-scan-a: 0.55;
        --fx-scan-blend: multiply;

        --fx-scan-r: 0;
        --fx-scan-g: 0;
        --fx-scan-b: 0;
      }

      /* ✅ IMPORTANT: uniquement ::after pour le scan (évite double-ligne). */
      [data-fx-enabled="1"] .fx-border-scan.fx-divider::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 1px;
        pointer-events: none;
        z-index: 2;

        background: linear-gradient(
            90deg,
            rgba(var(--fx-scan-r), var(--fx-scan-g), var(--fx-scan-b), 0) 0%,
            rgba(
                var(--fx-scan-r),
                var(--fx-scan-g),
                var(--fx-scan-b),
                var(--fx-scan-a)
              )
              25%,
            rgba(var(--fx-scan-r), var(--fx-scan-g), var(--fx-scan-b), 0) 50%
          )
          0% 50% / 200% 200%;

        mix-blend-mode: var(--fx-scan-blend);
        opacity: var(--fx-scan-opacity);
        animation: scanBorder var(--fx-scan-speed) linear infinite;
      }

      /* ============================================================
         FX — Soft glow (OPTIONNEL)
         ============================================================ */
      .fx-softglow {
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.08);
      }

      /* ============================================================
         FX — Shimmer CTA (OPTIONNEL)
         ============================================================ */

      @keyframes fxCtaShimmer {
        0% {
          transform: translateX(-140%) skewX(-18deg);
          opacity: 0;
        }
        28% {
          transform: translateX(-140%) skewX(-18deg);
          opacity: 0;
        }
        36% {
          opacity: 0.55;
        }
        56% {
          opacity: 0.28;
        }
        68% {
          transform: translateX(140%) skewX(-18deg);
          opacity: 0;
        }
        100% {
          transform: translateX(140%) skewX(-18deg);
          opacity: 0;
        }
      }

      .fx-cta,
      .fx-shimmer-cta {
        position: relative;
        overflow: hidden;
        isolation: isolate;

        --fx-cta-shimmer-dur: 5200ms;
        --fx-cta-shimmer-ease: ease-in-out;

        --fx-cta-a1: 0.18;
        --fx-cta-a2: 0.55;

        --fx-cta-blend: screen;
        --fx-cta-blur: 0.4px;
      }

      .fx-cta::after,
      .fx-shimmer-cta::after {
        content: "";
        position: absolute;
        top: -35%;
        left: -70%;
        width: 70%;
        height: 170%;

        background: linear-gradient(
          110deg,
          transparent 0%,
          rgba(255, 255, 255, var(--fx-cta-a1)) 35%,
          rgba(255, 255, 255, var(--fx-cta-a2)) 50%,
          rgba(255, 255, 255, var(--fx-cta-a1)) 65%,
          transparent 100%
        );

        mix-blend-mode: var(--fx-cta-blend);
        filter: blur(var(--fx-cta-blur));

        pointer-events: none;
        z-index: 2;

        opacity: 0;
        transform: translateX(-140%) skewX(-18deg);
      }

      [data-ui="light"] .fx-cta,
      [data-ui="light"] .fx-shimmer-cta {
        --fx-cta-a1: 0.12;
        --fx-cta-a2: 0.26;
        --fx-cta-blend: soft-light;
        --fx-cta-blur: 0.6px;
      }

      [data-fx-shimmer="1"] .fx-cta::after,
      [data-fx-shimmer="1"] .fx-shimmer-cta::after {
        animation-name: fxCtaShimmer;
        animation-duration: var(--fx-cta-shimmer-dur);
        animation-timing-function: var(--fx-cta-shimmer-ease);
        animation-iteration-count: 3;
      }

      /* ============================================================
         FX — Ambient (OPTIONNEL)
         ============================================================ */
      ${ambient
        ? `
      [data-fx-enabled="1"] .fx-ambient {
        position: relative;
        isolation: isolate;
        overflow: hidden;
      }
      [data-fx-enabled="1"] .fx-ambient::before {
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
         BASE — Reveal one-shot (smooth)
         ============================================================ */

      .reveal {
        will-change: opacity, transform;
        transition: opacity 520ms ease, transform 520ms ease;
      }

      /* hidden state (set by JS: dataset.reveal="pending") */
      .reveal[data-reveal="pending"] {
        opacity: 0;
        transform: translateY(14px);
      }

      /* ✅ Boot protection: on refresh mid-scroll, don't hide pending for 1 frame => no jumps */
      html[data-reveal-skip="1"] .reveal[data-reveal="pending"] {
        opacity: 1;
        transform: none;
      }

      /* visible state => KEEP transition (no snap) */
      .reveal.is-in {
        opacity: 1;
        transform: translateY(0);
      }

      /* after finish: reduce paint cost */
      .reveal.reveal-done {
        will-change: auto;
      }

      @media (prefers-reduced-motion: reduce) {
        .reveal,
        .reveal[data-reveal="pending"] {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }

        .fx-border-scan.fx-divider::after,
        .fx-cta::after,
        .fx-shimmer-cta::after {
          animation: none !important;
        }
      }
    `}</style>
  );
}
