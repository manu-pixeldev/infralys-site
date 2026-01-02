// app/components/template-engine/pro.tsx
"use client";

import React from "react";
import type { ThemeLike } from "./theme";
import { cx, containerClass } from "./theme";

type Brand = any;
type NavItem = { href: string; label: string };

function safeIdToHref(id: string) {
  const v = String(id || "").trim();
  if (!v) return "#top";
  return v.startsWith("#") ? v : `#${v}`;
}

function labelFromSection(s: any) {
  return String(s?.title || s?.navLabel || s?.id || "").trim() || "Section";
}

function buildNavFromSections(sections: any[]): NavItem[] {
  const out: NavItem[] = [];
  for (const s of sections || []) {
    if (!s || s.enabled === false) continue;
    if (s.type === "header" || s.type === "top") continue;

    const href = safeIdToHref(s.id);
    if (out.some((x) => x.href === href)) continue;

    out.push({ href, label: labelFromSection(s) });
  }
  return out;
}

function splitMenu(nav: NavItem[], maxDirect: number) {
  const n = Math.max(
    0,
    Math.min(12, Number.isFinite(maxDirect) ? maxDirect : 4)
  );
  if (nav.length <= n) return { direct: nav, more: [] as NavItem[] };
  return { direct: nav.slice(0, n), more: nav.slice(n) };
}

function getMoreLabel({
  more,
  activeHref,
  fallback = "AUTRES",
}: {
  more: NavItem[];
  activeHref?: string;
  fallback?: string;
}) {
  if (!activeHref) return fallback;
  const hit = more.find((x) => x.href === activeHref);
  return hit?.label ? hit.label : fallback;
}

function isMoreActive(more: NavItem[], activeHref?: string) {
  return !!activeHref && more.some((x) => x.href === activeHref);
}

function galleryGridClass(variant?: string) {
  const v = String(variant || "")
    .trim()
    .toLowerCase();

  if (v.includes("one") || v.includes("1col") || v.includes("stack")) {
    return "grid grid-cols-1 gap-4";
  }
  if (v.includes("two") || v.includes("2col")) {
    return "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2";
  }
  if (v.includes("four") || v.includes("4col")) {
    return "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4";
  }
  return "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
}

export default function ProHeader({
  theme,
  brand,
  sections,
  activeHref,
  isScrolled,
  maxDirectLinksInMenu,
  fx,
}: {
  theme: ThemeLike;
  brand: Brand;
  sections: any[];
  activeHref?: string;
  isScrolled?: boolean;
  maxDirectLinksInMenu?: number;
  fx?: any;
}) {
  const nav = React.useMemo(() => buildNavFromSections(sections), [sections]);

  const { direct, more } = React.useMemo(
    () => splitMenu(nav, Number(maxDirectLinksInMenu ?? 4)),
    [nav, maxDirectLinksInMenu]
  );

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  // Glass styles with fallback
  const darkFallback = "rgba(18,18,22,0.62)";
  const lightFallback = "rgba(255,255,255,0.72)";

  const surfaceStyle: React.CSSProperties = theme.isDark
    ? {
        backgroundColor: darkFallback,
        background:
          "color-mix(in srgb, var(--te-surface, rgba(18,18,22,0.92)) 70%, transparent)",
        border: "1px solid var(--te-surface-border, rgba(255,255,255,0.10))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }
    : {
        backgroundColor: lightFallback,
        background:
          "color-mix(in srgb, var(--te-surface, rgba(255,255,255,0.92)) 72%, transparent)",
        border: "1px solid var(--te-surface-border, rgba(0,0,0,0.10))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      };

  const headerBgStyle: React.CSSProperties = theme.isDark
    ? {
        backgroundColor: darkFallback,
        background:
          "color-mix(in srgb, var(--te-surface, rgba(18,18,22,0.62)) 72%, transparent)",
        border: "1px solid var(--te-surface-border, rgba(255,255,255,0.10))",
        backdropFilter: isScrolled ? "blur(14px)" : "blur(10px)",
        WebkitBackdropFilter: isScrolled ? "blur(14px)" : "blur(10px)",
      }
    : {
        backgroundColor: lightFallback,
        background:
          "color-mix(in srgb, var(--te-surface, rgba(255,255,255,0.70)) 72%, transparent)",
        border: "1px solid var(--te-surface-border, rgba(0,0,0,0.10))",
        backdropFilter: isScrolled ? "blur(12px)" : "blur(8px)",
        WebkitBackdropFilter: isScrolled ? "blur(12px)" : "blur(8px)",
      };

  const pillBg = theme.isDark
    ? "rgba(255,255,255,0.10)"
    : "color-mix(in srgb, var(--te-surface, rgba(255,255,255,0.92)) 70%, white 30%)";

  const logoMode = String(brand?.logo?.mode ?? "logoPlusText");
  const logoSrc = String(brand?.logo?.src ?? "");
  const showImg = logoMode !== "textOnly" && !!logoSrc;

  const moreLabel = getMoreLabel({ more, activeHref, fallback: "AUTRES" });
  const moreActive = isMoreActive(more, activeHref);

  return (
    <header
      className={cx(
        "sticky top-0 z-[60] w-full",
        isScrolled ? "backdrop-blur-md" : "backdrop-blur-sm"
      )}
    >
      <div className={cx(containerClass("7xl"), "px-4 pt-4")}>
        <div
          className={cx(
            "flex items-center justify-between gap-4 rounded-2xl px-5 py-4",
            isScrolled ? "shadow-[0_10px_40px_rgba(0,0,0,0.10)]" : ""
          )}
          style={headerBgStyle}
        >
          <div className="flex items-center gap-3 min-w-0">
            {showImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt="logo"
                className="h-10 w-10 rounded-xl object-contain"
                onError={(e) => {
                  (e.currentTarget as any).style.display = "none";
                }}
              />
            ) : null}

            <div className="min-w-0">
              <div className="font-semibold truncate">
                {brand?.text?.name ?? "Société"}
              </div>
              <div className="text-xs opacity-70 truncate">
                {brand?.text?.subtitle ?? brand?.text?.tagline ?? "Sous-titre"}
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {direct.map((it) => (
              <a
                key={it.href}
                href={it.href}
                className={cx(
                  "rounded-full px-4 py-2 text-xs font-semibold opacity-85 hover:opacity-100 transition",
                  fx?.enabled && fx?.shimmerCta ? "fx-cta" : ""
                )}
                style={{
                  background: activeHref === it.href ? pillBg : "transparent",
                }}
              >
                {it.label.toUpperCase()}
              </a>
            ))}

            {more.length ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className={cx(
                    "rounded-full px-4 py-2 text-xs font-semibold opacity-85 hover:opacity-100 transition",
                    fx?.enabled && fx?.shimmerCta ? "fx-cta" : ""
                  )}
                  style={{
                    background: open || moreActive ? pillBg : "transparent",
                  }}
                  aria-expanded={open}
                >
                  {moreLabel.toUpperCase()}{" "}
                  <span className="opacity-60">▾</span>
                </button>

                {open ? (
                  <div
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl shadow-[0_18px_55px_rgba(0,0,0,0.18)]"
                    style={surfaceStyle}
                  >
                    <div className="p-2">
                      {more.map((it) => (
                        <a
                          key={it.href}
                          href={it.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-3 py-2 text-sm font-semibold opacity-85 hover:opacity-100"
                          style={{
                            background:
                              activeHref === it.href ? pillBg : "transparent",
                          }}
                        >
                          {it.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}

/* ---------------- PRO SERVICES (placeholder) ---------------- */

export function ProServices() {
  return (
    <section className="py-24 text-center opacity-80">
      <h2 className="text-xl font-semibold">Services (PRO)</h2>
    </section>
  );
}

/* ---------------- PRO GALLERY (variant-aware) ---------------- */

export function ProGallery({
  content,
  config,
  variant,
  theme,
}: {
  content?: any;
  config?: any;
  variant?: string;
  theme?: ThemeLike;
}) {
  const images: any[] =
    (content?.gallery?.images as any[]) ??
    (config?.content?.gallery?.images as any[]) ??
    [];

  const fallback: any[] = [
    { src: "/images/template-base/p1.jpg", alt: "Photo 1" },
    { src: "/images/template-base/p2.jpg", alt: "Photo 2" },
    { src: "/images/template-base/p3.jpg", alt: "Photo 3" },
    { src: "/images/template-base/p4.jpg", alt: "Photo 4" },
    { src: "/images/template-base/p5.jpg", alt: "Photo 5" },
    { src: "/images/template-base/p6.jpg", alt: "Photo 6" },
  ];

  const list = images.length ? images : fallback;

  const hasTheme = !!theme;
  const Sheen = hasTheme ? (
    <div
      aria-hidden="true"
      className={cx(
        "pointer-events-none absolute inset-0 opacity-[0.10]",
        "mix-blend-screen"
      )}
    >
      <div
        className={cx(
          "absolute -top-24 -left-24 h-56 w-56 rounded-full blur-3xl",
          "bg-gradient-to-br",
          theme!.accentFrom,
          theme!.accentTo
        )}
      />
      <div
        className={cx(
          "absolute -bottom-28 -right-28 h-72 w-72 rounded-full blur-3xl",
          "bg-gradient-to-br",
          theme!.accentFrom,
          theme!.accentTo
        )}
      />
    </div>
  ) : null;

  return (
    <section className="py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Réalisations</h2>
          <p className="mt-1 text-sm opacity-75">Galerie (PRO)</p>
        </div>

        {/* ✅ Align PRO card with legacy Surface look */}
        <div
          className="relative overflow-hidden rounded-3xl border p-6"
          style={{
            backgroundColor: "var(--te-surface, rgba(18,18,22,0.35))",
            borderColor: "var(--te-surface-border, rgba(255,255,255,0.10))",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {Sheen}
          <div className={cx("relative", galleryGridClass(variant))}>
            {list.map((img, i) => (
              <div
                key={`${img?.src ?? "img"}:${i}`}
                className="overflow-hidden rounded-2xl border"
                style={{
                  borderColor:
                    "var(--te-surface-border, rgba(255,255,255,0.10))",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt ?? `Image ${i + 1}`}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
