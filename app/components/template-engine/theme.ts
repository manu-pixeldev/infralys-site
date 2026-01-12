// app/components/template-engine/theme.ts
import React from "react";
import type { LayoutTokens, Container, Density, Radius } from "./types";

/** Small class joiner */
export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export type ThemeVariant = string;
export type CanvasStyle = "classic" | "immersive";

export type ThemeLike = {
  bgPage: string;
  text: string;

  accentFrom: string;
  accentTo: string;

  surfaceBg: string;
  surfaceElevated: string;
  surfaceBorder: string;

  isDark: boolean;

  canvasStyle?: CanvasStyle;
  canvasVar?: React.CSSProperties;
};

type AccentDef = { accentFrom: string; accentTo: string };

type CanvasDef = {
  bgPage: string;
  isDark: boolean;

  surfaceBg?: string;
  surfaceBorder?: string;

  immersiveSurfaceBg?: string;
  immersiveSurfaceBorder?: string;

  immersiveBgExtra?: string;
  canvasHex?: string;
};

const ACCENTS: Record<string, AccentDef> = {
  amberOrange: { accentFrom: "from-amber-400", accentTo: "to-orange-500" },
  emeraldTeal: { accentFrom: "from-emerald-500", accentTo: "to-teal-500" },
  blueRed: { accentFrom: "from-sky-500", accentTo: "to-rose-500" },
  purplePink: { accentFrom: "from-purple-500", accentTo: "to-pink-500" },
  slateIndigo: { accentFrom: "from-indigo-500", accentTo: "to-slate-700" },

  monoDark: { accentFrom: "from-cyan-400", accentTo: "to-blue-500" },
  monoDarkRose: { accentFrom: "from-fuchsia-400", accentTo: "to-rose-500" },
  monoDarkGold: { accentFrom: "from-amber-300", accentTo: "to-yellow-500" },
  monoDarkLime: { accentFrom: "from-lime-300", accentTo: "to-emerald-400" },

  neon: { accentFrom: "from-cyan-300", accentTo: "to-fuchsia-400" },
  aurora: { accentFrom: "from-emerald-300", accentTo: "to-cyan-300" },
  volcano: { accentFrom: "from-orange-400", accentTo: "to-rose-500" },
  cyber: { accentFrom: "from-lime-300", accentTo: "to-cyan-300" },
};

const ALIASES: Record<string, string> = {
  blueSky: "blueRed",
  rosePink: "purplePink",
  violetIndigo: "slateIndigo",
  slateMono: "monoDark",

  amberOrange400: "amberOrange",
  amberOrange500: "amberOrange",
};

const CANVAS: Record<string, CanvasDef> = {
  classic: {
    bgPage: "bg-slate-50",
    isDark: false,
    surfaceBg: "bg-white",
    surfaceBorder: "border-slate-200",
    canvasHex: "#F8FAFC",
  },
  warm: {
    bgPage: "bg-amber-50",
    isDark: false,
    surfaceBg: "bg-white",
    surfaceBorder: "border-slate-200",
    canvasHex: "#FFFBEB",
  },
  charcoal: {
    bgPage: "bg-slate-950",
    isDark: true,
    surfaceBg: "bg-white/5",
    surfaceBorder: "border-white/10",
    immersiveSurfaceBg: "bg-white/6",
    immersiveSurfaceBorder: "border-white/12",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_20%_0%,rgba(56,189,248,0.10),transparent_55%),radial-gradient(900px_700px_at_80%_20%,rgba(168,85,247,0.10),transparent_55%)]",
    canvasHex: "#020617",
  },
  // (tu peux réinjecter tes autres canvas ici, inchangé)
};

function normalizeAccentKey(k: string) {
  const key = String(k || "amberOrange");
  return ALIASES[key] ?? key;
}

export function parseThemeVariant(v?: string) {
  const raw = String(v ?? "amberOrange|classic").trim();
  if (!raw) return { accent: "amberOrange", canvas: "classic" };

  if (raw.includes("|")) {
    const [a, c] = raw.split("|").map((x) => String(x || "").trim());
    return { accent: a || "amberOrange", canvas: c || "classic" };
  }

  if ((CANVAS as any)[raw]) return { accent: "amberOrange", canvas: raw };
  return { accent: raw, canvas: "classic" };
}

export type GetThemeArg =
  | ThemeVariant
  | { accent?: string; canvas?: string; style?: CanvasStyle }
  | undefined;

export function getTheme(arg?: GetThemeArg): ThemeLike {
  const parsed =
    typeof arg === "string" || typeof arg === "undefined"
      ? parseThemeVariant(arg)
      : {
          accent: String((arg as any)?.accent ?? "amberOrange"),
          canvas: String((arg as any)?.canvas ?? "classic"),
        };

  const style: CanvasStyle =
    typeof arg === "object" && arg
      ? (String((arg as any).style || "classic") as CanvasStyle)
      : "classic";

  const accentKey = normalizeAccentKey(parsed.accent);
  const accent = ACCENTS[accentKey] ?? ACCENTS.amberOrange;

  const canvasKey = String(parsed.canvas || "classic");
  const canvas = CANVAS[canvasKey] ?? CANVAS.classic;

  const isDark = canvas.isDark;
  const text = isDark ? "text-white" : "text-slate-900";
  const immersive = style === "immersive";

  const baseBg = canvas.bgPage;
  const extra = canvas.immersiveBgExtra;
  const bgPage = extra ? cx(baseBg, extra) : baseBg;

  const canvasHex = canvas.canvasHex ?? (isDark ? "#0b0b0c" : "#ffffff");

  const canvasVar = {
    ["--te-canvas" as any]: canvasHex,
    ["--te-surface" as any]: isDark
      ? immersive
        ? "color-mix(in srgb, var(--te-canvas, #0b0b0c) 88%, white 12%)"
        : "color-mix(in srgb, var(--te-canvas, #0b0b0c) 96%, white 4%)"
      : immersive
      ? "color-mix(in srgb, var(--te-canvas, #ffffff) 66%, white 34%)"
      : "color-mix(in srgb, var(--te-canvas, #ffffff) 72%, white 28%)",
    ["--te-surface-2" as any]: isDark
      ? immersive
        ? "color-mix(in srgb, var(--te-canvas, #0b0b0c) 82%, white 18%)"
        : "color-mix(in srgb, var(--te-canvas, #0b0b0c) 84%, white 16%)"
      : immersive
      ? "color-mix(in srgb, var(--te-canvas, #ffffff) 58%, white 42%)"
      : "color-mix(in srgb, var(--te-canvas, #ffffff) 64%, white 36%)",
    ["--te-surface-border" as any]: isDark
      ? "color-mix(in srgb, var(--te-canvas, #0b0b0c) 94%, white 6%)"
      : immersive
      ? "color-mix(in srgb, var(--te-canvas, #ffffff) 92%, black 8%)"
      : "color-mix(in srgb, var(--te-canvas, #ffffff) 94%, black 6%)",
  } as React.CSSProperties;

  const surfaceBg = "bg-[color:var(--te-surface)]";
  const surfaceElevated = "bg-[color:var(--te-surface-2)]";
  const surfaceBorder = "border-[color:var(--te-surface-border)]";

  return {
    bgPage,
    text,
    accentFrom: accent.accentFrom,
    accentTo: accent.accentTo,
    surfaceBg,
    surfaceElevated,
    surfaceBorder,
    isDark,
    canvasStyle: immersive ? "immersive" : "classic",
    canvasVar,
  };
}

/* ============================================================
   LAYOUT TOKENS
   ============================================================ */

export function resolveLayout(
  layout?: LayoutTokens,
  globalLayout?: LayoutTokens
) {
  const merged = { ...(globalLayout ?? {}), ...(layout ?? {}) } as LayoutTokens;

  return {
    container: (merged.container ?? "7xl") as Container,
    density: (merged.density ?? ("normal" as any)) as Density,
    radius: (merged.radius ?? (24 as any)) as Radius,
  };
}

export function containerClass(container?: Container) {
  const base = "mx-auto w-full px-4 sm:px-6 lg:px-8";
  switch (container) {
    case "5xl":
      return cx(base, "max-w-5xl");
    case "6xl":
      return cx(base, "max-w-6xl");
    case "full":
      return cx("w-full px-4 sm:px-6 lg:px-8");
    case "7xl":
    default:
      return cx(base, "max-w-7xl");
  }
}

export function sectionPadY(density?: Density) {
  switch (String(density ?? "normal")) {
    case "compact":
      return "py-10 md:py-12";
    case "spacious":
      return "py-20 md:py-28";
    default:
      return "py-14 md:py-20";
  }
}

export function heroPadY(density?: Density) {
  switch (String(density ?? "normal")) {
    case "compact":
      return "pt-12 md:pt-16 pb-10 md:pb-14";
    case "spacious":
      return "pt-20 md:pt-28 pb-16 md:pb-20";
    default:
      return "pt-16 md:pt-22 pb-12 md:pb-16";
  }
}

export function radiusClass(radius?: any) {
  const r = Number(radius);
  if (r === 16) return "rounded-2xl";
  if (r === 24) return "rounded-3xl";
  if (r === 32) return "rounded-[32px]";
  return "rounded-3xl";
}

export function radiusStyle(radius?: any): React.CSSProperties | undefined {
  const n = typeof radius === "number" ? radius : Number(radius);
  if (Number.isFinite(n) && n >= 0) return { borderRadius: `${n}px` };
  return { borderRadius: "24px" };
}
