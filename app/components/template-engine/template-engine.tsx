// app/components/template-engine/template-engine.tsx
"use client";

import React from "react";
import ReactDOM from "react-dom";
import NextImage from "next/image";

import type { TemplateConfig } from "./types";
import { getTheme, cx } from "./theme";
import { VARIANTS } from "./variants";
import { StudioPanel } from "./studio-panel";

/** FX styles (global) */
function FxStyles({ enabled, ambient }: { enabled: boolean; ambient: boolean }) {
  if (!enabled) return null;

  return (
    <style jsx global>{`
      @keyframes scanBorder {
        0% {
          background-position: 0% 50%;
        }
        100% {
          background-position: 200% 50%;
        }
      }
      .fx-border-scan {
        position: relative;
      }
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

      .fx-softglow {
        box-shadow: 0 18px 60px rgba(0, 0, 0, 0.08);
      }

      @keyframes shimmer {
        0% {
          transform: translateX(-120%) skewX(-18deg);
          opacity: 0;
        }
        20% {
          opacity: 0.55;
        }
        60% {
          opacity: 0.35;
        }
        100% {
          transform: translateX(120%) skewX(-18deg);
          opacity: 0;
        }
      }
      .fx-shimmer {
        position: relative;
        overflow: hidden;
      }
      .fx-shimmer::after {
        content: "";
        position: absolute;
        top: -20%;
        left: -40%;
        width: 40%;
        height: 140%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
        animation: shimmer 2.8s ease-in-out infinite;
        pointer-events: none;
      }

      ${ambient
        ? `
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
      `
        : ``}
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

/** ✅ Résolution centralisée */
function resolveConfig(input: TemplateConfig): TemplateConfig {
  const clone =
    typeof structuredClone === "function"
      ? structuredClone(input)
      : (JSON.parse(JSON.stringify(input)) as TemplateConfig);

  const next = clone as TemplateConfig;

  // options safe
  next.options = next.options ?? ({} as any);
  (next.options as any).fx = (next.options as any).fx ?? ({} as any);

  next.options.fx = {
    enabled: !!next.options.fx?.enabled,
    ambient: !!next.options.fx?.ambient,
    softGlow: !!next.options.fx?.softGlow,
    borderScan: !!next.options.fx?.borderScan,
    shimmerCta: !!(next.options.fx as any)?.shimmerCta,
    ...(next.options.fx ?? {}),
  };

  // brand.logo safe
  next.brand = next.brand ?? ({} as any);
  next.brand.logo = next.brand.logo ?? ({} as any);

  const mode = (next.brand.logo as any).mode ?? "logoPlusText";
  (next.brand.logo as any).mode = mode;

  const w = Number(next.brand.logo.width ?? 80);
  const h = Number(next.brand.logo.height ?? 80);
  next.brand.logo.width = Number.isFinite(w) ? Math.max(24, w) : 80;
  next.brand.logo.height = Number.isFinite(h) ? Math.max(24, h) : 80;

  if (mode === "textOnly") {
    next.brand.logo.src = next.brand.logo.src ?? undefined;
  } else {
    next.brand.logo.src = next.brand.logo.src ?? "/brand/logo.svg";
  }

  // split moderne -> legacy
  const s = next.content?.split;
  if (s) {
    next.content.splitTitle = next.content.splitTitle ?? s.title ?? "";
    next.content.splitText = next.content.splitText ?? s.text ?? "";
    next.content.splitImage = next.content.splitImage ?? s.image ?? "";
    next.content.splitImageAlt = next.content.splitImageAlt ?? s.imageAlt ?? "";
    next.content.splitCtaLabel = next.content.splitCtaLabel ?? s.ctaLabel ?? "";
    next.content.splitCtaHref = next.content.splitCtaHref ?? s.ctaHref ?? "";
  }

  return next;
}

export function TemplateEngine({
  config,
  setConfig,
}: {
  config: TemplateConfig;
  setConfig?: React.Dispatch<React.SetStateAction<TemplateConfig>>;
}) {
  /** ✅ LIVE CONFIG (résolu) */
  const [liveConfig, setLiveConfig] = React.useState<TemplateConfig>(() => resolveConfig(config));

  // sync from parent -> local
  React.useEffect(() => {
    setLiveConfig(resolveConfig(config));
  }, [config]);

  /**
   * ✅ setter LOCAL ONLY (NE PAS setConfig ici)
   * sinon React warning "update parent while rendering child"
   */
  const setBoth = React.useCallback((next: React.SetStateAction<TemplateConfig>) => {
    setLiveConfig((prev) => {
      const computed = typeof next === "function" ? (next as any)(prev) : next;
      return resolveConfig(computed);
    });
  }, []);

  /**
   * ✅ push vers parent APRÈS render
   * avec anti-boucle (stringify)
   */
  const lastSentRef = React.useRef<string>("");
  React.useEffect(() => {
    if (!setConfig) return;
    const serialized = JSON.stringify(liveConfig);
    if (serialized === lastSentRef.current) return;
    lastSentRef.current = serialized;
    setConfig(liveConfig);
  }, [liveConfig, setConfig]);

  /** ✅ Portal mount */
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const fx = liveConfig.options?.fx ?? {
    enabled: false,
    ambient: false,
    softGlow: false,
    borderScan: false,
    shimmerCta: false,
  };

  const themeVariant = liveConfig.options?.themeVariant ?? ("amberOrange" as any);
  const theme = React.useMemo(() => getTheme(themeVariant), [themeVariant]);

  /** Sticky header scroll padding */
  const headerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const apply = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.scrollPaddingTop = `${Math.ceil(h) + 12}px`;
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
  }, [liveConfig.sections]);

  /** Nav links from galleries */
  const galleryLinks = React.useMemo(() => {
    const g = liveConfig.content?.galleries ?? [];
    return g.map((x: any) => ({ id: x.id, title: x.title }));
  }, [liveConfig.content?.galleries]);

  /** Lightbox */
  const flatImages = React.useMemo(() => {
    const list: any[] = [];
    (liveConfig.content?.galleries ?? []).forEach((g: any) => (g.images ?? []).forEach((img: any) => list.push(img)));
    return list;
  }, [liveConfig.content?.galleries]);

  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [activeImg, setActiveImg] = React.useState<AnyImg>(null);

  const enableLightbox = (liveConfig.options as any)?.enableLightbox ?? true;

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
    () => (liveConfig.sections?.find((x: any) => x.type === "hero")?.variant ?? "B") as any,
    [liveConfig.sections]
  );

  const showTeam = React.useMemo(
    () => !!liveConfig.sections?.find((x: any) => x.type === "team" && x.enabled !== false),
    [liveConfig.sections]
  );

  const hasServices = React.useMemo(
    () => !!liveConfig.sections?.some((x: any) => x.type === "services" && x.enabled !== false),
    [liveConfig.sections]
  );

  const globalLayout = (liveConfig.options as any)?.layout;

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
        layout: s.layout, // layout par section
        globalLayout,     // layout global
      };

      switch (s.type) {
        case "header":
          return (
            <Comp
              key={s.id}
              {...common}
              brand={liveConfig.brand}
              headerRef={headerRef}
              galleryLinks={galleryLinks}
              showTeam={showTeam}
              maxDirectLinks={liveConfig.options?.maxDirectLinksInMenu ?? 4}
              headerVariant={s.variant}
              content={liveConfig.content}
              contact={{
                phone: liveConfig.content?.contact?.phone,
                email: liveConfig.content?.contact?.email,
              }}
            />
          );

        case "hero":
          return (
            <Comp
              key={s.id}
              {...common}
              content={liveConfig.content}
              brand={liveConfig.brand}
              heroVariant={s.variant}
              hasServices={hasServices}
            />
          );

        case "services":
          return <Comp key={s.id} {...common} content={liveConfig.content} servicesVariant={s.variant} />;

        case "proof":
           return <Comp key={s.id} {...common} content={liveConfig.content} />;


        case "team":
          return <Comp key={s.id} {...common} content={liveConfig.content} teamVariant={s.variant} />;

        case "gallery":
          return (
            <Comp
              key={s.id}
              {...common}
              content={liveConfig.content}
              galleryLayout={s.variant}
              layout={s.variant}
              onOpen={onOpenImage}
              enableLightbox={enableLightbox}
            />
          );

        case "contact": {
          const resolved = s.variant === "AUTO" ? resolveContactVariantFromHero(heroVariant) : (s.variant as any);
          return (
            <Comp
              key={s.id}
              {...common}
              brand={liveConfig.brand}
              content={liveConfig.content}
              heroVariant={heroVariant}
              forcedVariant={resolved}
              contactVariant={resolved}
              variant={resolved}
            />
          );
        }

        case "split":
          return <Comp key={s.id} {...common} content={liveConfig.content} />;

        default:
          return null;
      }
    },
    [
      theme,
      fx,
      liveConfig.brand,
      liveConfig.content,
      liveConfig.options?.maxDirectLinksInMenu,
      galleryLinks,
      showTeam,
      hasServices,
      onOpenImage,
      enableLightbox,
      heroVariant,
      globalLayout,
    ]
  );

  return (
    <>
      <main className={cx("min-h-screen", theme.bgPage, theme.text, fx.enabled && fx.ambient && "fx-ambient")}>
        <FxStyles enabled={!!fx.enabled} ambient={!!fx.ambient} />
        {(liveConfig.sections ?? []).map(renderSection)}
      </main>

      {/* StudioPanel in portal */}
      {mounted && liveConfig.options?.studio?.enabled && typeof document !== "undefined"
        ? ReactDOM.createPortal(<StudioPanel config={liveConfig} setConfig={setBoth} />, document.body)
        : null}

      {/* Lightbox */}
      {enableLightbox && lightboxOpen && activeImg?.src ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
          onMouseDown={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] bg-black">
              <NextImage src={activeImg.src} alt={activeImg.alt || "Aperçu"} fill className="object-contain" />
            </div>

            <button
              onClick={closeLightbox}
              className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
            >
              Fermer ✕
            </button>

            <button
              onClick={prevImg}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
              aria-label="Précédent"
            >
              ←
            </button>

            <button
              onClick={nextImg}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
              aria-label="Suivant"
            >
              →
            </button>

            {activeImg.caption && activeImg.caption.trim().length > 0 ? (
              <div className="border-t border-white/10 bg-black px-4 py-3 text-sm text-white/80">{activeImg.caption}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
