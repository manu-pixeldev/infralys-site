// app/components/template-engine/theme.ts
import type { LayoutTokens, Container, Density, Radius } from "../../template-base/template.config";

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

/**
 * Merge layout tokens: local section layout overrides global layout.
 */
export function resolveLayout(layout?: LayoutTokens, globalLayout?: LayoutTokens) {
  const merged = {
    ...(globalLayout ?? {}),
    ...(layout ?? {}),
  } as LayoutTokens;

  // Density réel (StudioPanel): compact|normal|spacious
  return {
    container: (merged.container ?? "7xl") as Container,
    density: (merged.density ?? ("normal" as any)) as Density,
    radius: (merged.radius ?? ("24" as any)) as Radius,
  };
}

/* ============================================================
   HELPERS
   ============================================================ */

export function containerClass(container?: Container) {
  // spacing + “pro” sur grands écrans
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
 * Supporte compact|normal|spacious
 * + fallback vieux tokens xs|sm|md|lg|xl
 */
export function sectionPadY(density?: Density) {
  switch (String(density ?? "normal")) {
    // NEW TOKENS (StudioPanel)
    case "compact":
      return "py-8 md:py-10";
    case "spacious":
      return "py-20 md:py-24";
    case "normal":
    default:
      // OLD TOKENS fallback
      if (density === ("xs" as any)) return "py-8 md:py-10";
      if (density === ("sm" as any)) return "py-10 md:py-12";
      if (density === ("lg" as any)) return "py-16 md:py-20";
      if (density === ("xl" as any)) return "py-20 md:py-24";
      return "py-12 md:py-16";
  }
}

/**
 * Hero spacing : légèrement plus compact que sectionPadY, mais cohérent.
 * IMPORTANT : supporte compact|normal|spacious + vieux tokens
 */
export function heroPadY(density?: Density) {
  switch (String(density ?? "normal")) {
    case "compact":
      return "pt-10 md:pt-12 pb-10 md:pb-12";
    case "spacious":
      return "pt-16 md:pt-20 pb-14 md:pb-18";
    case "normal":
    default:
      // fallback vieux tokens
      if (density === ("xs" as any)) return "pt-8 md:pt-10 pb-10 md:pb-12";
      if (density === ("sm" as any)) return "pt-10 md:pt-12 pb-10 md:pb-12";
      if (density === ("lg" as any)) return "pt-14 md:pt-16 pb-12 md:pb-14";
      if (density === ("xl" as any)) return "pt-16 md:pt-20 pb-14 md:pb-18";
      return "pt-12 md:pt-14 pb-10 md:pb-12";
  }
}

/**
 * Tailwind radius tokens (si tu en as encore besoin).
 * MAIS pour radius numérique (=24), utilise radiusStyle() (ci-dessous).
 */
export function radiusClass(radius?: any) {
  const r = Number(radius);

  // ✅ support des nouveaux tokens 16/24/32
  if (r === 16) return "rounded-2xl";
  if (r === 24) return "rounded-3xl";
  if (r === 32) return "rounded-[32px]";

  // ✅ compat legacy strings
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
      return "rounded-3xl";
    default:
      return "rounded-3xl";
  }
}


/**
 * ✅ LA solution pour radius numérique (ex: 24).
 * À utiliser en style inline : style={radiusStyle(l.radius)}
 */
export function radiusStyle(radius?: any): React.CSSProperties | undefined {
  const n = typeof radius === "number" ? radius : Number(radius);
  if (Number.isFinite(n) && n >= 0) return { borderRadius: `${n}px` };

  // fallback tokens
  switch (String(radius ?? "xl")) {
    case "none":
      return { borderRadius: "0px" };
    case "sm":
      return { borderRadius: "12px" };
    case "md":
      return { borderRadius: "16px" };
    case "lg":
      return { borderRadius: "20px" };
    case "xl":
    default:
      return { borderRadius: "24px" };
  }
}
