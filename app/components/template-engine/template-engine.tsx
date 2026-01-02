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

  /* ============================================================
     REVEAL OBSERVER (compile-safe)
     ============================================================ */
  const revealRef = React.useRef<IntersectionObserver | null>(null);

  React.useEffect(() => {
    // cleanup on unmount
    return () => {
      revealRef.current?.disconnect();
      revealRef.current = null;
    };
  }, []);

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

  /* ============================================================
     ACTIVE SECTION HIGHLIGHT (V2030 - stable + deep link safe)
     - ✅ “Accueil” highlights the HOME section href (#hero usually)
     - ✅ #top still works as an alias (scroll top), but highlight stays on home
     - ✅ NO SCROLL when effect re-runs due to Studio edits
     ============================================================ */

  const [activeHref, setActiveHref] = React.useState<string>("#top");

  // ✅ prevents “studio edit => re-run effect => applyHash scroll jump”
  const didInitHashScrollRef = React.useRef(false);
  const lastHashAppliedRef = React.useRef<string>("");

  // ✅ keep timeout ids so we can cancel on cleanup / re-run
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
    return sections.filter((s) => s && s.enabled !== false);
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

  // ✅ HOME ID: treat #hero as "Accueil" when present, else fallback to first real section
  const homeId = React.useMemo(() => {
    return observableIds.includes("hero") ? "hero" : firstRealId;
  }, [observableIds, firstRealId]);

  // ✅ single helper so “Accueil” highlight is consistent everywhere
  const setActiveHome = React.useCallback(() => {
    setActiveHref(homeId ? `#${homeId}` : "#top");
  }, [homeId]);

  // aliases: allow #preuves (title) to resolve to the real id
  const aliasToId = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const s of realSections) {
      const id = String((s as any).id || "").trim();
      if (!id) continue;

      const title = String((s as any).title || "").trim();
      if (title) map.set(slugify(title), id);

      map.set(slugify(id), id);
    }
    return map;
  }, [realSections, slugify]);

  const headerOffsetPx = React.useCallback(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-offset")
      .trim();
    const n = Number(String(v).replace("px", "").trim());
    return Number.isFinite(n) && n > 0 ? n : 84;
  }, []);

  const isNearTop = React.useCallback(() => {
    const off = headerOffsetPx();
    const y = window.scrollY || 0;
    return y <= Math.max(24, Math.round(off * 0.75));
  }, [headerOffsetPx]);

  React.useEffect(() => {
    if (!mounted) return;

    // kill old delayed scrolls (prevents “ghost jump”)
    for (const t of hashTimeoutsRef.current) window.clearTimeout(t);
    hashTimeoutsRef.current = [];

    const resolveHashToHref = (rawHash: string): string | null => {
      const raw = String(rawHash || "").trim();
      if (!raw || raw === "#") return null;

      // keep supporting #top as an alias
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

      // If effect re-runs (studio edit) and hash didn't change, do NOT scroll.
      const currentHash = String(window.location.hash || "");
      const hashChanged = currentHash !== lastHashAppliedRef.current;

      if (!forceScroll && !hashChanged && didInitHashScrollRef.current) {
        // still keep highlight sane (no jump)
        if (resolved === "#top") setActiveHome();
        else {
          const id = resolved.slice(1);
          if (homeId && id === homeId) setActiveHome();
          else setActiveHref(resolved);
        }
        return;
      }

      // record
      lastHashAppliedRef.current = currentHash;

      // #top: highlight “Accueil” but optionally scroll to very top
      if (resolved === "#top") {
        setActiveHome();
        if (forceScroll) window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      const id = resolved.slice(1);

      if (homeId && id === homeId) setActiveHome();
      else setActiveHref(resolved);

      if (!forceScroll) return;

      // offset-aware anchor; delayed re-apply after layout settle
      requestAnimationFrame(() => scrollToId(id, "auto"));
      const t = window.setTimeout(() => scrollToId(id, "auto"), 200);
      hashTimeoutsRef.current.push(t);
    };

    // ✅ Mount behavior:
    // - first time only => scroll to hash if present
    // - on subsequent effect runs (studio edits) => NO scroll
    if (!didInitHashScrollRef.current) {
      didInitHashScrollRef.current = true;
      applyHash(true);
    } else {
      applyHash(false);
    }

    const onHash = () => applyHash(true);
    window.addEventListener("hashchange", onHash);

    // clicking anchors => immediate highlight + alias support
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

    // near-top highlight => “Accueil” (not a special #top that doesn't exist in menu)
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

  // wrapper auto-hooks for FX classes
  // IMPORTANT: shimmer is NOT applied here anymore (opt-in on buttons via .fx-cta)
  const wrap = React.useCallback(
    (s: Section, node: React.ReactNode, key: React.Key, variant: string) => {
      const t = String(s.type || "");
      if (t === "header" || t === "top") {
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

  // ✅ Step 1 — ensure canvas CSS vars are globally available (header / menus / portals)
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const style = theme.canvasVar as any;
    if (!style) return;

    // apply vars to <html> so sticky header + dropdowns always inherit
    const root = document.documentElement;

    const keys = Object.keys(style);
    for (const k of keys) {
      if (!k.startsWith("--")) continue;
      root.style.setProperty(k, String(style[k]));
    }

    return () => {
      // cleanup only what we set
      for (const k of keys) {
        if (!k.startsWith("--")) continue;
        root.style.removeProperty(k);
      }
    };
  }, [theme.canvasVar]);

  return (
    <div
      className={cx(
        "min-h-screen",
        theme.bgPage,
        theme.text,
        fx.enabled && fx.ambient && "fx-ambient"
      )}
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

/*
PS (Charcoal header noir “décalé”):
- c’est côté Header (legacy/pro) quand hasCanvas=false, il met un fallback bg-slate-950.
- si ton thème charcoal n’injecte pas de canvasVar (--te-canvas), hasCanvas reste false.
- donc le fix final est dans legacy/pro header: remplacer le fallback bg-slate-950 par un fallback basé sur le thème (ex: theme.bgPage ou un token bgHeader).
*/
