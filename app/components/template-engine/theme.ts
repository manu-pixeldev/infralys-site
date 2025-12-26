// app/components/template-engine/theme.ts
import type {
  LayoutTokens,
  Container,
  Density,
  Radius,
} from "../../template-base/template.config";

/** Small class joiner */
export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/* ============================================================
   THEME
   ============================================================ */

export type ThemeVariant =
  | "amberOrange"
  | "blueSky"
  | "emeraldTeal"
  | "rosePink"
  | "violetIndigo"
  | "slateMono"
  | (string & {});

export type ThemeLike = {
  // used by TemplateEngine main
  bgPage: string;
  text: string;

  // used by legacy components
  accentFrom: string;
  accentTo: string;

  // used for conditional surfaces/borders
  isDark: boolean;
};

const THEMES: Record<string, ThemeLike> = {
  amberOrange: {
    bgPage: "bg-slate-50",
    text: "text-slate-900",
    accentFrom: "from-amber-500",
    accentTo: "to-orange-500",
    isDark: false,
  },
  blueSky: {
    bgPage: "bg-slate-50",
    text: "text-slate-900",
    accentFrom: "from-sky-500",
    accentTo: "to-blue-600",
    isDark: false,
  },
  emeraldTeal: {
    bgPage: "bg-slate-50",
    text: "text-slate-900",
    accentFrom: "from-emerald-500",
    accentTo: "to-teal-500",
    isDark: false,
  },
  rosePink: {
    bgPage: "bg-slate-50",
    text: "text-slate-900",
    accentFrom: "from-rose-500",
    accentTo: "to-pink-500",
    isDark: false,
  },
  violetIndigo: {
    bgPage: "bg-slate-50",
    text: "text-slate-900",
    accentFrom: "from-violet-500",
    accentTo: "to-indigo-500",
    isDark: false,
  },
  slateMono: {
    bgPage: "bg-slate-950",
    text: "text-white",
    accentFrom: "from-slate-200",
    accentTo: "to-slate-50",
    isDark: true,
  },
};

export function getTheme(variant?: ThemeVariant): ThemeLike {
  const key = String(variant ?? "amberOrange");
  return THEMES[key] ?? THEMES.amberOrange;
}

/* ============================================================
   LAYOUT TOKENS (container / density / radius)
   ============================================================ */

export function resolveLayout(layout?: LayoutTokens, globalLayout?: LayoutTokens) {
  const merged = {
    ...(globalLayout ?? {}),
    ...(layout ?? {}),
  } as LayoutTokens;

  return {
    container: (merged.container ?? "7xl") as Container,
    density: (merged.density ?? ("normal" as any)) as Density,
    radius: (merged.radius ?? "xl") as Radius,
  };
}

/* ============================================================
   HELPERS
   ============================================================ */

export function containerClass(container?: Container) {
  // un poil plus "pro" sur grands écrans
  const base = "mx-auto w-full px-4 sm:px-6 lg:px-8";

  switch (container) {
    case "5xl":
      return cx(base, "max-w-5xl");
    case "6xl":
      return cx(base, "max-w-6xl");
    case "7xl":
    default:
      return cx(base, "max-w-7xl");
  }
}

/**
 * Density -> vertical section padding.
 * Supporte compact|normal|spacious + anciens tokens si présents.
 */
export function sectionPadY(density?: Density) {
  const d = String(density ?? "normal");

  if (d === "compact") return "py-10 md:py-12";
  if (d === "spacious") return "py-20 md:py-24";
  if (d === "normal") return "py-14 md:py-18";

  // legacy fallback
  if (d === "xs") return "py-8 md:py-10";
  if (d === "sm") return "py-10 md:py-12";
  if (d === "lg") return "py-16 md:py-20";
  if (d === "xl") return "py-20 md:py-24";
  return "py-12 md:py-16";
}

/**
 * Hero padding (un peu plus compact que sections)
 */
export function heroPadY(density?: Density) {
  const d = String(density ?? "normal");

  if (d === "compact") return "pt-6 md:pt-8 pb-10 md:pb-12";
  if (d === "spacious") return "pt-12 md:pt-14 pb-14 md:pb-16";
  // normal
  return "pt-8 md:pt-10 pb-12 md:pb-14";
}

export function radiusClass(radius?: Radius) {
  switch (radius) {
    case "none":
      return "rounded-none";
    case "sm":
      return "rounded-lg";
    case "md":
      return "rounded-xl";
    case "lg":
      return "rounded-2xl";
    case "xl":
    default:
      return "rounded-3xl";
  }
}
