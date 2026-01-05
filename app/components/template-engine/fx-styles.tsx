"use client";

import React from "react";

/** FX styles (global) */
export function FxStyles({
  enabled,
  ambient,
  shimmer,
}: {
  enabled: boolean;
  ambient: boolean;
  shimmer?: boolean; // ✅ pilotage shimmer CTA
}) {
  if (!enabled) return null;

  const shimmerOn = shimmer ? "1" : "0";

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

        /* 🔧 TEST BORDER-SCAN: brightness + speed */
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
         - Apply class .fx-cta on buttons/CTAs.
         - Legacy alias .fx-shimmer-cta is unified to same behavior.
         - Global ON/OFF via [data-fx-shimmer="${shimmerOn}"].
         ============================================================ */

      /* pause + sweep + pause (premium) */
      @keyframes fxCtaShimmer {
        /* pause OFFSCREEN (longue) */
        0% {
          transform: translateX(-140%) skewX(-18deg);
          opacity: 0;
        }
        28% {
          transform: translateX(-140%) skewX(-18deg);
          opacity: 0;
        }

        /* sweep (smooth) */
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

        /* pause ON THE RIGHT (longue) */
        100% {
          transform: translateX(140%) skewX(-18deg);
          opacity: 0;
        }
      }

      /* ✅ One source of truth */
      .fx-cta,
      .fx-shimmer-cta {
        position: relative;
        overflow: hidden;
        isolation: isolate;

        /* defaults (override per button with modifiers) */
        --fx-cta-shimmer-dur: 5200ms; /* default premium */
        --fx-cta-shimmer-ease: ease-in-out;

        /* micro perf */
        will-change: transform;
      }

      /* CTA large (full width / gros boutons) => plus lent */
      .fx-cta-lg {
        --fx-cta-shimmer-dur: 9800ms; /* 👈 luxe */
      }

      /* Ultra-luxe: un peu plus “soyeux” (optionnel) */
      .fx-cta-luxe {
        --fx-cta-shimmer-ease: cubic-bezier(0.25, 0.8, 0.25, 1);
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
          rgba(255, 255, 255, 0.18) 35%,
          rgba(255, 255, 255, 0.55) 50%,
          rgba(255, 255, 255, 0.18) 65%,
          transparent 100%
        );

        mix-blend-mode: screen; /* 🔑 lisible sur gradients */
        filter: blur(0.4px);

        pointer-events: none;
        z-index: 2;

        /* OFF by default */
        opacity: 0;
        transform: translateX(-140%) skewX(-18deg);

        /* perf */
        will-change: transform, opacity;
      }

      /* ✅ Shimmer ON (global switch) */
      [data-fx-shimmer="1"] .fx-cta::after,
      [data-fx-shimmer="1"] .fx-shimmer-cta::after {
        animation-name: fxCtaShimmer;
        animation-duration: var(--fx-cta-shimmer-dur);
        animation-timing-function: var(--fx-cta-shimmer-ease);
        animation-iteration-count: infinite;

        /* smoother & no “jump” */
        animation-fill-mode: both;
      }

      /* ✅ Ultra luxe: 3 passes puis stop */
      [data-fx-shimmer="1"] .fx-cta.fx-cta-3x::after,
      [data-fx-shimmer="1"] .fx-shimmer-cta.fx-cta-3x::after {
        animation-iteration-count: 3;
      }

      /* ============================================================
         If you still want wrappers to shimmer sometimes
         ============================================================ */
      .fx-shimmer {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }

      .fx-shimmer::after {
        content: "";
        position: absolute;
        top: -35%;
        left: -70%;
        width: 70%;
        height: 170%;
        background: linear-gradient(
          110deg,
          transparent 0%,
          rgba(255, 255, 255, 0.35) 35%,
          rgba(255, 255, 255, 0.55) 50%,
          rgba(255, 255, 255, 0.35) 65%,
          transparent 100%
        );
        mix-blend-mode: overlay;
        filter: blur(0.4px);
        animation: fxCtaShimmer 4200ms ease-in-out infinite;
        animation-fill-mode: both;
        pointer-events: none;
        z-index: 2;
        will-change: transform, opacity;
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
