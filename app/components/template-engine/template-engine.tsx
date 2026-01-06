// app/components/template-engine/template-engine.tsx
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
  next.options.nav = next.options.nav ?? {};
  next.options.nav.maxDirectLinksInMenu =
    next.options.nav.maxDirectLinksInMenu ?? next.options.maxDirectLinksInMenu;

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

  const fxEnabled = !!fx?.enabled;
  const fxShimmer = fxEnabled && !!fx?.shimmerCta;

  const opt = (liveConfig as any).options ?? {};
  const themeVariant = (opt as any).themeVariant ?? "amberOrange|classic";
  const canvasStyle = ((opt as any).canvasStyle ?? "classic") as CanvasStyle;

  const maxDirectLinksInMenu = Number(
    (opt as any)?.nav?.maxDirectLinksInMenu ??
      (opt as any)?.maxDirectLinksInMenu ??
      (opt as any)?.maxDirectLinks ??
      (liveConfig as any)?.content?.nav?.maxDirectLinksInMenu ??
      (liveConfig as any)?.content?.nav?.maxDirectLinks ??
      4
  );

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

  /**
   * NOTE:
   * - Header mesure sa hauteur et set:
   *   --header-h et --header-offset
   */
  const headerRef = React.useRef<HTMLElement>(null);

  /* ============================================================
   REVEAL OBSERVER (one-shot) — ONLY on scroll DOWN
   - dataset.reveal is set only by registerReveal
   ============================================================ */
  const revealRef = React.useRef<IntersectionObserver | null>(null);

  const lastScrollYRef = React.useRef<number>(0);
  const lastDirRef = React.useRef<1 | -1>(1); // 1 = down, -1 = up

  React.useEffect(() => {
    // init
    lastScrollYRef.current =
      typeof window !== "undefined" ? window.scrollY || 0 : 0;

    const onScroll = () => {
      const y = window.scrollY || 0;
      const dy = y - lastScrollYRef.current;

      // ignore micro jitter
      if (Math.abs(dy) >= 2) {
        lastDirRef.current = dy > 0 ? 1 : -1;
        lastScrollYRef.current = y;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    return () => {
      revealRef.current?.disconnect();
      revealRef.current = null;
    };
  }, []);

  const registerReveal = React.useCallback((id: string) => {
    return (node: HTMLElement | null) => {
      if (!node) return;

      // set pending only if not already revealed
      if (!node.classList.contains("is-in")) {
        node.dataset.reveal = node.dataset.reveal || "pending";
      }

      if (!revealRef.current) {
        revealRef.current = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (!e.isIntersecting) continue;

              const el = e.target as HTMLElement;

              // ✅ only animate when scrolling DOWN
              if (lastDirRef.current !== 1) {
                // HARD skip: no transition, no movement, no flicker
                el.style.transition = "none";
                el.style.transform = "none";
                el.style.opacity = "1";

                // mark revealed
                el.classList.add("is-in");
                el.classList.add("reveal-done");
                try {
                  delete (el as any).dataset?.reveal;
                } catch {}

                // keep it clean (optional)
                requestAnimationFrame(() => {
                  // we can keep transform/opacity inline, but removing is safe once it's revealed
                  el.style.transition = "";
                  el.style.transform = "";
                  el.style.opacity = "";
                });

                revealRef.current?.unobserve(el);
                continue;
              }

              // normal smooth reveal (down only)
              el.classList.add("is-in");

              window.setTimeout(() => {
                el.classList.add("reveal-done");
                try {
                  delete (el as any).dataset?.reveal;
                } catch {}
              }, 650);

              revealRef.current?.unobserve(el);
            }
          },
          { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
        );
      }

      revealRef.current.observe(node);
    };
  }, []);

  /* ============================================================
     ACTIVE SECTION HIGHLIGHT (unchanged)
     ============================================================ */
  const [activeHref, setActiveHref] = React.useState<string>("#top");

  const didInitHashScrollRef = React.useRef(false);
  const lastHashAppliedRef = React.useRef<string>("");
  const hashTimeoutsRef = React.useRef<number[]>([]);

  const slugify = React.useCallback((s: string) => {
    const raw = String(s || "").toLowerCase();
    const norm = (raw as any).normalize ? raw.normalize("NFD") : raw;
    return norm
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }, []);

  const enabledSections = React.useMemo(() => {
    return sections.filter((s) => s && (s as any).enabled !== false);
  }, [sections]);

  const realSections = React.useMemo(() => {
    return enabledSections.filter((s) => {
      const t = String((s as any).type || "");
      return t !== "header" && t !== "top";
    });
  }, [enabledSections]);

  const observableIds = React.useMemo(() => {
    return realSections
      .map((s) => String((s as any).id || "").trim())
      .filter(Boolean);
  }, [realSections]);

  const firstRealId = React.useMemo(() => {
    return observableIds[0] ?? "";
  }, [observableIds]);

  const homeId = React.useMemo(() => {
    return observableIds.includes("hero") ? "hero" : firstRealId;
  }, [observableIds, firstRealId]);

  const setActiveHome = React.useCallback(() => {
    setActiveHref(homeId ? `#${homeId}` : "#top");
  }, [homeId]);

  const aliasToId = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const s of realSections) {
      const id = String((s as any).id || "").trim();
      if (!id) continue;

      const title = String((s as any).title || "").trim();
      if (title) {
        const key = slugify(title);
        if (!map.has(key)) map.set(key, id);
      }

      map.set(slugify(id), id);
    }
    return map;
  }, [realSections, slugify]);

  const headerOffsetPx = React.useCallback(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-offset")
      .trim();
    const n = Number(String(v).replace("px", "").trim());
    return Number.isFinite(n) && n > 0 ? n : 120;
  }, []);

  const isNearTop = React.useCallback(() => {
    const off = headerOffsetPx();
    const y = window.scrollY || 0;
    return y <= Math.max(24, Math.round(off * 0.75));
  }, [headerOffsetPx]);

  React.useEffect(() => {
    if (!mounted) return;

    for (const t of hashTimeoutsRef.current) window.clearTimeout(t);
    hashTimeoutsRef.current = [];

    const resolveHashToHref = (rawHash: string): string | null => {
      const raw = String(rawHash || "").trim();
      if (!raw || raw === "#") return null;
      if (raw === "#top") return "#top";

      const wanted = raw.startsWith("#") ? raw.slice(1) : raw;
      if (!wanted) return null;

      if (document.getElementById(wanted)) return `#${wanted}`;

      const ali = aliasToId.get(slugify(wanted));
      if (ali && document.getElementById(ali)) return `#${ali}`;

      return null;
    };

    const scrollToId = (id: string, behavior: ScrollBehavior = "auto") => {
      const el = document.getElementById(id);
      if (!el) return;

      const y =
        el.getBoundingClientRect().top + window.scrollY - headerOffsetPx();
      window.scrollTo({ top: Math.max(0, y), behavior });
    };

    const applyHash = (forceScroll: boolean) => {
      const resolved = resolveHashToHref(window.location.hash);
      if (!resolved) return;

      const currentHash = String(window.location.hash || "");
      const hashChanged = currentHash !== lastHashAppliedRef.current;

      if (!forceScroll && !hashChanged && didInitHashScrollRef.current) {
        if (resolved === "#top") setActiveHome();
        else {
          const id = resolved.slice(1);
          if (homeId && id === homeId) setActiveHome();
          else setActiveHref(resolved);
        }
        return;
      }

      lastHashAppliedRef.current = currentHash;

      if (resolved === "#top") {
        setActiveHome();
        if (forceScroll) window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      const id = resolved.slice(1);

      if (homeId && id === homeId) setActiveHome();
      else setActiveHref(resolved);

      if (!forceScroll) return;

      requestAnimationFrame(() => scrollToId(id, "auto"));
      const t = window.setTimeout(() => scrollToId(id, "auto"), 200);
      hashTimeoutsRef.current.push(t);
    };

    if (!didInitHashScrollRef.current) {
      didInitHashScrollRef.current = true;
      applyHash(true);
    } else {
      applyHash(false);
    }

    const onHash = () => applyHash(true);
    window.addEventListener("hashchange", onHash);

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const a = target.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;

      const hrefRaw = (a.getAttribute("href") || "").trim();
      if (!hrefRaw.startsWith("#")) return;

      if (hrefRaw === "#top") {
        setActiveHome();
        return;
      }

      const wanted = hrefRaw.slice(1);
      if (!wanted) return;

      if (document.getElementById(wanted)) {
        if (homeId && wanted === homeId) setActiveHome();
        else setActiveHref(`#${wanted}`);
        return;
      }

      const ali = aliasToId.get(slugify(wanted));
      if (ali && document.getElementById(ali)) {
        window.location.hash = ali;
        if (homeId && ali === homeId) setActiveHome();
        else setActiveHref(`#${ali}`);
      }
    };

    document.addEventListener("click", onClick, true);

    const onScrollTop = () => {
      if (isNearTop()) setActiveHome();
    };

    let obs: IntersectionObserver | null = null;

    if (observableIds.length) {
      obs = new IntersectionObserver(
        (entries) => {
          if (isNearTop()) {
            setActiveHome();
            return;
          }

          const best = entries
            .filter((e) => e.isIntersecting)
            .sort(
              (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0)
            )[0];

          if (!best) return;

          const id = (best.target as HTMLElement).id;
          if (!id) return;

          if (homeId && id === homeId) {
            setActiveHome();
            return;
          }

          setActiveHref(`#${id}`);
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: [0.12, 0.2, 0.35] }
      );

      for (const id of observableIds) {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
      }
    }

    window.addEventListener("scroll", onScrollTop, { passive: true });
    onScrollTop();

    return () => {
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScrollTop);
      obs?.disconnect();

      for (const t of hashTimeoutsRef.current) window.clearTimeout(t);
      hashTimeoutsRef.current = [];
    };
  }, [
    mounted,
    observableIds,
    homeId,
    aliasToId,
    slugify,
    headerOffsetPx,
    isNearTop,
    setActiveHome,
  ]);

  // Lightbox minimal
  const [lightboxImg, setLightboxImg] = React.useState<any>(null);
  const closeLightbox = React.useCallback(() => setLightboxImg(null), []);
  React.useEffect(() => {
    if (!lightboxImg) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeLightbox();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxImg, closeLightbox]);

  // ensure canvas vars globally available
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const style = theme.canvasVar as any;
    if (!style) return;

    const root = document.documentElement;
    const keys = Object.keys(style);

    for (const k of keys) {
      if (!k.startsWith("--")) continue;
      root.style.setProperty(k, String(style[k]));
    }

    return () => {
      for (const k of keys) {
        if (!k.startsWith("--")) continue;
        root.style.removeProperty(k);
      }
    };
  }, [theme.canvasVar]);

  // DOM ids uniqueness map (reset each render)
  const usedDomIdsRef = React.useRef<Map<string, number>>(new Map());
  usedDomIdsRef.current.clear();

  return (
    <div
      data-ui={theme.isDark ? "dark" : "light"}
      data-fx-enabled={fxEnabled ? "1" : "0"}
      data-fx-shimmer={fxShimmer ? "1" : "0"}
      className={cx(
        "min-h-screen",
        theme.bgPage,
        theme.text,
        fxEnabled && fx.ambient && "fx-ambient"
      )}
      style={{ ...(theme.canvasVar ?? {}) }}
    >
      <FxStyles
        enabled={fxEnabled}
        ambient={!!fx.ambient}
        shimmer={fxShimmer}
      />

      {sections.map((s, idx) => {
        if (!s || (s as any).enabled === false) return null;

        const type = String((s as any).type || "");
        const variant = resolveSectionVariant(s);
        const Comp = (VARIANTS as any)?.[type]?.[variant] as any;
        if (!Comp) return null;

        const rawId =
          String((s as any).id ?? "").trim() || `${type}-${idx + 1}`;

        const usedDomIds = usedDomIdsRef.current;
        const n = (usedDomIds.get(rawId) ?? 0) + 1;
        usedDomIds.set(rawId, n);

        // DOM id uniqueness (split, split-2, split-3…)
        const domId = n === 1 ? rawId : `${rawId}-${n}`;
        const key = `${domId}:${variant}`;

        const baseNode = (
          <section id={domId} className="w-full" data-variant={variant}>
            <Comp
              {...(s as any)}
              sectionId={domId}
              theme={theme}
              brand={(liveConfig as any).brand}
              content={(liveConfig as any).content}
              sections={sections}
              activeHref={activeHref}
              isScrolled={isScrolled}
              scrollT={scrollT}
              headerRef={type === "header" ? headerRef : undefined}
              headerVariant={
                type === "header"
                  ? String((s as any).variant ?? "A")
                  : undefined
              }
              fx={fx}
              enableLightbox
              onOpen={(img: any) => setLightboxImg(img)}
              setConfig={setBoth}
              config={liveConfig}
              options={(liveConfig as any).options}
              layout={(liveConfig as any).options?.layout}
              maxDirectLinksInMenu={maxDirectLinksInMenu}
              canvasVar={theme.canvasVar}
              canvasStyle={canvasStyle}
            />
          </section>
        );

        // TOP: no wrapper FX/reveal
        if (type === "top") {
          return <React.Fragment key={key}>{baseNode}</React.Fragment>;
        }

        // HEADER: no wrapper FX/reveal + spacer
        if (type === "header") {
          return (
            <React.Fragment key={key}>
              {baseNode}
              <div
                aria-hidden="true"
                style={{ height: "var(--header-h, 120px)" }}
              />
            </React.Fragment>
          );
        }

        // ✅ Stable: fx-divider on OUTER, reveal on INNER
        // (prevents pseudo-elements “double line” flicker during transform)
        return (
          <div
            key={key}
            className={cx(
              "fx-divider",
              fxEnabled && fx.softGlow && "fx-softglow",
              fxEnabled && fx.borderScan && "fx-border-scan"
            )}
            data-variant={variant}
            style={{
              scrollMarginTop: "calc(var(--header-offset, 120px) + 16px)",
            }}
          >
            <div ref={registerReveal(domId)} className="reveal">
              {baseNode}
            </div>
          </div>
        );
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
