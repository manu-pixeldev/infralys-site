// app/components/legacy/legacy.tsx
"use client";

import React from "react";
import NextImage from "next/image";
import type { Brand, LogoMode, LayoutTokens } from "../../template-base/template.config";
import { containerClass, sectionPadY, radiusClass, resolveLayout } from "../template-engine/theme"; // adapte si ton path est différent

type ThemeLike = {
  accentFrom: string;
  accentTo: string;
  isDark: boolean;
};

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function hasText(v: string | null | undefined) {
  return !!(v && v.trim().length > 0);
}

type HeaderVariantX = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";

/* =========================
   SMALL LAYOUT PRIMITIVES
   ========================= */

function Wrap({
  children,
  layout,
  globalLayout,
  className,
}: {
  children: React.ReactNode;
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
  className?: string;
}) {
  const l = resolveLayout(layout, globalLayout);
  return <div className={cx(containerClass(l.container), className)}>{children}</div>;
}

function Surface({
  theme,
  layout,
  globalLayout,
  className,
  children,
}: {
  theme: ThemeLike;
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
  className?: string;
  children: React.ReactNode;
}) {
  const l = resolveLayout(layout, globalLayout);
  return (
    <div
      className={cx(
        radiusClass(l.radius),
        "border",
        theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ============================================================
   HEADER
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

  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
}) {
  const { theme, brand, headerVariant, headerRef, showTeam, maxDirectLinks, contact } = props;
  const variant = (headerVariant ?? "A") as HeaderVariantX;
  const l = resolveLayout(props.layout, props.globalLayout);

  const showCta = !["J"].includes(String(variant));
  const includeContactInNav = !showCta;

  const direct = props.galleryLinks.slice(0, Math.max(0, maxDirectLinks || 0));
  const links = [
    { href: "#top", label: "Accueil" },
    { href: "#services", label: "Services" },
    ...(showTeam ? [{ href: "#team", label: "Équipe" }] : []),
    ...direct.map((g) => ({ href: `#${g.id}`, label: g.title })),
    ...(includeContactInNav ? [{ href: "#contact", label: "Contact" }] : []),
  ];

  const navBase = "text-[12px] font-semibold uppercase tracking-[0.14em]";

  // --- LOGO MODE ---
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

  const BrandText = showTextBlock ? (
    <div className="min-w-0 leading-tight">
      <div className={cx("truncate font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
        {(brand as any)?.text?.name ?? "Nom de la société"}
        {hasText((brand as any)?.text?.accent) ? (
          <span className={cx("ml-2 bg-gradient-to-r bg-clip-text text-transparent", theme.accentFrom, theme.accentTo)}>
            {(brand as any)?.text?.accent}
          </span>
        ) : null}
      </div>
      {hasText((brand as any)?.text?.subtitle) ? (
        <div className={cx("truncate text-xs", theme.isDark ? "text-white/70" : "text-slate-500")}>
          {(brand as any).text.subtitle}
        </div>
      ) : null}
    </div>
  ) : null;

  const ctaLabel = props.content?.cta?.header ?? "Contact";

  const Cta = showCta ? (
    <a
      href="#contact"
      className={cx(
        radiusClass(l.radius),
        "px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition will-change-transform hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
        theme.accentFrom,
        theme.accentTo
      )}
    >
      {ctaLabel}
    </a>
  ) : null;

  const SimpleNav = (className?: string) => (
    <nav className={cx("hidden md:flex items-center gap-7", navBase, className || (theme.isDark ? "text-white/80" : "text-slate-700"))}>
      {links.map((lnk) => (
        <a key={lnk.href} href={lnk.href} className={cx("transition", theme.isDark ? "hover:text-white" : "hover:text-slate-950")}>
          {lnk.label}
        </a>
      ))}
    </nav>
  );

  // A
  if (variant === "A") {
    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-[0_2px_18px_rgba(0,0,0,0.06)]">
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-6 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            {LogoNode}
            {BrandText}
          </a>
          {SimpleNav("text-slate-700")}
          {Cta}
        </Wrap>
      </header>
    );
  }

  // B
  if (variant === "B") {
    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 shadow-[0_2px_18px_rgba(0,0,0,0.06)]">
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-4 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            {LogoNode}
            {BrandText}
          </a>

          <nav className="hidden md:flex items-center gap-2">
            {links.map((lnk) => (
              <a
                key={lnk.href}
                href={lnk.href}
                className={cx(
                  "rounded-full border px-5 py-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow",
                  navBase,
                  "border-slate-200 bg-white text-slate-700 hover:text-slate-950"
                )}
              >
                {lnk.label}
              </a>
            ))}
          </nav>

          {Cta}
        </Wrap>
      </header>
    );
  }

  // C
  if (variant === "C") {
    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className={cx("h-[3px] w-full bg-gradient-to-r", theme.accentFrom, theme.accentTo)} />
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-5 flex items-center justify-between gap-6">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            {LogoNode}
            {BrandText}
          </a>

          <nav className={cx("hidden md:flex items-center gap-7", navBase, "text-slate-700")}>
            {links.map((lnk) => (
              <a key={lnk.href} href={lnk.href} className="group relative pb-1 hover:text-slate-950 transition">
                {lnk.label}
                <span
                  className={cx(
                    "absolute left-0 -bottom-1 h-[2px] w-0 opacity-0 transition-all duration-300 group-hover:w-full group-hover:opacity-100 bg-gradient-to-r",
                    theme.accentFrom,
                    theme.accentTo
                  )}
                />
              </a>
            ))}
          </nav>

          {Cta}
        </Wrap>
      </header>
    );
  }

  // D
  if (variant === "D") {
    const phone = contact?.phone ?? "";
    const email = contact?.email ?? "";

    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-[0_2px_18px_rgba(0,0,0,0.06)]">
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            {LogoNode}
            {BrandText}
          </a>

          <div className="hidden lg:flex items-center justify-center gap-3">
            {phone ? (
              <div className="max-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Téléphone</div>
                <div className="truncate text-sm font-semibold text-slate-900">{phone}</div>
              </div>
            ) : null}

            {email ? (
              <div className="max-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">E-mail</div>
                <div className="truncate text-sm font-semibold text-slate-900">{email}</div>
              </div>
            ) : null}
          </div>

          <div className="justify-self-end">{Cta}</div>
        </Wrap>

        <div className="border-t border-slate-200 bg-white">
          <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-2 flex justify-center">
            <nav className={cx("hidden md:flex items-center gap-2 rounded-2xl border p-1.5", "border-slate-200 bg-slate-50")}>
              {links.filter((x) => x.href !== "#contact").map((lnk) => (
                <a
                  key={lnk.href}
                  href={lnk.href}
                  className={cx(
                    "rounded-2xl px-8 py-2 transition text-center min-w-[140px] hover:-translate-y-[1px] active:translate-y-0",
                    navBase,
                    "text-slate-700 hover:text-slate-950 hover:bg-white hover:shadow-sm"
                  )}
                >
                  {lnk.label}
                </a>
              ))}
            </nav>
          </Wrap>
        </div>
      </header>
    );
  }

  // E
  if (variant === "E") {
    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur shadow-[0_2px_18px_rgba(0,0,0,0.35)]">
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-4 flex items-center justify-between gap-4 text-white">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            {LogoNode}
            {showTextBlock ? (
              <div className="min-w-0">
                <div className="truncate font-semibold uppercase tracking-[0.12em]">
                  {(brand as any)?.text?.name ?? "Nom de la société"}{" "}
                  <span className={cx("bg-gradient-to-r bg-clip-text text-transparent", theme.accentFrom, theme.accentTo)}>
                    {(brand as any)?.text?.accent ?? ""}
                  </span>
                </div>
                <div className="truncate text-xs text-white/70">{(brand as any)?.text?.subtitle ?? ""}</div>
              </div>
            ) : null}
          </a>

          <nav className={cx("hidden md:flex items-center gap-7", navBase, "text-white/80")}>
            {links.map((lnk) => (
              <a key={lnk.href} href={lnk.href} className="hover:text-white transition">
                {lnk.label}
              </a>
            ))}
          </nav>

          {Cta}
        </Wrap>
      </header>
    );
  }

  // F
  if (variant === "F") {
    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur shadow-[0_2px_18px_rgba(0,0,0,0.06)]">
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-3 flex items-center gap-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            {LogoNode}
            {BrandText}
          </a>

          <div className="ml-auto hidden lg:flex items-center gap-5 text-xs text-slate-700">
            {contact?.phone ? <span className="font-semibold">📞 {contact.phone}</span> : null}
            {contact?.email ? <span className="font-semibold">✉️ {contact.email}</span> : null}
          </div>

          <div className="hidden md:flex items-center gap-4 ml-6">
            {SimpleNav("text-slate-700")}
            {Cta}
          </div>

          <div className="md:hidden ml-auto">{Cta}</div>
        </Wrap>
      </header>
    );
  }

  // G
  if (variant === "G") {
    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-[0_2px_18px_rgba(0,0,0,0.06)]">
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-4 flex items-center justify-between gap-4">
          <div className="w-[140px]" />
          <a href="#top" className="flex items-center gap-3 justify-center min-w-0">
            {LogoNode}
            {BrandText}
          </a>
          <div className="w-[140px] flex justify-end">{Cta}</div>
        </Wrap>

        <div className="border-t border-slate-200 bg-white">
          <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-3 flex justify-center">
            {SimpleNav("text-slate-700")}
          </Wrap>
        </div>
      </header>
    );
  }

  // H
  if (variant === "H") {
    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-[0_2px_24px_rgba(0,0,0,0.08)]">
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-4 flex items-center justify-between gap-4">
          <div className="w-[140px] hidden md:block" />
          <a href="#top" className="flex items-center gap-3 justify-center min-w-0">
            {LogoNode}
            {BrandText}
          </a>
          <div className="w-[140px] flex justify-end">{Cta}</div>
        </Wrap>

        <div className="border-t border-slate-200 bg-white">
          <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-3 flex justify-center">
            <nav className="hidden md:flex flex-wrap items-center justify-center gap-2">
              {links.map((lnk) => (
                <a
                  key={lnk.href}
                  href={lnk.href}
                  className={cx(
                    "rounded-full border px-6 py-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow active:translate-y-0",
                    navBase,
                    "border-slate-200 bg-white text-slate-700 hover:text-slate-950"
                  )}
                >
                  {lnk.label}
                </a>
              ))}
            </nav>
          </Wrap>
        </div>
      </header>
    );
  }

  // I
  if (variant === "I") {
    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className={cx("h-[4px] w-full bg-gradient-to-r", theme.accentFrom, theme.accentTo)} />
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-4 flex items-center gap-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            {LogoNode}
            {BrandText}
          </a>

          <div className="hidden lg:flex items-center gap-6 ml-6 text-xs text-slate-600">
            {contact?.phone ? <span className="font-semibold">📞 {contact.phone}</span> : null}
            {contact?.email ? <span className="font-semibold">✉️ {contact.email}</span> : null}
          </div>

          <div className="ml-auto hidden md:flex items-center gap-6">
            <nav className={cx("hidden md:flex items-center gap-8", navBase, "text-slate-800")}>
              {links.map((lnk) => (
                <a key={lnk.href} href={lnk.href} className="group relative hover:text-slate-950 transition">
                  {lnk.label}
                  <span
                    className={cx(
                      "absolute left-0 -bottom-2 h-[2px] w-0 opacity-0 transition-all duration-200 group-hover:w-full group-hover:opacity-100 bg-gradient-to-r",
                      theme.accentFrom,
                      theme.accentTo
                    )}
                  />
                </a>
              ))}
            </nav>
            {Cta}
          </div>

          <div className="md:hidden ml-auto">{Cta}</div>
        </Wrap>
      </header>
    );
  }

  // J
  if (variant === "J") {
    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-[0_2px_18px_rgba(0,0,0,0.06)]">
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-4 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 min-w-0">
            {LogoNode}
            {BrandText}
          </a>

          <nav className={cx("hidden md:flex items-center gap-8", navBase, "text-slate-800")}>
            {links.filter((x) => x.href !== "#contact").map((lnk) => (
              <a key={lnk.href} href={lnk.href} className="group relative flex items-center gap-3 hover:text-slate-950 transition">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-orange-400 transition" />
                <span className="relative">
                  {lnk.label}
                  <span
                    className={cx(
                      "absolute left-0 -bottom-2 h-[2px] w-0 opacity-0 transition-all duration-200 group-hover:w-full group-hover:opacity-100 bg-gradient-to-r",
                      theme.accentFrom,
                      theme.accentTo
                    )}
                  />
                </span>
              </a>
            ))}
            <a
              href="#contact"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-slate-800 hover:bg-slate-50"
            >
              Contact
            </a>
          </nav>
        </Wrap>
      </header>
    );
  }

  // K
  if (variant === "K") {
    return (
      <header ref={headerRef as any} className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/35 backdrop-blur text-white">
        <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-4 flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-white/80">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10">f</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <a href="#top" className="flex items-center gap-3">
              {LogoNode}
              {showTextBlock ? (
                <div className="hidden sm:block">
                  <div className="font-semibold uppercase tracking-[0.18em]">
                    {(brand as any)?.text?.name ?? "Nom de la société"}{" "}
                    <span className={cx("bg-gradient-to-r bg-clip-text text-transparent", theme.accentFrom, theme.accentTo)}>
                      {(brand as any)?.text?.accent ?? ""}
                    </span>
                  </div>
                </div>
              ) : null}
            </a>
          </div>

          <div className="flex items-center gap-3">
            {contact?.phone ? (
              <div className="hidden md:flex items-center gap-2 text-white/85">
                <span className={cx("inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r", theme.accentFrom, theme.accentTo)}>
                  ☎
                </span>
                <span className="text-sm">{contact.phone}</span>
              </div>
            ) : null}
          </div>
        </Wrap>

        <div className="border-t border-white/10">
          <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-3">
            <nav className={cx("hidden md:flex items-center justify-center gap-10", navBase, "text-white/85")}>
              {links.map((lnk) => (
                <a key={lnk.href} href={lnk.href} className="group relative hover:text-white transition">
                  {lnk.label}
                  <span
                    className={cx(
                      "absolute left-0 -bottom-2 h-[2px] w-0 opacity-0 transition-all duration-200 group-hover:w-full group-hover:opacity-100 bg-gradient-to-r",
                      theme.accentFrom,
                      theme.accentTo
                    )}
                  />
                </a>
              ))}
            </nav>
          </Wrap>
        </div>
      </header>
    );
  }

  // fallback
  return (
    <header ref={headerRef as any} className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <Wrap layout={props.layout} globalLayout={props.globalLayout} className="py-4 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3 min-w-0">
          {LogoNode}
          {BrandText}
        </a>
        {Cta}
      </Wrap>
    </header>
  );
}

/* ============================================================
   HERO
   ============================================================ */

export function LegacyHero({ theme, brand, content, variant, hasServices, layout, globalLayout }: any) {
  const l = resolveLayout(layout, globalLayout);

  const title = content?.heroTitle ?? "Titre de la section HERO";
  const text = content?.heroText ?? "Une phrase courte qui explique la valeur, en 1 ligne.";
  const img = content?.heroImage ?? "";

  const primaryLabel = content?.cta?.heroPrimary ?? "Me contacter";
  const secondaryLabel = content?.cta?.heroSecondary ?? "Voir les services";
  const ctaHref = content?.heroCtaHref ?? "#contact";

  const showServicesBtn = !!hasServices;

  const PrimaryBtn = (
    <a
      href={ctaHref}
      className={cx(
        radiusClass(l.radius),
        "px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition will-change-transform hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
        theme.accentFrom,
        theme.accentTo
      )}
    >
      {primaryLabel}
    </a>
  );

  const SecondaryBtn = showServicesBtn ? (
    <a
      href="#services"
      className={cx(
        radiusClass(l.radius),
        "px-5 py-3 text-sm font-semibold border transition hover:-translate-y-[1px] active:translate-y-0",
        theme.isDark ? "border-white/15 text-white hover:bg-white/5" : "border-slate-200 text-slate-900 hover:bg-slate-50"
      )}
    >
      {secondaryLabel}
    </a>
  ) : null;

  const HeroFrame = (children: React.ReactNode) => (
    <section id="top" className={cx("pt-14 pb-10")}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface theme={theme} layout={layout} globalLayout={globalLayout}>
          {children}
        </Surface>
      </Wrap>
    </section>
  );

  if (variant === "A") {
    return HeroFrame(
      <div className="p-8 md:p-12">
        <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-500")}>{brand?.text?.subtitle ?? ""}</div>
        <h1 className={cx("mt-3 text-3xl md:text-5xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h1>
        <p className={cx("mt-4 max-w-2xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          {PrimaryBtn}
          {SecondaryBtn}
        </div>
      </div>
    );
  }

  if (variant === "B") {
    return HeroFrame(
      <div className="grid gap-8 md:grid-cols-2 items-center p-6 md:p-10">
        <div>
          <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-500")}>{brand?.text?.subtitle ?? ""}</div>
          <h1 className={cx("mt-3 text-3xl md:text-5xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h1>
          <p className={cx("mt-4", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {PrimaryBtn}
            {SecondaryBtn}
          </div>
        </div>

        {img ? (
          <div className={cx(radiusClass(l.radius), "relative overflow-hidden border border-slate-200/30 bg-slate-200/20")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={content?.heroImageAlt ?? "Illustration"} className="h-[320px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </div>
        ) : (
          <div className={cx(radiusClass(l.radius), "border p-10", theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
            <div className={cx("h-12 w-12 rounded-2xl bg-gradient-to-br", theme.accentFrom, theme.accentTo)} />
            <div className={cx("mt-4 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>
              (Ajoute <code>content.heroImage</code> pour activer l’image.)
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === "C") {
    return (
      <section id="top" className="pt-10 pb-10">
        <Wrap layout={layout} globalLayout={globalLayout}>
          <div className={cx(radiusClass(l.radius), "relative overflow-hidden border border-slate-200/30")}>
            {img ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={content?.heroImageAlt ?? "Illustration"} className="h-[460px] w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
              </>
            ) : (
              <div className={cx("h-[460px] w-full", theme.isDark ? "bg-white/5" : "bg-slate-100")} />
            )}

            <div className="relative z-10 p-8 md:p-12">
              <div className="max-w-2xl">
                <div className="text-sm font-semibold text-white/80">{brand?.text?.subtitle ?? ""}</div>
                <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-white">{title}</h1>
                <p className="mt-4 text-white/85">{text}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {PrimaryBtn}
                  {SecondaryBtn}
                </div>
              </div>
            </div>
          </div>
        </Wrap>
      </section>
    );
  }

  if (variant === "D") {
    return HeroFrame(
      <div className="grid md:grid-cols-2 gap-10 items-center p-6 md:p-10">
        <div className={cx(radiusClass(l.radius), "overflow-hidden border border-slate-200/30 bg-slate-100")}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={content?.heroImageAlt ?? "Illustration"} className="h-[320px] w-full object-cover" />
          ) : (
            <div className={cx("h-[320px] w-full", theme.isDark ? "bg-white/5" : "bg-slate-100")} />
          )}
        </div>
        <div>
          <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-500")}>{brand?.text?.subtitle ?? ""}</div>
          <h1 className={cx("mt-3 text-3xl md:text-5xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h1>
          <p className={cx("mt-4", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {PrimaryBtn}
            {SecondaryBtn}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "E") {
    return HeroFrame(
      <div className="grid md:grid-cols-2 gap-10 items-center p-6 md:p-10">
        <div>
          <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-500")}>{brand?.text?.subtitle ?? ""}</div>
          <h1 className={cx("mt-3 text-3xl md:text-5xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h1>
          <p className={cx("mt-4", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {PrimaryBtn}
            {SecondaryBtn}
          </div>
        </div>
        <div className={cx(radiusClass(l.radius), "overflow-hidden border border-slate-200/30 bg-slate-100")}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={content?.heroImageAlt ?? "Illustration"} className="h-[320px] w-full object-cover" />
          ) : (
            <div className={cx("h-[320px] w-full", theme.isDark ? "bg-white/5" : "bg-slate-100")} />
          )}
        </div>
      </div>
    );
  }

  return null;
}

/* ============================================================
   SPLIT
   ============================================================ */

export function LegacySplit({ theme, content, variant, layout, globalLayout }: any) {
  const l = resolveLayout(layout, globalLayout);
  const v = variant === "B" ? "B" : "A";

  const title = content?.splitTitle ?? "Une approche claire et efficace";
  const text =
    content?.splitText ??
    "Diagnostic précis, explications simples, intervention propre. Tu sais ce que je fais et pourquoi je le fais.";
  const image = content?.splitImage ?? null;

  const ctaLabel = content?.splitCtaLabel ?? null;
  const ctaHref = content?.splitCtaHref ?? "#contact";

  const imageFirst = v === "A";

  return (
    <section className={sectionPadY(l.density, l.paddingY)}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface theme={theme} layout={layout} globalLayout={globalLayout} className={cx("grid items-center gap-10 md:grid-cols-2 p-8 md:p-12")}>
          {image ? (
            <div className={cx("relative overflow-hidden", radiusClass(l.radius), imageFirst ? "order-1" : "order-2")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={content?.splitImageAlt ?? "Illustration"}
                className="h-[360px] w-full object-cover transition duration-300 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          ) : (
            <div
              className={cx(
                "flex h-[360px] items-center justify-center border",
                radiusClass(l.radius),
                theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50",
                imageFirst ? "order-1" : "order-2"
              )}
            >
              <div className={cx("h-16 w-16", radiusClass(l.radius), "bg-gradient-to-br", theme.accentFrom, theme.accentTo)} />
            </div>
          )}

          <div className={imageFirst ? "order-2" : "order-1"}>
            <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h2>
            <p className={cx("mt-4 leading-relaxed", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>

            {ctaLabel ? (
              <div className="mt-6">
                <a
                  href={ctaHref}
                  className={cx(
                    radiusClass(l.radius),
                    "inline-flex px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r transition hover:shadow-md",
                    theme.accentFrom,
                    theme.accentTo
                  )}
                >
                  {ctaLabel}
                </a>
              </div>
            ) : null}
          </div>
        </Surface>
      </Wrap>
    </section>
  );
}

/* ============================================================
   SERVICES
   ============================================================ */

export function LegacyServices({ theme, content, variant, layout, globalLayout }: any) {
  const l = resolveLayout(layout, globalLayout);
  const v = ["A", "B", "C"].includes(String(variant)) ? String(variant) : "A";

  const title = content?.servicesTitle ?? "Services";
  const text = content?.servicesText ?? "Des prestations claires et adaptées.";
  const cards = Array.isArray(content?.services) ? content.services : [];
  if (!cards.length) return null;

  const baseSection = (children: React.ReactNode) => (
    <section id="services" className={cx(sectionPadY(l.density, l.paddingY), "pb-14")}>
      <Wrap layout={layout} globalLayout={globalLayout}>{children}</Wrap>
    </section>
  );

  if (v === "A") {
    return baseSection(
      <>
        <div className="flex items-end justify-between gap-4">
          <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h2>
          <div className={cx("text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {cards.map((it: any, idx: number) => (
            <Surface key={idx} theme={theme} layout={layout} globalLayout={globalLayout} className="p-6">
              <div className={cx("text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent", theme.accentFrom, theme.accentTo)}>
                {it.title ?? `Service ${idx + 1}`}
              </div>
              <div className={cx("mt-2 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>
                {Array.isArray(it.items) ? it.items.join(" • ") : ""}
              </div>
            </Surface>
          ))}
        </div>
      </>
    );
  }

  if (v === "B") {
    return baseSection(
      <>
        <div className="mb-8">
          <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h2>
          <p className={cx("mt-2 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
        </div>

        <div className="space-y-4">
          {cards.map((it: any, idx: number) => (
            <Surface key={idx} theme={theme} layout={layout} globalLayout={globalLayout} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className={cx("text-lg font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{it.title ?? `Service ${idx + 1}`}</div>
                <div className={cx("h-[3px] w-24 rounded-full bg-gradient-to-r", theme.accentFrom, theme.accentTo)} />
              </div>

              {Array.isArray(it.items) ? (
                <ul className={cx("mt-3 list-disc pl-5 space-y-1", theme.isDark ? "text-white/70" : "text-slate-600")}>
                  {it.items.map((x: string, i: number) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              ) : null}
            </Surface>
          ))}
        </div>
      </>
    );
  }

  return baseSection(
    <>
      <div className="mb-8">
        <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h2>
        <p className={cx("mt-2 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((it: any, idx: number) => (
          <Surface key={idx} theme={theme} layout={layout} globalLayout={globalLayout} className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div className={cx("text-lg font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{it.title ?? `Service ${idx + 1}`}</div>
              <div className={cx("h-10 w-10 rounded-2xl bg-gradient-to-br", theme.accentFrom, theme.accentTo)} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(it.items ?? []).map((x: string, i: number) => (
                <span
                  key={i}
                  className={cx(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    theme.isDark ? "border-white/10 bg-white/5 text-white/80" : "border-slate-200 bg-slate-50 text-slate-700"
                  )}
                >
                  {x}
                </span>
              ))}
            </div>
          </Surface>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   TEAM
   ============================================================ */

export function LegacyTeam({ theme, content, variant, layout, globalLayout }: any) {
  const l = resolveLayout(layout, globalLayout);
  const v = ["A", "B", "C"].includes(String(variant)) ? String(variant) : "A";
  const title = content?.teamTitle ?? "Qui sommes-nous";
  const text = content?.teamText ?? "";
  const cards = Array.isArray(content?.teamCards) ? content.teamCards : [];
  if (!title && !text && cards.length === 0) return null;

  const base = (children: React.ReactNode) => (
    <section id="team" className={sectionPadY(l.density, l.paddingY)}>
      <Wrap layout={layout} globalLayout={globalLayout}>{children}</Wrap>
    </section>
  );

  if (v === "A") {
    return base(
      <>
        <div className="mb-10">
          <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h2>
          {text ? <p className={cx("mt-3 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p> : null}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((c: any, i: number) => (
            <Surface key={i} theme={theme} layout={layout} globalLayout={globalLayout} className="p-6">
              <div className={cx("text-sm font-semibold uppercase tracking-[0.14em]", theme.isDark ? "text-white/60" : "text-slate-500")}>
                {c?.title ?? `Bloc ${i + 1}`}
              </div>
              <div className={cx("mt-3 leading-relaxed", theme.isDark ? "text-white/70" : "text-slate-700")}>{c?.text ?? ""}</div>
              <div className={cx("mt-5 h-[3px] w-24 rounded-full bg-gradient-to-r", theme.accentFrom, theme.accentTo)} />
            </Surface>
          ))}
        </div>
      </>
    );
  }

  if (v === "B") {
    return base(
      <Surface theme={theme} layout={layout} globalLayout={globalLayout} className="p-10">
        <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h2>
        {text ? <p className={cx("mt-3 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p> : null}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cards.map((c: any, i: number) => (
            <div key={i} className={cx(radiusClass(l.radius), "border p-6", theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
              <div className={cx("font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{c?.title ?? `Bloc ${i + 1}`}</div>
              <div className={cx("mt-2", theme.isDark ? "text-white/70" : "text-slate-600")}>{c?.text ?? ""}</div>
            </div>
          ))}
        </div>
      </Surface>
    );
  }

  return base(
    <>
      <div className="mb-10">
        <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h2>
        {text ? <p className={cx("mt-3 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p> : null}
      </div>

      <div className="space-y-6">
        {cards.map((c: any, i: number) => (
          <div key={i} className="flex gap-4">
            <div className={cx("mt-2 h-10 w-10 rounded-2xl bg-gradient-to-br", theme.accentFrom, theme.accentTo)} />
            <Surface theme={theme} layout={layout} globalLayout={globalLayout} className="flex-1 p-6">
              <div className={cx("font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{c?.title ?? `Bloc ${i + 1}`}</div>
              <div className={cx("mt-2", theme.isDark ? "text-white/70" : "text-slate-600")}>{c?.text ?? ""}</div>
            </Surface>
          </div>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   GALLERIES
   ============================================================ */

export function LegacyGalleries(props: {
  theme: ThemeLike;
  content: any;
  galleryLayout?: "stack" | "twoCol" | "threeCol";
  onOpen?: (img: any) => void;
  enableLightbox?: boolean;

  globalLayout?: LayoutTokens;
  layoutTokens?: LayoutTokens;
}) {
  const { theme, content, onOpen, enableLightbox } = props;
  const l = resolveLayout(props.layoutTokens, props.globalLayout);

  const galleryLayout = (props.galleryLayout ?? "twoCol") as "stack" | "twoCol" | "threeCol";

  const galleries = Array.isArray(content?.galleries) ? content.galleries : [];
  const first = galleries[0];
  const images = Array.isArray(first?.images) ? first.images : [];
  const title = first?.title ?? "Réalisations";
  const desc = first?.description ?? "";

  if (!images.length) return null;

  const cols = galleryLayout === "threeCol" ? "md:grid-cols-3" : galleryLayout === "twoCol" ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <section id={first?.id ?? "realisations"} className={sectionPadY(l.density, l.paddingY)}>
      <Wrap layout={props.layoutTokens} globalLayout={props.globalLayout}>
        <div className="mb-10">
          <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h2>
          {desc ? <p className={cx("mt-3 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{desc}</p> : null}
        </div>

        <div className={cx("grid gap-6", cols)}>
          {images.map((img: any, i: number) => (
            <button
              key={i}
              type="button"
              onClick={() => enableLightbox && onOpen?.(img)}
              className={cx(
                radiusClass(l.radius),
                "group overflow-hidden border text-left shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
                theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
              )}
            >
              <div className={cx("relative aspect-[4/3]", theme.isDark ? "bg-white/5" : "bg-slate-100")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt ?? "Réalisation"} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              </div>
              {img.caption ? <div className={cx("p-4 text-sm", theme.isDark ? "text-white/80" : "text-slate-700")}>{img.caption}</div> : null}
            </button>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   CONTACT
   ============================================================ */

export function LegacyContact({ theme, content, variant, layout, globalLayout }: any) {
  const l = resolveLayout(layout, globalLayout);

  const title = content?.contactTitle ?? "Contact";
  const text = content?.contactText ?? "Expliquez votre besoin, on répond rapidement.";
  const phone = content?.contact?.phone ?? "";
  const email = content?.contact?.email ?? "";
  const address = content?.contact?.address ?? "";

  const v = String(variant ?? "A");

  if (v === "A") {
    return (
      <section id="contact" className={cx(sectionPadY(l.density, l.paddingY), "pb-20")}>
        <Wrap layout={layout} globalLayout={globalLayout}>
          <Surface theme={theme} layout={layout} globalLayout={globalLayout} className="p-10">
            <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h2>
            <p className={cx("mt-2 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {phone ? <InfoCard label="Téléphone" value={phone} dark={theme.isDark} radius={l.radius} /> : null}
              {email ? <InfoCard label="E-mail" value={email} dark={theme.isDark} radius={l.radius} /> : null}
              {address ? <InfoCard label="Adresse" value={address} dark={theme.isDark} radius={l.radius} /> : null}
            </div>

            {email ? (
              <div className="mt-8">
                <a
                  href={`mailto:${email}`}
                  className={cx(radiusClass(l.radius), "inline-flex px-6 py-3 font-semibold text-white bg-gradient-to-r", theme.accentFrom, theme.accentTo)}
                >
                  Envoyer un e-mail
                </a>
              </div>
            ) : null}
          </Surface>
        </Wrap>
      </section>
    );
  }

  if (v === "B") {
    return (
      <section id="contact" className={cx(sectionPadY(l.density, l.paddingY), "pb-20")}>
        <Wrap layout={layout} globalLayout={globalLayout}>
          <div className={cx(radiusClass(l.radius), "bg-slate-950 text-white p-10 border border-white/10")}>
            <h2 className="text-3xl font-semibold">{title}</h2>
            <p className="mt-2 text-white/70 max-w-3xl">{text}</p>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {phone ? <InfoCardDark label="Téléphone" value={phone} radius={l.radius} /> : null}
              {email ? <InfoCardDark label="E-mail" value={email} radius={l.radius} /> : null}
              {address ? <InfoCardDark label="Adresse" value={address} radius={l.radius} /> : null}
            </div>

            {email ? (
              <div className="mt-8">
                <a
                  href={`mailto:${email}`}
                  className={cx(radiusClass(l.radius), "inline-flex px-6 py-3 font-semibold text-white bg-gradient-to-r", theme.accentFrom, theme.accentTo)}
                >
                  Envoyer un e-mail
                </a>
              </div>
            ) : null}
          </div>
        </Wrap>
      </section>
    );
  }

  if (v === "C") {
    return (
      <section id="contact" className={cx(sectionPadY(l.density, l.paddingY), "pb-20")}>
        <Wrap layout={layout} globalLayout={globalLayout}>
          <Surface theme={theme} layout={layout} globalLayout={globalLayout} className="p-10 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>{title}</h2>
              <p className={cx("mt-2", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>

              <div className={cx("mt-6 space-y-2", theme.isDark ? "text-white/80" : "text-slate-700")}>
                {phone ? <div><b>Tél:</b> {phone}</div> : null}
                {email ? <div><b>Email:</b> {email}</div> : null}
                {address ? <div><b>Adresse:</b> {address}</div> : null}
              </div>
            </div>

            <div className={cx(radiusClass(l.radius), "border p-8", theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
              <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-600")}>Réponse rapide</div>
              <div className={cx("mt-2", theme.isDark ? "text-white/80" : "text-slate-700")}>Un mail, un SMS ou un appel — on cale ça proprement.</div>

              {email ? (
                <a
                  href={`mailto:${email}`}
                  className={cx(radiusClass(l.radius), "mt-6 inline-flex w-full justify-center px-6 py-3 font-semibold text-white bg-gradient-to-r", theme.accentFrom, theme.accentTo)}
                >
                  Envoyer un e-mail
                </a>
              ) : null}
            </div>
          </Surface>
        </Wrap>
      </section>
    );
  }

  return null;
}

function InfoCard({ label, value, dark, radius }: { label: string; value: string; dark: boolean; radius?: any }) {
  return (
    <div className={cx(radiusClass(radius), "border p-4", dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
      <div className={cx("text-[11px] font-semibold uppercase tracking-wider", dark ? "text-white/60" : "text-slate-500")}>{label}</div>
      <div className={cx("mt-1 font-semibold", dark ? "text-white" : "text-slate-900")}>{value}</div>
    </div>
  );
}

function InfoCardDark({ label, value, radius }: { label: string; value: string; radius?: any }) {
  return (
    <div className={cx(radiusClass(radius), "border border-white/10 bg-white/5 p-4")}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-1 font-semibold text-white">{value}</div>
    </div>
  );
}
