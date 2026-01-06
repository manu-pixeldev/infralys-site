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
  shimmer?: boolean; // ✅ master ON/OFF (data-fx-shimmer)
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
         SHIMMER CTA — CANONIQUE (premium)
         - Opt-in via .fx-cta (ou legacy alias .fx-shimmer-cta)
         - Master switch via [data-fx-shimmer="${shimmerOn}"]
         - DEFAULT: 3 passes puis stop ✅
         - Loop ONLY if you add: .fx-cta-loop ✅
         - Options:
            .fx-cta-lg     => plus lent (gros boutons)
            .fx-cta-ultra  => plus subtil
            .fx-cta-once   => ne joue que si .fx-cta-play est présent (first view)
         ============================================================ */

      @keyframes fxCtaShimmer {
        /* pause OFFSCREEN */
        0% {
          transform: translateX(-140%) skewX(-18deg);
          opacity: 0;
        }
        28% {
          transform: translateX(-140%) skewX(-18deg);
          opacity: 0;
        }

        /* sweep */
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

        /* pause ON THE RIGHT */
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

        /* defaults (premium) */
        --fx-cta-shimmer-dur: 5200ms;
        --fx-cta-shimmer-ease: ease-in-out;

        /* intensity */
        --fx-cta-a1: 0.18;
        --fx-cta-a2: 0.55;
      }

      /* CTA large => plus lent */
      .fx-cta-lg {
        --fx-cta-shimmer-dur: 9800ms;
      }

      /* Ultra luxe => plus subtil */
      .fx-cta-ultra {
        --fx-cta-a1: 0.12;
        --fx-cta-a2: 0.38;
        filter: saturate(0.98);
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

        mix-blend-mode: screen;
        filter: blur(0.4px);

        pointer-events: none;
        z-index: 2;

        /* OFF by default */
        opacity: 0;
        transform: translateX(-140%) skewX(-18deg);
      }

      /* ===== PLAY RULES =====
         DEFAULT: 3 passes then stop ✅
         Loop ONLY if .fx-cta-loop is present ✅
         If .fx-cta-once is present: only plays when .fx-cta-play is also present
      */

      /* Standard play (master switch) => 3x by default */
      [data-fx-shimmer="1"] .fx-cta::after,
      [data-fx-shimmer="1"] .fx-shimmer-cta::after {
        animation-name: fxCtaShimmer;
        animation-duration: var(--fx-cta-shimmer-dur);
        animation-timing-function: var(--fx-cta-shimmer-ease);
        animation-iteration-count: 3; /* ✅ default premium */
      }

      /* Loop only when explicitly requested */
      [data-fx-shimmer="1"] .fx-cta.fx-cta-loop::after,
      [data-fx-shimmer="1"] .fx-shimmer-cta.fx-cta-loop::after {
        animation-iteration-count: infinite;
      }

      /* First-view mode: stop by default */
      [data-fx-shimmer="1"] .fx-cta.fx-cta-once::after,
      [data-fx-shimmer="1"] .fx-shimmer-cta.fx-cta-once::after {
        animation: none;
      }

      /* First-view mode: play only when .fx-cta-play is added */
      [data-fx-shimmer="1"] .fx-cta.fx-cta-once.fx-cta-play::after,
      [data-fx-shimmer="1"] .fx-shimmer-cta.fx-cta-once.fx-cta-play::after {
        animation-name: fxCtaShimmer;
        animation-duration: var(--fx-cta-shimmer-dur);
        animation-timing-function: var(--fx-cta-shimmer-ease);
        animation-iteration-count: 3; /* ✅ still 3 passes */
      }

      /* ============================================================
         Optional wrapper shimmer (rare)
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
          rgba(255, 255, 255, 0.28) 35%,
          rgba(255, 255, 255, 0.45) 50%,
          rgba(255, 255, 255, 0.28) 65%,
          transparent 100%
        );
        mix-blend-mode: overlay;
        filter: blur(0.4px);
        animation: fxCtaShimmer 5200ms ease-in-out infinite;
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
