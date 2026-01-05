"use client";

import React from "react";
import NextImage from "next/image";

import type { ThemeLike } from "./theme";
import {
  cx,
  resolveLayout,
  containerClass,
  sectionPadY,
  heroPadY,
  radiusClass,
  radiusStyle,
} from "./theme";

import { resolveSocialLinks, type SocialConfig } from "./socials";

/* ============================================================
   BLOC 0 — TYPES (soft compat)
   ============================================================ */

type Brand = any;
type LayoutTokens = any;
type HeaderVariantX = any;
type LogoMode = "logoPlusText" | "logoOnly" | "textOnly";

function hasText(v: any) {
  return typeof v === "string" && v.trim().length > 0;
}

/** nettoie les labels (enlève les "+" accidentels en début/fin, espaces, etc.) */
function cleanNavLabel(v: any) {
  const s = String(v ?? "");
  return s
    .replace(/^\s*\+\s*/, "")
    .replace(/\s*\+\s*$/, "")
    .trim();
}

/**
 * Génère un id DOM unique pour des sections répétées (split, split-2, split-3...)
 * IMPORTANT: nécessite un reset global une fois par page (dans LegacyHeader).
 */
function useUniqueDomId(sectionId?: string) {
  return React.useMemo(() => {
    const raw = String(sectionId ?? "").trim();
    if (!raw) return "";

    if (typeof window === "undefined") return raw;

    const w = window as any;
    w.__te_ids = w.__te_ids || new Map<string, number>();

    const m: Map<string, number> = w.__te_ids;
    const n = (m.get(raw) ?? 0) + 1;
    m.set(raw, n);

    return n === 1 ? raw : `${raw}-${n}`;
  }, [sectionId]);
}

/* ============================================================
   BLOC 0B — GLASS HELPERS (1 source de vérité, anti “miroir”)
   ============================================================ */

function pickCanvasVar(theme: ThemeLike, propsCanvasVar?: React.CSSProperties) {
  return (
    ((propsCanvasVar ??
      (theme as any)?.canvasVar ??
      {}) as React.CSSProperties) || {}
  );
}

function hasCanvasVars(canvasVar: React.CSSProperties) {
  const v: any = canvasVar || {};
  return (
    !!v["--te-canvas"] ||
    !!v["--te-surface"] ||
    !!v["--te-surface-2"] ||
    !!v["--te-surface-border"]
  );
}

/** Header glass: un poil translucide en scroll, plus dense en top */
function headerGlassStyle(
  theme: ThemeLike,
  canvasVar: React.CSSProperties,
  isScrolled: boolean
): React.CSSProperties {
  const dark = theme.isDark;

  const mixTop = dark
    ? "color-mix(in srgb, var(--te-canvas, #020617) 94%, transparent)"
    : "color-mix(in srgb, var(--te-canvas, #ffffff) 92%, transparent)";
  const mixScroll = dark
    ? "color-mix(in srgb, var(--te-canvas, #020617) 88%, transparent)"
    : "color-mix(in srgb, var(--te-canvas, #ffffff) 86%, transparent)";

  return {
    ...canvasVar,
    background: dark
      ? `linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.00)), ${
          isScrolled ? mixScroll : mixTop
        }`
      : `linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.10)), ${
          isScrolled ? mixScroll : mixTop
        }`,
    borderColor: "var(--te-surface-border, rgba(255,255,255,0.10))",
    backdropFilter: "blur(12px) saturate(125%)",
    WebkitBackdropFilter: "blur(12px) saturate(125%)",
    boxShadow: isScrolled
      ? "0 10px 34px rgba(0,0,0,0.28)"
      : "0 2px 10px rgba(0,0,0,0.16)",
  };
}

/** Dropdown glass: lisible (pas miroir), fond plus dense que header */
function menuGlassStyle(
  theme: ThemeLike,
  canvasVar: React.CSSProperties
): React.CSSProperties {
  const dark = theme.isDark;

  const base = dark
    ? "color-mix(in srgb, var(--te-canvas, #020617) 92%, transparent)"
    : "color-mix(in srgb, var(--te-canvas, #ffffff) 90%, transparent)";

  const sheen = dark
    ? "linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))"
    : "linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.25))";

  const smoke = dark
    ? "linear-gradient(to bottom, rgba(2,6,23,0.38), rgba(2,6,23,0.18))"
    : "";

  return {
    ...canvasVar,
    background: dark ? `${sheen}, ${smoke}, ${base}` : `${sheen}, ${base}`,
    borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
    backdropFilter: "blur(18px) saturate(130%)",
    WebkitBackdropFilter: "blur(18px) saturate(130%)",
    boxShadow: dark
      ? "0 24px 70px rgba(0,0,0,0.45)"
      : "0 18px 55px rgba(0,0,0,0.18)",
  };
}

/* ============================================================
   BLOC 1 — UI HELPERS
   ============================================================ */

function Wrap({
  children,
  layout,
  globalLayout,
  className,
  style,
}: {
  children: React.ReactNode;
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
  className?: string;
  style?: React.CSSProperties;
}) {
  const l = resolveLayout(layout, globalLayout);
  return (
    <div className={cx(containerClass(l.container), className)} style={style}>
      {children}
    </div>
  );
}

/* ============================================================
   BLOC 1B — SURFACE (autonome)
   ============================================================ */

function Surface({
  children,
  theme,
  layout,
  globalLayout,
  className,
  style,
}: {
  children: React.ReactNode;
  theme: ThemeLike;
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
  className?: string;
  style?: React.CSSProperties;
}) {
  const l = resolveLayout(layout, globalLayout);

  const canvasVar = pickCanvasVar(theme);
  const hasCanvas = hasCanvasVars(canvasVar);

  const fallbackBg = theme.isDark ? "bg-white/5" : "bg-white/85";

  return (
    <div
      style={{
        ...radiusStyle(l.radius),
        ...(hasCanvas ? canvasVar : {}),
        ...style,
      }}
      className={cx(
        "border backdrop-blur-xl",
        hasCanvas
          ? "bg-[color:color-mix(in_srgb,var(--te-canvas)_82%,var(--te-surface-2)_18%)]"
          : theme.surfaceBg || fallbackBg,
        hasCanvas
          ? "border-[color:var(--te-surface-border)]"
          : theme.surfaceBorder ||
              (theme.isDark ? "border-white/10" : "border-slate-200"),
        theme.isDark ? "text-white" : "text-slate-900",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ============================================================
   BLOC 1C — SOCIAL ROW
   ============================================================ */

function SocialRow({
  theme,
  cfg,
  className,
}: {
  theme: ThemeLike;
  cfg?: SocialConfig;
  className?: string;
}) {
  const items = React.useMemo(() => resolveSocialLinks(cfg), [cfg]);
  if (!items.length) return null;

  const btnBase =
    "inline-flex items-center justify-center rounded-2xl border transition hover:-translate-y-[1px] active:translate-y-0";
  const btnTheme = cx(
    theme.isDark
      ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
      : "border-slate-200 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950",
    "backdrop-blur"
  );

  return (
    <div className={cx("flex items-center gap-2", className)}>
      {items.map(({ kind, href, def }) => (
        <a
          key={kind}
          href={href}
          target="_blank"
          rel="noreferrer"
          title={def.label}
          aria-label={def.label}
          className={cx(btnBase, btnTheme, "h-10 w-10")}
        >
          <def.Icon className="opacity-90" />
        </a>
      ))}
    </div>
  );
}

/* ============================================================
   BLOC 1D — OVERFLOW MENU (desktop)
   ============================================================ */

function DesktopOverflowMenu({
  theme,
  label = "Plus",
  items,
  menuStyle,
  hasCanvas,
  active = false,
  buttonClassName,
  showCaret = true,
  activeHref,
  navBaseClass,
  underline = false,
  underlineActive = false,
}: {
  theme: ThemeLike;
  label?: string;
  items: { href: string; label: string }[];
  menuStyle?: React.CSSProperties;
  hasCanvas?: boolean;
  active?: boolean;
  buttonClassName?: string;
  showCaret?: boolean;
  activeHref?: string;
  navBaseClass?: string; // ✅ pour matcher la typo du header
  underline?: boolean;
  underlineActive?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as any)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!items?.length) return null;

  const canvasFallbackStyle: React.CSSProperties = {
    background: theme.isDark
      ? "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), color-mix(in srgb, var(--te-canvas, #020617) 92%, transparent)"
      : "linear-gradient(to bottom, rgba(255,255,255,0.70), rgba(255,255,255,0.25)), color-mix(in srgb, var(--te-canvas, #ffffff) 90%, transparent)",
    borderColor: theme.isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
    backdropFilter: "blur(18px) saturate(130%)",
    WebkitBackdropFilter: "blur(18px) saturate(130%)",
    boxShadow: theme.isDark
      ? "0 24px 70px rgba(0,0,0,0.45)"
      : "0 18px 55px rgba(0,0,0,0.18)",
  };

  const useCanvasLike = Boolean(menuStyle) || Boolean(hasCanvas);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cx(
          "group inline-flex items-center gap-2 transition-colors text-inherit",
          navBaseClass ?? "",
          buttonClassName
            ? buttonClassName
            : cx(
                active ? "opacity-100" : "opacity-80 hover:opacity-100",
                open && "opacity-100"
              )
        )}
      >
        {/* underline EXACT sous le texte */}
        <span className="relative inline-block">
          <span className="whitespace-nowrap">{label}</span>
          {showCaret ? (
            <span
              className={cx(
                "ml-2 inline-block transition",
                open ? "rotate-180" : ""
              )}
            >
              ▾
            </span>
          ) : null}

          {underline ? (
            <span
              className={cx(
                "pointer-events-none absolute left-0 -bottom-2 h-[2px] w-full bg-gradient-to-r transition-opacity",
                theme.accentFrom,
                theme.accentTo,
                underlineActive
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              )}
            />
          ) : null}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          style={useCanvasLike ? menuStyle ?? canvasFallbackStyle : undefined}
          className={cx(
            "absolute right-0 z-[999] mt-3 w-56 overflow-hidden rounded-2xl border shadow-lg",
            useCanvasLike
              ? "border-[color:var(--te-surface-border)] text-inherit"
              : theme.isDark
              ? "border-white/10 bg-slate-950/95 text-white"
              : "border-slate-200 bg-white/85 text-slate-900"
          )}
        >
          {items.map((it) => {
            const rowActive = it.href === (activeHref ?? "");
            return (
              <a
                key={it.href}
                href={it.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cx(
                  "relative block px-4 py-3 font-semibold transition",
                  navBaseClass ?? "text-sm",
                  rowActive
                    ? theme.isDark
                      ? "bg-white/10"
                      : "bg-black/5"
                    : "",
                  theme.isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                )}
              >
                {rowActive ? (
                  <span
                    aria-hidden="true"
                    className={cx(
                      "absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b",
                      theme.accentFrom,
                      theme.accentTo
                    )}
                  />
                ) : null}
                <span className={cx("block", rowActive && "pl-2")}>
                  {it.label}
                </span>
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   BLOC 2 — HEADER (A/B/C/D)
   ============================================================ */

export function LegacyHeader(props: {
  theme: ThemeLike;
  brand: Brand;
  headerVariant: any;
  galleryLinks: { id: string; title: string }[];
  headerRef: React.RefObject<HTMLElement>;
  showTeam: boolean;

  maxDirectLinks?: number;
  maxDirectLinksInMenu?: number;

  contact?: { phone?: string; email?: string };
  content?: any;
  sections?: any[];
  activeHref?: string;
  isScrolled?: boolean;
  scrollT?: number;
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;

  canvasStyle?: "classic" | "immersive";
  canvasVar?: React.CSSProperties;
}) {
  const { theme, brand, headerVariant, headerRef, showTeam, contact } = props;

  // ✅ RESET global ids map 1x par page (sinon tu gardes split-999 en hot reload)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__te_ids = new Map<string, number>();
  }, []);

  const variant = (headerVariant ?? "A") as HeaderVariantX;
  const l = resolveLayout(props.layout, props.globalLayout);

  const t = Math.max(
    0,
    Math.min(1, Number(props.scrollT ?? (props.isScrolled ? 1 : 0)))
  );
  const isScrolled = t > 0.15;

  const lerp = (a: number, b: number) => a + (b - a) * t;

  const padY = lerp(16, 10);
  const padY2 = lerp(14, 9);
  const navPadY = lerp(10, 8);

  const logoScale = lerp(1, 0.92);

  const showCta = !["J"].includes(String(variant));
  const includeContactInNav = true;

  const navBase =
    "text-[12px] font-semibold uppercase tracking-[0.14em] leading-none";

  // Logo
  const logoEnabled = (brand as any)?.logo?.enabled !== false;
  const logoMode =
    (((brand as any)?.logo?.mode ?? "logoPlusText") as LogoMode) ||
    "logoPlusText";
  const logoW = Math.max(32, Number((brand as any)?.logo?.width ?? 80));
  const logoH = Math.max(28, Number((brand as any)?.logo?.height ?? 64));
  const logoSrc = (brand as any)?.logo?.src;

  const showLogo = logoEnabled && logoMode !== "textOnly" && !!logoSrc;
  const showTextBlock = logoMode !== "logoOnly";
  const hasBrandLeft = Boolean(showLogo || showTextBlock);

  const LogoNode =
    logoMode === "textOnly" ? null : showLogo ? (
      <div style={{ height: logoH }} className="flex items-center shrink-0">
        <NextImage
          src={logoSrc}
          alt="Logo"
          width={logoW}
          height={logoH}
          priority
          className="object-contain"
          style={{ height: logoH, width: "auto" }}
        />
      </div>
    ) : (
      <div
        className={cx(
          "rounded-2xl bg-gradient-to-br shrink-0",
          theme.accentFrom,
          theme.accentTo
        )}
        style={{ width: 56, height: 56 }}
        aria-hidden="true"
      />
    );

  React.useLayoutEffect(() => {
    const el = headerRef?.current as HTMLElement | null;
    if (!el) return;

    const root = document.documentElement;

    const apply = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      const offset = Math.max(0, h + 16);

      root.style.setProperty("--header-h", `${h}px`);
      root.style.setProperty("--header-offset", `${offset}px`);
      root.style.scrollPaddingTop = `${offset}px`;
    };

    apply();

    const ro = new ResizeObserver(() => apply());
    ro.observe(el);

    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [headerRef]);

  const subtitleRaw = (brand as any)?.text?.subtitle;
  const subtitleText = hasText(subtitleRaw) ? String(subtitleRaw) : "\u00A0";

  const BrandText = showTextBlock ? (
    <div className="min-w-0 leading-tight">
      <div
        className={cx(
          "truncate font-semibold",
          theme.isDark ? "text-white" : "text-slate-900"
        )}
      >
        {(brand as any)?.text?.name ?? "Nom de la société"}
      </div>

      <div
        className={cx(
          "truncate text-xs",
          theme.isDark ? "text-white/70" : "text-slate-500",
          "min-h-[1.125rem] leading-[1.125rem]"
        )}
      >
        {subtitleText}
      </div>
    </div>
  ) : null;

  const ctaLabel = props.content?.cta?.header ?? "Contact";
  const Cta = showCta ? (
    <a
      href="#contact"
      className={cx(
        radiusClass(l.radius),
        "fx-cta shrink-0 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition will-change-transform hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
        theme.accentFrom,
        theme.accentTo
      )}
    >
      {ctaLabel}
    </a>
  ) : null;

  const socialsCfg = (props.content?.socials ?? undefined) as
    | SocialConfig
    | undefined;

  // sections
  const secs = Array.isArray((props as any).sections)
    ? (props as any).sections
    : [];

  // active href handling (Accueil) — ✅ ne pas “remapper” ici
  const activeHref = props.activeHref ?? "#top";

  // ============================================================
  // ✅ LINKS (href = DOM id unique)
  // ============================================================

  const homeLabel = String(props.content?.nav?.homeLabel ?? "Accueil");

  const enabledSecs = Array.isArray(secs)
    ? secs.filter(
        (sec: any) =>
          sec?.enabled !== false &&
          sec?.type !== "header" &&
          sec?.type !== "top"
      )
    : [];

  const usedIds = new Map<string, number>();

  let orderedLinks: { href: string; label: string }[] = enabledSecs
    .map((sec: any) => {
      const rawId = String(sec?.id ?? "").trim();
      if (!rawId) return null;

      // ✅ id unique (split, split-2, split-3…)
      const n = (usedIds.get(rawId) ?? 0) + 1;
      usedIds.set(rawId, n);
      const domId = n === 1 ? rawId : `${rawId}-${n}`;

      let label = sec.navLabel ?? sec.title ?? rawId;

      const tt = String(sec.type ?? "").toLowerCase();
      if (tt === "galleries" || tt === "gallery") {
        const gs = Array.isArray(props.content?.galleries)
          ? props.content.galleries
          : [];
        const gg = gs.find((x: any) => String(x?.id) === rawId);
        if (gg?.title) label = gg.title;
      }

      label = cleanNavLabel(label);

      return { href: `#${domId}`, label };
    })
    .filter(Boolean) as { href: string; label: string }[];

  // ✅ HOME link logic
  const firstRealHref = orderedLinks[0]?.href ?? "#top";

  // si la première section est hero, on remplace par #top (Accueil)
  // sinon on garde la première section ET on ajoute Accueil devant
  if (orderedLinks.length && firstRealHref === "#hero") {
    orderedLinks[0] = { href: "#top", label: homeLabel };
  } else {
    orderedLinks = [{ href: "#top", label: homeLabel }, ...orderedLinks];
  }

  const fallbackLinks = [
    { href: "#top", label: homeLabel },
    { href: "#approche", label: "Approche" },
    ...(showTeam ? [{ href: "#team", label: "Équipe" }] : []),
    ...(includeContactInNav ? [{ href: "#contact", label: "Contact" }] : []),
  ];

  let linksAll: { href: string; label: string }[] =
    orderedLinks.length > 0 ? [...orderedLinks] : [...fallbackLinks];

  // force approche/contact si la section existe vraiment
  const forceIfExists = (id: string, label: string) => {
    const exists = enabledSecs.some((s: any) => String(s?.id ?? "") === id);
    if (!exists) return;
    const href = `#${id}`;
    if (!linksAll.some((l) => l.href === href)) linksAll.push({ href, label });
  };

  forceIfExists("approche", "Approche");
  forceIfExists("contact", "Contact");

  // dédoublonnage href
  const seen = new Set<string>();
  linksAll = linksAll.filter((l) => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });

  // ============================================================
  // ✅ SCROLL-SPY LOCAL (FIABLE JUSQU’EN BAS)
  // ============================================================

  const [activeHrefLocal, setActiveHrefLocal] = React.useState<string>("#top");

  const getHeaderOffsetPx = React.useCallback(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--header-offset")
      .trim();
    const n = Number(String(v).replace("px", ""));
    return Number.isFinite(n) && n > 0 ? n : 84;
  }, []);

  const computeActiveHref = React.useCallback(() => {
    if (typeof window === "undefined") return;

    const headerOffset = getHeaderOffsetPx();
    const y = window.scrollY + headerOffset + 8;

    // 🔒 stratégie fiable : dernière section atteinte
    let bestHref: string = "#top";
    let bestTop = -Infinity;

    for (const lnk of linksAll) {
      if (!lnk.href || lnk.href === "#top") continue;

      const id = lnk.href.slice(1);
      const el = document.getElementById(id);
      if (!el) continue;

      const topAbs = el.getBoundingClientRect().top + window.scrollY;

      if (topAbs <= y && topAbs > bestTop) {
        bestTop = topAbs;
        bestHref = lnk.href;
      }
    }

    // 🔒 force Contact en bas de page
    const scrollH = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    const atBottom = window.innerHeight + window.scrollY >= scrollH - 4;

    if (atBottom && linksAll.some((l) => l.href === "#contact")) {
      setActiveHrefLocal("#contact");
    } else {
      setActiveHrefLocal(bestHref);
    }
  }, [linksAll, getHeaderOffsetPx]);

  React.useEffect(() => {
    computeActiveHref();

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(computeActiveHref);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onScroll as any);
    };
  }, [computeActiveHref]);

  const activeHrefEffective = activeHrefLocal || activeHref;

  // ============================================================
  // ✅ AUTO-FIT RESPONSIVE (UTILISÉ POUR DE VRAI)
  // ============================================================

  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const leftRef = React.useRef<HTMLDivElement | null>(null);
  const rightRef = React.useRef<HTMLDivElement | null>(null);
  const measureRef = React.useRef<HTMLDivElement | null>(null);

  const maxDirectLinks = Number(
    (props as any)?.options?.nav?.maxDirectLinksInMenu ??
      (props as any)?.options?.maxDirectLinksInMenu ??
      (props as any)?.options?.maxDirectLinks ??
      props.maxDirectLinksInMenu ??
      props.maxDirectLinks ??
      props.content?.nav?.maxDirectLinksInMenu ??
      props.content?.nav?.maxDirectLinks ??
      4
  );

  const MAX_INLINE = Math.max(
    1,
    Math.min(12, Number.isFinite(maxDirectLinks) ? maxDirectLinks : 4)
  );

  const [inlineCount, setInlineCount] = React.useState<number>(() =>
    Math.min(MAX_INLINE, Math.max(1, linksAll.length || 1))
  );

  const dummyOverflowLabel = "Plus";

  const recalcFit = React.useCallback(() => {
    const wrap = wrapRef.current;
    const meas = measureRef.current;
    if (!wrap || !meas) return;

    const available = Math.max(160, wrap.getBoundingClientRect().width - 32);
    const kids = Array.from(meas.children) as HTMLElement[];
    if (!kids.length) return;

    const overflowBtn = kids[kids.length - 1];
    const overflowW = overflowBtn.getBoundingClientRect().width;

    const linkEls = kids.slice(0, kids.length - 1);
    const gap = 28; // gap-7

    let used = 0;
    let fit = 0;

    for (let i = 0; i < linkEls.length && i < MAX_INLINE; i++) {
      const w = linkEls[i].getBoundingClientRect().width;
      const next = fit === 0 ? w : used + gap + w;

      const needsOverflow = i < Math.min(linkEls.length, MAX_INLINE) - 1;
      const reserve = needsOverflow ? gap + overflowW : 0;

      if (next + reserve <= available) {
        used = next;
        fit = i + 1;
      } else {
        break;
      }
    }

    fit = Math.max(1, Math.min(fit, MAX_INLINE, linksAll.length));
    setInlineCount(fit);
  }, [linksAll, MAX_INLINE]);

  React.useLayoutEffect(() => {
    recalcFit();
  }, [recalcFit, theme.isDark, props.content, hasBrandLeft, showCta]);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => recalcFit());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [recalcFit]);

  React.useEffect(() => {
    setInlineCount((c) => {
      const limit = Math.max(1, Math.min(MAX_INLINE, linksAll.length));
      return c > limit ? limit : c;
    });
  }, [MAX_INLINE, linksAll.length]);

  const inlineLinks = linksAll.slice(0, inlineCount);
  const overflowLinks = linksAll.slice(inlineCount);

  const overflowActiveLink = overflowLinks.find(
    (x) => x.href === activeHrefEffective
  );

  const overflowLabel = overflowActiveLink
    ? overflowActiveLink.label
    : dummyOverflowLabel;

  const overflowActive = Boolean(overflowActiveLink);

  // ============================================================
  // header shell
  // ============================================================

  const headerPos = "fixed left-0 right-0 top-0";
  const headerZ = "z-50";
  const Spacer = (
    <div aria-hidden="true" style={{ height: "var(--header-h, 0px)" }} />
  );

  const canvasVar = pickCanvasVar(theme, props.canvasVar);
  const hasCanvas = hasCanvasVars(canvasVar);

  const headerStyle: React.CSSProperties | undefined = hasCanvas
    ? headerGlassStyle(theme, canvasVar, isScrolled)
    : undefined;

  const menuStyle: React.CSSProperties | undefined = hasCanvas
    ? menuGlassStyle(theme, canvasVar)
    : undefined;

  const headerClassBase = cx(
    headerPos,
    headerZ,
    "border-b transition-[background-color,backdrop-filter] duration-200",
    theme.isDark
      ? "border-white/10 text-white"
      : "border-slate-200 text-slate-900",
    !hasCanvas &&
      (theme.isDark
        ? "bg-slate-950/70 backdrop-blur"
        : "bg-white/70 backdrop-blur"),
    !hasCanvas &&
      isScrolled &&
      (theme.isDark
        ? "bg-slate-950/78 backdrop-blur"
        : "bg-white/78 backdrop-blur")
  );

  const HeaderShell = (children: React.ReactNode) => (
    <>
      <header
        ref={headerRef as any}
        style={headerStyle}
        className={headerClassBase}
      >
        {children}
      </header>
      {Spacer}
    </>
  );

  const navTextClass = hasCanvas
    ? "text-inherit"
    : theme.isDark
    ? "text-white/80"
    : "text-slate-700";

  const navHoverTextClass = hasCanvas
    ? "text-inherit"
    : theme.isDark
    ? "hover:text-white"
    : "hover:text-slate-950";

  const navShellClass = cx(
    "hidden md:flex items-center gap-2 rounded-2xl border p-1.5 backdrop-blur",
    hasCanvas
      ? "border-[color:var(--te-surface-border)] bg-white/5"
      : theme.isDark
      ? "border-white/10 bg-white/5"
      : "border-black/10 bg-white/40"
  );

  const pillBase = cx(
    "rounded-2xl px-5 py-2 transition text-center hover:-translate-y-[1px] active:translate-y-0",
    navBase
  );

  const pillActive = hasCanvas
    ? "text-inherit bg-white/15 shadow-sm"
    : theme.isDark
    ? "text-white bg-white/10 shadow-sm"
    : "text-slate-950 bg-white/90 shadow-sm";

  const pillIdle = hasCanvas
    ? "text-inherit opacity-80 hover:opacity-100 hover:bg-white/10"
    : theme.isDark
    ? "text-white/80 hover:text-white hover:bg-white/10"
    : "text-slate-900/90 hover:text-slate-950 hover:bg-white/70 hover:shadow-sm";

  const NavA = () => (
    <nav
      className={cx(
        "hidden md:flex items-center gap-7",
        navBase,
        navTextClass,
        "whitespace-nowrap"
      )}
    >
      {inlineLinks.map((lnk) => {
        const active = lnk.href === activeHrefEffective;
        return (
          <a
            key={lnk.href}
            href={lnk.href}
            className={cx(
              "group relative inline-flex transition-colors",
              navHoverTextClass,
              hasCanvas && !active && "opacity-80 hover:opacity-100",
              active &&
                !hasCanvas &&
                (theme.isDark ? "text-white" : "text-slate-950")
            )}
          >
            <span className="whitespace-nowrap">
              {cleanNavLabel(lnk.label)}
            </span>
            <span
              className={cx(
                "pointer-events-none absolute left-0 -bottom-2 h-[2px] w-full bg-gradient-to-r transition-opacity",
                theme.accentFrom,
                theme.accentTo,
                active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            />
          </a>
        );
      })}

      {overflowLinks.length ? (
        <DesktopOverflowMenu
          theme={theme}
          label={cleanNavLabel(overflowLabel)}
          items={overflowLinks.map((x) => ({
            ...x,
            label: cleanNavLabel(x.label),
          }))}
          menuStyle={menuStyle}
          hasCanvas={hasCanvas}
          active={overflowActive}
          activeHref={activeHrefEffective}
          navBaseClass={navBase}
          underline
          underlineActive={overflowActive}
        />
      ) : null}
    </nav>
  );

  const NavB = () => (
    <nav className={navShellClass}>
      {inlineLinks.map((lnk) => {
        const active = lnk.href === activeHrefEffective;
        return (
          <a
            key={lnk.href}
            href={lnk.href}
            className={cx(pillBase, active ? pillActive : pillIdle)}
          >
            {cleanNavLabel(lnk.label)}
          </a>
        );
      })}

      {overflowLinks.length ? (
        <div className="hidden md:block">
          <DesktopOverflowMenu
            theme={theme}
            label={cleanNavLabel(overflowLabel)}
            items={overflowLinks.map((x) => ({
              ...x,
              label: cleanNavLabel(x.label),
            }))}
            menuStyle={menuStyle}
            hasCanvas={hasCanvas}
            active={overflowActive}
            activeHref={activeHrefEffective}
            navBaseClass={navBase}
            buttonClassName={cx(
              pillBase,
              overflowActive ? pillActive : pillIdle
            )}
          />
        </div>
      ) : null}
    </nav>
  );

  // ✅ underline EXACTEMENT sous le texte (et pas full width d’un wrapper)
  const NavC = () => (
    <nav
      className={cx(
        "hidden md:flex items-center justify-center gap-8",
        navBase,
        navTextClass,
        "whitespace-nowrap"
      )}
    >
      {inlineLinks.map((lnk) => {
        const isActive = lnk.href === activeHrefEffective;

        return (
          <a
            key={lnk.href}
            href={lnk.href}
            className={cx(
              "group relative inline-flex",
              navHoverTextClass,
              hasCanvas && !isActive && "opacity-80 hover:opacity-100",
              isActive &&
                !hasCanvas &&
                (theme.isDark ? "text-white" : "text-slate-950")
            )}
          >
            {/* TEXTE = référence de largeur */}
            <span className="relative inline-block">
              {cleanNavLabel(lnk.label)}
              <span
                className={cx(
                  "pointer-events-none absolute left-0 -bottom-2 h-[2px] w-full bg-gradient-to-r transition-opacity",
                  theme.accentFrom,
                  theme.accentTo,
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              />
            </span>
          </a>
        );
      })}

      {overflowLinks.length > 0 ? (
        <DesktopOverflowMenu
          theme={theme}
          label={cleanNavLabel(overflowLabel)}
          items={overflowLinks.map((x) => ({
            ...x,
            label: cleanNavLabel(x.label),
          }))}
          menuStyle={menuStyle}
          hasCanvas={hasCanvas}
          active={overflowActive}
          activeHref={activeHrefEffective}
          navBaseClass={navBase}
          underline
          underlineActive={overflowActive}
        />
      ) : null}
    </nav>
  );

  const RenderD = () => {
    const phone = contact?.phone ?? "";
    const email = contact?.email ?? "";

    const pillBaseD = cx(
      "rounded-2xl border px-4 transition-all duration-200 backdrop-blur",
      theme.isDark
        ? "border-white/10 bg-white/5"
        : "border-slate-200 bg-white/70"
    );
    const pillLabel = theme.isDark ? "text-white/60" : "text-slate-500";
    const pillValue = theme.isDark ? "text-white" : "text-slate-900";

    return (
      <>
        <header
          ref={headerRef as any}
          style={headerStyle}
          className={headerClassBase}
        >
          <Wrap
            layout={props.layout}
            globalLayout={props.globalLayout}
            className={cx("grid grid-cols-[auto_1fr_auto] items-center gap-4")}
            style={{ paddingTop: padY2, paddingBottom: padY2 }}
          >
            <a href="#top" className="flex items-center gap-3 min-w-0">
              <div
                style={{
                  transform: `scale(${logoScale})`,
                  transformOrigin: "left center",
                }}
                className="shrink-0"
              >
                {LogoNode}
              </div>
              {BrandText}
            </a>

            <div
              className={cx(
                "hidden lg:flex items-center justify-center gap-3 transition-opacity duration-200",
                isScrolled && "opacity-95"
              )}
            >
              {phone ? (
                <div
                  className={cx("max-w-[220px]", pillBaseD)}
                  style={{ paddingTop: lerp(8, 6), paddingBottom: lerp(8, 6) }}
                >
                  <div
                    className={cx(
                      "text-[10px] font-semibold uppercase tracking-wider",
                      pillLabel
                    )}
                  >
                    Téléphone
                  </div>
                  <div
                    className={cx("truncate text-sm font-semibold", pillValue)}
                  >
                    {phone}
                  </div>
                </div>
              ) : null}

              {email ? (
                <div
                  className={cx("max-w-[260px]", pillBaseD)}
                  style={{ paddingTop: lerp(8, 6), paddingBottom: lerp(8, 6) }}
                >
                  <div
                    className={cx(
                      "text-[10px] font-semibold uppercase tracking-wider",
                      pillLabel
                    )}
                  >
                    E-mail
                  </div>
                  <div
                    className={cx("truncate text-sm font-semibold", pillValue)}
                  >
                    {email}
                  </div>
                </div>
              ) : null}

              <SocialRow theme={theme} cfg={socialsCfg} className="ml-2" />
            </div>

            <div className="justify-self-end flex items-center gap-3">
              <SocialRow theme={theme} cfg={socialsCfg} className="lg:hidden" />
              {Cta}
            </div>
          </Wrap>

          <div
            style={headerStyle}
            className={cx(
              "border-t transition-[background-color,backdrop-filter] duration-200",
              theme.isDark ? "border-white/10" : "border-slate-200"
            )}
          >
            <Wrap
              layout={props.layout}
              globalLayout={props.globalLayout}
              className="flex justify-center"
              style={{ paddingTop: navPadY, paddingBottom: navPadY }}
            >
              {NavB()}
            </Wrap>
          </div>
        </header>

        {Spacer}
      </>
    );
  };

  const GridHeaderRow = ({ nav }: { nav: React.ReactNode }) => (
    <Wrap
      layout={props.layout}
      globalLayout={props.globalLayout}
      className={cx(
        "grid items-center gap-4",
        "grid-cols-[auto_minmax(0,1fr)_auto]"
      )}
      style={{ paddingTop: padY, paddingBottom: padY }}
    >
      <div ref={leftRef} className="justify-self-start min-w-0">
        {hasBrandLeft ? (
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <div
              style={{
                transform: `scale(${logoScale})`,
                transformOrigin: "left center",
              }}
              className="shrink-0"
            >
              {LogoNode}
            </div>

            {BrandText ? (
              <div className="min-w-0 max-w-[340px]">{BrandText}</div>
            ) : null}
          </a>
        ) : (
          <div aria-hidden="true" className="h-10 w-10" />
        )}
      </div>

      <div ref={wrapRef} className="justify-self-center min-w-0 w-full">
        <div className="relative flex justify-center">
          {nav}

          {/* mesure invisible (labels + overflow) */}
          <div
            ref={measureRef}
            className={cx(
              "pointer-events-none absolute left-0 top-0 opacity-0",
              "hidden md:flex items-center gap-7",
              navBase
            )}
            aria-hidden="true"
          >
            {linksAll.map((lnk) => (
              <span key={lnk.href} className="inline-flex">
                {cleanNavLabel(lnk.label)}
              </span>
            ))}
            <span className="inline-flex">{dummyOverflowLabel} ▾</span>
          </div>
        </div>
      </div>

      <div
        ref={rightRef}
        className="justify-self-end flex items-center gap-3 min-w-0"
      >
        <SocialRow theme={theme} cfg={socialsCfg} className="hidden lg:flex" />
        {Cta}
      </div>
    </Wrap>
  );

  const RenderA = () => HeaderShell(<GridHeaderRow nav={NavA()} />);
  const RenderB = () => HeaderShell(<GridHeaderRow nav={NavB()} />);
  const RenderC = () => HeaderShell(<GridHeaderRow nav={NavC()} />);

  if (variant === "D") return RenderD();
  if (variant === "B") return RenderB();
  if (variant === "C") return RenderC();
  return RenderA();
}

/* ============================================================
   BLOC 3 — HERO (A/B)
   ============================================================ */

export function LegacyHero({
  theme,
  content,
  layout,
  globalLayout,
  sectionId,
  variant,
}: any) {
  const l = resolveLayout(layout, globalLayout);
  const v = String(variant ?? "A");

  // ✅ id DOM unique
  const domId = useUniqueDomId(sectionId ?? "hero");

  const kicker = content?.heroKicker ?? "Sous-titre et/ou slogan";
  const title = content?.heroTitle ?? "Titre de la section HERO";
  const text =
    content?.heroText ??
    "Une approche professionnelle orientée qualité, transparence et solutions durables, adaptée aux particuliers comme aux entreprises.";

  const imgSrc = content?.heroImage ?? "/images/template-base/p4.jpg";
  const imgAlt = content?.heroImageAlt ?? "Illustration";

  const cta1 = content?.cta?.heroPrimary ?? "Me contacter";
  const cta2 = content?.cta?.heroSecondary ?? "Voir nos services";

  const PrimaryBtn = (
    <a
      href="#contact"
      className={cx(
        radiusClass(l.radius),
        "fx-cta px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
        theme.accentFrom,
        theme.accentTo
      )}
    >
      {cta1}
    </a>
  );

  const SecondaryBtn = (
    <a
      href="#services"
      className={cx(
        radiusClass(l.radius),
        "px-6 py-3 text-sm font-semibold border transition hover:-translate-y-[1px] active:translate-y-0",
        theme.isDark
          ? "border-white/15 text-white hover:bg-white/5"
          : "border-slate-200 text-slate-900 hover:bg-slate-50"
      )}
    >
      {cta2}
    </a>
  );

  if (v === "B") {
    return (
      <section id={domId} className={cx(heroPadY(l.density))}>
        <Wrap layout={layout} globalLayout={globalLayout}>
          <Surface
            theme={theme}
            layout={layout}
            globalLayout={globalLayout}
            className="p-10 md:p-14"
          >
            <div className="max-w-3xl mx-auto text-center">
              {hasText(kicker) ? (
                <div
                  className={cx(
                    "text-sm font-semibold",
                    theme.isDark ? "text-white/70" : "text-slate-600"
                  )}
                >
                  {kicker}
                </div>
              ) : null}

              <h1
                className={cx(
                  "mt-3 text-4xl md:text-5xl font-semibold tracking-tight",
                  theme.isDark ? "text-white" : "text-slate-950"
                )}
              >
                {title}
              </h1>

              <p
                className={cx(
                  "mt-4 text-base md:text-lg leading-relaxed",
                  theme.isDark ? "text-white/70" : "text-slate-600"
                )}
              >
                {text}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {PrimaryBtn}
                {SecondaryBtn}
              </div>
            </div>

            <div className="mt-10">
              <div
                style={radiusStyle(l.radius)}
                className={cx(
                  "relative overflow-hidden border",
                  theme.isDark ? "border-white/10" : "border-slate-200"
                )}
              >
                <div className="relative aspect-[16/7]">
                  <NextImage
                    src={imgSrc}
                    alt={imgAlt}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </Surface>
        </Wrap>
      </section>
    );
  }

  return (
    <section id={domId} className={cx(heroPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface
          theme={theme}
          layout={layout}
          globalLayout={globalLayout}
          className="p-10 md:p-14"
        >
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              {hasText(kicker) ? (
                <div
                  className={cx(
                    "text-sm font-semibold",
                    theme.isDark ? "text-white/70" : "text-slate-600"
                  )}
                >
                  {kicker}
                </div>
              ) : null}
              <h1
                className={cx(
                  "mt-3 text-4xl md:text-5xl font-semibold tracking-tight",
                  theme.isDark ? "text-white" : "text-slate-950"
                )}
              >
                {title}
              </h1>
              <p
                className={cx(
                  "mt-4 max-w-xl text-base md:text-lg leading-relaxed",
                  theme.isDark ? "text-white/70" : "text-slate-600"
                )}
              >
                {text}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {PrimaryBtn}
                {SecondaryBtn}
              </div>
            </div>

            <div className="relative">
              <div
                style={radiusStyle(l.radius)}
                className={cx(
                  "relative overflow-hidden border",
                  theme.isDark ? "border-white/10" : "border-slate-200"
                )}
              >
                <div className="relative aspect-[16/10]">
                  <NextImage
                    src={imgSrc}
                    alt={imgAlt}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </Surface>
      </Wrap>
    </section>
  );
}

/* ============================================================
   BLOC 4 — SPLIT (A/B)
   ============================================================ */

export function LegacySplit(props: any) {
  const { theme, content, layout, globalLayout, sectionId, variant } = props;
  const l = resolveLayout(layout, globalLayout);
  const v = String(variant ?? "A");

  // ✅ id DOM unique (split, split-2...)
  const domId = useUniqueDomId(sectionId ?? "split");

  const title =
    content?.split?.title ??
    content?.splitTitle ??
    "Une approche simple, pro, efficace.";
  const text =
    content?.split?.text ??
    content?.splitText ??
    "Diagnostic clair, intervention propre, résultat durable.";
  const imgSrc =
    content?.split?.image ??
    content?.splitImage ??
    "/images/template-base/p2.jpg";
  const imgAlt =
    content?.split?.imageAlt ?? content?.splitImageAlt ?? "Illustration";
  const ctaLabel =
    content?.split?.ctaLabel ?? content?.splitCtaLabel ?? "Me contacter";
  const ctaHref =
    content?.split?.ctaHref ?? content?.splitCtaHref ?? "#contact";

  const reverse = v === "B" ? true : !!content?.split?.reverse;

  return (
    <section id={domId} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface
          theme={theme}
          layout={layout}
          globalLayout={globalLayout}
          className="p-8 md:p-10"
        >
          <div
            className={cx(
              "grid items-center gap-10 md:grid-cols-2",
              reverse && "md:[&>*:first-child]:order-2"
            )}
          >
            <div>
              <h2
                className={cx(
                  "text-2xl md:text-3xl font-semibold tracking-tight",
                  theme.isDark ? "text-white" : "text-slate-950"
                )}
              >
                {title}
              </h2>
              <p
                className={cx(
                  "mt-3 max-w-xl",
                  theme.isDark ? "text-white/70" : "text-slate-600"
                )}
              >
                {text}
              </p>

              <div className="mt-6">
                <a
                  href={ctaHref}
                  className={cx(
                    radiusClass(l.radius),
                    "fx-cta inline-flex px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
                    theme.accentFrom,
                    theme.accentTo
                  )}
                >
                  {ctaLabel}
                </a>
              </div>
            </div>

            <div
              style={radiusStyle(l.radius)}
              className={cx(
                "relative overflow-hidden border",
                theme.isDark ? "border-white/10" : "border-slate-200"
              )}
            >
              <div className="relative aspect-[16/10]">
                <NextImage
                  src={imgSrc}
                  alt={imgAlt}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Surface>
      </Wrap>
    </section>
  );
}

/* ============================================================
   BLOC 5 — SERVICES
   ============================================================ */

export function LegacyServices(props: any) {
  const { theme, content, layout, globalLayout, sectionId, variant } = props;
  const l = resolveLayout(layout, globalLayout);
  const v = String(variant ?? "A");

  const domId = useUniqueDomId(sectionId ?? "services");

  const title = content?.servicesTitle ?? "Nos services";
  const text =
    content?.servicesText ??
    "Des prestations claires et adaptées à vos besoins.";
  const items = Array.isArray(content?.services) ? content.services : [];

  const Card = ({ t, list }: { t: string; list: string[] }) => (
    <Surface
      theme={theme}
      layout={layout}
      globalLayout={globalLayout}
      className="p-6"
    >
      <div
        className={cx(
          "text-lg font-semibold",
          theme.isDark ? "text-white" : "text-slate-950"
        )}
      >
        {t}
      </div>
      <ul
        className={cx(
          "mt-3 space-y-2 text-sm",
          theme.isDark ? "text-white/70" : "text-slate-600"
        )}
      >
        {list.map((x, i) => (
          <li key={i} className="flex gap-2">
            <span
              className={cx(
                "mt-[6px] h-1.5 w-1.5 rounded-full bg-gradient-to-r",
                theme.accentFrom,
                theme.accentTo
              )}
            />
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );

  const gridCols =
    v === "B"
      ? "md:grid-cols-2"
      : v === "C"
      ? "md:grid-cols-3"
      : v === "D"
      ? "md:grid-cols-3"
      : v === "E"
      ? "md:grid-cols-2"
      : "md:grid-cols-3";

  return (
    <section id={domId} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="mb-8">
          <div
            className={cx(
              "text-xs font-semibold uppercase tracking-[0.18em]",
              theme.isDark ? "text-white/60" : "text-slate-500"
            )}
          >
            Services
          </div>
          <h2
            className={cx(
              "mt-2 text-3xl font-semibold tracking-tight",
              theme.isDark ? "text-white" : "text-slate-950"
            )}
          >
            {title}
          </h2>
          <p
            className={cx(
              "mt-3 max-w-3xl",
              theme.isDark ? "text-white/70" : "text-slate-600"
            )}
          >
            {text}
          </p>
        </div>

        <div className={cx("grid gap-6", gridCols)}>
          {items.map((s: any, i: number) => (
            <Card
              key={i}
              t={s.title ?? `Service ${i + 1}`}
              list={Array.isArray(s.items) ? s.items : []}
            />
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   BLOC 6 — TEAM
   ============================================================ */

export function LegacyTeam(props: any) {
  const { theme, content, layout, globalLayout, sectionId, variant } = props;
  const l = resolveLayout(layout, globalLayout);
  const v = String(variant ?? "A");

  const domId = useUniqueDomId(sectionId ?? "team");

  const title = content?.teamTitle ?? "Qui sommes-nous";
  const text = content?.teamText ?? "Une équipe terrain orientée qualité.";
  const cards = Array.isArray(content?.teamCards) ? content.teamCards : [];

  const cols =
    v === "B"
      ? "md:grid-cols-2"
      : v === "C"
      ? "md:grid-cols-3"
      : "md:grid-cols-3";

  return (
    <section id={domId} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="mb-8">
          <div
            className={cx(
              "text-xs font-semibold uppercase tracking-[0.18em]",
              theme.isDark ? "text-white/60" : "text-slate-500"
            )}
          >
            Équipe
          </div>
          <h2
            className={cx(
              "mt-2 text-3xl font-semibold tracking-tight",
              theme.isDark ? "text-white" : "text-slate-950"
            )}
          >
            {title}
          </h2>
          <p
            className={cx(
              "mt-3 max-w-3xl",
              theme.isDark ? "text-white/70" : "text-slate-600"
            )}
          >
            {text}
          </p>
        </div>

        <div className={cx("grid gap-6", cols)}>
          {cards.map((c: any, i: number) => (
            <Surface
              key={i}
              theme={theme}
              layout={layout}
              globalLayout={globalLayout}
              className="p-6"
            >
              <div
                className={cx(
                  "text-lg font-semibold",
                  theme.isDark ? "text-white" : "text-slate-950"
                )}
              >
                {c.title ?? `Bloc ${i + 1}`}
              </div>
              <p
                className={cx(
                  "mt-2 text-sm",
                  theme.isDark ? "text-white/70" : "text-slate-600"
                )}
              >
                {c.text ?? ""}
              </p>
            </Surface>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   BLOC 7 — GALLERIES (NO DUPLICATE IDs)
   ============================================================ */

export function LegacyGalleries(props: any) {
  const {
    theme,
    content,
    layout,
    globalLayout,
    sectionId, // ⚠️ utilisé pour choisir la galerie, PAS pour mettre un id DOM ici
    onOpen,
    enableLightbox,
    variant,
  } = props;

  const l = resolveLayout(layout, globalLayout);

  const rawV = String(variant ?? "twoCol")
    .trim()
    .toLowerCase();
  const v =
    rawV.includes("three") || rawV.includes("3col")
      ? "threeCol"
      : rawV.includes("two") || rawV.includes("2col")
      ? "twoCol"
      : rawV.includes("stack") || rawV.includes("one") || rawV.includes("1col")
      ? "stack"
      : rawV;

  const cols =
    v === "threeCol"
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : v === "stack"
      ? "grid-cols-1"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-2";

  const aspect = v === "stack" ? "aspect-[16/7]" : "aspect-[16/11]";

  const galleries = Array.isArray(content?.galleries) ? content.galleries : [];

  const g =
    galleries.find((x: any) => String(x?.id) === String(sectionId)) ??
    galleries[0];

  const title = g?.title ?? "Galeries";
  const desc = g?.description ?? "";
  const images = Array.isArray(g?.images) ? g.images : [];

  if (!images.length) {
    return (
      <section className={cx(sectionPadY(l.density))}>
        <Wrap layout={layout} globalLayout={globalLayout}>
          <div className="mb-8">
            <div
              className={cx(
                "text-xs font-semibold uppercase tracking-[0.18em]",
                theme.isDark ? "text-white/60" : "text-slate-500"
              )}
            >
              Galerie
            </div>
            <h2
              className={cx(
                "mt-2 text-3xl font-semibold tracking-tight",
                theme.isDark ? "text-white" : "text-slate-950"
              )}
            >
              {title}
            </h2>
            <p
              className={cx(
                "mt-3",
                theme.isDark ? "text-white/70" : "text-slate-600"
              )}
            >
              Aucune image configurée pour cette galerie.
            </p>
          </div>
        </Wrap>
      </section>
    );
  }

  return (
    <section className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="mb-8">
          <div
            className={cx(
              "text-xs font-semibold uppercase tracking-[0.18em]",
              theme.isDark ? "text-white/60" : "text-slate-500"
            )}
          >
            Galerie
          </div>
          <h2
            className={cx(
              "mt-2 text-3xl font-semibold tracking-tight",
              theme.isDark ? "text-white" : "text-slate-950"
            )}
          >
            {title}
          </h2>

          {hasText(desc) ? (
            <p
              className={cx(
                "mt-3 max-w-3xl",
                theme.isDark ? "text-white/70" : "text-slate-600"
              )}
            >
              {desc}
            </p>
          ) : null}
        </div>

        <div className={cx("grid gap-6", cols)}>
          {images.map((img: any, i: number) => (
            <button
              key={i}
              type="button"
              className={cx(
                "text-left",
                enableLightbox ? "cursor-zoom-in" : "cursor-default"
              )}
              onClick={() => enableLightbox && onOpen?.(img)}
            >
              <div
                style={radiusStyle(l.radius)}
                className={cx(
                  "relative overflow-hidden border",
                  theme.isDark ? "border-white/10" : "border-slate-200"
                )}
              >
                <div className={cx("relative", aspect)}>
                  <NextImage
                    src={img.src}
                    alt={img.alt ?? "Visuel"}
                    fill
                    className="object-cover"
                    sizes={
                      v === "threeCol"
                        ? "(min-width: 768px) 33vw, 100vw"
                        : v === "twoCol"
                        ? "(min-width: 640px) 50vw, 100vw"
                        : "100vw"
                    }
                  />
                </div>
              </div>

              {hasText(img.caption) ? (
                <div
                  className={cx(
                    "mt-2 text-sm",
                    theme.isDark ? "text-white/70" : "text-slate-600"
                  )}
                >
                  {img.caption}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   BLOC 8 — CONTACT
   ============================================================ */

export function LegacyContact(props: any) {
  const { theme, content, layout, globalLayout, sectionId, variant } = props;
  const l = resolveLayout(layout, globalLayout);

  const v = String(variant ?? "A");

  // ✅ id DOM unique
  const domId = useUniqueDomId(sectionId ?? "contact");

  const kicker = content?.contactKicker ?? "Contact";
  const title = content?.contactTitle ?? "Contact";
  const text =
    content?.contactText ??
    "Expliquez votre besoin en 2 lignes, nous vous répondrons rapidement.";

  const address = content?.contact?.address ?? "";
  const phone = content?.contact?.phone ?? "";
  const email = content?.contact?.email ?? "";

  const socialsCfg = (content?.socials ?? undefined) as
    | SocialConfig
    | undefined;
  const socials = React.useMemo(
    () => resolveSocialLinks(socialsCfg),
    [socialsCfg]
  );

  const SocialBar = socials.length ? (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {socials.map(({ kind, href, def }: any) => (
        <a
          key={kind}
          href={href}
          target="_blank"
          rel="noreferrer"
          className={cx(
            "inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition hover:-translate-y-[1px] active:translate-y-0",
            theme.isDark
              ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950"
          )}
          title={def.label}
          aria-label={def.label}
        >
          <def.Icon className="opacity-90" />
        </a>
      ))}
    </div>
  ) : null;

  const RenderA = () => (
    <section id={domId} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            {hasText(kicker) ? (
              <div
                className={cx(
                  "text-xs font-semibold uppercase tracking-[0.18em]",
                  theme.isDark ? "text-white/60" : "text-slate-500"
                )}
              >
                {kicker}
              </div>
            ) : null}

            <h2
              className={cx(
                "mt-2 text-3xl md:text-4xl font-semibold tracking-tight",
                theme.isDark ? "text-white" : "text-slate-950"
              )}
            >
              {title}
            </h2>

            {hasText(text) ? (
              <p
                className={cx(
                  "mt-3 max-w-xl",
                  theme.isDark ? "text-white/70" : "text-slate-600"
                )}
              >
                {text}
              </p>
            ) : null}

            <div className="mt-8 space-y-3 text-sm">
              {hasText(address) ? (
                <div
                  className={cx(
                    theme.isDark ? "text-white/80" : "text-slate-800"
                  )}
                >
                  <span
                    className={cx(
                      "font-semibold",
                      theme.isDark ? "text-white" : "text-slate-950"
                    )}
                  >
                    Adresse:
                  </span>{" "}
                  {address}
                </div>
              ) : null}
              {hasText(phone) ? (
                <div
                  className={cx(
                    theme.isDark ? "text-white/80" : "text-slate-800"
                  )}
                >
                  <span
                    className={cx(
                      "font-semibold",
                      theme.isDark ? "text-white" : "text-slate-950"
                    )}
                  >
                    Téléphone:
                  </span>{" "}
                  {phone}
                </div>
              ) : null}
              {hasText(email) ? (
                <div
                  className={cx(
                    theme.isDark ? "text-white/80" : "text-slate-800"
                  )}
                >
                  <span
                    className={cx(
                      "font-semibold",
                      theme.isDark ? "text-white" : "text-slate-950"
                    )}
                  >
                    E-mail:
                  </span>{" "}
                  {email}
                </div>
              ) : null}
            </div>

            {SocialBar}
          </div>

          <Surface
            theme={theme}
            layout={layout}
            globalLayout={globalLayout}
            className="p-6 md:p-8"
          >
            <div
              className={cx(
                "text-lg font-semibold",
                theme.isDark ? "text-white" : "text-slate-950"
              )}
            >
              Demande rapide
            </div>
            <div
              className={cx(
                "mt-1 text-sm",
                theme.isDark ? "text-white/70" : "text-slate-600"
              )}
            >
              (Démo) Brancher ici ton vrai formulaire plus tard.
            </div>

            <div className="mt-6 space-y-3">
              <input
                className={cx(
                  radiusClass(l.radius),
                  "w-full border px-4 py-3 text-sm outline-none",
                  theme.isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
                )}
                placeholder="Nom"
              />
              <input
                className={cx(
                  radiusClass(l.radius),
                  "w-full border px-4 py-3 text-sm outline-none",
                  theme.isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
                )}
                placeholder="E-mail"
              />
              <textarea
                rows={4}
                className={cx(
                  radiusClass(l.radius),
                  "w-full border px-4 py-3 text-sm outline-none",
                  theme.isDark
                    ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
                )}
                placeholder="Message"
              />
              <button
                type="button"
                className={cx(
                  radiusClass(l.radius),
                  "fx-cta mt-2 w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
                  theme.accentFrom,
                  theme.accentTo
                )}
              >
                Envoyer
              </button>
            </div>
          </Surface>
        </div>
      </Wrap>
    </section>
  );

  const RenderB = () => (
    <section id={domId} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface
          theme={theme}
          layout={layout}
          globalLayout={globalLayout}
          className="p-8 md:p-10"
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              {hasText(kicker) ? (
                <div
                  className={cx(
                    "text-xs font-semibold uppercase tracking-[0.18em]",
                    theme.isDark ? "text-white/60" : "text-slate-500"
                  )}
                >
                  {kicker}
                </div>
              ) : null}
              <h2
                className={cx(
                  "mt-2 text-3xl md:text-4xl font-semibold tracking-tight",
                  theme.isDark ? "text-white" : "text-slate-950"
                )}
              >
                {title}
              </h2>
              {hasText(text) ? (
                <p
                  className={cx(
                    "mt-3 max-w-xl",
                    theme.isDark ? "text-white/70" : "text-slate-600"
                  )}
                >
                  {text}
                </p>
              ) : null}

              <div className="mt-8 space-y-3 text-sm">
                {hasText(address) ? (
                  <div
                    className={cx(
                      theme.isDark ? "text-white/80" : "text-slate-800"
                    )}
                  >
                    <span
                      className={cx(
                        "font-semibold",
                        theme.isDark ? "text-white" : "text-slate-950"
                      )}
                    >
                      Adresse:
                    </span>{" "}
                    {address}
                  </div>
                ) : null}
                {hasText(phone) ? (
                  <div
                    className={cx(
                      theme.isDark ? "text-white/80" : "text-slate-800"
                    )}
                  >
                    <span
                      className={cx(
                        "font-semibold",
                        theme.isDark ? "text-white" : "text-slate-950"
                      )}
                    >
                      Téléphone:
                    </span>{" "}
                    {phone}
                  </div>
                ) : null}
                {hasText(email) ? (
                  <div
                    className={cx(
                      theme.isDark ? "text-white/80" : "text-slate-800"
                    )}
                  >
                    <span
                      className={cx(
                        "font-semibold",
                        theme.isDark ? "text-white" : "text-slate-950"
                      )}
                    >
                      E-mail:
                    </span>{" "}
                    {email}
                  </div>
                ) : null}
              </div>

              {SocialBar}
            </div>

            <div>
              <div
                className={cx(
                  "text-lg font-semibold",
                  theme.isDark ? "text-white" : "text-slate-950"
                )}
              >
                Demande rapide
              </div>
              <div
                className={cx(
                  "mt-1 text-sm",
                  theme.isDark ? "text-white/70" : "text-slate-600"
                )}
              >
                (shimmer ok) Brancher ici ton vrai formulaire plus tard.
              </div>

              <div className="mt-6 space-y-3">
                <input
                  className={cx(
                    radiusClass(l.radius),
                    "w-full border px-4 py-3 text-sm outline-none",
                    theme.isDark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
                  )}
                  placeholder="Nom"
                />
                <input
                  className={cx(
                    radiusClass(l.radius),
                    "w-full border px-4 py-3 text-sm outline-none",
                    theme.isDark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
                  )}
                  placeholder="E-mail"
                />
                <textarea
                  rows={4}
                  className={cx(
                    radiusClass(l.radius),
                    "w-full border px-4 py-3 text-sm outline-none",
                    theme.isDark
                      ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300"
                  )}
                  placeholder="Message"
                />
                <button
                  type="button"
                  className={cx(
                    radiusClass(l.radius),
                    "fx-cta mt-2 w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
                    theme.accentFrom,
                    theme.accentTo
                  )}
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </Surface>
      </Wrap>
    </section>
  );

  if (v === "B") return <RenderB />;
  return <RenderA />;
}
