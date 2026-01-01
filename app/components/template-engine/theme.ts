// app/components/template-engine/theme.ts
import React from "react";
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

export type ThemeVariant = string;
export type CanvasStyle = "classic" | "immersive";

export type ThemeLike = {
  bgPage: string;
  text: string;

  accentFrom: string;
  accentTo: string;

  surfaceBg: string;
  surfaceBorder: string;

  isDark: boolean;

  // ✅ immersive plumbing (used by header + main wrapper)
  canvasStyle?: CanvasStyle;
  canvasVar?: React.CSSProperties;
};

type AccentDef = { accentFrom: string; accentTo: string };

type CanvasDef = {
  bgPage: string;
  isDark: boolean;

  // classic defaults
  surfaceBg?: string;
  surfaceBorder?: string;

  // immersive tuned surfaces (optional)
  immersiveSurfaceBg?: string;
  immersiveSurfaceBorder?: string;

  // optional extra "universe" feel
  immersiveBgExtra?: string;

  // ✅ for header immersive backgroundColor + CSS var
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

  pearl: {
    bgPage: "bg-[#F7F8FB]",
    isDark: false,
    surfaceBg: "bg-white/90",
    surfaceBorder: "border-slate-200/70",
    immersiveSurfaceBg: "bg-white/78",
    immersiveSurfaceBorder: "border-slate-200/50",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(99,102,241,0.10),transparent_55%),radial-gradient(1000px_700px_at_80%_20%,rgba(14,165,233,0.10),transparent_55%)]",
    canvasHex: "#F7F8FB",
  },

  sand: {
    bgPage: "bg-[#FBF7F1]",
    isDark: false,
    surfaceBg: "bg-white/88",
    surfaceBorder: "border-amber-200/40",
    immersiveSurfaceBg: "bg-white/72",
    immersiveSurfaceBorder: "border-amber-200/30",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(245,158,11,0.12),transparent_58%),radial-gradient(900px_700px_at_90%_25%,rgba(16,185,129,0.10),transparent_55%)]",
    canvasHex: "#FBF7F1",
  },

  frost: {
    bgPage: "bg-[#F4F7FB]",
    isDark: false,
    surfaceBg: "bg-white/88",
    surfaceBorder: "border-sky-200/40",
    immersiveSurfaceBg: "bg-white/72",
    immersiveSurfaceBorder: "border-sky-200/30",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_650px_at_30%_0%,rgba(56,189,248,0.14),transparent_55%),radial-gradient(900px_700px_at_85%_25%,rgba(99,102,241,0.10),transparent_55%)]",
    canvasHex: "#F4F7FB",
  },

  paper: {
    bgPage: "bg-[#FAF9F7]",
    isDark: false,
    surfaceBg: "bg-white/92",
    surfaceBorder: "border-slate-200/60",
    immersiveSurfaceBg: "bg-white/78",
    immersiveSurfaceBorder: "border-slate-200/45",
    immersiveBgExtra:
      "bg-[radial-gradient(1100px_650px_at_25%_0%,rgba(244,63,94,0.08),transparent_60%),radial-gradient(900px_650px_at_85%_25%,rgba(59,130,246,0.10),transparent_55%)]",
    canvasHex: "#FAF9F7",
  },

  porcelain: {
    bgPage: "bg-[#F6F7FB]",
    isDark: false,
    canvasHex: "#F6F7FB",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_20%_0%,rgba(99,102,241,0.10),transparent_55%),radial-gradient(1000px_700px_at_85%_20%,rgba(56,189,248,0.10),transparent_55%)]",
  },

  cloud: {
    bgPage: "bg-[#F3F6FA]",
    isDark: false,
    canvasHex: "#F3F6FA",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_25%_0%,rgba(14,165,233,0.12),transparent_58%),radial-gradient(900px_650px_at_85%_25%,rgba(148,163,184,0.10),transparent_60%)]",
  },

  latte: {
    bgPage: "bg-[#F6EFE6]",
    isDark: false,
    canvasHex: "#F6EFE6",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_22%_0%,rgba(245,158,11,0.12),transparent_58%),radial-gradient(950px_650px_at_88%_22%,rgba(168,85,247,0.08),transparent_60%)]",
  },

  sage: {
    bgPage: "bg-[#EAF3EE]",
    isDark: false,
    canvasHex: "#EAF3EE",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_22%_0%,rgba(16,185,129,0.12),transparent_58%),radial-gradient(950px_650px_at_88%_22%,rgba(34,211,238,0.08),transparent_60%)]",
  },

  clay: {
    bgPage: "bg-[#F3E8E4]",
    isDark: false,
    canvasHex: "#F3E8E4",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_20%_0%,rgba(244,63,94,0.10),transparent_60%),radial-gradient(950px_650px_at_86%_22%,rgba(245,158,11,0.10),transparent_60%)]",
  },

  lilac: {
    bgPage: "bg-[#F2EEFB]",
    isDark: false,
    canvasHex: "#F2EEFB",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_20%_0%,rgba(168,85,247,0.12),transparent_58%),radial-gradient(950px_650px_at_86%_22%,rgba(59,130,246,0.10),transparent_60%)]",
  },

  warm: {
    bgPage: "bg-amber-50",
    isDark: false,
    surfaceBg: "bg-white",
    surfaceBorder: "border-slate-200",
    canvasHex: "#FFFBEB",
  },
  cool: {
    bgPage: "bg-slate-50",
    isDark: false,
    surfaceBg: "bg-white",
    surfaceBorder: "border-slate-200",
    canvasHex: "#F8FAFC",
  },
  forest: {
    bgPage: "bg-emerald-50",
    isDark: false,
    surfaceBg: "bg-white",
    surfaceBorder: "border-slate-200",
    canvasHex: "#ECFDF5",
  },
  sunset: {
    bgPage: "bg-orange-50",
    isDark: false,
    surfaceBg: "bg-white",
    surfaceBorder: "border-slate-200",
    canvasHex: "#FFF7ED",
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
    canvasHex: "#0b0b0c",
  },

  midnight: {
    bgPage: "bg-[#060B1A]",
    isDark: true,
    surfaceBg: "bg-white/6",
    surfaceBorder: "border-white/12",
    immersiveSurfaceBg: "bg-white/7",
    immersiveSurfaceBorder: "border-white/14",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_25%_0%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(900px_700px_at_85%_20%,rgba(34,211,238,0.10),transparent_55%)]",
    canvasHex: "#060B1A",
  },

  graphite: {
    bgPage: "bg-[#0B0F14]",
    isDark: true,
    surfaceBg: "bg-white/5",
    surfaceBorder: "border-white/10",
    immersiveSurfaceBg: "bg-white/6",
    immersiveSurfaceBorder: "border-white/12",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_25%_0%,rgba(16,185,129,0.10),transparent_55%),radial-gradient(900px_700px_at_85%_20%,rgba(245,158,11,0.08),transparent_55%)]",
    canvasHex: "#0B0F14",
  },

  studio: {
    bgPage: "bg-[#070A0F]",
    isDark: true,
    surfaceBg: "bg-white/7",
    surfaceBorder: "border-white/12",
    immersiveSurfaceBg: "bg-white/8",
    immersiveSurfaceBorder: "border-white/14",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_25%_0%,rgba(236,72,153,0.10),transparent_55%),radial-gradient(900px_700px_at_85%_20%,rgba(59,130,246,0.10),transparent_55%)]",
    canvasHex: "#070A0F",
  },

  obsidian: {
    bgPage: "bg-[#05070B]",
    isDark: true,
    surfaceBg: "bg-white/6",
    surfaceBorder: "border-white/12",
    immersiveSurfaceBg: "bg-white/8",
    immersiveSurfaceBorder: "border-white/16",
    immersiveBgExtra:
      "bg-[radial-gradient(1100px_700px_at_20%_0%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(900px_700px_at_80%_22%,rgba(34,211,238,0.10),transparent_55%)]",
    canvasHex: "#05070B",
  },

  neon: {
    bgPage: "bg-[#05050A]",
    isDark: true,
    surfaceBg: "bg-white/6",
    surfaceBorder: "border-white/12",
    immersiveSurfaceBg: "bg-white/7",
    immersiveSurfaceBorder: "border-white/14",
    immersiveBgExtra:
      "bg-[radial-gradient(900px_700px_at_18%_0%,rgba(34,211,238,0.22),transparent_58%),radial-gradient(900px_700px_at_82%_18%,rgba(232,121,249,0.22),transparent_58%),radial-gradient(1200px_900px_at_50%_120%,rgba(99,102,241,0.12),transparent_60%)]",
    canvasHex: "#05050A",
  },

  aurora: {
    bgPage: "bg-[#041012]",
    isDark: true,
    surfaceBg: "bg-white/6",
    surfaceBorder: "border-white/12",
    immersiveSurfaceBg: "bg-white/7",
    immersiveSurfaceBorder: "border-white/14",
    immersiveBgExtra:
      "bg-[radial-gradient(1100px_800px_at_20%_-10%,rgba(52,211,153,0.22),transparent_60%),radial-gradient(1100px_800px_at_90%_0%,rgba(34,211,238,0.20),transparent_60%),radial-gradient(1200px_900px_at_50%_120%,rgba(16,185,129,0.10),transparent_62%)]",
    canvasHex: "#041012",
  },

  volcano: {
    bgPage: "bg-[#120608]",
    isDark: true,
    surfaceBg: "bg-white/6",
    surfaceBorder: "border-white/12",
    immersiveSurfaceBg: "bg-white/7",
    immersiveSurfaceBorder: "border-white/14",
    immersiveBgExtra:
      "bg-[radial-gradient(1100px_800px_at_20%_-10%,rgba(251,146,60,0.26),transparent_60%),radial-gradient(1100px_800px_at_90%_0%,rgba(244,63,94,0.22),transparent_60%),radial-gradient(1200px_900px_at_50%_120%,rgba(245,158,11,0.10),transparent_62%)]",
    canvasHex: "#120608",
  },

  cyber: {
    bgPage: "bg-[#03110A]",
    isDark: true,
    surfaceBg: "bg-white/6",
    surfaceBorder: "border-white/12",
    immersiveSurfaceBg: "bg-white/7",
    immersiveSurfaceBorder: "border-white/14",
    immersiveBgExtra:
      "bg-[radial-gradient(1100px_800px_at_20%_-10%,rgba(163,230,53,0.22),transparent_60%),radial-gradient(1100px_800px_at_90%_0%,rgba(34,211,238,0.20),transparent_60%),radial-gradient(1200px_900px_at_50%_120%,rgba(132,204,22,0.10),transparent_62%)]",
    canvasHex: "#03110A",
  },

  broken: {
    bgPage: "bg-[#07070A]",
    isDark: true,
    surfaceBg: "bg-white/5",
    surfaceBorder: "border-white/14",
    immersiveSurfaceBg: "bg-white/6",
    immersiveSurfaceBorder: "border-white/16",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_900px_at_35%_0%,rgba(255,0,64,0.12),transparent_60%),radial-gradient(1200px_900px_at_75%_20%,rgba(0,255,208,0.10),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_30%,rgba(255,255,255,0.02))]",
    canvasHex: "#07070A",
  },
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
          accent: String(arg.accent ?? "amberOrange"),
          canvas: String(arg.canvas ?? "classic"),
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
  const extra = immersive ? canvas.immersiveBgExtra : undefined;
  const bgPage = extra ? cx(baseBg, extra) : baseBg;

  const canvasHex = canvas.canvasHex ?? (isDark ? "#0b0b0c" : "#ffffff");

  const canvasVar = {
    ["--te-canvas" as any]: canvasHex,

    ["--te-surface" as any]: isDark
      ? immersive
        ? "color-mix(in srgb, var(--te-canvas, #0b0b0c) 88%, white 12%)"
        : "color-mix(in srgb, var(--te-canvas, #0b0b0c) 92%, white 8%)"
      : immersive
      ? "color-mix(in srgb, var(--te-canvas, #ffffff) 70%, white 30%)"
      : "color-mix(in srgb, var(--te-canvas, #ffffff) 78%, white 22%)",

    ["--te-surface-2" as any]: isDark
      ? immersive
        ? "color-mix(in srgb, var(--te-canvas, #0b0b0c) 84%, white 16%)"
        : "color-mix(in srgb, var(--te-canvas, #0b0b0c) 88%, white 12%)"
      : immersive
      ? "color-mix(in srgb, var(--te-canvas, #ffffff) 62%, white 38%)"
      : "color-mix(in srgb, var(--te-canvas, #ffffff) 70%, white 30%)",

    ["--te-surface-border" as any]: isDark
      ? immersive
        ? "color-mix(in srgb, var(--te-canvas, #0b0b0c) 76%, white 24%)"
        : "color-mix(in srgb, var(--te-canvas, #0b0b0c) 80%, white 20%)"
      : immersive
      ? "color-mix(in srgb, var(--te-canvas, #ffffff) 86%, black 14%)"
      : "color-mix(in srgb, var(--te-canvas, #ffffff) 90%, black 10%)",
  } as React.CSSProperties;

  const surfaceBg = isDark
    ? immersive
      ? canvas.immersiveSurfaceBg ?? "bg-white/7"
      : canvas.surfaceBg ?? "bg-white/6"
    : "bg-[color:var(--te-surface)]";

  const surfaceBorder = isDark
    ? immersive
      ? canvas.immersiveSurfaceBorder ?? "border-white/14"
      : canvas.surfaceBorder ?? "border-white/12"
    : "border-[color:var(--te-surface-border)]";

  return {
    bgPage,
    text,
    accentFrom: accent.accentFrom,
    accentTo: accent.accentTo,
    surfaceBg,
    surfaceBorder,
    isDark,
    canvasStyle: immersive ? "immersive" : "classic",
    canvasVar,
  };
}

/* ============================================================
   LAYOUT TOKENS
   ============================================================ */

export function resolveLayout(layout?: LayoutTokens, globalLayout?: LayoutTokens) {
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
