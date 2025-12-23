"use client";

import type { ThemeVariant, LayoutTokens, Container, Density, Radius } from "../../template-base/template.config";

/* =======================
   THEME VARIANTS
   ======================= */

type AccentPair = { from: string; to: string };

const THEME_VARIANTS: Record<ThemeVariant, AccentPair> = {
  blueRed: { from: "from-blue-600", to: "to-red-600" },
  purplePink: { from: "from-purple-600", to: "to-pink-500" },
  emeraldTeal: { from: "from-emerald-500", to: "to-teal-500" },
  amberOrange: { from: "from-amber-500", to: "to-orange-600" },
  slateIndigo: { from: "from-slate-700", to: "to-indigo-500" },
  monoDark: { from: "from-slate-900", to: "to-slate-600" },
  warm: { from: "from-amber-500", to: "to-rose-500" },
  cool: { from: "from-cyan-500", to: "to-indigo-500" },
  forest: { from: "from-emerald-600", to: "to-lime-500" },
  sunset: { from: "from-orange-500", to: "to-fuchsia-500" },
};

/** Aliases legacy */
const THEME_ALIASES: Record<string, ThemeVariant> = {
  ORANGE: "amberOrange",
  orange: "amberOrange",
  BLUE: "cool",
  blue: "cool",
  AMBER: "amberOrange",
};

/* =======================
   TOKENS
   ======================= */

export type ThemeTokens = {
  variant: ThemeVariant;
  isDark: boolean;

  bgPage: string;
  bgSection: string;
  bgHeader: string;
  bgCard: string;

  text: string;
  muted: string;

  border: string;
  headerBorder: string;
  cardBorder: string;

  navText: string;
  navHover: string;

  accentFrom: string;
  accentTo: string;
};

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function accentText(theme: ThemeTokens) {
  return cx("bg-gradient-to-r bg-clip-text text-transparent", theme.accentFrom, theme.accentTo);
}

/* =======================
   LAYOUT HELPERS ✅
   (1 SEULE VERSION, pas de doublon)
   ======================= */

export function containerClass(container?: Container) {
  const base = "mx-auto w-full px-4";
  switch (container) {
    case "5xl":
      return `${base} max-w-5xl`;
    case "6xl":
      return `${base} max-w-6xl`;
    case "7xl":
      return `${base} max-w-7xl`;
    case "full":
      return `${base} max-w-none`;
    default:
      return `${base} max-w-6xl`;
  }
}

export function radiusClass(radius?: Radius) {
  switch (radius) {
    case 16:
      return "rounded-2xl";
    case 24:
      return "rounded-3xl";
    case 32:
      return "rounded-[2rem]";
    default:
      return "rounded-3xl";
  }
}

/** Tailwind-safe: classes fixes (pas de `py-${n}`) */
export function sectionPadY(density?: Density) {
  switch (density) {
    case "compact":
      return "py-10 md:py-12";
    case "spacious":
      return "py-20 md:py-24";
    default:
      return "py-16 md:py-18";
  }
}

/** Global layout + override section */
export function resolveLayout(section?: LayoutTokens, global?: LayoutTokens): LayoutTokens {
  return { ...(global ?? {}), ...(section ?? {}) };
}

/* =======================
   THEME RESOLVER
   ======================= */

function safeThemeVariant(input: ThemeVariant | string | undefined): ThemeVariant {
  if (!input) return "amberOrange";
  if ((input as ThemeVariant) in THEME_VARIANTS) return input as ThemeVariant;
  const alias = THEME_ALIASES[String(input)];
  return alias ?? "amberOrange";
}

export function getTheme(variant: ThemeVariant): ThemeTokens {
  const safe = safeThemeVariant(variant);
  const t = THEME_VARIANTS[safe];
  const isMonoDark = safe === "monoDark";

  if (isMonoDark) {
    return {
      variant: safe,
      isDark: true,

      bgPage: "bg-slate-950",
      bgSection: "bg-slate-950",
      bgHeader: "bg-slate-950/70 backdrop-blur",
      bgCard: "bg-white/5",

      text: "text-white",
      muted: "text-white/70",

      border: "border-white/10",
      headerBorder: "border-white/10",
      cardBorder: "border-white/10",

      navText: "text-white/80",
      navHover: "hover:text-white",

      accentFrom: t.from,
      accentTo: t.to,
    };
  }

  const base = {
    variant: safe,
    isDark: false,

    bgCard: "bg-white",
    text: "text-slate-900",
    muted: "text-slate-600",

    navText: "text-slate-700",
    navHover: "hover:text-slate-950",

    accentFrom: t.from,
    accentTo: t.to,
  } as const;

  if (safe === "warm") {
    return {
      ...base,
      bgPage: "bg-rose-50",
      bgSection: "bg-rose-50",
      bgHeader: "bg-white/85 backdrop-blur",
      border: "border-rose-200",
      headerBorder: "border-rose-200/80",
      cardBorder: "border-rose-200",
    };
  }

  if (safe === "cool") {
    return {
      ...base,
      bgPage: "bg-cyan-50",
      bgSection: "bg-cyan-50",
      bgHeader: "bg-white/85 backdrop-blur",
      border: "border-cyan-200",
      headerBorder: "border-cyan-200/80",
      cardBorder: "border-cyan-200",
    };
  }

  if (safe === "forest") {
    return {
      ...base,
      bgPage: "bg-emerald-50",
      bgSection: "bg-emerald-50",
      bgHeader: "bg-white/85 backdrop-blur",
      border: "border-emerald-200",
      headerBorder: "border-emerald-200/80",
      cardBorder: "border-emerald-200",
    };
  }

  if (safe === "sunset") {
    return {
      ...base,
      bgPage: "bg-amber-50",
      bgSection: "bg-amber-50",
      bgHeader: "bg-white/85 backdrop-blur",
      border: "border-amber-200",
      headerBorder: "border-amber-200/80",
      cardBorder: "border-amber-200",
    };
  }

  return {
    ...base,
    bgPage: "bg-slate-50",
    bgSection: "bg-slate-50",
    bgHeader: "bg-white/90 backdrop-blur",
    border: "border-slate-200",
    headerBorder: "border-slate-200/80",
    cardBorder: "border-slate-200",
  };
}
