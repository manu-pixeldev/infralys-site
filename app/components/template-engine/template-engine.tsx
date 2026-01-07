// app/components/template-engine/template-engine.tsx
"use client";

import React from "react";
import { createPortal } from "react-dom";

import type { TemplateConfigInput } from "./types";
type SectionType = string;

import { getTheme, cx, parseThemeVariant, type CanvasStyle } from "./theme";
import { VARIANTS, VARIANTS_BY_TYPE } from "./variants";
import { StudioPanel } from "./studio-panel";
import { FxStyles } from "./fx-styles";

// V24 core
import { domIdForSection, dataAttrForSection } from "./core/dom-ids";
import { buildNavModel } from "./core/nav/nav-model";
import { createScrollSpy, scrollToDomId } from "./core/nav/scroll-spy";
import { useReveal } from "./core/fx/reveal";

// ✅ V25: safe deep clone (no JSON stringify)
import { deepClone } from "./core/deep-clone";

type Section = {
  id: string;
  type: SectionType;
  title?: string;
  variant?: string;
  enabled?: boolean;
  lock?: boolean;
  domId?: string; // computed from core/dom-ids.ts
  [k: string]: any;
};

function fallbackVariant(type: string) {
  switch (type) {
    case "gallery":
      return "stack";
    case "contact":
      return "AUTO";
    case "proof":
      return "stats";
    default:
      return "A";
  }
}

function cloneConfig<T>(v: T): T {
  return deepClone(v);
}

function resolveConfig(input: TemplateConfigInput): TemplateConfigInput {
  const next = cloneConfig(input) as any;

  next.options = next.options ?? {};

  // FX defaults
  next.options.fx = {
    enabled: !!next.options.fx?.enabled,
    ambient: !!next.options.fx?.ambient,
    softGlow: !!next.options.fx?.softGlow,
    borderScan: !!next.options.fx?.borderScan,
    shimmerCta: !!next.options.fx?.shimmerCta,
    ...(next.options.fx ?? {}),
  };

  // studio defaults
  next.options.studio = next.options.studio ?? {};
  next.options.studio.enabled = next.options.studio.enabled ?? true;
  next.options.studio.allowRandomize =
    next.options.studio.allowRandomize ?? true;
  next.options.studio.ui = next.options.studio.ui ?? {};
  next.options.studio.ui.dock = next.options.studio.ui.dock ?? "right";
  next.options.studio.ui.minimized = next.options.studio.ui.minimized ?? false;

  // theme default safe
  (next.options as any).themeVariant =
    (next.options as any).themeVariant ?? "amberOrange|classic";

  // canvas style default safe
  (next.options as any).canvasStyle = ((next.options as any).canvasStyle ??
    "classic") as CanvasStyle;

  // layout defaults
  next.options.layout = next.options.layout ?? {};
  next.options.layout.container = next.options.layout.container ?? "7xl";
  next.options.layout.density = next.options.layout.density ?? "normal";
  next.options.layout.radius = next.options.layout.radius ?? 24;

  // nav defaults
  next.options.maxDirectLinksInMenu = next.options.maxDirectLinksInMenu ?? 4;
  next.options.nav = next.options.nav ?? {};
  next.options.nav.maxDirectLinksInMenu =
    next.options.nav.maxDirectLinksInMenu ?? next.options.maxDirectLinksInMenu;

  // brand defaults
  next.brand = next.brand ?? {};
  next.brand.logo = next.brand.logo ?? {};
  next.brand.logo.mode = next.brand.logo.mode ?? "logoPlusText";
  next.brand.logo.width = Math.max(
    24,
    Number(next.brand.logo.width ?? 80) || 80
  );
  next.brand.logo.height = Math.max(
    24,
    Number(next.brand.logo.height ?? 80) || 80
  );

  if (next.brand.logo.mode === "textOnly") {
    next.brand.logo.src = next.brand.logo.src ?? undefined;
  } else {
    next.brand.logo.src = next.brand.logo.src ?? "/brand/logo.svg";
  }

  next.content = next.content ?? {};
  next.sections = Array.isArray(next.sections) ? next.sections : [];

  return next as TemplateConfigInput;
}

function resolveSectionVariant(s: any) {
  const type = String(s?.type || "");
  const known = (VARIANTS_BY_TYPE as any)[type] as
    | readonly string[]
    | undefined;

  const v = String(s?.variant || "").trim();
  if (known?.includes(v)) return v;

  const fb = fallbackVariant(type);
  if (known?.includes(fb)) return fb;

  return known?.[0] ?? fb;
}

export default function TemplateEngine({
  config,
  setConfig,
}: {
  config: TemplateConfigInput;
  setConfig?: React.Dispatch<React.SetStateAction<TemplateConfigInput>>;
}) {
  // ============================================================
  // ✅ SYNC STABLE (anti boucle / anti stack overflow)
  // ============================================================
  const syncingRef = React.useRef(false);

  const [liveConfig, setLiveConfig] = React.useState<TemplateConfigInput>(() =>
    resolveConfig(config)
  );

  React.useEffect(() => {
    syncingRef.current = true;
    setLiveConfig(resolveConfig(config));
  }, [config]);

  React.useEffect(() => {
    if (!setConfig) return;
    if (syncingRef.current) {
      syncingRef.current = false;
      return;
    }
    setConfig(liveConfig);
  }, [liveConfig, setConfig]);

  const setBoth = React.useCallback(
    (next: React.SetStateAction<TemplateConfigInput>) => {
      setLiveConfig((prev: TemplateConfigInput) => {
        const computed =
          typeof next === "function"
            ? (next as (p: TemplateConfigInput) => TemplateConfigInput)(prev)
            : next;

        return resolveConfig(computed);
      });
    },
    []
  );

  // ✅ mount guard (anti flash)
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const opt = (liveConfig as any).options ?? {};
  const fx = (opt as any).fx ?? {
    enabled: false,
    ambient: false,
    softGlow: false,
    borderScan: false,
    shimmerCta: false,
  };

  const fxEnabled = !!fx?.enabled;
  const fxShimmer = fxEnabled && !!fx?.shimmerCta;

  const themeVariant = (opt as any).themeVariant ?? "amberOrange|classic";
  const canvasStyle = ((opt as any).canvasStyle ?? "classic") as CanvasStyle;

  const theme = React.useMemo(() => {
    const { accent, canvas } = parseThemeVariant(themeVariant);
    return getTheme({ accent, canvas, style: canvasStyle });
  }, [themeVariant, canvasStyle]);

  // Ctrl+K : toggle studio
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      if (e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      setBoth((prev: any) => {
        const next = cloneConfig(prev) as any;
        next.options = next.options ?? {};
        next.options.studio = next.options.studio ?? {};
        next.options.studio.enabled = !next.options.studio.enabled;
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setBoth]);

  // Smooth header shrink (0..1)
  const [scrollT, setScrollT] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const MAX = 64;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = Math.max(0, window.scrollY || 0);
        const t = Math.max(0, Math.min(1, y / MAX));
        setScrollT(t);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  const isScrolled = scrollT > 0.15;

  const rawSections: Section[] = Array.isArray((liveConfig as any).sections)
    ? ((liveConfig as any).sections as any)
    : [];

  // ============================================================
  // DOM IDs (single source of truth)
  // ============================================================
  const sections: Section[] = React.useMemo(() => {
    return rawSections
      .filter((s) => s && (s as any).enabled !== false)
      .map((s, idx) => {
        const sid =
          String((s as any).id || "").trim() ||
          String((s as any).type || "").trim() ||
          `section-${idx}`;
        return { ...(s as any), domId: domIdForSection(sid) } as Section;
      });
  }, [rawSections]);

  // ============================================================
  // Reveal
  // ============================================================
  const { registerReveal } = useReveal();

  // ============================================================
  // maxDirectLinksInMenu
  // ============================================================
  const maxDirectLinksInMenu = Number(
    (opt as any)?.nav?.maxDirectLinksInMenu ??
      (opt as any)?.maxDirectLinksInMenu ??
      (opt as any)?.maxDirectLinks ??
      (liveConfig as any)?.content?.nav?.maxDirectLinksInMenu ??
      (liveConfig as any)?.content?.nav?.maxDirectLinks ??
      4
  );

  // ============================================================
  // NAV SECTIONS (hero éligible même si title vide)
  // ============================================================
  const sectionsForNav = React.useMemo(() => {
    return sections.map((s, idx) => {
      const type = String((s as any).type || "");
      const domId = String((s as any).domId || `sec-${idx}`);
      const safeTitle =
        (s as any).title?.trim?.() || (type === "hero" ? "Accueil" : "");
      return { ...(s as any), domId, title: safeTitle } as Section;
    });
  }, [sections]);

  // ============================================================
  // Nav model + scroll spy
  // ============================================================
  const navModel = React.useMemo(() => {
    return buildNavModel({
      sections: sectionsForNav as any,
      maxDirect: maxDirectLinksInMenu,
      overflowLabel: "Plus",
    });
  }, [sectionsForNav, maxDirectLinksInMenu]);

  const [activeDomId, setActiveDomId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!mounted) return;

    const spy = createScrollSpy({
      onActiveChange: setActiveDomId,
    });

    requestAnimationFrame(() => spy.refresh());
    return () => spy.destroy();
  }, [mounted, sectionsForNav.length]);

  const activeHref = React.useMemo(() => {
    return activeDomId ? `#${activeDomId}` : "#top";
  }, [activeDomId]);

  const onNavTo = React.useCallback((href: string) => {
    const id = String(href || "").startsWith("#") ? href.slice(1) : href;
    if (!id) return;
    scrollToDomId(id, { behavior: "smooth" });
  }, []);

  // Lightbox minimal
  const [lightboxImg, setLightboxImg] = React.useState<any>(null);
  const closeLightbox = React.useCallback(() => setLightboxImg(null), []);
  React.useEffect(() => {
    if (!lightboxImg) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLightbox();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxImg, closeLightbox]);

  // first content section after header => breathing room
  const firstNonHeaderIdx = React.useMemo(() => {
    return sections.findIndex(
      (x) => String((x as any).type || "") !== "header"
    );
  }, [sections]);

  return (
    <div
      data-ui={theme.isDark ? "dark" : "light"}
      data-mounted={mounted ? "1" : "0"}
      data-fx-enabled={fxEnabled ? "1" : "0"}
      data-fx-shimmer={fxShimmer ? "1" : "0"}
      className={cx(
        "min-h-screen",
        theme.bgPage,
        theme.text,
        fxEnabled && fx.ambient && "fx-ambient"
      )}
      style={mounted ? { ...(theme.canvasVar ?? {}) } : undefined}
    >
      <FxStyles
        enabled={fxEnabled}
        ambient={!!fx.ambient}
        shimmer={fxShimmer}
      />

      {sections.map((s, idx) => {
        const type = String((s as any).type || "");
        const variant = resolveSectionVariant(s);
        const Comp = (VARIANTS as any)?.[type]?.[variant] as any;
        if (!Comp) return null;

        const domId = String((s as any).domId || `sec-${idx}`);
        const sectionId = String((s as any).id || "").trim() || domId;

        const baseNode = (
          <Comp
            key={`${domId}::${variant}`}
            section={s}
            theme={theme}
            brand={(liveConfig as any).brand}
            content={{
              ...(liveConfig as any).content,
              nav: {
                ...(((liveConfig as any).content?.nav as any) ?? {}),
                maxDirectLinksInMenu,
              },
            }}
            options={(liveConfig as any).options}
            sections={sections}
            activeHref={activeHref}
            activeDomId={activeDomId}
            navModel={navModel}
            onNavTo={onNavTo}
            isScrolled={isScrolled}
            scrollT={scrollT}
            setLightboxImg={setLightboxImg}
          />
        );

        if (type === "top") {
          return (
            <React.Fragment key={`${domId}::top`}>{baseNode}</React.Fragment>
          );
        }

        if (type === "header") {
          return (
            <React.Fragment key={`${domId}::header`}>
              {baseNode}
              <div
                aria-hidden="true"
                style={{ height: "var(--header-h, 120px)" }}
              />
            </React.Fragment>
          );
        }

        const isAfterHeader = idx === firstNonHeaderIdx;

        return (
          <div
            key={`${domId}::wrap`}
            id={domId}
            {...dataAttrForSection(sectionId)}
            ref={registerReveal(domId)}
            className={cx(
              "reveal",
              "fx-divider",
              isAfterHeader && "te-after-header",
              fxEnabled && fx.softGlow && "fx-softglow",
              fxEnabled && fx.borderScan && "fx-border-scan"
            )}
            data-variant={variant}
            style={{
              scrollMarginTop: "calc(var(--header-offset, 120px) + 16px)",
            }}
          >
            {baseNode}
          </div>
        );
      })}

      {/* Studio Panel */}
      {mounted &&
      (liveConfig as any).options?.studio?.enabled !== false &&
      typeof window !== "undefined"
        ? createPortal(
            <StudioPanel
              config={liveConfig}
              setConfig={setBoth}
              theme={theme}
            />,
            document.body
          )
        : null}

      {/* Lightbox */}
      {lightboxImg ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6"
          onMouseDown={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] max-w-[92vw] overflow-hidden rounded-2xl bg-black/20 backdrop-blur-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImg.src}
              alt={lightboxImg.alt || "Image"}
              className="max-h-[90vh] max-w-[92vw] object-contain"
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
