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
if (!enabled) return null;

return (
<style jsx global>{`
/_ ============================================================
DIVIDER BASE (always)
============================================================ _/
.fx-divider {
position: relative;
isolation: isolate;
overflow: visible;
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
         BORDER SCAN — ULTIMATE PREMIUM
         - Rare, not constant
         - Above content (z-index)
         - Direction: default L→R
         ============================================================ */

      /* Direction control:
         1  = L→R
         -1 = R→L
      */
      .fx-border-scan {
        --fx-scan-dir: 1;

        /* cadence premium */
        --fx-scan-dur: 1650ms;     /* durée du passage */
        --fx-scan-gap: 8600ms;     /* temps “off” entre passes */
        --fx-scan-ease: cubic-bezier(0.2, 0.7, 0.2, 1);

        /* rendu */
        --fx-scan-h: 2px;
        --fx-scan-blur: 0.55px;

        /* dark (blanc subtil) */
        --fx-scan-o: 0.55;
        --fx-scan-core: 0.65;
        --fx-scan-halo: 0.22;

        --fx-scan-r: 255;
        --fx-scan-g: 255;
        --fx-scan-b: 255;
        --fx-scan-blend: screen;
      }

      /* light (noir ultra soft) */
      [data-ui="light"] .fx-border-scan {
        --fx-scan-o: 0.45;
        --fx-scan-core: 0.32;
        --fx-scan-halo: 0.14;

        --fx-scan-r: 0;
        --fx-scan-g: 0;
        --fx-scan-b: 0;
        --fx-scan-blend: multiply;
      }

      @keyframes teScanPremium {
        0% {
          transform: translateX(calc(var(--fx-scan-dir) * -130%));
          opacity: 0;
        }
        10% {
          opacity: var(--fx-scan-o);
        }
        90% {
          opacity: var(--fx-scan-o);
        }
        100% {
          transform: translateX(calc(var(--fx-scan-dir) * 130%));
          opacity: 0;
        }
      }

      @keyframes teScanLoopWithGap {
        0% {
          transform: translateX(calc(var(--fx-scan-dir) * -130%));
          opacity: 0;
        }
        6% {
          opacity: var(--fx-scan-o);
        }
        16% {
          transform: translateX(calc(var(--fx-scan-dir) * 130%));
          opacity: 0;
        }
        100% {
          transform: translateX(calc(var(--fx-scan-dir) * 130%));
          opacity: 0;
        }
      }

      /* ✅ important: apply on wrapper, above children */
      .fx-border-scan::after {
        content: "";
        position: absolute;
        top: 0;
        left: -25%;
        width: 150%;
        height: var(--fx-scan-h);

        pointer-events: none;
        z-index: 5;

        background: linear-gradient(
          90deg,
          rgba(var(--fx-scan-r), var(--fx-scan-g), var(--fx-scan-b), 0) 0%,
          rgba(var(--fx-scan-r), var(--fx-scan-g), var(--fx-scan-b), var(--fx-scan-halo))
            42%,
          rgba(var(--fx-scan-r), var(--fx-scan-g), var(--fx-scan-b), var(--fx-scan-core))
            50%,
          rgba(var(--fx-scan-r), var(--fx-scan-g), var(--fx-scan-b), var(--fx-scan-halo))
            58%,
          rgba(var(--fx-scan-r), var(--fx-scan-g), var(--fx-scan-b), 0) 100%
        );

        mix-blend-mode: var(--fx-scan-blend);
        filter: blur(var(--fx-scan-blur));

        transform: translateX(calc(var(--fx-scan-dir) * -130%));
        opacity: 0;

        /* loop rare */
        animation: teScanLoopWithGap
          calc(var(--fx-scan-dur) + var(--fx-scan-gap))
          var(--fx-scan-ease)
          infinite;
      }

      /* Option: si tu veux le scan R→L sur certaines sections :
         ajoute className "fx-scan-rtl" sur le wrapper */
      .fx-border-scan.fx-scan-rtl {
        --fx-scan-dir: -1;
      }

      /* Stop when tab inactive (premium polish) */
      @media (prefers-reduced-motion: reduce) {
        /* Reveal/shimmer off, mais scan ok (non agressif) */
        .fx-cta::after,
        .fx-shimmer-cta::after {
          animation: none !important;
        }
      }
    `}</style>

);
}
