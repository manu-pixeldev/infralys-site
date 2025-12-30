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

// Types "soft" (compat)
type Brand = any;
type LayoutTokens = any;
type HeaderVariantX = any;
type LogoMode = "logoPlusText" | "logoOnly" | "textOnly";

function hasText(v: any) {
  return typeof v === "string" && v.trim().length > 0;
}

/** Small section header (SaaS clean) */
function SectionHead({
  theme,
  kicker,
  title,
  text,
  align = "left",
}: {
  theme: ThemeLike;
  kicker?: string;
  title?: string;
  text?: string;
  align?: "left" | "center";
}) {
  if (!hasText(kicker) && !hasText(title) && !hasText(text)) return null;

  const isCenter = align === "center";
  return (
    <div className={cx(isCenter ? "text-center" : "text-left", "mb-8")}>
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

      {hasText(title) ? (
        <h2
          className={cx(
            "mt-2 text-2xl md:text-3xl font-semibold tracking-tight",
            theme.isDark ? "text-white" : "text-slate-950"
          )}
        >
          {title}
        </h2>
      ) : null}

      {hasText(text) ? (
        <p
          className={cx(
            "mt-3 max-w-3xl",
            isCenter ? "mx-auto" : "",
            theme.isDark ? "text-white/70" : "text-slate-600"
          )}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

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

function Surface({
  children,
  theme,
  layout,
  globalLayout,
  className,
}: {
  children: React.ReactNode;
  theme: ThemeLike;
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
  className?: string;
}) {
  const l = resolveLayout(layout, globalLayout);
  return (
    <div
      style={radiusStyle(l.radius)}
      className={cx(
        "border",
        theme.surfaceBg,
        theme.surfaceBorder,
        theme.isDark ? "text-white" : "text-slate-900",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Social icons row (optional, driven by content.socials) */
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
  const btnTheme = theme.isDark
    ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950";

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

  const btnBase =
    "inline-flex items-center gap-2 rounded-2xl px-4 py-2 transition will-change-transform hover:-translate-y-[1px] active:translate-y-0";
  const btnTheme = theme.isDark
    ? "text-white/85 hover:text-white bg-white/0 hover:bg-white/10"
    : "text-slate-700 hover:text-slate-950 bg-white/0 hover:bg-white";

  return (
    <div ref={ref} className="relative hidden md:block px-1">
      <button
        type="button"
        className={cx("group relative", btnBase, btnTheme)}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
        <span className="opacity-70">▾</span>

        <span
          className={cx(
            "pointer-events-none absolute left-3 right-3 -bottom-1 h-[2px] bg-gradient-to-r transition-opacity opacity-0 group-hover:opacity-100",
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
              : "border-slate-200 bg-white text-slate-900",
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
   HEADER (FULL)
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
}) {
  const { theme, brand, headerVariant, headerRef, showTeam, maxDirectLinks, contact } =
    props;

  const variant = (headerVariant ?? "A") as HeaderVariantX;
  const l = resolveLayout(props.layout, props.globalLayout);

  const activeHref = props.activeHref ?? "#top";
  const t = Math.max(
    0,
    Math.min(1, Number(props.scrollT ?? (props.isScrolled ? 1 : 0)))
  );
  const isScrolled = t > 0.15;

  const lerp = (a: number, b: number) => a + (b - a) * t;

  // padding fluide
  const padY = lerp(16, 10);
  const padY2 = lerp(14, 9);
  const navPadY = lerp(10, 8);
  const logoScale = lerp(1, 0.9);

  const showCta = !["J"].includes(String(variant));
  const includeContactInNav = !showCta;

  const navBase = "text-[12px] font-semibold uppercase tracking-[0.14em]";

  const logoEnabled = (brand as any)?.logo?.enabled !== false;
  const logoMode =
    (((brand as any)?.logo?.mode ?? "logoPlusText") as LogoMode) ||
    "logoPlusText";

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
            className={cx(
              "rounded-2xl bg-gradient-to-br",
              theme.accentFrom,
              theme.accentTo
            )}
            style={{ width: 56, height: 56 }}
            aria-hidden="true"
          />
        );

  // ✅ FIX ANTI-TREMBLEMENT:
  // - subtitle wrapper toujours rendu
  // - réserve une ligne (min-h + leading)
  // - si vide => NBSP (pas "—", pas opacity-0)
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
          // réserve une hauteur stable (1 ligne)
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

  // ✅ socials via content.socials (optional)
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

  // dropdown si trop d’items (desktop)
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
        className={cx(
          headerPos,
          headerZ,
          "border-b shadow-[0_2px_18px_rgba(0,0,0,0.06)] transition-[background-color,backdrop-filter] duration-200",
          theme.isDark
            ? "border-white/10 bg-slate-950 text-white"
            : "border-slate-200 bg-white text-slate-900",
          isScrolled &&
            (theme.isDark ? "bg-slate-950/88 backdrop-blur" : "bg-white/88 backdrop-blur")
        )}
      >
        {children}
      </header>
      {Spacer}
    </>
  );

  const NavA = () => (
    <nav
      className={cx(
        "hidden md:flex items-center gap-7",
        navBase,
        theme.isDark ? "text-white/80" : "text-slate-700"
      )}
    >
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
    <nav
      className={cx(
        "hidden md:flex items-center gap-2 rounded-2xl border p-1.5",
        theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
      )}
    >
      {inlineLinks.map((lnk) => {
        const active = lnk.href === activeHref;
        const activePill = theme.isDark
          ? "text-white bg-white/10 shadow-sm"
          : "text-slate-950 bg-white shadow-sm";
        const idlePill = theme.isDark
          ? "text-white/80 hover:text-white hover:bg-white/10"
          : "text-slate-700 hover:text-slate-950 hover:bg-white hover:shadow-sm";

        return (
          <a
            key={lnk.href}
            href={lnk.href}
            className={cx(
              "rounded-2xl px-5 py-2 transition text-center hover:-translate-y-[1px] active:translate-y-0",
              navBase,
              active ? activePill : idlePill
            )}
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
    <nav
      className={cx(
        "hidden md:flex items-center justify-center gap-8",
        navBase,
        theme.isDark ? "text-white/80" : "text-slate-700"
      )}
    >
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

    const pillBase = cx(
      "rounded-2xl border px-4 transition-all duration-200",
      theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
    );
    const pillLabel = theme.isDark ? "text-white/60" : "text-slate-500";
    const pillValue = theme.isDark ? "text-white" : "text-slate-900";

    return (
      <>
        <header
          ref={headerRef as any}
          className={cx(
            headerPos,
            headerZ,
            "border-b shadow-[0_2px_18px_rgba(0,0,0,0.06)] transition-[background-color,backdrop-filter] duration-200",
            theme.isDark ? "border-white/10 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-900",
            isScrolled && (theme.isDark ? "bg-slate-950/88 backdrop-blur" : "bg-white/88 backdrop-blur")
          )}
        >
          <Wrap
            layout={props.layout}
            globalLayout={props.globalLayout}
            className={cx("grid grid-cols-[auto_1fr_auto] items-center gap-4")}
            style={{ paddingTop: padY2, paddingBottom: padY2 }}
          >
            <a href="#top" className="flex items-center gap-3 min-w-0">
              <div style={{ transform: `scale(${logoScale})`, transformOrigin: "left center" }}>
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
            className={cx(
              "border-t transition-[background-color] duration-200",
              theme.isDark ? "border-white/10 bg-slate-950" : "border-slate-200 bg-white"
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

  const RenderA = () =>
    HeaderShell(
      <Wrap
        layout={props.layout}
        globalLayout={props.globalLayout}
        className="flex items-center gap-4"
        style={{ paddingTop: padY, paddingBottom: padY }}
      >
        <a href="#top" className="flex items-center gap-3 min-w-0 flex-[0_0_auto]">
          <div style={{ transform: `scale(${logoScale})`, transformOrigin: "left center" }}>
            {LogoNode}
          </div>
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
      <Wrap
        layout={props.layout}
        globalLayout={props.globalLayout}
        className="flex items-center gap-4"
        style={{ paddingTop: padY, paddingBottom: padY }}
      >
        <a href="#top" className="flex items-center gap-3 min-w-0 flex-[0_0_auto]">
          <div style={{ transform: `scale(${logoScale})`, transformOrigin: "left center" }}>
            {LogoNode}
          </div>
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
      <Wrap
        layout={props.layout}
        globalLayout={props.globalLayout}
        className={cx("grid items-center gap-4", "grid-cols-[1fr_auto_1fr]")}
        style={{ paddingTop: padY, paddingBottom: padY }}
      >
        <div className="justify-self-start">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            <div style={{ transform: `scale(${logoScale})`, transformOrigin: "left center" }}>
              {LogoNode}
            </div>
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
   HERO (variants A/B)
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

  const kicker = content?.heroKicker ?? "Sous-titre et/ou slogan";
  const title = content?.heroTitle ?? "Titre de la section HERO";
  const text =
    content?.heroText ??
    "Une approche professionnelle orientée qualité, transparence et solutions durables, adaptée aux particuliers comme aux entreprises.";

  const imgSrc = content?.heroImage ?? "/images/template-base/p4.jpg";
  const imgAlt = content?.heroImageAlt ?? "Illustration";

  const cta1 = content?.cta?.primary ?? "Me contacter";
  const cta2 = content?.cta?.secondary ?? "Voir nos services";

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
      <section id={sectionId ?? "hero"} className={cx(heroPadY(l.density))}>
        <Wrap layout={layout} globalLayout={globalLayout}>
          <Surface
            theme={theme}
            layout={layout}
            globalLayout={globalLayout}
            className={cx("p-10 md:p-14", theme.isDark && "bg-white/5")}
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
                className={cx("relative overflow-hidden border", theme.isDark ? "border-white/10" : "border-slate-200")}
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

  // default A
  return (
    <section id={sectionId ?? "hero"} className={cx(heroPadY(l.density))}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface theme={theme} layout={layout} globalLayout={globalLayout} className={cx("p-10 md:p-14", theme.isDark && "bg-white/5")}>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              {hasText(kicker) ? (
                <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-600")}>
                  {kicker}
                </div>
              ) : null}

              <h1 className={cx("mt-3 text-4xl md:text-5xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-950")}>
                {title}
              </h1>

              <p className={cx("mt-4 max-w-xl text-base md:text-lg leading-relaxed", theme.isDark ? "text-white/70" : "text-slate-600")}>
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
                className={cx("relative overflow-hidden border", theme.isDark ? "border-white/10" : "border-slate-200")}
              >
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
   SPLIT (variants A/B)
   ============================================================ */

export function LegacySplit(props: {
  theme: ThemeLike;
  content?: any;
  sectionId?: string;
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
  sectionTitle?: string; // ✅ vient du panel (s.title)
  variant?: string; // ✅ A/B depuis registry
}) {
  const { theme } = props;
  const l = resolveLayout(props.layout, props.globalLayout);

  const v = String(props.variant ?? "A");

  const title = hasText(props.sectionTitle)
    ? props.sectionTitle
    : props.content?.splitTitle ?? "Section split";

  const text = props.content?.splitText ?? "";
  const img = props.content?.splitImage ?? "";
  const imgAlt = props.content?.splitImageAlt ?? "Illustration";
  const ctaLabel = props.content?.splitCtaLabel ?? "En savoir plus";
  const ctaHref = props.content?.splitCtaHref ?? "#contact";

  const Media = (
    <div className="relative min-h-[240px] lg:min-h-[360px]">
      {img ? (
        <NextImage
          src={img}
          alt={imgAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={false}
        />
      ) : (
        <div className={cx("h-full w-full", theme.isDark ? "bg-white/5" : "bg-slate-100")} />
      )}
    </div>
  );

  const Copy = (
    <div className="p-6 md:p-10">
      <h3 className={cx("mt-2 text-2xl md:text-3xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-950")}>
        {title}
      </h3>

      {hasText(text) ? (
        <p className={cx("mt-4 leading-relaxed", theme.isDark ? "text-white/70" : "text-slate-600")}>
          {text}
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        <a
          href={ctaHref}
          className={cx(
            radiusClass(l.radius),
            "inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition will-change-transform hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
            theme.accentFrom,
            theme.accentTo
          )}
        >
          {ctaLabel}
        </a>

        <a
          href="#services"
          className={cx(
            radiusClass(l.radius),
            "inline-flex items-center justify-center px-5 py-3 text-sm font-semibold border transition",
            theme.isDark
              ? "border-white/15 text-white/85 hover:text-white hover:bg-white/5"
              : "border-slate-200 text-slate-800 hover:text-slate-950 hover:bg-slate-50"
          )}
        >
          Services
        </a>
      </div>
    </div>
  );

  // ✅ A = texte à gauche / image à droite
  // ✅ B = image à gauche / texte à droite
  const Left = v === "B" ? Media : Copy;
  const Right = v === "B" ? Copy : Media;

  return (
    <section id={props.sectionId} className={sectionPadY(l.density)}>
      <Wrap layout={props.layout} globalLayout={props.globalLayout}>
        <Surface theme={theme} layout={props.layout} globalLayout={props.globalLayout} className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {Left}
            {Right}
          </div>
        </Surface>
      </Wrap>
    </section>
  );
}

/* ============================================================
   SERVICES (variants A/B/C)
   ============================================================ */

export function LegacyServices({
  theme,
  content,
  layout,
  globalLayout,
  sectionId,
  variant,
  servicesVariant,
}: any) {
  const l = resolveLayout(layout, globalLayout);

  const items = Array.isArray(content?.services)
    ? content.services
    : [
        { title: "Accompagnement", text: "Description." },
        { title: "Intervention", text: "Description." },
        { title: "Optimisation", text: "Description." },
      ];

  const v = String(servicesVariant ?? variant ?? "A");

  const gridCols = v === "B" ? "md:grid-cols-2" : v === "C" ? "md:grid-cols-4" : "md:grid-cols-3";
  const headAlign: "left" | "center" = v === "B" ? "center" : "left";

  const title = content?.servicesTitle ?? "Services";
  const kicker = content?.servicesKicker ?? "Ce qu’on fait";
  const desc = content?.servicesText ?? "Des prestations claires, cadrées, livrées proprement.";

  return (
    <section id={sectionId ?? "services"} className={sectionPadY(l.density)}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <SectionHead theme={theme} kicker={kicker} title={title} text={desc} align={headAlign} />

        <div className={cx("grid gap-4", gridCols)}>
          {items.slice(0, 12).map((it: any, idx: number) => (
            <Surface
              key={idx}
              theme={theme}
              layout={layout}
              globalLayout={globalLayout}
              className={cx("p-6 transition will-change-transform hover:shadow-md")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-600")}>
                  {(idx + 1).toString().padStart(2, "0")}
                </div>

                {v === "B" ? (
                  <div
                    className={cx(
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      theme.isDark
                        ? "border-white/10 bg-white/5 text-white/80"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    )}
                  >
                    {it.tag ?? "SaaS"}
                  </div>
                ) : null}
              </div>

              <div className={cx("mt-3 text-lg font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
                {it.title ?? `Service ${idx + 1}`}
              </div>

              <p className={cx("mt-2 text-sm leading-relaxed", theme.isDark ? "text-white/70" : "text-slate-600")}>
                {it.text ?? "Description."}
              </p>

              <div className={cx("mt-4 h-[2px] w-16 bg-gradient-to-r", theme.accentFrom, theme.accentTo)} />
            </Surface>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   TEAM (variants A/B/C)
   ============================================================ */

export function LegacyTeam({ theme, content, layout, globalLayout, sectionId, variant, teamVariant }: any) {
  const l = resolveLayout(layout, globalLayout);

  const items = Array.isArray(content?.team)
    ? content.team
    : [
        { name: "Prénom Nom", role: "Fonction" },
        { name: "Prénom Nom", role: "Fonction" },
        { name: "Prénom Nom", role: "Fonction" },
      ];

  const v = String(teamVariant ?? variant ?? "A");

  const title = content?.teamTitle ?? "Équipe";
  const kicker = content?.teamKicker ?? "Qui intervient";
  const desc = content?.teamText ?? "Une équipe stable, des process propres, un rendu net.";

  const gridCols = v === "B" ? "md:grid-cols-2" : v === "C" ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <section id={sectionId ?? "team"} className={sectionPadY(l.density)}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <SectionHead theme={theme} kicker={kicker} title={title} text={desc} align={v === "B" ? "center" : "left"} />

        <div className={cx("grid gap-4", gridCols)}>
          {items.slice(0, 12).map((it: any, idx: number) => (
            <Surface key={idx} theme={theme} layout={layout} globalLayout={globalLayout} className={cx("p-6", v === "C" && "p-5")}>
              <div className="flex items-center gap-4">
                <div className={cx("h-12 w-12 rounded-2xl bg-gradient-to-br", theme.accentFrom, theme.accentTo)} aria-hidden="true" />
                <div className="min-w-0">
                  <div className={cx("truncate font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
                    {it.name ?? "Prénom Nom"}
                  </div>
                  <div className={cx("truncate text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>
                    {it.role ?? "Fonction"}
                  </div>
                </div>
              </div>

              {v === "B" ? (
                <div className={cx("mt-4 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>
                  {it.bio ?? "Bio courte / expertise / zone d’intervention."}
                </div>
              ) : null}
            </Surface>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   GALLERIES (stack/twoCol/threeCol)
   ============================================================ */

export function LegacyGalleries({
  theme,
  content,
  layout,
  globalLayout,
  sectionId,
  onOpen,
  enableLightbox,
  variant,
  galleryLayout,
}: any) {
  const l = resolveLayout(layout, globalLayout);

  const galleries = Array.isArray(content?.galleries) ? content.galleries : [];
  const images = galleries.flatMap((g: any) => (Array.isArray(g?.images) ? g.images : []));
  const list = images.length
    ? images
    : [
        { src: "/images/template-base/p4.jpg", alt: "Image" },
        { src: "/images/template-base/p4.jpg", alt: "Image" },
        { src: "/images/template-base/p4.jpg", alt: "Image" },
      ];

  const gl = String(galleryLayout ?? variant ?? "threeCol");
  const gridCols = gl === "stack" ? "grid-cols-1" : gl === "twoCol" ? "md:grid-cols-2" : "md:grid-cols-3";

  const title = content?.galleryTitle ?? "Réalisations";
  const kicker = content?.galleryKicker ?? "Preuves";
  const desc = content?.galleryText ?? "Quelques exemples concrets (photos, chantiers, avant/après).";

  return (
    <section id={sectionId ?? "gallery"} className={sectionPadY(l.density)}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <SectionHead theme={theme} kicker={kicker} title={title} text={desc} align={gl === "stack" ? "center" : "left"} />

        <div className={cx("grid gap-4", gridCols)}>
          {list.slice(0, 24).map((img: any, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => enableLightbox && onOpen?.(img)}
              className={cx("text-left group")}
            >
              <div
                style={radiusStyle(l.radius)}
                className={cx(
                  "relative overflow-hidden border transition-[box-shadow] duration-200 group-hover:shadow-md",
                  theme.isDark ? "border-white/10" : "border-slate-200"
                )}
              >
                <div className={cx("relative", gl === "stack" ? "aspect-[16/7]" : "aspect-[4/3]")}>
                  <NextImage
                    src={img.src}
                    alt={img.alt ?? "Image"}
                    fill
                    className="object-cover transition-transform duration-300 will-change-transform transform-gpu group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   CONTACT (variants A/B/C)
   ============================================================ */

export function LegacyContact({ theme, content, layout, globalLayout, sectionId, variant }: any) {
  const l = resolveLayout(layout, globalLayout);

  const title = content?.contactTitle ?? "Contact";
  const text = content?.contactText ?? "Expliquez votre besoin, on répond rapidement.";
  const phone = content?.contact?.phone ?? "";
  const email = content?.contact?.email ?? "";
  const address = content?.contact?.address ?? "";

  const socialsCfg = (content?.socials ?? undefined) as SocialConfig | undefined;

  const v = String(variant ?? "A");

  const InfoGrid = (
    <div className={cx("mt-8 grid gap-3", v === "C" ? "md:grid-cols-2" : "md:grid-cols-3")}>
      {phone ? <InfoCard label="Téléphone" value={phone} dark={theme.isDark} radius={l.radius} /> : null}
      {email ? <InfoCard label="E-mail" value={email} dark={theme.isDark} radius={l.radius} /> : null}
      {address ? <InfoCard label="Adresse" value={address} dark={theme.isDark} radius={l.radius} /> : null}
    </div>
  );

  const MailCta = email ? (
    <a
      href={`mailto:${email}`}
      className={cx(
        radiusClass(l.radius),
        "inline-flex px-6 py-3 font-semibold text-white bg-gradient-to-r shadow-sm transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
        theme.accentFrom,
        theme.accentTo
      )}
    >
      Envoyer un e-mail
    </a>
  ) : null;

  const Socials = <SocialRow theme={theme} cfg={socialsCfg} className="mt-6 justify-center" />;

  if (v === "B") {
    return (
      <section id={sectionId ?? "contact"} className={cx(sectionPadY(l.density), "pb-20")}>
        <Wrap layout={layout} globalLayout={globalLayout}>
          <Surface theme={theme} layout={layout} globalLayout={globalLayout} className="p-10">
            <div className="max-w-3xl mx-auto text-center">
              <SectionHead theme={theme} kicker="Parlons-en" title={title} text={text} align="center" />
              {InfoGrid}
              {Socials}
              <div className="mt-10">{MailCta}</div>
            </div>
          </Surface>
        </Wrap>
      </section>
    );
  }

  if (v === "C") {
    return (
      <section id={sectionId ?? "contact"} className={cx(sectionPadY(l.density), "pb-20")}>
        <Wrap layout={layout} globalLayout={globalLayout}>
          <Surface theme={theme} layout={layout} globalLayout={globalLayout} className="p-10">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
                  {title}
                </h2>
                <p className={cx("mt-2 max-w-2xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
                {InfoGrid}
                <div className="mt-6">
                  <SocialRow theme={theme} cfg={socialsCfg} />
                </div>
              </div>

              <div className="md:pt-2">{MailCta}</div>
            </div>
          </Surface>
        </Wrap>
      </section>
    );
  }

  // A default
  return (
    <section id={sectionId ?? "contact"} className={cx(sectionPadY(l.density), "pb-20")}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface theme={theme} layout={layout} globalLayout={globalLayout} className="p-10">
          <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
            {title}
          </h2>

          <p className={cx("mt-2 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>

          {InfoGrid}
          <div className="mt-6">
            <SocialRow theme={theme} cfg={socialsCfg} />
          </div>

          {email ? <div className="mt-8">{MailCta}</div> : null}
        </Surface>
      </Wrap>
    </section>
  );
}

function InfoCard({
  label,
  value,
  dark,
  radius,
}: {
  label: string;
  value: string;
  dark: boolean;
  radius?: any;
}) {
  return (
    <div
      style={radiusStyle(radius)}
      className={cx(
        "overflow-hidden border p-4",
        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
      )}
    >
      <div className={cx("text-[11px] font-semibold uppercase tracking-wider", dark ? "text-white/60" : "text-slate-500")}>
        {label}
      </div>
      <div className={cx("mt-1 font-semibold", dark ? "text-white" : "text-slate-900")}>{value}</div>
    </div>
  );
}
