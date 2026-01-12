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
  const fxAmbient = fxEnabled && !!ambient;
  const fxShimmer = fxEnabled && !!shimmer;

  return (
    <style jsx global>{`
      :root {
        --header-offset: 84px;

        /* reveal */
        --reveal-y: 14px;
        --reveal-dur: 520ms;
        --reveal-ease: cubic-bezier(0.2, 0.8, 0.2, 1);

        /* divider + scan */
        --divider-h: 1px;
        --scan-h: 2px;
        --scan-dur: 1400ms;
        --scan-glow: 0.55;

        /* divider palette fallback (if theme vars missing) */
        --te-surface-border-fallback: rgba(0, 0, 0, 0.18);
        --te-surface-border-fallback-dark: rgba(255, 255, 255, 0.14);
      }

      /* ==========================================================
         Reveal system (NO JUMP on refresh)
         - Before data-reveal-ready: visible, no transition
         - After ready: .reveal animates when .is-in toggled
         ========================================================== */

      .reveal {
        opacity: 1;
        transform: none;
        filter: none;
        will-change: transform, opacity, filter;
      }

      html[data-reveal-ready="1"] .reveal {
        opacity: 0;
        transform: translate3d(0, var(--reveal-y), 0);
        filter: blur(0.2px);
        transition: transform var(--reveal-dur) var(--reveal-ease),
          opacity var(--reveal-dur) var(--reveal-ease),
          filter var(--reveal-dur) var(--reveal-ease);
      }

      html[data-reveal-ready="1"] .reveal.is-in {
        opacity: 1;
        transform: translate3d(0, 0, 0);
        filter: none;
      }

      @media (prefers-reduced-motion: reduce) {
        html[data-reveal-ready="1"] .reveal {
          transition: none !important;
          opacity: 1 !important;
          transform: none !important;
          filter: none !important;
        }
      }

      /* ==========================================================
         Divider BETWEEN sections (ALWAYS ON)
         - attach class "te-divider" on the wrapper (or reveal wrapper)
         - uses --te-surface-border when present, with light/dark fallback
         ========================================================== */

      .te-divider {
        position: relative;
      }

      /* default (light-ish fallback) */
      .te-divider::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;

        /* line at the top of the block (between sections) */
        top: 0;

        height: var(--divider-h);
        pointer-events: none;
        opacity: 0.78;
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(
            in srgb,
            var(--te-surface-border, var(--te-surface-border-fallback)) 70%,
            transparent
          ),
          transparent
        );
      }

      /* dark fallback (if you set data-theme="dark" on .template-engine) */
      .template-engine[data-theme="dark"] .te-divider::after {
        opacity: 0.72;
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(
            in srgb,
            var(--te-surface-border, var(--te-surface-border-fallback-dark)) 75%,
            transparent
          ),
          transparent
        );
      }

      /* avoid line before very first section wrapper (optional, safe) */
      .min-h-screen > .te-divider:first-child::after {
        opacity: 0;
      }

      /* ==========================================================
         Ambient subtle glow (optional)
         ========================================================== */

      ${fxAmbient
        ? `
      .fx-softglow { position: relative; }
      .fx-softglow::before{
        content:"";
        position:absolute;
        inset:-14px;
        pointer-events:none;
        border-radius:inherit;
        opacity:0.18;
        filter:blur(18px);
        background: radial-gradient(closest-side, rgba(255,255,255,0.55), transparent 70%);
      }
      .template-engine[data-theme="dark"] .fx-softglow::before{
        opacity:0.14;
        background: radial-gradient(closest-side, rgba(255,255,255,0.35), transparent 70%);
      }
      `
        : ``}

      /* ==========================================================
         Border scan (optional) - plays on entrance
         - attach class "fx-border-scan" on same wrapper as "reveal"
         - IMPORTANT: we draw it on top edge to align with divider
         ========================================================== */

      ${fxEnabled
        ? `
      .fx-border-scan { position: relative; }

      .fx-border-scan::before{
        content:"";
        position:absolute;
        left: 0;

        /* align to divider top edge */
        top: 0;

        width: 220px;
        height: var(--scan-h);
        pointer-events:none;
        opacity:0;
        filter: blur(0.25px);
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255,255,255,var(--scan-glow)),
          transparent
        );

        /* start at right, sweep to left */
        transform: translateX(110%);
      }

      html[data-reveal-ready="1"] .reveal.is-in.fx-border-scan::before{
        opacity:1;
        animation: te-scan var(--scan-dur) ease-out 1;
      }

      @keyframes te-scan{
        0%{ transform: translateX(110%); opacity:0; }
        12%{ opacity:1; }
        100%{ transform: translateX(-30%); opacity:0; }
      }

      @media (prefers-reduced-motion: reduce){
        .fx-border-scan::before{
          display:none !important;
        }
      }
      `
        : ``}

      /* ==========================================================
         Shimmer CTA (optional)
         Apply ONLY with class .fx-cta
         ========================================================== */

      ${fxShimmer
        ? `
      .fx-cta{
        position:relative;
        isolation:isolate;
      }

      .fx-cta::after{
        content:"";
        position:absolute;
        inset:-2px;
        pointer-events:none;
        border-radius:inherit;
        opacity:0;
        background: linear-gradient(
          120deg,
          transparent 0%,
          rgba(255,255,255,0.55) 15%,
          rgba(255,255,255,0.08) 35%,
          transparent 55%
        );
        transform: translateX(-140%);
      }

      .fx-cta:hover::after{
        opacity:1;
        animation: te-shimmer 1100ms cubic-bezier(0.2,0.8,0.2,1) 1;
      }

      @keyframes te-shimmer{
        0%{ transform:translateX(-140%); opacity:0; }
        15%{ opacity:1; }
        100%{ transform:translateX(140%); opacity:0; }
      }

      @media (prefers-reduced-motion: reduce){
        .fx-cta::after{ display:none !important; }
      }
      `
        : ``}
    `}</style>
  );
}
