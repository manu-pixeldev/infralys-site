"use client";

import React from "react";
import ReactDOM from "react-dom";

import type { TemplateConfigInput, SectionType } from "./types";
import { getTheme, cx, parseThemeVariant, type CanvasStyle } from "./theme";
import { VARIANTS, VARIANTS_BY_TYPE } from "./variants";
import { StudioPanel } from "./studio-panel";
import { FxStyles } from "./fx-styles";

type Section = {
  id: string;
  type: SectionType;
  title?: string;
  variant?: string;
  enabled?: boolean;
  lock?: boolean;
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
  if (typeof (globalThis as any).structuredClone === "function") {
    return (globalThis as any).structuredClone(v);
  }
  return JSON.parse(JSON.stringify(v));
}

function resolveConfig(input: TemplateConfigInput): TemplateConfigInput {
  const next = cloneConfig(input) as any;

  next.options = next.options ?? {};
  next.options.fx = {
    enabled: !!next.options.fx?.enabled,
    ambient: !!next.options.fx?.ambient,
    softGlow: !!next.options.fx?.softGlow,
    borderScan: !!next.options.fx?.borderScan,
    shimmerCta: !!next.options.fx?.shimmerCta,
    ...(next.options.fx ?? {}),
  };

  // studio defaults (+ UI)
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
  const lastSentRef = React.useRef<string>("");
  const lastRecvRef = React.useRef<string>("");

  const [liveConfig, setLiveConfig] = React.useState<TemplateConfigInput>(
    () => {
      const resolved = resolveConfig(config);
      const s = JSON.stringify(resolved);
      lastSentRef.current = s;
      lastRecvRef.current = s;
      return resolved;
    }
  );

  React.useEffect(() => {
    const resolved = resolveConfig(config);
    const serialized = JSON.stringify(resolved);

    if (serialized === lastSentRef.current) {
      lastRecvRef.current = serialized;
      return;
    }
    if (serialized === lastRecvRef.current) return;

    lastRecvRef.current = serialized;
    setLiveConfig(resolved);
  }, [config]);

  React.useEffect(() => {
    if (!setConfig) return;
    const serialized = JSON.stringify(liveConfig);
    if (serialized === lastSentRef.current) return;

    lastSentRef.current = serialized;
    lastRecvRef.current = serialized;
    setConfig(liveConfig);
  }, [liveConfig, setConfig]);

  const setBoth = React.useCallback(
    (next: React.SetStateAction<TemplateConfigInput>) => {
      setLiveConfig((prev) => {
        const computed =
          typeof next === "function" ? (next as any)(prev) : next;
        return resolveConfig(computed);
      });
    },
    []
  );

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const fx = (liveConfig as any).options?.fx ?? {
    enabled: false,
    ambient: false,
    softGlow: false,
    borderScan: false,
    shimmerCta: false,
  };

  const opt = (liveConfig as any).options ?? {};
  const themeVariant = (opt as any).themeVariant ?? "amberOrange|classic";
  const canvasStyle = ((opt as any).canvasStyle ?? "classic") as CanvasStyle;

  const maxDirectLinksInMenu = Number((opt as any).maxDirectLinksInMenu ?? 4);

  // theme depends on canvasStyle + themeVariant
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

  const sections: Section[] = Array.isArray((liveConfig as any).sections)
    ? ((liveConfig as any).sections as any)
    : [];

  // active section highlight
  const [activeHref, setActiveHref] = React.useState<string>("#top");
  React.useEffect(() => {
    if (!mounted) return;

    const ids = sections
      .filter((s) => s && s.enabled !== false)
      .map((s) => String(s.id || "").trim())
      .filter(Boolean);

    if (!ids.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0)
          )[0];
        if (!visible) return;
        const id = (visible.target as HTMLElement).id;
        if (id) setActiveHref(`#${id}`);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0.1, 0.2, 0.35] }
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [mounted, sections]);

  // reveal observer
  const revealRef = React.useRef<IntersectionObserver | null>(null);
  const registerReveal = React.useCallback((id: string) => {
    return (node: HTMLElement | null) => {
      if (!node) return;
      node.dataset.reveal = "pending";
      if (!revealRef.current) {
        revealRef.current = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (!e.isIntersecting) continue;
              const el = e.target as HTMLElement;
              el.classList.add("is-in");
              revealRef.current?.unobserve(el);
            }
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
        );
      }
      revealRef.current.observe(node);
    };
  }, []);

  // wrapper auto-hooks for FX classes
  // IMPORTANT: shimmer is NOT applied here anymore (opt-in on buttons via .fx-cta)
  const wrap = React.useCallback(
    (s: Section, node: React.ReactNode, key: React.Key, variant: string) => {
      const t = String(s.type || "");
      if (t === "header" || t === "top") {
        // ensure key is on the returned element (fix React key warning)
        return <React.Fragment key={key}>{node}</React.Fragment>;
      }

      return (
        <div
          key={key}
          ref={registerReveal(String(s.id))}
          className={cx(
            "reveal",
            fx.enabled && fx.softGlow && "fx-softglow",
            fx.enabled && fx.borderScan && "fx-border-scan"
          )}
          style={{ scrollMarginTop: "var(--header-offset, 84px)" }}
          data-variant={variant}
        >
          {node}
        </div>
      );
    },
    [fx.enabled, fx.softGlow, fx.borderScan, registerReveal]
  );

  // Lightbox minimal
  const [lightboxImg, setLightboxImg] = React.useState<any>(null);
  const closeLightbox = React.useCallback(() => setLightboxImg(null), []);
  React.useEffect(() => {
    if (!lightboxImg) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLightbox();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxImg, closeLightbox]);

  const headerRef = React.useRef<HTMLElement>(null);

  // expose header height as CSS var (for scrollMarginTop etc.)
  React.useEffect(() => {
    if (!mounted) return;
    const el = headerRef.current;
    if (!el) return;

    const setVar = () => {
      const h = el.getBoundingClientRect().height || 84;
      document.documentElement.style.setProperty(
        "--header-offset",
        `${Math.round(h)}px`
      );
    };

    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    window.addEventListener("resize", setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVar);
    };
  }, [mounted]);

  return (
    <div
      className={cx(
        "min-h-screen",
        // ✅ bgPage/text are CLASSES (tailwind), not css values
        theme.bgPage,
        theme.text,
        fx.enabled && fx.ambient && "fx-ambient"
      )}
      // ✅ canvas vars in style (CSS vars)
      style={{ ...(theme.canvasVar ?? {}) }}
    >
      <FxStyles enabled={!!fx.enabled} ambient={!!fx.ambient} />

      {sections.map((s) => {
        if (!s || s.enabled === false) return null;

        const type = String(s.type || "");
        const variant = resolveSectionVariant(s);
        const Comp = (VARIANTS as any)?.[type]?.[variant] as any;
        if (!Comp) return null;

        const key = `${String(s.id)}:${variant}`;

        const node = (
          <section id={String(s.id || "")} className="w-full">
            <Comp
              {...(s as any)}
              theme={theme}
              brand={(liveConfig as any).brand}
              content={(liveConfig as any).content}
              sections={sections}
              activeHref={activeHref}
              isScrolled={isScrolled}
              scrollT={scrollT}
              headerRef={type === "header" ? headerRef : undefined}
              fx={fx}
              enableLightbox
              onOpen={(img: any) => setLightboxImg(img)}
              setConfig={setBoth}
              config={liveConfig}
              options={(liveConfig as any).options}
              layout={(liveConfig as any).options?.layout}
              maxDirectLinksInMenu={maxDirectLinksInMenu}
              // ✅ pass canvasVar so header/menu can reuse exact surface
              canvasVar={theme.canvasVar}
              canvasStyle={canvasStyle}
            />
          </section>
        );

        return wrap(s, node, key, variant);
      })}

      {/* Studio Panel */}
      {mounted &&
      (liveConfig as any).options?.studio?.enabled !== false &&
      typeof window !== "undefined"
        ? ReactDOM.createPortal(
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
