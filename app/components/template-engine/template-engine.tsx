// app/components/template-engine/template-engine.tsx
"use client";

import React from "react";
import ReactDOM from "react-dom";
import Image from "next/image";

import type { TemplateConfigInput } from "./types";
import { getTheme, cx } from "./theme";
import { VARIANTS } from "./variants";
import StudioPanel from "./studio-panel";
import { FxStyles } from "./fx-styles";

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

function resolveContactVariantFromHero(heroVariant: string): "A" | "B" {
  const dark = ["A", "B", "D", "E", "G", "H"].includes(String(heroVariant));
  return dark ? "B" : "A";
}

type AnyImg = { src: string; alt?: string; caption?: string } | null;

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
  next.options.studio.ui = next.options.studio.ui ?? {};
  next.options.studio.ui.dock = next.options.studio.ui.dock ?? "right";
  next.options.studio.ui.minimized = next.options.studio.ui.minimized ?? false;

  // ✅ keep safe if types.ts doesn't include it
  (next.options as any).themeVariant = (next.options as any).themeVariant ?? "amberOrange|classic";

  next.brand = next.brand ?? {};
  next.brand.logo = next.brand.logo ?? {};
  next.brand.logo.mode = next.brand.logo.mode ?? "logoPlusText";
  next.brand.logo.width = Math.max(24, Number(next.brand.logo.width ?? 80) || 80);
  next.brand.logo.height = Math.max(24, Number(next.brand.logo.height ?? 80) || 80);

  if (next.brand.logo.mode === "textOnly") {
    next.brand.logo.src = next.brand.logo.src ?? undefined;
  } else {
    next.brand.logo.src = next.brand.logo.src ?? "/brand/logo.svg";
  }

  next.content = next.content ?? {};

  // compat split legacy
  const s = next.content?.split;
  if (s) {
    next.content.splitTitle = next.content.splitTitle ?? s.title ?? "";
    next.content.splitText = next.content.splitText ?? s.text ?? "";
    next.content.splitImage = next.content.splitImage ?? s.image ?? "";
    next.content.splitImageAlt = next.content.splitImageAlt ?? s.imageAlt ?? "";
    next.content.splitCtaLabel = next.content.splitCtaLabel ?? s.ctaLabel ?? "";
    next.content.splitCtaHref = next.content.splitCtaHref ?? s.ctaHref ?? "";
  }

  next.sections = Array.isArray(next.sections) ? next.sections : [];
  return next as TemplateConfigInput;
}

export function TemplateEngine({
  config,
  setConfig,
}: {
  config: TemplateConfigInput;
  setConfig?: React.Dispatch<React.SetStateAction<TemplateConfigInput>>;
}) {
  const lastSentRef = React.useRef<string>("");

  const [liveConfig, setLiveConfig] = React.useState<TemplateConfigInput>(() => {
    const resolved = resolveConfig(config);
    lastSentRef.current = JSON.stringify(resolved);
    return resolved;
  });

  // ✅ sync from parent without feedback loop
  React.useEffect(() => {
    const resolved = resolveConfig(config);
    const serialized = JSON.stringify(resolved);
    // only sync if really different
    if (serialized === JSON.stringify(liveConfig)) return;
    setLiveConfig(resolved);
    // IMPORTANT: align lastSent to prevent immediate re-send
    lastSentRef.current = serialized;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const setBoth = React.useCallback((next: React.SetStateAction<TemplateConfigInput>) => {
    setLiveConfig((prev) => {
      const computed = typeof next === "function" ? (next as any)(prev) : next;
      return resolveConfig(computed);
    });
  }, []);

  // push to parent (controlled mode)
  React.useEffect(() => {
    if (!setConfig) return;
    const serialized = JSON.stringify(liveConfig);
    if (serialized === lastSentRef.current) return;
    lastSentRef.current = serialized;
    setConfig(liveConfig);
  }, [liveConfig, setConfig]);

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
  const theme = React.useMemo(() => getTheme(themeVariant), [themeVariant]);

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

  /** Smooth header shrink (0..1) */
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

  /** Header variant (pour déclencher re-measure) */
  const headerVariant = React.useMemo(() => {
    const h = (((liveConfig as any).sections ?? []) as any[]).find((x) => x.type === "header");
    return String(h?.variant ?? "A");
  }, [(liveConfig as any).sections]);

  /** Header measurements */
  const headerRef = React.useRef<HTMLElement>(null);
  React.useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    let raf = 0;

    const apply = () => {
      const headerH = Math.ceil(el.getBoundingClientRect().height || el.offsetHeight || 0);
      const SAFE_MAX = 260;
      const safeH = Math.max(0, Math.min(headerH, SAFE_MAX));
      const gap = 16;

      document.documentElement.style.scrollPaddingTop = `${safeH + gap}px`;
      document.documentElement.style.setProperty("--header-h", `${safeH}px`);
      document.documentElement.style.setProperty("--header-offset", `${safeH + gap}px`);
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };

    apply();

    const RO = (window as any).ResizeObserver as typeof ResizeObserver | undefined;
    let ro: ResizeObserver | null = null;
    let onResize: (() => void) | null = null;

    if (RO) {
      ro = new RO(schedule);
      ro.observe(el);
    } else {
      onResize = schedule;
      window.addEventListener("resize", onResize);
    }

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (onResize) window.removeEventListener("resize", onResize);
    };
  }, [headerVariant, themeVariant]);

  /** Active section */
  const [activeHref, setActiveHref] = React.useState<string>("#top");
  React.useEffect(() => {
    const secs = ((liveConfig as any).sections ?? []).filter(
      (s: any) => s?.enabled !== false && s.type !== "header" && s.type !== "top"
    );

    const ids = secs.map((s: any) => String(s.id));
    const elements = ids.map((id: string) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!elements.length) return;

    const IO = (window as any).IntersectionObserver as typeof IntersectionObserver | undefined;
    if (!IO) return;

    const observer = new IO(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (visible?.target?.id) {
          const id = (visible.target as HTMLElement).id;
          setActiveHref(id === "top" ? "#top" : `#${id}`);
        }
      },
      { root: null, rootMargin: "-20% 0px -65% 0px", threshold: [0.08, 0.15, 0.25, 0.4, 0.6] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [(liveConfig as any).sections]);

  /** Smooth scroll */
  React.useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  /** Nav links from galleries */
  const galleryLinks = React.useMemo(() => {
    const g = (liveConfig as any).content?.galleries ?? [];
    return g.map((x: any) => ({ id: x.id, title: x.title }));
  }, [(liveConfig as any).content]);

  /** Lightbox */
  const flatImages = React.useMemo(() => {
    const list: any[] = [];
    (((liveConfig as any).content?.galleries ?? []) as any[]).forEach((g: any) =>
      (g.images ?? []).forEach((img: any) => list.push(img))
    );
    return list;
  }, [(liveConfig as any).content]);

  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [activeImg, setActiveImg] = React.useState<AnyImg>(null);

  const enableLightbox = (liveConfig as any).options?.enableLightbox ?? true;

  const onOpenImage = React.useCallback(
    (img: any) => {
      if (!enableLightbox) return;
      setActiveImg(img);
      setLightboxOpen(true);
    },
    [enableLightbox]
  );

  const closeLightbox = React.useCallback(() => {
    setLightboxOpen(false);
    setActiveImg(null);
  }, []);

  const activeIndex = React.useMemo(() => {
    if (!activeImg) return -1;
    return flatImages.findIndex((x) => x?.src === activeImg.src && (x?.caption ?? "") === (activeImg.caption ?? ""));
  }, [activeImg, flatImages]);

  const prevImg = React.useCallback(() => {
    if (!flatImages.length) return;
    const i = activeIndex < 0 ? 0 : activeIndex;
    const next = (i - 1 + flatImages.length) % flatImages.length;
    setActiveImg(flatImages[next]);
  }, [activeIndex, flatImages]);

  const nextImg = React.useCallback(() => {
    if (!flatImages.length) return;
    const i = activeIndex < 0 ? 0 : activeIndex;
    const next = (i + 1) % flatImages.length;
    setActiveImg(flatImages[next]);
  }, [activeIndex, flatImages]);

  React.useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "ArrowRight") nextImg();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox, prevImg, nextImg]);

  const heroVariant = React.useMemo(
    () => ((((liveConfig as any).sections ?? []).find((x: any) => x.type === "hero")?.variant ?? "B") as any),
    [(liveConfig as any).sections]
  );

  const showTeam = React.useMemo(
    () => !!(((liveConfig as any).sections ?? []).find((x: any) => x.type === "team" && x.enabled !== false)),
    [(liveConfig as any).sections]
  );

  const hasServices = React.useMemo(
    () => (((liveConfig as any).sections ?? []) as any[]).some((x: any) => x.type === "services" && x.enabled !== false),
    [(liveConfig as any).sections]
  );

  const globalLayout = (liveConfig as any).options?.layout;

  /** Reveal one-shot */
  const revealRefs = React.useRef<Map<string, HTMLElement>>(new Map());
  const revealed = React.useRef<Set<string>>(new Set());

  React.useLayoutEffect(() => {
    const entries = Array.from(revealRefs.current.entries());
    if (!entries.length) return;

    const vh = window.innerHeight || 800;
    const fold = vh + Math.floor(vh * 0.35);

    entries.forEach(([id, el]) => {
      if (revealed.current.has(id)) {
        el.classList.add("is-in");
        el.setAttribute("data-reveal", "done");
        return;
      }

      const r = el.getBoundingClientRect();
      const alreadyVisible = r.top < fold && r.bottom > 0;

      if (alreadyVisible) {
        el.classList.add("is-in");
        revealed.current.add(id);
        el.setAttribute("data-reveal", "done");
      } else {
        el.setAttribute("data-reveal", "pending");
      }
    });

    const IO = (window as any).IntersectionObserver as typeof IntersectionObserver | undefined;
    if (!IO) {
      entries.forEach(([id, el]) => {
        el.classList.add("is-in");
        revealed.current.add(id);
        el.setAttribute("data-reveal", "done");
      });
      return;
    }

    const obs = new IO(
      (ioEntries) => {
        for (const e of ioEntries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const id = el.getAttribute("data-reveal-id") || "";
          if (!id) continue;

          el.classList.add("is-in");
          el.setAttribute("data-reveal", "done");
          revealed.current.add(id);
          obs.unobserve(el);
        }
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    entries.forEach(([id, el]) => {
      if (!revealed.current.has(id)) obs.observe(el);
    });

    return () => obs.disconnect();
  }, [(liveConfig as any).sections, themeVariant]);

  const registerReveal = React.useCallback((id: string) => {
    return (node: HTMLElement | null) => {
      if (!id) return;

      if (!node) {
        revealRefs.current.delete(id);
        return;
      }

      node.setAttribute("data-reveal-id", id);

      if (revealed.current.has(id)) {
        node.classList.add("is-in");
        node.setAttribute("data-reveal", "done");
      } else {
        node.setAttribute("data-reveal", "pending");
      }

      revealRefs.current.set(id, node);
    };
  }, []);

  const renderSection = React.useCallback(
    (s: any) => {
      if (s.enabled === false) return null;

      const map = (VARIANTS as any)[s.type];
      const Comp = map?.[s.variant] ?? map?.[fallbackVariant(s.type)] ?? null;
      if (!Comp) return null;

      const common = {
        theme,
        fx,
        variant: s.variant,
        layout: s.layout,
        globalLayout,
        sectionId: s.id,
      };

      if (s.type === "header") {
        return (
          <Comp
            key={`${s.id}:${s.variant ?? ""}`}
            {...common}
            brand={(liveConfig as any).brand}
            headerRef={headerRef}
            galleryLinks={galleryLinks}
            showTeam={showTeam}
            maxDirectLinks={(liveConfig as any).options?.maxDirectLinksInMenu ?? 4}
            headerVariant={s.variant}
            content={(liveConfig as any).content}
            contact={{
              phone: (liveConfig as any).content?.contact?.phone,
              email: (liveConfig as any).content?.contact?.email,
            }}
            sections={(liveConfig as any).sections}
            activeHref={activeHref}
            isScrolled={isScrolled}
            scrollT={scrollT}
          />
        );
      }

      if (s.type === "top") {
        return <div key={`${s.id}:${s.variant ?? ""}`} id="top" style={{ height: 0, scrollMarginTop: 0 }} aria-hidden="true" />;
      }

      const wrap = (node: React.ReactNode) => (
        <div
          key={`${s.id}:${s.variant ?? ""}`} // ✅ remount on variant change (fix split A/B not updating)
          ref={registerReveal(String(s.id))}
          className={cx("reveal", fx.enabled && fx.softGlow && "fx-softglow")}
          style={{ scrollMarginTop: "var(--header-offset, 84px)" }}
        >
          {node}
        </div>
      );

      switch (s.type) {
        case "hero":
          return wrap(<Comp {...common} content={(liveConfig as any).content} brand={(liveConfig as any).brand} hasServices={hasServices} />);

        case "proof":
          return wrap(<Comp {...common} content={(liveConfig as any).content} />);

        case "services":
          return wrap(<Comp {...common} content={(liveConfig as any).content} servicesVariant={s.variant} />);

        case "team":
          return wrap(<Comp {...common} content={(liveConfig as any).content} teamVariant={s.variant} />);

        case "gallery":
          return wrap(
            <Comp
              {...common}
              content={(liveConfig as any).content}
              galleryLayout={s.variant}
              onOpen={onOpenImage}
              enableLightbox={enableLightbox}
            />
          );

        case "contact": {
          const resolved = s.variant === "AUTO" ? resolveContactVariantFromHero(heroVariant) : (s.variant as any);
          return wrap(
            <Comp
              {...common}
              brand={(liveConfig as any).brand}
              content={(liveConfig as any).content}
              heroVariant={heroVariant}
              variant={resolved}
            />
          );
        }

        case "split":
          return wrap(<Comp {...common} content={(liveConfig as any).content} sectionTitle={s.title} />);

        default:
          return null;
      }
    },
    [
      theme,
      fx,
      galleryLinks,
      showTeam,
      hasServices,
      onOpenImage,
      enableLightbox,
      heroVariant,
      globalLayout,
      activeHref,
      isScrolled,
      scrollT,
      registerReveal,
      liveConfig,
    ]
  );

  const studioEnabled = !!(liveConfig as any)?.options?.studio?.enabled;

  return (
    <>
      <main className={cx("min-h-screen", theme.bgPage, theme.text, fx.enabled && fx.ambient && "fx-ambient")}>
        <div id="top" style={{ height: 0 }} aria-hidden="true" />
        <FxStyles enabled={!!fx.enabled} ambient={!!fx.ambient} />
        {(((liveConfig as any).sections ?? []) as any[]).map(renderSection)}
      </main>

      {mounted && studioEnabled && typeof document !== "undefined"
        ? ReactDOM.createPortal(<StudioPanel config={liveConfig as any} setConfig={setBoth as any} />, document.body)
        : null}

      {enableLightbox && lightboxOpen && activeImg?.src ? (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4" onMouseDown={closeLightbox} role="dialog" aria-modal="true">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black" onMouseDown={(e) => e.stopPropagation()}>
            <div className="relative aspect-[16/9] bg-black">
              <Image src={activeImg.src} alt={activeImg.alt || "Aperçu"} fill className="object-contain" />
            </div>

            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
              aria-label="Fermer"
            >
              Fermer ✕
            </button>

            <button
              type="button"
              onClick={prevImg}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
              aria-label="Précédent"
            >
              ←
            </button>

            <button
              type="button"
              onClick={nextImg}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
              aria-label="Suivant"
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default TemplateEngine;
