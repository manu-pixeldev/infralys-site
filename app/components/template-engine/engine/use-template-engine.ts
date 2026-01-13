// app/components/template-engine/engine/use-template-engine.ts
"use client";

import React from "react";

import type { TemplateConfigInput } from "../types";
import type { CanvasStyle, ThemeLike } from "../theme";
import { getTheme, parseThemeVariant } from "../theme";

// core
import type { NavModel } from "../core/nav/nav-model";
import { buildNavModel } from "../core/nav/nav-model";
import { createScrollSpy, scrollToDomId } from "../core/nav/scroll-spy";
import { useReveal } from "../core/fx/reveal";

import type { NormalizedSection } from "./normalize-config";

type AnyRecord = Record<string, any>;

/**
 * TemplateEngine public contract.
 * Consumers:
 * - template-engine.tsx
 * - engine/render-sections.tsx
 * - studio UI (portal, panels)
 *
 * IMPORTANT:
 * Keep this return shape backward-compatible.
 */
export type TemplateEngineState = {
  // theme
  theme: ThemeLike;
  parsedTheme: { accent: string; canvas: string };
  canvasStyle: CanvasStyle;

  // fx
  fxEnabled: boolean;
  fxAmbient: boolean;
  fxShimmer: boolean;
  fxBorderScan: boolean;

  // nav/scroll
  navModel: NavModel;
  onNavTo: (href: string) => void;
  activeDomId: string | null;
  activeHref: string;
  isScrolled: boolean;
  scrollT: number;

  // reveal
  registerReveal: (id: string) => (node: HTMLElement | null) => void;
};

function safeStr(v: unknown, fallback = ""): string {
  const s = String(v ?? "").trim();
  return s || fallback;
}

function getHeaderOffsetPx(): number {
  // client-only hook file, but keep defensive anyway
  try {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-offset")
      .trim();
    const n = Number(String(raw).replace("px", ""));
    return Number.isFinite(n) && n > 0 ? n : 84;
  } catch {
    return 84;
  }
}

export function useTemplateEngine(
  config: TemplateConfigInput,
  sections: NormalizedSection[]
): TemplateEngineState {
  const cfg = (config || ({} as any)) as AnyRecord;

  // ---- Theme (pure)
  const canvasStyle = ((cfg as AnyRecord)?.canvasStyle ??
    "classic") as CanvasStyle;

  // parseThemeVariant is stable; keep it outside memo but derive stable object
  const parsed = parseThemeVariant((cfg as AnyRecord)?.themeVariant);

  const parsedTheme = React.useMemo(
    () => ({
      accent: safeStr((parsed as any)?.accent, "amberOrange"),
      canvas: safeStr((parsed as any)?.canvas, "classic"),
    }),
    [(parsed as any)?.accent, (parsed as any)?.canvas]
  );

  const theme = React.useMemo(() => {
    return getTheme({
      accent: parsedTheme.accent,
      canvas: parsedTheme.canvas,
      style: canvasStyle,
    } as any);
  }, [parsedTheme.accent, parsedTheme.canvas, canvasStyle]);

  // ---- FX (pure)
  const fx = (cfg as AnyRecord)?.fx ?? {};
  const fxEnabled = Boolean(fx?.enabled);
  const fxAmbient = Boolean(fxEnabled && fx?.ambient);
  const fxShimmer = Boolean(fxEnabled && fx?.shimmer);
  const fxBorderScan = Boolean(fxEnabled && fx?.borderScan);

  // ---- Reveal (adapter)
  const revealApi: any = useReveal();
  const registerReveal: (id: string) => (node: HTMLElement | null) => void =
    typeof revealApi === "function"
      ? revealApi
      : typeof revealApi?.registerReveal === "function"
      ? revealApi.registerReveal
      : typeof revealApi?.register === "function"
      ? revealApi.register
      : () => () => {};

  // ---- Nav model (canonical)
  const navModel = React.useMemo<NavModel>(() => {
    const maxDirect =
      Number(
        (cfg as AnyRecord)?.nav?.maxDirect ??
          (cfg as AnyRecord)?.options?.nav?.maxDirect ??
          4
      ) || 4;

    const overflowLabel =
      safeStr((cfg as AnyRecord)?.nav?.overflowLabel, "") ||
      safeStr((cfg as AnyRecord)?.options?.nav?.overflowLabel, "") ||
      "Plus";

    return buildNavModel({
      sections: (Array.isArray(sections) ? sections : []).map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        label: s.navLabel || s.label,
        hidden: s.hidden,
        disabled: s.enabled === false,
        nav: s.nav,
      })),
      maxDirect,
      overflowLabel,
    } as any);
  }, [cfg, sections]);

  // ---- scroll state
  const [activeDomId, setActiveDomId] = React.useState<string | null>(null);
  const [activeHref, setActiveHref] = React.useState<string>("#top");
  const [scrollT, setScrollT] = React.useState(0);

  const onNavTo = React.useCallback((href: string) => {
    const domId = href.startsWith("#") ? href.slice(1) : href;
    if (!domId) return;

    // mark explicit anchor navigation (used by scroll-restore)
    try {
      (window as any).__TE_ANCHOR_NAV = true;
    } catch {}

    // keep URL hash in sync
    try {
      history.replaceState(null, "", `#${domId}`);
    } catch {}

    scrollToDomId(domId, getHeaderOffsetPx());

    // clear flag after a tick
    setTimeout(() => {
      try {
        (window as any).__TE_ANCHOR_NAV = false;
      } catch {}
    }, 0);
  }, []);

  // scrolled state
  React.useEffect(() => {
    const onScroll = () => setScrollT(window.scrollY || 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ScrollSpy
  React.useEffect(() => {
    const spy = createScrollSpy(
      navModel as any,
      {
        onActiveChange: (href: string) => setActiveHref(href),
        onActiveDomId: (id: string | null) => setActiveDomId(id),
        getOffsetPx: () => getHeaderOffsetPx(),
        biasPx: 8,
      } as any
    );

    // allow reveal system to start only after first client effect
    try {
      document.documentElement.setAttribute("data-reveal-ready", "1");
    } catch {}

    return () => {
      try {
        spy?.destroy?.();
      } catch {}
    };
  }, [navModel]);

  const isScrolled = scrollT > 8;

  return {
    theme: theme as any,
    parsedTheme,
    canvasStyle,

    fxEnabled,
    fxAmbient,
    fxShimmer,
    fxBorderScan,

    navModel,
    onNavTo,
    activeDomId,
    activeHref,
    isScrolled,
    scrollT,

    registerReveal,
  };
}
