"use client";

import React from "react";
import ReactDOM from "react-dom";
import Image from "next/image";

import type { TemplateConfigInput } from "./types";
import { getTheme, cx } from "./theme";
import { VARIANTS } from "./variants";
import { StudioPanel } from "./studio-panel";

/** FX styles (global) */
function FxStyles({ enabled, ambient }: { enabled: boolean; ambient: boolean }) {
  if (!enabled) return null;

  return (
    <style jsx global>{`
      @keyframes scanBorder {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }
      .fx-border-scan { position: relative; }
      .fx-border-scan::before {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: 24px;
        padding: 1px;
        background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.25) 25%,
            rgba(255, 255, 255, 0) 50%
          )
          0% 50% / 200% 200%;
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        mask-composite: exclude;
        -webkit-mask-composite: xor;
        opacity: 0.55;
        pointer-events: none;
        animation: scanBorder 5s linear infinite;
      }

      .fx-softglow { box-shadow: 0 18px 60px rgba(0,0,0,0.08); }

      @keyframes shimmer {
        0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
        20% { opacity: 0.55; }
        60% { opacity: 0.35; }
        100% { transform: translateX(120%) skewX(-18deg); opacity: 0; }
      }
      .fx-shimmer { position: relative; overflow: hidden; }
      .fx-shimmer::after {
        content: "";
        position: absolute;
        top: -20%;
        left: -40%;
        width: 40%;
        height: 140%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
        animation: shimmer 2.8s ease-in-out infinite;
        pointer-events: none;
      }

      ${ambient ? `
        .fx-ambient { position: relative; }
        .fx-ambient::before{
          content:"";
          position:absolute;
          inset:0;
          background:
            radial-gradient(circle at 20% 20%, rgba(0,0,0,0.06), transparent 40%),
            radial-gradient(circle at 80% 10%, rgba(0,0,0,0.05), transparent 45%),
            radial-gradient(circle at 60% 90%, rgba(0,0,0,0.04), transparent 50%);
          pointer-events:none;
          z-index: 0;
        }
        .fx-ambient > * { position: relative; z-index: 1; }
      ` : ``}

      /* Reveal one-shot */
      .reveal { will-change: opacity, transform; transition: opacity 520ms ease, transform 520ms ease; }
      .reveal[data-reveal="pending"] { opacity: 0; transform: translateY(14px); }
      .reveal.is-in { opacity: 1; transform: translateY(0); }

      @media (prefers-reduced-motion: reduce) {
        .reveal, .reveal[data-reveal="pending"] {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
      }
    `}</style>
  );
}

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

function resolveConfig(input: TemplateConfigInput): TemplateConfigInput {
  const clone =
    typeof structuredClone === "function"
      ? structuredClone(input)
      : (JSON.parse(JSON.stringify(input)) as TemplateConfigInput);

  const next = clone as any;

  next.options = next.options ?? {};
  next.options.fx = next.options.fx ?? {};
  next.options.fx = {
    enabled: !!next.options.fx?.enabled,
    ambient: !!next.options.fx?.ambient,
    softGlow: !!next.options.fx?.softGlow,
    borderScan: !!next.options.fx?.borderScan,
    shimmerCta: !!next.options.fx?.shimmerCta,
    ...(next.options.fx ?? {}),
  };

  next.brand = next.brand ?? {};
  next.brand.logo = next.brand.logo ?? {};

  const mode = next.brand.logo.mode ?? "logoPlusText";
  next.brand.logo.mode = mode;

  const w = Number(next.brand.logo.width ?? 80);
  const h = Number(next.brand.logo.height ?? 80);
  next.brand.logo.width = Number.isFinite(w) ? Math.max(24, w) : 80;
  next.brand.logo.height = Number.isFinite(h) ? Math.max(24, h) : 80;

  if (mode === "textOnly") {
    next.brand.logo.src = next.brand.logo.src ?? undefined;
  } else {
    next.brand.logo.src = next.brand.logo.src ?? "/brand/logo.svg";
  }

  next.content = next.content ?? {};

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
  const [liveConfig, setLiveConfig] = React.useState<TemplateConfigInput>(() => resolveConfig(config));

  React.useEffect(() => {
    setLiveConfig(resolveConfig(config));
  }, [config]);

  const setBoth = React.useCallback((next: React.SetStateAction<TemplateConfigInput>) => {
    setLiveConfig((prev) => {
      const computed = typeof next === "function" ? (next as any)(prev) : next;
      return resolveConfig(computed);
    });
  }, []);

  const lastSentRef = React.useRef<string>("");
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

  const themeVariant = (liveConfig as any).options?.themeVariant ?? "amberOrange";
  const theme = React.useMemo(() => getTheme(themeVariant), [themeVariant]);

  /** ✅ Header measurements (single truth) */
  const headerRef = React.useRef<HTMLElement>(null);

  React.useLayoutEffect(() => {
    const el = headerRef.current;

    // safe reset (avoid stale)
    document.documentElement.style.setProperty("--header-h", "0px");
    document.documentElement.style.setProperty("--header-offset", "0px");
    document.documentElement.style.scrollPaddingTop = "0px";

    if (!el) return;

    const apply = () => {
      const h = el.getBoundingClientRect().height;
      const headerH = Math.ceil(h);

      // keep sane (prevents weird spikes)
      const SAFE_MAX = 240;
      const safeH = Math.max(0, Math.min(headerH, SAFE_MAX));

      const gap = 12; // "respiration pro"
      const offset = safeH + gap;

      document.documentElement.style.setProperty("--header-h", `${safeH}px`);
      document.documentElement.style.setProperty("--header-offset", `${offset}px`);
      document.documentElement.style.scrollPaddingTop = `${offset}px`;
    };

    apply();

    const RO = (window as any).ResizeObserver as typeof ResizeObserver | undefined;
    let ro: ResizeObserver | null = null;
    let onResize: (() => void) | null = null;

    if (RO) {
      ro = new RO(() => apply());
      ro.observe(el);
    } else {
      onResize = () => apply();
      window.addEventListener("resize", onResize);
    }

    return () => {
      if (ro) ro.disconnect();
      if (onResize) window.removeEventListener("resize", onResize);
    };
  }, [(liveConfig as any).sections]);

  /** Header shrink */
  const [isScrolled, setIsScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Active section */
  const [activeHref, setActiveHref] = React.useState<string>("#top");
  React.useEffect(() => {
    const secs = ((liveConfig as any).sections ?? []).filter(
      (s: any) => s?.enabled !== false && s.type !== "header"
    );

    const ids = secs.map((s: any) => String(s.id));
    const elements = ids
      .map((id: string) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

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
    if (typeof document === "undefined") return;
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
    return flatImages.findIndex(
      (x) => x?.src === activeImg.src && (x?.caption ?? "") === (activeImg.caption ?? "")
    );
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
    () => !!(((liveConfig as any).sections ?? []).some((x: any) => x.type === "services" && x.enabled !== false)),
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

    const recheck = () => {
      const vh2 = window.innerHeight || 800;
      const fold2 = vh2 + Math.floor(vh2 * 0.35);
      entries.forEach(([id, el]) => {
        if (revealed.current.has(id)) return;
        const r = el.getBoundingClientRect();
        if (r.top < fold2 && r.bottom > 0) {
          el.classList.add("is-in");
          el.setAttribute("data-reveal", "done");
          revealed.current.add(id);
          obs.unobserve(el);
        }
      });
    };

    const t1 = window.setTimeout(recheck, 220);
    const t2 = window.setTimeout(recheck, 700);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      obs.disconnect();
    };
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
        if (!node.getAttribute("data-reveal")) node.removeAttribute("data-reveal");
      }

      revealRefs.current.set(id, node);
    };
  }, []);

  const renderSection = React.useCallback(
    (s: any) => {
      if (!s || s.enabled === false) return null;

      // ✅ Kill any "top" padding section. Keep only anchor.
      if (s.id === "top" || s.type === "top") {
        return <div key={s.id ?? "top"} id="top" aria-hidden style={{ height: 0 }} />;
      }

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
            key={s.id}
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
          />
        );
      }

      const wrap = (node: React.ReactNode) => (
        <div
          key={s.id}
          ref={registerReveal(String(s.id))}
          className="reveal"
          style={{ scrollMarginTop: "var(--header-offset, 84px)" }}
        >
          {node}
        </div>
      );

      // ✅ Hero rendu EXACTEMENT comme les autres (plus de wrapper spécial)
      if (s.type === "hero") {
        return wrap(
          <Comp
            {...common}
            content={(liveConfig as any).content}
            brand={(liveConfig as any).brand}
            hasServices={hasServices}
            sectionId={s.id}
          />
        );
      }

      switch (s.type) {
        case "proof":
          return wrap(<Comp {...common} content={(liveConfig as any).content} sectionId={s.id} />);

        case "services":
          return wrap(<Comp {...common} content={(liveConfig as any).content} servicesVariant={s.variant} sectionId={s.id} />);

        case "team":
          return wrap(<Comp {...common} content={(liveConfig as any).content} teamVariant={s.variant} sectionId={s.id} />);

        case "gallery":
          return wrap(
            <Comp
              {...common}
              content={(liveConfig as any).content}
              galleryLayout={s.variant}
              onOpen={onOpenImage}
              enableLightbox={enableLightbox}
              sectionId={s.id}
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
              sectionId={s.id}
            />
          );
        }

        case "split":
          return wrap(<Comp {...common} content={(liveConfig as any).content} sectionId={s.id} />);

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
      registerReveal,
      liveConfig,
    ]
  );

  return (
    <>
      <main className={cx("min-h-screen", theme.bgPage, theme.text, fx.enabled && fx.ambient && "fx-ambient")}>
        <FxStyles enabled={!!fx.enabled} ambient={!!fx.ambient} />
        {(((liveConfig as any).sections ?? []) as any[]).map(renderSection)}
      </main>

      {mounted && (liveConfig as any).options?.studio?.enabled && typeof document !== "undefined"
        ? ReactDOM.createPortal(<StudioPanel config={liveConfig as any} setConfig={setBoth as any} />, document.body)
        : null}

      {/* ✅ SINGLE lightbox */}
      {enableLightbox && lightboxOpen && activeImg?.src ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
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
