// app/components/template-engine/template-engine.tsx
"use client";

import React from "react";
import { createPortal } from "react-dom";

import type { TemplateConfigInput, SectionType } from "./types";
import { getTheme, cx, parseThemeVariant, type CanvasStyle } from "./theme";
import { VARIANTS, VARIANTS_BY_TYPE } from "./variants";
import { StudioPanel } from "./studio-panel";
import { FxStyles } from "./fx-styles";

// core
import { domIdForSection, dataAttrForSection } from "./core/dom-ids";
import { buildNavModel } from "./core/nav/nav-model";
import { createScrollSpy, scrollToDomId } from "./core/nav/scroll-spy";
import { useReveal } from "./core/fx/reveal";
import { deepClone } from "./core/deep-clone";
import { useScrollRestoreNoFlash } from "./core/nav/scroll-restore";

type Props = {
  config: TemplateConfigInput;
  setConfig?: (next: TemplateConfigInput) => void;
};

type AnyRecord = Record<string, any>;

type Section = {
  id: string;
  type: SectionType;
  title?: string;
  label?: string;
  navLabel?: string;
  variant?: string;
  enabled?: boolean;
  hidden?: boolean;
  lock?: boolean;

  // computed
  domId?: string;

  // passthrough
  content?: any;
  options?: any;
  nav?: { label?: string; hide?: boolean };

  [k: string]: any;
};

function safeStr(v: unknown, fallback = ""): string {
  const s = String(v ?? "").trim();
  return s || fallback;
}

function safeBool(v: unknown, fallback = true): boolean {
  if (typeof v === "boolean") return v;
  if (v == null) return fallback;
  return Boolean(v);
}

function normalizeSections(raw: any[]): Section[] {
  const arr = Array.isArray(raw) ? raw : [];
  const seenDom = new Set<string>();

  return arr.map((s: any, idx: number) => {
    const id = safeStr(s?.id, `sec-${idx + 1}`);
    const type = safeStr(s?.type, "split") as unknown as SectionType;

    const sec: Section = {
      ...s,
      id,
      type,
      enabled: safeBool(s?.enabled, true),
      hidden: safeBool(s?.hidden, false),
      variant: safeStr(s?.variant, "") || undefined,
      title: safeStr(s?.title, "") || undefined,
      label: safeStr(s?.label, "") || undefined,
      navLabel: safeStr(s?.navLabel, "") || undefined,
    };

    // ✅ domId helper expects a string SectionId
    let computedDom = safeStr(sec.domId, "") || domIdForSection(id);

    // Deduplicate (critical for scroll/spy)
    if (seenDom.has(computedDom)) {
      let n = 2;
      while (seenDom.has(`${computedDom}-${n}`)) n++;
      computedDom = `${computedDom}-${n}`;
    }
    seenDom.add(computedDom);

    sec.domId = computedDom;
    return sec;
  });
}

function pickVariant(type: string, requested?: string) {
  const t = String(type || "").toLowerCase();
  const v = safeStr(requested, "") || "AUTO";
  const bucket =
    (VARIANTS as AnyRecord)[t] || (VARIANTS_BY_TYPE as AnyRecord)[t];
  if (!bucket) return { variant: v, Comp: null as any };
  const Comp = bucket[v] || bucket.AUTO || bucket.A || null;
  return { variant: v, Comp };
}

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

export function TemplateEngine({ config, setConfig }: Props) {
  const cfg = React.useMemo<TemplateConfigInput>(
    () => deepClone(config || ({} as any)),
    [config]
  );

  const sections = React.useMemo(
    () => normalizeSections((cfg as AnyRecord)?.sections ?? []),
    [cfg]
  );

  // ---- Theme (getTheme signature ok) ----
  const canvasStyle = ((cfg as AnyRecord)?.canvasStyle ??
    "classic") as CanvasStyle;

  const parsedTheme = parseThemeVariant((cfg as AnyRecord)?.themeVariant);
  const theme = React.useMemo(() => {
    try {
      return getTheme({
        accent: parsedTheme?.accent ?? "amberOrange",
        canvas: parsedTheme?.canvas ?? "classic",
        style: canvasStyle,
      } as any);
    } catch {
      return getTheme({
        accent: "amberOrange",
        canvas: "classic",
        style: canvasStyle,
      } as any);
    }
  }, [parsedTheme?.accent, parsedTheme?.canvas, canvasStyle]);

  // FX config
  const fx = (cfg as AnyRecord)?.fx ?? {};
  const fxEnabled = Boolean(fx?.enabled);
  const fxAmbient = Boolean(fxEnabled && fx?.ambient);
  const fxShimmer = Boolean(fxEnabled && fx?.shimmer);
  const fxBorderScan = Boolean(fxEnabled && fx?.borderScan);

  // mounted guard (portal + data attrs)
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    try {
      document.documentElement.setAttribute("data-mounted", "1");
    } catch {}
  }, []);

  // Scroll restore (Phase 0)
  useScrollRestoreNoFlash();

  const [activeDomId, setActiveDomId] = React.useState<string | null>(null);
  const [activeHref, setActiveHref] = React.useState<string>("#top");
  const [scrollT, setScrollT] = React.useState(0);

  // reveal hook adapter
  const revealApi: any = useReveal();
  const registerReveal: (id: string) => (node: HTMLElement | null) => void =
    typeof revealApi === "function"
      ? revealApi
      : typeof revealApi?.registerReveal === "function"
      ? revealApi.registerReveal
      : typeof revealApi?.register === "function"
      ? revealApi.register
      : () => () => {};

  // nav model (canonical)
  const navModel = React.useMemo(() => {
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
      sections: sections.map((s) => ({
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

  // smooth scroll handler used by Header
  const onNavTo = React.useCallback((href: string) => {
    const domId = href.startsWith("#") ? href.slice(1) : href;
    if (!domId) return;

    try {
      (window as any).__TE_ANCHOR_NAV = true;
    } catch {}

    try {
      history.replaceState(null, "", `#${domId}`);
    } catch {}

    scrollToDomId(domId, getHeaderOffsetPx());

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
    const spy = createScrollSpy(navModel, {
      onActiveChange: (href: string) => setActiveHref(href),
      onActiveDomId: (id: string | null) => setActiveDomId(id),
      getOffsetPx: () => getHeaderOffsetPx(),
      biasPx: 8,
    } as any);

    try {
      document.documentElement.setAttribute("data-reveal-ready", "1");
    } catch {}

    return () => {
      try {
        spy?.destroy?.();
      } catch {}
    };
  }, [navModel]);

  const rootStyle = React.useMemo(() => {
    const out: React.CSSProperties = {};
    (out as any)["--header-offset"] = "84px";

    const canvasVar = (theme as any)?.canvasVar;
    if (
      canvasVar &&
      typeof canvasVar === "object" &&
      !Array.isArray(canvasVar)
    ) {
      Object.assign(out as any, canvasVar);
    }
    return out;
  }, [theme]);

  const isScrolled = scrollT > 8;

  const wrapSection = React.useCallback(
    (sec: Section, node: React.ReactNode, idx: number) => {
      const t = String(sec.type || "").toLowerCase();
      if (t === "header" || t === "top") {
        return <React.Fragment key={sec.id}>{node}</React.Fragment>;
      }

      // ✅ domId is a string (computed earlier)
      const domId = safeStr(sec.domId, domIdForSection(sec.id));
      const withDivider = idx > 0;

      const className = cx(
        "reveal",
        withDivider && "te-divider",
        fxAmbient && "fx-softglow",
        fxBorderScan && "fx-border-scan"
      );

      return (
        <div
          key={`wrap-${sec.id}`}
          id={domId}
          ref={registerReveal(sec.id)}
          className={className}
          style={{ scrollMarginTop: "var(--header-offset, 84px)" }}
          data-domid={domId}
          {...dataAttrForSection(sec.id)} // ✅ spread object
          data-variant={sec.variant || "AUTO"}
        >
          {node}
        </div>
      );
    },
    [fxAmbient, fxBorderScan, registerReveal]
  );

  return (
    <>
      <FxStyles enabled={fxEnabled} ambient={fxAmbient} shimmer={fxShimmer} />

      <div
        className={cx(
          "template-engine",
          (theme as any)?.bgPage,
          (theme as any)?.text
        )}
        data-theme={`${parsedTheme?.accent ?? "amberOrange"}|${
          parsedTheme?.canvas ?? "classic"
        }`}
        data-canvas-style={(theme as any)?.canvasStyle ?? canvasStyle}
        style={rootStyle}
      >
        <div id="top" />

        <div className="min-h-screen">
          {sections
            .filter((s) => s && s.enabled !== false && !s.hidden)
            .map((sec, idx) => {
              const { variant, Comp } = pickVariant(sec.type, sec.variant);
              if (!Comp) return null;

              const isHeader = String(sec.type).toLowerCase() === "header";

              const node = (
                <section
                  className="te-section"
                  {...dataAttrForSection(sec.id)} // ✅ spread object
                  data-variant={variant}
                >
                  <Comp
                    theme={theme}
                    section={sec}
                    content={(sec as AnyRecord)?.content}
                    options={(sec as AnyRecord)?.options}
                    navModel={isHeader ? navModel : undefined}
                    onNavTo={isHeader ? onNavTo : undefined}
                    activeDomId={isHeader ? activeDomId : undefined}
                    activeHref={isHeader ? activeHref : undefined}
                    isScrolled={isHeader ? isScrolled : undefined}
                    scrollT={isHeader ? scrollT : undefined}
                    sections={isHeader ? sections : undefined}
                    config={cfg}
                    setConfig={setConfig}
                  />
                </section>
              );

              return wrapSection(sec, node, idx);
            })}
        </div>
      </div>

      {/* StudioPanel portal (stable / guard setConfig) */}
      {mounted &&
      (cfg as AnyRecord)?.studio?.enabled &&
      typeof setConfig === "function"
        ? createPortal(
            <StudioPanel config={cfg} setConfig={setConfig!} />,
            document.body
          )
        : null}
    </>
  );
}
