"use client";

import React from "react";
import NextImage from "next/image";

import type { ThemeLike } from "./theme";
import {
  cx,
  resolveLayout,
  containerClass,
  sectionPadY,
  radiusClass,
  radiusStyle,
} from "./theme";

// Types "soft" (compat)
type Brand = any;
type LayoutTokens = any;
type LogoMode = "logoPlusText" | "logoOnly" | "textOnly";

function hasText(v: any) {
  return typeof v === "string" && v.trim().length > 0;
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
    <div
      className={cx(containerClass(l.container), className)}
      style={style}
    >
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

/* ============================================================
   HEADER PRO (fixed/blur/underline active + CTA)
   - IMPORTANT: on évite le double “Contact” (nav + CTA)
   - shrink fluide via scrollT (0..1)
   ============================================================ */
export function ProHeader(props: {
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
  scrollT?: number; // ✅ nouveau
  layout?: LayoutTokens;
  globalLayout?: LayoutTokens;
}) {
  const { theme, brand, headerRef } = props;
  const l = resolveLayout(props.layout, props.globalLayout);

  const activeHref = props.activeHref ?? "#top";
  const t = Math.max(0, Math.min(1, Number(props.scrollT ?? (props.isScrolled ? 1 : 0))));

  // shrink fluide (padding)
  const padY = 16 - Math.round(6 * t); // 16 -> 10
  const headerBg = theme.isDark ? "bg-slate-950/75" : "bg-white/75";
  const headerBg2 = theme.isDark ? "bg-slate-950/88" : "bg-white/88";

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
            style={{ width: 44, height: 44 }}
            aria-hidden="true"
          />
        );

  const BrandText = showTextBlock ? (
    <div className="min-w-0 leading-tight">
      <div className={cx("truncate font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
        {(brand as any)?.text?.name ?? "Nom de la société"}
      </div>
      {hasText((brand as any)?.text?.subtitle) ? (
        <div className={cx("truncate text-xs", theme.isDark ? "text-white/70" : "text-slate-500")}>
          {(brand as any).text.subtitle}
        </div>
      ) : null}
    </div>
  ) : null;

  const secs = Array.isArray((props as any).sections) ? (props as any).sections : [];
  const orderedLinks = secs
    .filter((sec: any) => sec?.enabled !== false)
    .map((sec: any) => {
      if (!sec?.type || sec.type === "header" || sec.type === "top") return null;
      return { href: `#${sec.id}`, label: sec.title ?? sec.id };
    })
    .filter(Boolean) as { href: string; label: string }[];

  const fallbackLinks = [
    { href: "#hero", label: "Accueil" },
    { href: "#services", label: "Services" },
    { href: "#realisations", label: "Réalisations" },
  ];

  // ✅ CTA = “Contact” => on retire #contact du menu pour éviter doublon
  const rawLinks = orderedLinks.length ? orderedLinks : fallbackLinks;
  const links = rawLinks.filter((x) => x.href !== "#contact");

  const ctaLabel = props.content?.cta?.header ?? "Contact";

  const headerPos = "fixed left-0 right-0 top-0";
  const headerZ = "z-50";
  const Spacer = <div aria-hidden="true" style={{ height: "var(--header-h, 0px)" }} />;

  return (
    <>
      <header
        ref={headerRef as any}
        className={cx(
          headerPos,
          headerZ,
          "border-b transition-[background-color,backdrop-filter] duration-200",
          theme.isDark ? "border-white/10 text-white" : "border-slate-200 text-slate-900",
          "backdrop-blur",
          t > 0.2 ? headerBg2 : headerBg
        )}
      >
        <Wrap
  layout={props.layout}
  globalLayout={props.globalLayout}
  className="flex items-center gap-4"
  style={{ paddingTop: padY, paddingBottom: padY }}
>

          <a href="#hero" className="flex items-center gap-3 min-w-0">
            {LogoNode}
            {BrandText}
          </a>

          <nav
            className={cx(
              "hidden md:flex items-center gap-7 ml-auto text-[12px] font-semibold uppercase tracking-[0.14em]",
              theme.isDark ? "text-white/80" : "text-slate-700"
            )}
          >
            {links.map((lnk) => {
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
          </nav>

          <a
            href="#contact"
            className={cx(
              radiusClass(l.radius),
              "hidden md:inline-flex shrink-0 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r shadow-sm transition will-change-transform hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
              theme.accentFrom,
              theme.accentTo
            )}
          >
            {ctaLabel}
          </a>
        </Wrap>
      </header>
      {Spacer}
    </>
  );
}

/* ============================================================
   SERVICES PRO (ServicesVariant D)
   ============================================================ */
export function ProServices({ theme, content, layout, globalLayout, sectionId }: any) {
  const l = resolveLayout(layout, globalLayout);

  const title = content?.servicesTitle ?? "Nos services";
  const kicker = content?.servicesKicker ?? "Ce qu’on fait";
  const desc = content?.servicesText ?? "Des prestations claires et adaptées à vos besoins.";

  const items = Array.isArray(content?.services) ? content.services : [];

  return (
    <section id={sectionId ?? "services"} className={sectionPadY(l.density)}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <SectionHead theme={theme} kicker={kicker} title={title} text={desc} align="left" />

        <div className="grid gap-4 md:grid-cols-3">
          {items.slice(0, 12).map((it: any, idx: number) => (
            <Surface
              key={idx}
              theme={theme}
              layout={layout}
              globalLayout={globalLayout}
              className={cx("p-6 transition will-change-transform hover:shadow-md")}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={cx(
                    "text-xs font-semibold uppercase tracking-wider",
                    theme.isDark ? "text-white/60" : "text-slate-500"
                  )}
                >
                  {(idx + 1).toString().padStart(2, "0")}
                </div>
                <span
                  className={cx("h-10 w-10 rounded-2xl bg-gradient-to-br", theme.accentFrom, theme.accentTo)}
                  aria-hidden="true"
                />
              </div>

              <div className={cx("mt-3 text-lg font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
                {it?.title ?? `Service ${idx + 1}`}
              </div>

              {Array.isArray(it?.items) && it.items.length ? (
                <ul className={cx("mt-3 space-y-2 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>
                  {it.items.slice(0, 6).map((b: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className={cx("mt-1.5 h-2 w-2 rounded-full bg-gradient-to-r", theme.accentFrom, theme.accentTo)} />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={cx("mt-3 text-sm leading-relaxed", theme.isDark ? "text-white/70" : "text-slate-600")}>
                  Description.
                </p>
              )}

              <div className={cx("mt-5 h-[2px] w-16 bg-gradient-to-r", theme.accentFrom, theme.accentTo)} />
            </Surface>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ============================================================
   GALLERY PRO (proStack/proTwoCol/proThreeCol)
   - FIX hover: pas de translateY (évite micro-shift / repaint)
   ============================================================ */
export function ProGallery({
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

  const gl = String(galleryLayout ?? variant ?? "proTwoCol");
  const gridCols =
    gl === "proStack" ? "grid-cols-1" : gl === "proTwoCol" ? "md:grid-cols-2" : "md:grid-cols-3";

  const title = galleries?.[0]?.title ?? content?.galleryTitle ?? "Réalisations";
  const kicker = content?.galleryKicker ?? "Galeries";
  const desc = galleries?.[0]?.description ?? content?.galleryText ?? "Quelques exemples de projets.";

  const ratio = (idx: number) => {
    if (gl === "proStack") return "aspect-[16/7]";
    if (idx % 7 === 0) return "aspect-[16/9]";
    if (idx % 5 === 0) return "aspect-square";
    return "aspect-[4/3]";
  };

  return (
    <section id={sectionId ?? "realisations"} className={sectionPadY(l.density)}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <SectionHead
          theme={theme}
          kicker={kicker}
          title={title}
          text={desc}
          align={gl === "proStack" ? "center" : "left"}
        />

        <div className={cx("grid gap-4", gridCols)}>
          {images.slice(0, 36).map((img: any, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => enableLightbox && onOpen?.(img)}
              className="text-left group"
            >
              <div
                style={radiusStyle(l.radius)}
                className={cx(
                  "relative overflow-hidden border transition-[box-shadow] duration-200 will-change-transform",
                  theme.isDark ? "border-white/10" : "border-slate-200",
                  "group-hover:shadow-md"
                )}
              >
                <div className={cx("relative", ratio(idx))}>
                  <NextImage
                    src={img.src}
                    alt={img.alt ?? "Image"}
                    fill
                    className="object-cover transition-transform duration-300 will-change-transform transform-gpu group-hover:scale-[1.02]"
                  />
                </div>

                {hasText(img.caption) || hasText(img.alt) ? (
                  <div
                    className={cx(
                      "absolute inset-x-0 bottom-0 p-3 text-sm",
                      theme.isDark ? "text-white" : "text-slate-900",
                      "bg-gradient-to-t",
                      theme.isDark ? "from-black/55 to-transparent" : "from-white/70 to-transparent"
                    )}
                  >
                    <div className="font-semibold truncate">{img.caption ?? img.alt}</div>
                  </div>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
