// app/components/template-engine/legacy.tsx
"use client";

import React from "react";
import NextImage from "next/image";
import type { Brand, LogoMode, LayoutTokens } from "../../template-base/template.config";
import { cx, containerClass, sectionPadY, heroPadY, radiusClass, radiusStyle, resolveLayout } from "./theme";

type ThemeLike = {
  accentFrom: string;
  accentTo: string;
  isDark: boolean;
};

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
      style={radiusStyle(l.radius)}
      className={cx(
        "overflow-hidden border",
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
  sections?: any[];
  activeHref?: string;
  isScrolled?: boolean;
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
}) {
  const { theme, brand, headerVariant, headerRef, showTeam, maxDirectLinks, contact } = props;
  const variant = (headerVariant ?? "A") as HeaderVariantX;
  const l = resolveLayout(props.layout, props.globalLayout);

  const activeHref = props.activeHref ?? "#top";
  const isScrolled = !!props.isScrolled;

  const showCta = !["J"].includes(String(variant));
  const includeContactInNav = !showCta;

  const navBase = "text-[12px] font-semibold uppercase tracking-[0.14em]";

  // LOGO MODE
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

  // LINKS basés sur l'ordre + ON/OFF des sections
  const secs = Array.isArray((props as any).sections) ? (props as any).sections : [];
  const orderedLinks = secs
    .filter((sec: any) => sec?.enabled !== false)
    .map((sec: any) => {
      if (!sec?.type || sec.type === "header" || sec.type === "top") return null;
      return { href: `#${sec.id}`, label: sec.title ?? sec.id };
    })
    .filter(Boolean) as { href: string; label: string }[];

  // fallback ancien
  const direct = props.galleryLinks.slice(0, Math.max(0, maxDirectLinks || 0));
  const fallbackLinks = [
    { href: "#top", label: "Accueil" },
    { href: "#services", label: "Services" },
    ...(showTeam ? [{ href: "#team", label: "Équipe" }] : []),
    ...direct.map((g) => ({ href: `#${g.id}`, label: g.title })),
    ...(includeContactInNav ? [{ href: "#contact", label: "Contact" }] : []),
  ];

  const seen = new Set<string>();
  const links = (orderedLinks.length ? orderedLinks : fallbackLinks).filter((x) => {
    if (seen.has(x.href)) return false;
    seen.add(x.href);
    return true;
  });

  const SimpleNav = (className?: string) => (
    <nav
      className={cx(
        "hidden md:flex items-center gap-7",
        navBase,
        className || (theme.isDark ? "text-white/80" : "text-slate-700")
      )}
    >
      {links.map((lnk) => {
        const active = lnk.href === activeHref;
        return (
          <a
            key={lnk.href}
            href={lnk.href}
            className={cx(
              "transition relative",
              theme.isDark ? "hover:text-white" : "hover:text-slate-950",
              active && (theme.isDark ? "text-white" : "text-slate-950")
            )}
          >
            {lnk.label}
            <span
              className={cx(
                "absolute left-0 -bottom-2 h-[2px] w-full opacity-0 transition bg-gradient-to-r",
                theme.accentFrom,
                theme.accentTo,
                active && "opacity-100"
              )}
            />
          </a>
        );
      })}
    </nav>
  );

  const headerPos = "fixed left-0 right-0 top-0";
  const headerZ = "z-50";

  // ✅ spacer : remplace la hauteur du header fixed
  const Spacer = <div aria-hidden="true" style={{ height: "var(--header-h, 0px)" }} />;

  // A
  if (variant === "A") {
    return (
      <>
        <header
          ref={headerRef as any}
          className={cx(
            headerPos,
            headerZ,
            "border-b border-slate-200 bg-white shadow-[0_2px_18px_rgba(0,0,0,0.06)] transition-all duration-200",
            isScrolled && "bg-white/90 backdrop-blur"
          )}
        >
          <Wrap
            layout={props.layout}
            globalLayout={props.globalLayout}
            className={cx("flex items-center justify-between gap-4 transition-all duration-200", isScrolled ? "py-2" : "py-5")}
          >
            <a href="#top" className="flex items-center gap-3 min-w-0">
              {LogoNode}
              {BrandText}
            </a>
            {SimpleNav("text-slate-700")}
            {Cta}
          </Wrap>
        </header>
        {Spacer}
      </>
    );
  }

  // D
  if (variant === "D") {
    const phone = contact?.phone ?? "";
    const email = contact?.email ?? "";

    return (
      <>
        <header
          ref={headerRef as any}
          className={cx(headerPos, headerZ, "bg-white border-b border-slate-200 shadow-[0_2px_18px_rgba(0,0,0,0.06)]")}
        >
          <Wrap
            layout={props.layout}
            globalLayout={props.globalLayout}
            className={cx(
              "grid grid-cols-[auto_1fr_auto] items-center gap-4 transition-all duration-200",
              isScrolled ? "py-2" : "py-4"
            )}
          >
            <a href="#top" className="flex items-center gap-3 min-w-0">
              {LogoNode}
              {BrandText}
            </a>

            <div className={cx("hidden lg:flex items-center justify-center gap-3 transition-all duration-200", isScrolled && "opacity-95")}>
              {phone ? (
                <div className={cx("max-w-[220px] rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all duration-200", isScrolled ? "py-1.5" : "py-2")}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Téléphone</div>
                  <div className="truncate text-sm font-semibold text-slate-900">{phone}</div>
                </div>
              ) : null}

              {email ? (
                <div className={cx("max-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all duration-200", isScrolled ? "py-1.5" : "py-2")}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">E-mail</div>
                  <div className="truncate text-sm font-semibold text-slate-900">{email}</div>
                </div>
              ) : null}
            </div>

            <div className="justify-self-end">{Cta}</div>
          </Wrap>

          <div className={cx("border-t border-slate-200 bg-white transition-all duration-200", isScrolled && "shadow-[0_10px_30px_rgba(0,0,0,0.04)]")}>
            <Wrap
              layout={props.layout}
              globalLayout={props.globalLayout}
              className={cx("flex justify-center transition-all duration-200", isScrolled ? "py-1" : "py-2")}
            >
              <nav className={cx("hidden md:flex items-center gap-2 rounded-2xl border p-1.5", "border-slate-200 bg-slate-50")}>
                {links.filter((x) => x.href !== "#contact").map((lnk) => {
                  const active = lnk.href === activeHref;
                  return (
                    <a
                      key={lnk.href}
                      href={lnk.href}
                      className={cx(
                        "rounded-2xl px-8 py-2 transition text-center min-w-[140px] hover:-translate-y-[1px] active:translate-y-0",
                        navBase,
                        active ? "text-slate-950 bg-white shadow-sm" : "text-slate-700 hover:text-slate-950 hover:bg-white hover:shadow-sm"
                      )}
                    >
                      {lnk.label}
                    </a>
                  );
                })}
              </nav>
            </Wrap>
          </div>
        </header>

        {Spacer}
      </>
    );
  }

  // fallback
  return (
    <>
      <header ref={headerRef as any} className={cx(headerPos, headerZ, "border-b border-slate-200 bg-white")}>
        <Wrap
          layout={props.layout}
          globalLayout={props.globalLayout}
          className={cx("flex items-center justify-between gap-4 transition-all duration-200", isScrolled ? "py-2" : "py-5")}
        >
          <a href="#top" className="flex items-center gap-3 min-w-0">
            {LogoNode}
            {BrandText}
          </a>
          {Cta}
        </Wrap>
      </header>

      {Spacer}
    </>
  );
}

/* ============================================================
   HERO
   ============================================================ */

export function LegacyHero({
  theme,
  brand,
  content,
  variant,
  hasServices,
  layout,
  globalLayout,
  sectionId,
}: any) {
  const l = resolveLayout(layout, globalLayout);

  const title = content?.heroTitle ?? "Titre de la section HERO";
  const text = content?.heroText ?? "Une phrase courte qui explique la valeur, en 1 ligne.";
  const img = content?.heroImage ?? "";

  const primaryLabel = content?.cta?.heroPrimary ?? "Me contacter";
  const secondaryLabel = content?.cta?.heroSecondary ?? "Voir nos services";
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
    <section id={sectionId ?? "hero"} className={heroPadY(l.density)}>
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
        <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-500")}>
          {brand?.text?.subtitle ?? ""}
        </div>
        <h1 className={cx("mt-3 text-3xl md:text-5xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-900")}>
          {title}
        </h1>
        <p className={cx("mt-4 max-w-2xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          {PrimaryBtn}
          {SecondaryBtn}
        </div>
      </div>
    );
  }

  // B
  if (variant === "B") {
    return HeroFrame(
      <div className="grid gap-8 md:grid-cols-2 items-start md:items-center p-6 md:p-10">
        <div>
          <div className={cx("text-sm font-semibold", theme.isDark ? "text-white/70" : "text-slate-500")}>
            {brand?.text?.subtitle ?? ""}
          </div>
          <h1 className={cx("mt-3 text-3xl md:text-5xl font-semibold tracking-tight", theme.isDark ? "text-white" : "text-slate-900")}>
            {title}
          </h1>
          <p className={cx("mt-4", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {PrimaryBtn}
            {SecondaryBtn}
          </div>
        </div>

        {img ? (
          <div
            style={radiusStyle(l.radius)}
            className="relative overflow-hidden border border-slate-200/30 bg-slate-200/20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={content?.heroImageAlt ?? "Illustration"} className="h-[320px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </div>
        ) : (
          <div
            style={radiusStyle(l.radius)}
            className={cx("border p-10 overflow-hidden", theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}
          >
            <div className={cx("h-12 w-12 rounded-2xl bg-gradient-to-br", theme.accentFrom, theme.accentTo)} />
            <div className={cx("mt-4 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>
              (Ajoute <code>content.heroImage</code> pour activer l’image.)
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

/* ============================================================
   SPLIT
   ============================================================ */

export function LegacySplit({ theme, content, layout, globalLayout, sectionId }: any) {
  const l = resolveLayout(layout, globalLayout);

  const title = content?.splitTitle ?? "Une approche claire et efficace";
  const text = content?.splitText ?? "Décris ici ta méthode en 2–3 phrases, orientée bénéfices.";
  const img = content?.splitImage ?? "";
  const imgAlt = content?.splitImageAlt ?? "Illustration";

  const ctaLabel = content?.splitCtaLabel ?? "Découvrir";
  const ctaHref = content?.splitCtaHref ?? "#services";

  return (
    <section id={sectionId ?? "split"} className={sectionPadY(l.density)}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <Surface theme={theme} layout={layout} globalLayout={globalLayout} className="p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
                {title}
              </h2>
              <p className={cx("mt-4 leading-relaxed", theme.isDark ? "text-white/70" : "text-slate-600")}>
                {text}
              </p>

              <div className="mt-7">
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

            {img ? (
              <div
                style={radiusStyle(l.radius)}
                className={cx("overflow-hidden border", theme.isDark ? "border-white/10" : "border-slate-200")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={imgAlt} className="h-[320px] w-full object-cover" />
              </div>
            ) : (
              <div
                style={radiusStyle(l.radius)}
                className={cx("border p-10 overflow-hidden", theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}
              >
                <div className={cx("h-12 w-12 rounded-2xl bg-gradient-to-br", theme.accentFrom, theme.accentTo)} />
                <div className={cx("mt-4 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>
                  (Ajoute <code>content.splitImage</code> pour afficher une image.)
                </div>
              </div>
            )}
          </div>
        </Surface>
      </Wrap>
    </section>
  );
}

/* ============================================================
   SERVICES
   ============================================================ */

export function LegacyServices({ theme, content, layout, globalLayout, sectionId }: any) {
  const l = resolveLayout(layout, globalLayout);
  const title = content?.servicesTitle ?? "Services";
  const text = content?.servicesText ?? "";
  const cards = Array.isArray(content?.services) ? content.services : [];

  if (!cards.length) return null;

  return (
    <section id={sectionId ?? "services"} className={sectionPadY(l.density)}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="mb-8">
          <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
            {title}
          </h2>
          {text ? <p className={cx("mt-2 max-w-3xl", theme.isDark ? "text-white/70" : "text-slate-600")}>{text}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
      </Wrap>
    </section>
  );
}

/* ============================================================
   TEAM
   ============================================================ */

export function LegacyTeam({ theme, content, layout, globalLayout, sectionId }: any) {
  const l = resolveLayout(layout, globalLayout);
  const title = content?.teamTitle ?? "Équipe";
  const text = content?.teamText ?? "";
  const cards = Array.isArray(content?.teamCards) ? content.teamCards : [];

  if (!title && !text && !cards.length) return null;

  return (
    <section id={sectionId ?? "team"} className={sectionPadY(l.density)}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="mb-10">
          <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
            {title}
          </h2>
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
      </Wrap>
    </section>
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
  sectionId?: string;
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
}) {
  const { theme, content, onOpen, enableLightbox } = props;
  const l = resolveLayout(props.layout, props.globalLayout);

  const galleries = Array.isArray(content?.galleries) ? content.galleries : [];
  const first = galleries[0];
  const images = Array.isArray(first?.images) ? first.images : [];
  if (!images.length) return null;

  const galleryLayout = (props.galleryLayout ?? "twoCol") as "stack" | "twoCol" | "threeCol";

  const cols =
    galleryLayout === "threeCol"
      ? "md:grid-cols-3"
      : galleryLayout === "twoCol"
      ? "md:grid-cols-2"
      : "md:grid-cols-1";

  const title = first?.title ?? "Réalisations";
  const desc = first?.description ?? "";

  return (
    <section id={props.sectionId ?? first?.id ?? "realisations"} className={sectionPadY(l.density)}>
      <Wrap layout={props.layout} globalLayout={props.globalLayout}>
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
              style={radiusStyle(l.radius)}
              className={cx(
                "group overflow-hidden border text-left shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
                theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
              )}
            >
              <div className={cx("relative aspect-[4/3]", theme.isDark ? "bg-white/5" : "bg-slate-100")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt ?? "Réalisation"}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
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

export function LegacyContact({ theme, content, layout, globalLayout, sectionId }: any) {
  const l = resolveLayout(layout, globalLayout);

  const title = content?.contactTitle ?? "Contact";
  const text = content?.contactText ?? "Expliquez votre besoin, on répond rapidement.";
  const phone = content?.contact?.phone ?? "";
  const email = content?.contact?.email ?? "";
  const address = content?.contact?.address ?? "";

  return (
    <section id={sectionId ?? "contact"} className={cx(sectionPadY(l.density), "pb-20")}>
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

function InfoCard({ label, value, dark, radius }: { label: string; value: string; dark: boolean; radius?: any }) {
  return (
    <div
      style={radiusStyle(radius)}
      className={cx("overflow-hidden border p-4", dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}
    >
      <div className={cx("text-[11px] font-semibold uppercase tracking-wider", dark ? "text-white/60" : "text-slate-500")}>{label}</div>
      <div className={cx("mt-1 font-semibold", dark ? "text-white" : "text-slate-900")}>{value}</div>
    </div>
  );
}
