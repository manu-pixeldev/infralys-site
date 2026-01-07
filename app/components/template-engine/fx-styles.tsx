// app/components/template-engine/fx-styles.tsx
"use client";

import React from "react";

/**
 * FxStyles
 * - Base UI polish (divider + reveal) ALWAYS ON (même si FX désactivés)
 * - FX (ambient / border scan / shimmer) opt-in via data attrs + classes
 *
 * Notes:
 * - Pas de data-* SSR sur <html> (évite mismatch).
 * - "te-after-header" gère l'écart sous le header de manière globale.
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
  const fxEnabled = !!enabled;
  const fxAmbient = fxEnabled && !!ambient;
  const fxShimmer = fxEnabled && !!shimmer;

  return (
    <style jsx global>{`
      /* ============================================================
         GLOBAL GAP CONTROL
         ============================================================ */
      :root {
        --te-section-gap: 28px; /* espace “premium” entre header et 1ère section */
      }

      /* ============================================================
         BASE — Premium section divider (TOUJOURS)
         Usage: mettre "fx-divider" sur le wrapper de section
         Thème piloté par data-ui="dark|light" sur un parent.
         ============================================================ */

      .fx-divider {
        position: relative;
        isolation: isolate;
      }

      /* fade doux (pas une ligne brute) */
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

      /* optional: si tu as une classe te-header quelque part */
      [data-mounted="0"] .te-header {
        visibility: hidden;
      }

      /* DARK */
      [data-ui="dark"] .fx-divider::before {
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.04) 35%,
          rgba(255, 255, 255, 0) 100%
        );
      }

      /* LIGHT */
      [data-ui="light"] .fx-divider::before {
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.06),
          rgba(0, 0, 0, 0.025) 35%,
          rgba(0, 0, 0, 0) 100%
        );
      }

      /* ============================================================
         AFTER HEADER SPACING (global)
         ============================================================ */
      .te-after-header {
        margin-top: var(--te-section-gap);
      }

      /* ============================================================
         BASE — Reveal (scroll)
         IMPORTANT:
         - On ne cache JAMAIS "par défaut" sans attribut => évite page qui disparaît au refresh.
         - Seul data-reveal="pending" cache.
         ============================================================ */

      .reveal {
        will-change: opacity, transform;
        transition: opacity 520ms ease, transform 520ms ease;
      }

      /* hidden state */
      .reveal[data-reveal="pending"] {
        opacity: 0;
        transform: translateY(14px);
      }

      /* visible state (compat ancienne + nouvelle) */
      .reveal.is-in,
      .reveal[data-reveal="in"] {
        opacity: 1;
        transform: translateY(0);
      }

      /* ============================================================
         FX — Border scan / Softglow (injectés seulement si enabled)
         ============================================================ */
      ${fxEnabled
        ? `
      @keyframes scanBorder {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }

      .fx-border-scan {
        position: relative;
        isolation: isolate;

        /* defaults (DARK) */
        --fx-scan-opacity: 0.65;
        --fx-scan-speed: 5.4s;
        --fx-scan-a: 0.7;
        --fx-scan-blend: screen;

        --fx-scan-r: 255;
        --fx-scan-g: 255;
        --fx-scan-b: 255;
      }

      /* LIGHT: scan noir => visible sur fond clair */
      [data-ui="light"] .fx-border-scan {
        --fx-scan-opacity: 0.38;
        --fx-scan-a: 0.55;
        --fx-scan-blend: multiply;

        --fx-scan-r: 0;
        --fx-scan-g: 0;
        --fx-scan-b: 0;
      }

      /* la ligne animée (1px) */
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
            rgba(var(--fx-scan-r), var(--fx-scan-g), var(--fx-scan-b), var(--fx-scan-a)) 25%,
            rgba(var(--fx-scan-r), var(--fx-scan-g), var(--fx-scan-b), 0) 50%
          )
          0% 50% / 200% 200%;

        mix-blend-mode: var(--fx-scan-blend);
        opacity: var(--fx-scan-opacity);
        animation: scanBorder var(--fx-scan-speed) linear infinite;
        will-change: background-position;
      }

      .fx-softglow {
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.08);
      }
      `
        : ``}

      /* ============================================================
         FX — Shimmer CTA (injecté seulement si enabled && shimmer)
         ============================================================ */
      ${fxShimmer
        ? `
      @keyframes fxCtaShimmer {
        0% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
        28% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
        36% { opacity: 0.55; }
        56% { opacity: 0.28; }
        68% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
        100% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
      }

      .fx-cta,
      .fx-shimmer-cta {
        position: relative;
        overflow: hidden;
        isolation: isolate;

        --fx-cta-shimmer-dur: 5200ms;
        --fx-cta-shimmer-ease: ease-in-out;

        /* DARK defaults */
        --fx-cta-a1: 0.18;
        --fx-cta-a2: 0.55;

        --fx-cta-blend: screen;
        --fx-cta-blur: 0.45px;
      }

      /* LIGHT: un peu plus visible */
      [data-ui="light"] .fx-cta,
      [data-ui="light"] .fx-shimmer-cta {
        --fx-cta-a1: 0.16;
        --fx-cta-a2: 0.34;
        --fx-cta-blend: soft-light;
        --fx-cta-blur: 0.6px;
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
        will-change: transform, opacity;
      }

      /* 3 passes puis stop */
      [data-fx-shimmer="1"] .fx-cta::after,
      [data-fx-shimmer="1"] .fx-shimmer-cta::after {
        animation: fxCtaShimmer var(--fx-cta-shimmer-dur) var(--fx-cta-shimmer-ease) 0s 3 both;
      }

      /* Loop only when explicitly requested */
      [data-fx-shimmer="1"] .fx-cta.fx-cta-loop::after,
      [data-fx-shimmer="1"] .fx-shimmer-cta.fx-cta-loop::after {
        animation-iteration-count: infinite;
      }
      `
        : ``}

      /* ============================================================
         FX — Ambient (injecté seulement si enabled && ambient)
         ============================================================ */
      ${fxAmbient
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
