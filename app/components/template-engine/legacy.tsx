// app/components/template-engine/legacy.tsx
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
   BLOC 1B — SURFACE (theme-aware, no more bg-white/5 hacks)
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

  // ✅ If theme.surfaceBg is a class (tailwind) we keep it.
  // ✅ If immersive canvas is on, the page already has --te-canvas; we can add a subtle glass feel safely.
  const base =
    theme.isDark
      ? "text-white"
      : "text-slate-900";

  const glass =
    theme.isDark
      ? "bg-white/5"
      : "bg-white";

  return (
    <div
      style={{ ...radiusStyle(l.radius), ...style }}
      className={cx(
        "border",
        // keep theme tokens (classes)
        theme.surfaceBg || glass,
        theme.surfaceBorder,
        base,
        className
      )}
    >
      {children}
    </div>
  );
}


/** Social icons row (optional) */
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

/** Simple dropdown (desktop) */
function DesktopOverflowMenu({
  theme,
  label = "Plus",
  items,
}: {
  theme: ThemeLike;
  label?: string;
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      const el = ref.current;
      if (!el) return;
      if (el.contains(e.target as any)) return;
      setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!items.length) return null;

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        className={cx(
          "group relative transition-colors px-2 py-1 rounded-lg",
          theme.isDark ? "text-white/80 hover:text-white" : "text-slate-700 hover:text-slate-950"
        )}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
        <span
          className={cx(
            "pointer-events-none absolute left-0 -bottom-2 h-[2px] w-full bg-gradient-to-r transition-opacity opacity-0 group-hover:opacity-100",
            theme.accentFrom,
            theme.accentTo
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className={cx(
            "absolute right-0 mt-3 w-56 overflow-hidden border shadow-lg",
theme.isDark
  ? "border-white/10 bg-slate-950/95 text-white"
  : "border-slate-200 bg-white/85 text-slate-900",
"backdrop-blur rounded-2xl"

          )}
        >
          {items.map((it) => (
            <a
              key={it.href}
              href={it.href}
              role="menuitem"
              className={cx(
                "block px-4 py-3 text-sm font-semibold",
                theme.isDark ? "hover:bg-white/10" : "hover:bg-slate-50"
              )}
              onClick={() => setOpen(false)}
            >
              {it.label}
            </a>
          ))}
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
  maxDirectLinks: number;
  contact?: { phone?: string; email?: string };
  content?: any;
  sections?: any[];
  activeHref?: string;
  isScrolled?: boolean;
  scrollT?: number;
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
  canvasStyle?: "classic" | "immersive";
}) {
  const { theme, brand, headerVariant, headerRef, showTeam, maxDirectLinks, contact } = props;

  const variant = (headerVariant ?? "A") as HeaderVariantX;
  const l = resolveLayout(props.layout, props.globalLayout);

  const activeHref = props.activeHref ?? "#top";
  const t = Math.max(0, Math.min(1, Number(props.scrollT ?? (props.isScrolled ? 1 : 0))));
  const isScrolled = t > 0.15;

  const canvasStyle = (props as any)?.canvasStyle ?? "classic";
  const immersive = canvasStyle === "immersive";
  const lerp = (a: number, b: number) => a + (b - a) * t;

  const padY = lerp(16, 10);
  const padY2 = lerp(14, 9);
  const navPadY = lerp(10, 8);
  const logoScale = lerp(1, 0.9);

  const showCta = !["J"].includes(String(variant));
  const includeContactInNav = !showCta;

  const navBase = "text-[12px] font-semibold uppercase tracking-[0.14em]";

  const logoEnabled = (brand as any)?.logo?.enabled !== false;
  const logoMode = (((brand as any)?.logo?.mode ?? "logoPlusText") as LogoMode) || "logoPlusText";
  const logoW = Math.max(32, Number((brand as any)?.logo?.width ?? 80));
  const logoH = Math.max(32, Number((brand as any)?.logo?.height ?? 80));
  const logoSrc = (brand as any)?.logo?.src;

  const showLogo = logoEnabled && logoMode !== "textOnly" && !!logoSrc;
  const showTextBlock = logoMode !== "logoOnly";

  const LogoNode =
    logoMode === "textOnly"
      ? null
      : showLogo
      ? (
          <div style={{ height: logoH }} className="flex items-center">
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
        )
      : (
          <div
            className={cx("rounded-2xl bg-gradient-to-br", theme.accentFrom, theme.accentTo)}
            style={{ width: 56, height: 56 }}
            aria-hidden="true"
          />
        );

  // ✅ Anti-tremblement subtitle : wrapper toujours rendu + hauteur réservée
  const subtitleRaw = (brand as any)?.text?.subtitle;
  const subtitleText = hasText(subtitleRaw) ? String(subtitleRaw) : "\u00A0";

  const BrandText = showTextBlock ? (
    <div className="min-w-0 leading-tight">
      <div className={cx("truncate font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
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
        "shrink-0 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition will-change-transform hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
        theme.accentFrom,
        theme.accentTo
      )}
    >
      {ctaLabel}
    </a>
  ) : null;

  const socialsCfg = (props.content?.socials ?? undefined) as SocialConfig | undefined;

  const secs = Array.isArray((props as any).sections) ? (props as any).sections : [];
  const orderedLinks = secs
    .filter((sec: any) => sec?.enabled !== false)
    .map((sec: any) => {
      if (!sec?.type || sec.type === "header" || sec.type === "top") return null;
      return { href: `#${sec.id}`, label: sec.title ?? sec.id };
    })
    .filter(Boolean) as { href: string; label: string }[];

  const direct = (props.galleryLinks ?? []).slice(0, Math.max(0, maxDirectLinks || 0));
  const fallbackLinks = [
    { href: "#top", label: "Accueil" },
    { href: "#services", label: "Services" },
    ...(showTeam ? [{ href: "#team", label: "Équipe" }] : []),
    ...direct.map((g) => ({ href: `#${g.id}`, label: g.title })),
    ...(includeContactInNav ? [{ href: "#contact", label: "Contact" }] : []),
  ];

  const seen = new Set<string>();
  const linksAll = (orderedLinks.length ? orderedLinks : fallbackLinks).filter((x) => {
    if (seen.has(x.href)) return false;
    seen.add(x.href);
    return true;
  });

  const MAX_INLINE = Math.max(0, Math.min(12, Number(maxDirectLinks ?? 6)));
  const inlineLinks = linksAll.slice(0, MAX_INLINE);
  const overflowLinks = linksAll.slice(MAX_INLINE);

  const headerPos = "fixed left-0 right-0 top-0";
  const headerZ = "z-50";
  const Spacer = <div aria-hidden="true" style={{ height: "var(--header-h, 0px)" }} />;

  const HeaderShell = (children: React.ReactNode) => (
    <>
      <header
        ref={headerRef as any}
        style={
          immersive
            ? {
                backgroundColor: isScrolled
                  ? "color-mix(in srgb, var(--te-canvas, #0b0b0c) 88%, transparent)"
                  : "var(--te-canvas, #0b0b0c)",
              }
            : undefined
        }
        className={cx(
          headerPos,
          headerZ,
          "border-b shadow-[0_2px_18px_rgba(0,0,0,0.06)] transition-[background-color,backdrop-filter] duration-200",
          theme.isDark ? "border-white/10 text-white" : "border-slate-200 text-slate-900",
          !immersive && (theme.isDark ? "bg-slate-950" : "bg-white"),
          !immersive && isScrolled && (theme.isDark ? "bg-slate-950/88 backdrop-blur" : "bg-white/88 backdrop-blur"),
          immersive && isScrolled && "backdrop-blur"
        )}
      >
        {children}
      </header>
      {Spacer}
    </>
  );

  const NavA = () => (
    <nav className={cx("hidden md:flex items-center gap-7", navBase, theme.isDark ? "text-white/80" : "text-slate-700")}>
      {inlineLinks.map((lnk) => {
        const active = lnk.href === activeHref;
        return (
          <a
            key={lnk.href}
            href={lnk.href}
            className={cx(
              "group relative transition-colors",
              theme.isDark ? "hover:text-white" : "hover:text-slate-950",
              active && (theme.isDark ? "text-white" : "text-slate-950")
            )}
          >
            {lnk.label}
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
      <DesktopOverflowMenu theme={theme} items={overflowLinks} />
    </nav>
  );

  const NavB = () => (
    <nav className={cx("hidden md:flex items-center gap-2 rounded-2xl border p-1.5", theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
      {inlineLinks.map((lnk) => {
        const active = lnk.href === activeHref;
        const activePill = theme.isDark ? "text-white bg-white/10 shadow-sm" : "text-slate-950 bg-white shadow-sm";
        const idlePill = theme.isDark
          ? "text-white/80 hover:text-white hover:bg-white/10"
          : "text-slate-700 hover:text-slate-950 hover:bg-white hover:shadow-sm";

        return (
          <a
            key={lnk.href}
            href={lnk.href}
            className={cx("rounded-2xl px-5 py-2 transition text-center hover:-translate-y-[1px] active:translate-y-0", navBase, active ? activePill : idlePill)}
          >
            {lnk.label}
          </a>
        );
      })}

      <div className="hidden md:block">
        <DesktopOverflowMenu theme={theme} items={overflowLinks} />
      </div>
    </nav>
  );

  const NavC = () => (
    <nav className={cx("hidden md:flex items-center justify-center gap-8", navBase, theme.isDark ? "text-white/80" : "text-slate-700")}>
      {inlineLinks.map((lnk) => {
        const active = lnk.href === activeHref;
        return (
          <a
            key={lnk.href}
            href={lnk.href}
            className={cx(
              "group relative transition-colors",
              theme.isDark ? "hover:text-white" : "hover:text-slate-950",
              active && (theme.isDark ? "text-white" : "text-slate-950")
            )}
          >
            {lnk.label}
            <span
              className={cx(
                "pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-2 h-[2px] w-10 bg-gradient-to-r transition-opacity",
                theme.accentFrom,
                theme.accentTo,
                active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            />
          </a>
        );
      })}
      <DesktopOverflowMenu theme={theme} items={overflowLinks} />
    </nav>
  );

  const RenderD = () => {
    const phone = contact?.phone ?? "";
    const email = contact?.email ?? "";

    const pillBase = cx("rounded-2xl border px-4 transition-all duration-200", theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50");
    const pillLabel = theme.isDark ? "text-white/60" : "text-slate-500";
    const pillValue = theme.isDark ? "text-white" : "text-slate-900";

    return (
      <>
        <header
          ref={headerRef as any}
          style={
            immersive
              ? {
                  backgroundColor: isScrolled
                    ? "color-mix(in srgb, var(--te-canvas, #0b0b0c) 88%, transparent)"
                    : "var(--te-canvas, #0b0b0c)",
                }
              : undefined
          }
          className={cx(
            headerPos,
            headerZ,
            "border-b shadow-[0_2px_18px_rgba(0,0,0,0.06)] transition-[background-color,backdrop-filter] duration-200",
            theme.isDark ? "border-white/10 text-white" : "border-slate-200 text-slate-900",
            !immersive && (theme.isDark ? "bg-slate-950" : "bg-white"),
            !immersive && isScrolled && (theme.isDark ? "bg-slate-950/88 backdrop-blur" : "bg-white/88 backdrop-blur"),
            immersive && isScrolled && "backdrop-blur"
          )}
        >
          <Wrap layout={props.layout} globalLayout={props.globalLayout} className={cx("grid grid-cols-[auto_1fr_auto] items-center gap-4")} style={{ paddingTop: padY2, paddingBottom: padY2 }}>
            <a href="#top" className="flex items-center gap-3 min-w-0">
              <div style={{ transform: `scale(${logoScale})`, transformOrigin: "left center" }}>{LogoNode}</div>
              {BrandText}
            </a>

            <div className={cx("hidden lg:flex items-center justify-center gap-3 transition-opacity duration-200", isScrolled && "opacity-95")}>
              {phone ? (
                <div className={cx("max-w-[220px]", pillBase)} style={{ paddingTop: lerp(8, 6), paddingBottom: lerp(8, 6) }}>
                  <div className={cx("text-[10px] font-semibold uppercase tracking-wider", pillLabel)}>Téléphone</div>
                  <div className={cx("truncate text-sm font-semibold", pillValue)}>{phone}</div>
                </div>
              ) : null}

              {email ? (
                <div className={cx("max-w-[260px]", pillBase)} style={{ paddingTop: lerp(8, 6), paddingBottom: lerp(8, 6) }}>
                  <div className={cx("text-[10px] font-semibold uppercase tracking-wider", pillLabel)}>E-mail</div>
                  <div className={cx("truncate text-sm font-semibold", pillValue)}>{email}</div>
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
            style={immersive ? { backgroundColor: "var(--te-canvas, #0b0b0c)" } : undefined}
            className={cx("border-t transition-[background-color] duration-200", theme.isDark ? "border-white/10" : "border-slate-200", !immersive && (theme.isDark ? "bg-slate-950" : "bg-white"))}
          >
            <Wrap layout={props.layout} globalLayout={props.globalLayout} className="flex justify-center" style={{ paddingTop: navPadY, paddingBottom: navPadY }}>
              {NavB()}
            </Wrap>
          </div>
        </header>
        {Spacer}
      </>
    );
  };

  const RenderA = () =>
    HeaderShell(
      <Wrap layout={props.layout} globalLayout={props.globalLayout} className="flex items-center gap-4" style={{ paddingTop: padY, paddingBottom: padY }}>
        <a href="#top" className="flex items-center gap-3 min-w-0 flex-[0_0_auto]">
          <div style={{ transform: `scale(${logoScale})`, transformOrigin: "left center" }}>{LogoNode}</div>
          <div className="min-w-[180px] max-w-[320px]">{BrandText}</div>
        </a>

        <div className="flex-1 flex items-center justify-center">{NavA()}</div>

        <div className="flex-[0_0_auto] flex items-center gap-3">
          <SocialRow theme={theme} cfg={socialsCfg} className="hidden lg:flex" />
          {Cta}
        </div>
      </Wrap>
    );

  const RenderB = () =>
    HeaderShell(
      <Wrap layout={props.layout} globalLayout={props.globalLayout} className="flex items-center gap-4" style={{ paddingTop: padY, paddingBottom: padY }}>
        <a href="#top" className="flex items-center gap-3 min-w-0 flex-[0_0_auto]">
          <div style={{ transform: `scale(${logoScale})`, transformOrigin: "left center" }}>{LogoNode}</div>
          <div className="min-w-[180px] max-w-[320px]">{BrandText}</div>
        </a>

        <div className="flex-1 flex items-center justify-center">{NavB()}</div>

        <div className="flex-[0_0_auto] flex items-center gap-3">
          <SocialRow theme={theme} cfg={socialsCfg} className="hidden lg:flex" />
          {Cta}
        </div>
      </Wrap>
    );

  const RenderC = () =>
    HeaderShell(
      <Wrap layout={props.layout} globalLayout={props.globalLayout} className={cx("grid items-center gap-4", "grid-cols-[1fr_auto_1fr]")} style={{ paddingTop: padY, paddingBottom: padY }}>
        <div className="justify-self-start">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <div style={{ transform: `scale(${logoScale})`, transformOrigin: "left center" }}>{LogoNode}</div>
            <div className="min-w-[180px] max-w-[320px]">{BrandText}</div>
          </a>
        </div>

        <div className="justify-self-center">{NavC()}</div>

        <div className="justify-self-end flex items-center gap-3">
          <SocialRow theme={theme} cfg={socialsCfg} className="hidden lg:flex" />
          {Cta}
        </div>
      </Wrap>
    );

  if (variant === "D") return RenderD();
  if (variant === "B") return RenderB();
  if (variant === "C") return RenderC();
  return RenderA();
}

/* ============================================================
   BLOC 3 — HERO (A/B)
   ============================================================ */

export function LegacyHero({ theme, content, layout, globalLayout, sectionId, variant }: any) {
  const l = resolveLayout(layout, globalLayout);

  const kicker = content?.heroKicker ?? "Sous-titre et/ou slogan";
  const title = content?.heroTitle ?? "Titre de la section HERO";
  const text =
    content?.heroText ??
    "Une approche professionnelle orientée qualité, transparence et solutions durables, adaptée aux particuliers comme aux entreprises.";

  // ✅ paths minuscule (ton dossier = p4.jpg)
  const imgSrc = content?.heroImage ?? "/images/template-base/p4.jpg";
  const imgAlt = content?.heroImageAlt ?? "Illustration";

  const cta1 = content?.cta?.heroPrimary ?? "Me contacter";
  const cta2 = content?.cta?.heroSecondary ?? "Voir nos services";

  const v = String(variant ?? "A");

  const PrimaryBtn = (
    <a
      href="#contact"
      className={cx(
        radiusClass(l.radius),
        "px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
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
        theme.isDark ? "border-white/15 text-white hover:bg-white/5" : "border-slate-200 text-slate-900 hover:bg-slate-50"
      )}
    >
      {cta2}
    </a>
  );

  if (v === "B") {
  return (
    <section id={sectionId ?? "hero"} className={cx(heroPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface
          theme={theme}
          layout={layout}
          globalLayout={globalLayout}
          className={cx("p-10 md:p-14")}
        >
          <div className="max-w-3xl mx-auto text-center">
            {hasText(kicker) ? (
              <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-600")}>
                {kicker}
              </div>
            ) : null}

            <h1 className={cx("mt-3 text-4xl md:text-5xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-950")}>
              {title}
            </h1>

            <p className={cx("mt-4 text-base md:text-lg leading-relaxed", theme.isDark ? "text-white/70" : "text-slate-600")}>
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
              className={cx("relative overflow-hidden border", theme.surfaceBorder)}
            >
              <div className="relative aspect-[16/7]">
                <NextImage src={imgSrc} alt={imgAlt} fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </Surface>
      </Wrap>
    </section>
  );
}


  return (
    <section id={sectionId ?? "hero"} className={cx(heroPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface theme={theme} layout={layout} globalLayout={globalLayout} className={cx("p-10 md:p-14", theme.isDark && "bg-white/5")}>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              {hasText(kicker) ? <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-600")}>{kicker}</div> : null}
              <h1 className={cx("mt-3 text-4xl md:text-5xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-950")}>{title}</h1>
              <p className={cx("mt-4 max-w-xl text-base md:text-lg leading-relaxed", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {PrimaryBtn}
                {SecondaryBtn}
              </div>
            </div>

            <div className="relative">
              <div style={radiusStyle(l.radius)} className={cx("relative overflow-hidden border", theme.isDark ? "border-white/10" : "border-slate-200")}>
                <div className="relative aspect-[16/10]">
                  <NextImage src={imgSrc} alt={imgAlt} fill className="object-cover" priority />
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

  const title = content?.split?.title ?? content?.splitTitle ?? "Une approche simple, pro, efficace.";
  const text = content?.split?.text ?? content?.splitText ?? "Diagnostic clair, intervention propre, résultat durable.";
  const imgSrc = content?.split?.image ?? content?.splitImage ?? "/images/template-base/p2.jpg";
  const imgAlt = content?.split?.imageAlt ?? content?.splitImageAlt ?? "Illustration";
  const ctaLabel = content?.split?.ctaLabel ?? content?.splitCtaLabel ?? "Me contacter";
  const ctaHref = content?.split?.ctaHref ?? content?.splitCtaHref ?? "#contact";

  const reverse = v === "B" ? true : !!content?.split?.reverse;

  return (
    <section id={sectionId ?? "split"} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface theme={theme} layout={layout} globalLayout={globalLayout} className={cx("p-8 md:p-10", theme.isDark && "bg-white/5")}>
          <div className={cx("grid items-center gap-10 md:grid-cols-2", reverse && "md:[&>*:first-child]:order-2")}>
            <div>
              <h2 className={cx("text-2xl md:text-3xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-950")}>{title}</h2>
              <p className={cx("mt-3 max-w-xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>

              <div className="mt-6">
                <a
                  href={ctaHref}
                  className={cx(
                    radiusClass(l.radius),
                    "inline-flex px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
                    theme.accentFrom,
                    theme.accentTo
                  )}
                >
                  {ctaLabel}
                </a>
              </div>
            </div>

            <div style={radiusStyle(l.radius)} className={cx("relative overflow-hidden border", theme.isDark ? "border-white/10" : "border-slate-200")}>
              <div className="relative aspect-[16/10]">
                <NextImage src={imgSrc} alt={imgAlt} fill className="object-cover" />
              </div>
            </div>
          </div>
        </Surface>
      </Wrap>
    </section>
  );
}

/* ============================================================
   BLOC 5 — SERVICES (A/B/C/D/E)
   ============================================================ */

export function LegacyServices(props: any) {
  const { theme, content, layout, globalLayout, sectionId, variant } = props;
  const l = resolveLayout(layout, globalLayout);
  const v = String(variant ?? "A");

  const title = content?.servicesTitle ?? "Nos services";
  const text = content?.servicesText ?? "Des prestations claires et adaptées à vos besoins.";
  const items = Array.isArray(content?.services) ? content.services : [];

  const Card = ({ t, list }: { t: string; list: string[] }) => (
    <Surface theme={theme} layout={layout} globalLayout={globalLayout} className={cx("p-6", theme.isDark && "bg-white/5")}>
      <div className={cx("text-lg font-semibold", theme.isDark ? "text-white" : "text-slate-950")}>{t}</div>
      <ul className={cx("mt-3 space-y-2 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>
        {list.map((x, i) => (
          <li key={i} className="flex gap-2">
            <span className={cx("mt-[6px] h-1.5 w-1.5 rounded-full bg-gradient-to-r", theme.accentFrom, theme.accentTo)} />
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );

  const gridCols =
    v === "B" ? "md:grid-cols-2" :
    v === "C" ? "md:grid-cols-3" :
    v === "D" ? "md:grid-cols-3" :
    v === "E" ? "md:grid-cols-2" :
    "md:grid-cols-3";

  return (
    <section id={sectionId ?? "services"} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="mb-8">
          <div className={cx("text-xs font-semibold uppercase tracking-[0.18em]", theme.isDark ? "text-white/60" : "text-slate-500")}>Services</div>
          <h2 className={cx("mt-2 text-3xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-950")}>{title}</h2>
          <p className={cx("mt-3 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
        </div>

        <div className={cx("grid gap-6", gridCols)}>
          {items.map((s: any, i: number) => <Card key={i} t={s.title ?? `Service ${i + 1}`} list={Array.isArray(s.items) ? s.items : []} />)}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   BLOC 6 — TEAM (A/B/C)
   ============================================================ */

export function LegacyTeam(props: any) {
  const { theme, content, layout, globalLayout, sectionId, variant } = props;
  const l = resolveLayout(layout, globalLayout);
  const v = String(variant ?? "A");

  const title = content?.teamTitle ?? "Qui sommes-nous";
  const text = content?.teamText ?? "Une équipe terrain orientée qualité.";
  const cards = Array.isArray(content?.teamCards) ? content.teamCards : [];

  const cols = v === "B" ? "md:grid-cols-2" : v === "C" ? "md:grid-cols-3" : "md:grid-cols-3";

  return (
    <section id={sectionId ?? "team"} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="mb-8">
          <div className={cx("text-xs font-semibold uppercase tracking-[0.18em]", theme.isDark ? "text-white/60" : "text-slate-500")}>Équipe</div>
          <h2 className={cx("mt-2 text-3xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-950")}>{title}</h2>
          <p className={cx("mt-3 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
        </div>

        <div className={cx("grid gap-6", cols)}>
          {cards.map((c: any, i: number) => (
            <Surface key={i} theme={theme} layout={layout} globalLayout={globalLayout} className={cx("p-6", theme.isDark && "bg-white/5")}>
              <div className={cx("text-lg font-semibold", theme.isDark ? "text-white" : "text-slate-950")}>{c.title ?? `Bloc ${i + 1}`}</div>
              <p className={cx("mt-2 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>{c.text ?? ""}</p>
            </Surface>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   BLOC 7 — GALLERIES (stack / twoCol / threeCol)
   ============================================================ */

export function LegacyGalleries(props: any) {
  const { theme, content, layout, globalLayout, sectionId, onOpen, enableLightbox, variant } = props;
  const l = resolveLayout(layout, globalLayout);

  const v = String(variant ?? "twoCol");
  const cols = v === "threeCol" ? "md:grid-cols-3" : v === "stack" ? "md:grid-cols-1" : "md:grid-cols-2";

  const galleries = Array.isArray(content?.galleries) ? content.galleries : [];
  const g = galleries.find((x: any) => x?.id === sectionId) ?? galleries[0];
  const title = g?.title ?? "Galeries";
  const desc = g?.description ?? "";
  const images = Array.isArray(g?.images) ? g.images : [];

  return (
    <section id={sectionId ?? "realisations"} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="mb-8">
          <div className={cx("text-xs font-semibold uppercase tracking-[0.18em]", theme.isDark ? "text-white/60" : "text-slate-500")}>Galerie</div>
          <h2 className={cx("mt-2 text-3xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-950")}>{title}</h2>
          {hasText(desc) ? <p className={cx("mt-3 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{desc}</p> : null}
        </div>

        <div className={cx("grid gap-6", cols)}>
          {images.map((img: any, i: number) => (
            <button
              key={i}
              type="button"
              className={cx("text-left", enableLightbox ? "cursor-zoom-in" : "cursor-default")}
              onClick={() => enableLightbox && onOpen?.(img)}
            >
              <div style={radiusStyle(l.radius)} className={cx("relative overflow-hidden border", theme.isDark ? "border-white/10" : "border-slate-200")}>
                <div className="relative aspect-[16/11]">
                  <NextImage src={img.src} alt={img.alt ?? "Visuel"} fill className="object-cover" />
                </div>
              </div>
              {hasText(img.caption) ? (
                <div className={cx("mt-2 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>{img.caption}</div>
              ) : null}
            </button>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   BLOC 8 — CONTACT (A/B) + socials en bas ✅
   ============================================================ */

export function LegacyContact(props: any) {
  const { theme, content, layout, globalLayout, sectionId, variant } = props;
  const l = resolveLayout(layout, globalLayout);

  const v = String(variant ?? "A");

  const kicker = content?.contactKicker ?? "Contact";
  const title = content?.contactTitle ?? "Contact";
  const text = content?.contactText ?? "Expliquez votre besoin en 2 lignes, nous vous répondrons rapidement.";

  const address = content?.contact?.address ?? "";
  const phone = content?.contact?.phone ?? "";
  const email = content?.contact?.email ?? "";

  const socialsCfg = (content?.socials ?? undefined) as SocialConfig | undefined;
  const socials = React.useMemo(() => resolveSocialLinks(socialsCfg), [socialsCfg]);

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
    <section id={sectionId ?? "contact"} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            {hasText(kicker) ? (
              <div className={cx("text-xs font-semibold uppercase tracking-[0.18em]", theme.isDark ? "text-white/60" : "text-slate-500")}>
                {kicker}
              </div>
            ) : null}

            <h2 className={cx("mt-2 text-3xl md:text-4xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-950")}>
              {title}
            </h2>

            {hasText(text) ? (
              <p className={cx("mt-3 max-w-xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
            ) : null}

            <div className="mt-8 space-y-3 text-sm">
              {hasText(address) ? (
                <div className={cx(theme.isDark ? "text-white/80" : "text-slate-800")}>
                  <span className={cx("font-semibold", theme.isDark ? "text-white" : "text-slate-950")}>Adresse:</span> {address}
                </div>
              ) : null}
              {hasText(phone) ? (
                <div className={cx(theme.isDark ? "text-white/80" : "text-slate-800")}>
                  <span className={cx("font-semibold", theme.isDark ? "text-white" : "text-slate-950")}>Téléphone:</span> {phone}
                </div>
              ) : null}
              {hasText(email) ? (
                <div className={cx(theme.isDark ? "text-white/80" : "text-slate-800")}>
                  <span className={cx("font-semibold", theme.isDark ? "text-white" : "text-slate-950")}>E-mail:</span> {email}
                </div>
              ) : null}
            </div>

            {SocialBar}
          </div>

          <Surface theme={theme} layout={layout} globalLayout={globalLayout} className={cx("p-6 md:p-8", theme.isDark && "bg-white/5")}>
            <div className={cx("text-lg font-semibold", theme.isDark ? "text-white" : "text-slate-950")}>Demande rapide</div>
            <div className={cx("mt-1 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>(Démo) Brancher ici ton vrai formulaire plus tard.</div>

            <div className="mt-6 space-y-3">
              <input className={cx(radiusClass(l.radius), "w-full border px-4 py-3 text-sm outline-none", theme.isDark ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300")} placeholder="Nom" />
              <input className={cx(radiusClass(l.radius), "w-full border px-4 py-3 text-sm outline-none", theme.isDark ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300")} placeholder="E-mail" />
              <textarea rows={4} className={cx(radiusClass(l.radius), "w-full border px-4 py-3 text-sm outline-none", theme.isDark ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300")} placeholder="Message" />
              <button type="button" className={cx(radiusClass(l.radius), "mt-2 w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0", theme.accentFrom, theme.accentTo)}>
                Envoyer
              </button>
            </div>
          </Surface>
        </div>
      </Wrap>
    </section>
  );

  const RenderB = () => (
    <section id={sectionId ?? "contact"} className={cx(sectionPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface theme={theme} layout={layout} globalLayout={globalLayout} className={cx("p-8 md:p-10", theme.isDark && "bg-white/5")}>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              {hasText(kicker) ? <div className={cx("text-xs font-semibold uppercase tracking-[0.18em]", theme.isDark ? "text-white/60" : "text-slate-500")}>{kicker}</div> : null}
              <h2 className={cx("mt-2 text-3xl md:text-4xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-950")}>{title}</h2>
              {hasText(text) ? <p className={cx("mt-3 max-w-xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p> : null}

              <div className="mt-8 space-y-3 text-sm">
                {hasText(address) ? <div className={cx(theme.isDark ? "text-white/80" : "text-slate-800")}><span className={cx("font-semibold", theme.isDark ? "text-white" : "text-slate-950")}>Adresse:</span> {address}</div> : null}
                {hasText(phone) ? <div className={cx(theme.isDark ? "text-white/80" : "text-slate-800")}><span className={cx("font-semibold", theme.isDark ? "text-white" : "text-slate-950")}>Téléphone:</span> {phone}</div> : null}
                {hasText(email) ? <div className={cx(theme.isDark ? "text-white/80" : "text-slate-800")}><span className={cx("font-semibold", theme.isDark ? "text-white" : "text-slate-950")}>E-mail:</span> {email}</div> : null}
              </div>

              {SocialBar}
            </div>

            <div>
              <div className={cx("text-lg font-semibold", theme.isDark ? "text-white" : "text-slate-950")}>Demande rapide</div>
              <div className={cx("mt-1 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>(Démo) Brancher ici ton vrai formulaire plus tard.</div>

              <div className="mt-6 space-y-3">
                <input className={cx(radiusClass(l.radius), "w-full border px-4 py-3 text-sm outline-none", theme.isDark ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300")} placeholder="Nom" />
                <input className={cx(radiusClass(l.radius), "w-full border px-4 py-3 text-sm outline-none", theme.isDark ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300")} placeholder="E-mail" />
                <textarea rows={4} className={cx(radiusClass(l.radius), "w-full border px-4 py-3 text-sm outline-none", theme.isDark ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-white/20" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300")} placeholder="Message" />
                <button type="button" className={cx(radiusClass(l.radius), "mt-2 w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0", theme.accentFrom, theme.accentTo)}>
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
