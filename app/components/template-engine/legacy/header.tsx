// app/components/template-engine/legacy/header.tsx
"use client";

import React from "react";
import type { NavModel } from "../core/nav/nav-model";
import { hrefForSection } from "../core/dom-ids";
import { cx } from "../theme";

/**
 * Header (Legacy) — V24 compatible
 * - stable root class: te-header (used by [data-mounted="0"] guard)
 * - uses navModel if provided
 * - highlights activeDomId (preferred) else activeHref
 * - clicks call onNavTo if provided (smooth scroll)
 */

type Props = {
  theme: any;
  brand?: any;
  content?: any;
  options?: any;

  // sections fallback (if no navModel)
  sections?: any[];

  // V24 nav
  navModel?: NavModel;
  onNavTo?: (href: string) => void;

  // active state
  activeDomId?: string | null;
  activeHref?: string;

  // header state
  isScrolled?: boolean;
  scrollT?: number;
};

function pickBrandName(brand: any, content: any) {
  return (
    brand?.name ??
    content?.brandName ??
    content?.siteName ??
    content?.title ??
    "InfraLys"
  );
}

function buildFallbackNav(sections: any[] | undefined) {
  const list = Array.isArray(sections) ? sections : [];
  return list
    .filter((s) => {
      const t = String(s?.type ?? "").toLowerCase();
      if (!s?.id) return false;
      if (t === "header" || t === "top") return false;
      if (s?.enabled === false) return false;
      if (s?.nav?.hide) return false;
      return true;
    })
    .map((s) => {
      const id = String(s.id);
      const label = String(s?.nav?.label ?? s?.label ?? s?.title ?? id);
      const href = hrefForSection(id);
      return { key: id, label, href };
    });
}

export default function Header(props: Props) {
  const {
    theme,
    brand,
    content,
    sections,
    navModel,
    onNavTo,
    activeDomId,
    activeHref,
    isScrolled,
  } = props;

  const name = pickBrandName(brand, content);

  const directItems =
    navModel?.direct?.map((it) => ({
      key: it.key,
      label: it.label,
      href: it.href,
    })) ?? buildFallbackNav(sections);

  const overflowItems =
    navModel?.overflow?.map((it) => ({
      key: it.key,
      label: it.label,
      href: it.href,
    })) ?? [];

  const overflowLabel = navModel?.overflowLabel ?? "Plus";

  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = React.useCallback(
    (href: string) => {
      const id = href.startsWith("#") ? href.slice(1) : href;
      if (activeDomId) return id === activeDomId;
      if (activeHref) return href === activeHref;
      return false;
    },
    [activeDomId, activeHref]
  );

  const handleNav = React.useCallback(
    (href: string) => (e: React.MouseEvent) => {
      // Always allow cmd/ctrl click open new tab
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();
      setOpen(false);

      if (onNavTo) {
        onNavTo(href);
      } else {
        const id = href.startsWith("#") ? href.slice(1) : href;
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // keep URL hash in sync
      try {
        history.replaceState(null, "", href);
      } catch {}
    },
    [onNavTo]
  );

  return (
    <header
      className={cx(
        "te-header", // ✅ critical for anti-flash
        "fixed left-0 right-0 top-0 z-50",
        "border-b transition-[background-color,backdrop-filter] duration-200",
        theme?.isDark
          ? "border-white/10 text-white"
          : "border-slate-200 text-slate-900",
        isScrolled ? "backdrop-blur-md" : "backdrop-blur-sm"
      )}
      style={theme?.headerStyle}
    >
      <div
        className={cx(
          "mx-auto flex h-[var(--header-h,72px)] max-w-7xl items-center justify-between px-4"
        )}
      >
        {/* Brand */}
        <a
          href="#"
          onClick={(e) => {
            // go top
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            try {
              history.replaceState(null, "", "#top");
            } catch {}
          }}
          className={cx("flex items-center gap-3 font-semibold")}
          aria-label="Accueil"
        >
          <div
            className={cx(
              "h-9 w-9 rounded-xl",
              theme?.isDark ? "bg-white/10" : "bg-black/5"
            )}
          />
          <span className={cx("text-base")}>{name}</span>
        </a>

        {/* Nav */}
        <nav className={cx("hidden items-center gap-1 md:flex")}>
          {directItems.map((it) => (
            <a
              key={it.key}
              href={it.href}
              onClick={handleNav(it.href)}
              className={cx(
                "rounded-xl px-3 py-2 text-sm transition",
                isActive(it.href)
                  ? theme?.isDark
                    ? "bg-white/10"
                    : "bg-black/5"
                  : theme?.isDark
                  ? "hover:bg-white/5"
                  : "hover:bg-black/5"
              )}
            >
              {it.label}
            </a>
          ))}

          {overflowItems.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                className={cx(
                  "rounded-xl px-3 py-2 text-sm transition",
                  open
                    ? theme?.isDark
                      ? "bg-white/10"
                      : "bg-black/5"
                    : theme?.isDark
                    ? "hover:bg-white/5"
                    : "hover:bg-black/5"
                )}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
              >
                {overflowLabel}
              </button>

              {open ? (
                <div
                  className={cx(
                    "absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border p-1 shadow-lg",
                    theme?.isDark
                      ? "border-white/10 bg-black/60 backdrop-blur-xl"
                      : "border-slate-200 bg-white/80 backdrop-blur-xl"
                  )}
                >
                  {overflowItems.map((it) => (
                    <a
                      key={it.key}
                      href={it.href}
                      onClick={handleNav(it.href)}
                      className={cx(
                        "block rounded-xl px-3 py-2 text-sm transition",
                        isActive(it.href)
                          ? theme?.isDark
                            ? "bg-white/10"
                            : "bg-black/5"
                          : theme?.isDark
                          ? "hover:bg-white/5"
                          : "hover:bg-black/5"
                      )}
                    >
                      {it.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        {/* Mobile */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cx(
              "rounded-xl px-3 py-2 text-sm transition",
              theme?.isDark
                ? "bg-white/10 hover:bg-white/15"
                : "bg-black/5 hover:bg-black/10"
            )}
            aria-expanded={open}
          >
            Menu
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open ? (
        <div
          className={cx(
            "md:hidden",
            "border-t",
            theme?.isDark ? "border-white/10" : "border-slate-200"
          )}
        >
          <div className="mx-auto max-w-7xl px-4 py-2">
            {directItems.map((it) => (
              <a
                key={it.key}
                href={it.href}
                onClick={handleNav(it.href)}
                className={cx(
                  "block rounded-xl px-3 py-2 text-sm transition",
                  isActive(it.href)
                    ? theme?.isDark
                      ? "bg-white/10"
                      : "bg-black/5"
                    : theme?.isDark
                    ? "hover:bg-white/5"
                    : "hover:bg-black/5"
                )}
              >
                {it.label}
              </a>
            ))}

            {overflowItems.map((it) => (
              <a
                key={it.key}
                href={it.href}
                onClick={handleNav(it.href)}
                className={cx(
                  "block rounded-xl px-3 py-2 text-sm transition",
                  isActive(it.href)
                    ? theme?.isDark
                      ? "bg-white/10"
                      : "bg-black/5"
                    : theme?.isDark
                    ? "hover:bg-white/5"
                    : "hover:bg-black/5"
                )}
              >
                {it.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
