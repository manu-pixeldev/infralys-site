// app/components/template-engine/engine/use-template-engine.ts
"use client";

import React from "react";
import type { TemplateConfigInput } from "../types";
import { getTheme, parseThemeVariant, type CanvasStyle } from "../theme";
import { buildNavModel } from "../core/nav/nav-model";
import { createScrollSpy, scrollToDomId } from "../core/nav/scroll-spy";

function getHeaderOffsetPx(): number {
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

export function useTemplateEngine(cfg: TemplateConfigInput, sections: any[]) {
  const canvasStyle = ((cfg as any)?.canvasStyle ?? "classic") as CanvasStyle;

  const parsedTheme = parseThemeVariant((cfg as any)?.themeVariant);
  const theme = React.useMemo(() => {
    return getTheme({
      accent: parsedTheme?.accent ?? "amberOrange",
      canvas: parsedTheme?.canvas ?? "classic",
      style: canvasStyle,
    } as any);
  }, [parsedTheme?.accent, parsedTheme?.canvas, canvasStyle]);

  const fx = (cfg as any)?.fx ?? {};
  const fxEnabled = Boolean(fx?.enabled);
  const fxAmbient = Boolean(fxEnabled && fx?.ambient);
  const fxShimmer = Boolean(fxEnabled && fx?.shimmer);
  const fxBorderScan = Boolean(fxEnabled && fx?.borderScan);

  const navModel = React.useMemo(() => {
    const maxDirect =
      Number(
        (cfg as any)?.nav?.maxDirect ??
          (cfg as any)?.options?.nav?.maxDirect ??
          4
      ) || 4;
    const overflowLabel =
      String(
        (cfg as any)?.nav?.overflowLabel ??
          (cfg as any)?.options?.nav?.overflowLabel ??
          "Plus"
      ) || "Plus";
    return buildNavModel({
      sections: sections.map((s: any) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        label: s.navLabel || s.label,
        hidden: s.hidden,
        disabled: s.enabled === false,
        nav: s.nav,
        domId: s.domId,
      })),
      maxDirect,
      overflowLabel,
    } as any);
  }, [cfg, sections]);

  const [activeDomId, setActiveDomId] = React.useState<string | null>(null);
  const [activeHref, setActiveHref] = React.useState<string>("#top");
  const [scrollT, setScrollT] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => setScrollT(window.scrollY || 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onNavTo = React.useCallback((href: string) => {
    const domId = href.startsWith("#") ? href.slice(1) : href;
    if (!domId) return;

    try {
      (window as any).__TE_ANCHOR_NAV = true;
      history.replaceState(null, "", `#${domId}`);
    } catch {}

    scrollToDomId(domId, getHeaderOffsetPx());

    setTimeout(() => {
      try {
        (window as any).__TE_ANCHOR_NAV = false;
      } catch {}
    }, 0);
  }, []);

  React.useEffect(() => {
    const spy = createScrollSpy(navModel, {
      onActiveChange: (href: string) => setActiveHref(href),
      onActiveDomId: (id: string | null) => setActiveDomId(id),
      getOffsetPx: () => getHeaderOffsetPx(),
      biasPx: 8,
    } as any);

    try {
      document.documentElement.setAttribute("data-reveal-ready", "1");
    } catch {}

    return () => spy?.destroy?.();
  }, [navModel]);

  return {
    theme,
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
    scrollT,
    isScrolled: scrollT > 8,
  };
}
