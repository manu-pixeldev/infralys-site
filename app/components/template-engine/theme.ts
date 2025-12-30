// app/components/template-engine/theme.ts
import type { LayoutTokens, Container, Density, Radius } from "../../template-base/template.config";

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

  // optional extra "universe" feel (applied as additional class on bgPage)
  immersiveBgExtra?: string;
};

const ACCENTS: Record<string, AccentDef> = {
  amberOrange: { accentFrom: "from-amber-500", accentTo: "to-orange-500" },
  emeraldTeal: { accentFrom: "from-emerald-500", accentTo: "to-teal-500" },
  blueRed: { accentFrom: "from-sky-500", accentTo: "to-rose-500" },
  purplePink: { accentFrom: "from-purple-500", accentTo: "to-pink-500" },
  slateIndigo: { accentFrom: "from-indigo-500", accentTo: "to-slate-700" },

  // dark accents
  monoDark: { accentFrom: "from-cyan-400", accentTo: "to-blue-500" },
  monoDarkRose: { accentFrom: "from-fuchsia-400", accentTo: "to-rose-500" },
  monoDarkGold: { accentFrom: "from-amber-300", accentTo: "to-yellow-500" },
  monoDarkLime: { accentFrom: "from-lime-300", accentTo: "to-emerald-400" },
};

const ALIASES: Record<string, string> = {
  blueSky: "blueRed",
  rosePink: "purplePink",
  violetIndigo: "slateIndigo",
  slateMono: "monoDark",
};

const CANVAS: Record<string, CanvasDef> = {
  // ----------------
  // LIGHT (classic)
  // ----------------
  classic: { bgPage: "bg-slate-50", isDark: false, surfaceBg: "bg-white", surfaceBorder: "border-slate-200" },

  // premium light (plus “matière”, moins plat)
  pearl: {
    bgPage: "bg-[#F7F8FB]",
    isDark: false,
    surfaceBg: "bg-white/90",
    surfaceBorder: "border-slate-200/70",
    immersiveSurfaceBg: "bg-white/78",
    immersiveSurfaceBorder: "border-slate-200/50",
    immersiveBgExtra: "bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(99,102,241,0.10),transparent_55%),radial-gradient(1000px_700px_at_80%_20%,rgba(14,165,233,0.10),transparent_55%)]",
  },
  sand: {
    bgPage: "bg-[#FBF7F1]",
    isDark: false,
    surfaceBg: "bg-white/88",
    surfaceBorder: "border-amber-200/40",
    immersiveSurfaceBg: "bg-white/72",
    immersiveSurfaceBorder: "border-amber-200/30",
    immersiveBgExtra: "bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(245,158,11,0.12),transparent_58%),radial-gradient(900px_700px_at_90%_25%,rgba(16,185,129,0.10),transparent_55%)]",
  },
  frost: {
    bgPage: "bg-[#F4F7FB]",
    isDark: false,
    surfaceBg: "bg-white/88",
    surfaceBorder: "border-sky-200/40",
    immersiveSurfaceBg: "bg-white/72",
    immersiveSurfaceBorder: "border-sky-200/30",
    immersiveBgExtra: "bg-[radial-gradient(1200px_650px_at_30%_0%,rgba(56,189,248,0.14),transparent_55%),radial-gradient(900px_700px_at_85%_25%,rgba(99,102,241,0.10),transparent_55%)]",
  },
  paper: {
    bgPage: "bg-[#FAF9F7]",
    isDark: false,
    surfaceBg: "bg-white/92",
    surfaceBorder: "border-slate-200/60",
    immersiveSurfaceBg: "bg-white/78",
    immersiveSurfaceBorder: "border-slate-200/45",
    immersiveBgExtra: "bg-[radial-gradient(1100px_650px_at_25%_0%,rgba(244,63,94,0.08),transparent_60%),radial-gradient(900px_650px_at_85%_25%,rgba(59,130,246,0.10),transparent_55%)]",
  },

  // legacy light variants (still here)
  warm: { bgPage: "bg-amber-50", isDark: false, surfaceBg: "bg-white", surfaceBorder: "border-slate-200" },
  cool: { bgPage: "bg-slate-50", isDark: false, surfaceBg: "bg-white", surfaceBorder: "border-slate-200" },
  forest: { bgPage: "bg-emerald-50", isDark: false, surfaceBg: "bg-white", surfaceBorder: "border-slate-200" },
  sunset: { bgPage: "bg-orange-50", isDark: false, surfaceBg: "bg-white", surfaceBorder: "border-slate-200" },

  // ----------------
  // DARK (classic)
  // ----------------
  charcoal: {
    bgPage: "bg-slate-950",
    isDark: true,
    surfaceBg: "bg-white/5",
    surfaceBorder: "border-white/10",
    immersiveSurfaceBg: "bg-white/6",
    immersiveSurfaceBorder: "border-white/12",
    immersiveBgExtra:
      "bg-[radial-gradient(1200px_700px_at_20%_0%,rgba(56,189,248,0.10),transparent_55%),radial-gradient(900px_700px_at_80%_20%,rgba(168,85,247,0.10),transparent_55%)]",
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
  },

  // “ultra” dark (plus contrast, plus “premium”)
  obsidian: {
    bgPage: "bg-[#05070B]",
    isDark: true,
    surfaceBg: "bg-white/6",
    surfaceBorder: "border-white/12",
    immersiveSurfaceBg: "bg-white/8",
    immersiveSurfaceBorder: "border-white/16",
    immersiveBgExtra:
      "bg-[radial-gradient(1100px_700px_at_20%_0%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(900px_700px_at_80%_22%,rgba(34,211,238,0.10),transparent_55%)]",
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

  // legacy: single key might be a canvas
  if (CANVAS[raw]) return { accent: "amberOrange", canvas: raw };
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
    typeof arg === "object" && arg ? (String((arg as any).style || "classic") as CanvasStyle) : "classic";

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

  const surfaceBg = immersive
    ? canvas.immersiveSurfaceBg ?? (isDark ? "bg-white/6" : "bg-white/72")
    : canvas.surfaceBg ?? (isDark ? "bg-white/5" : "bg-white");

  const surfaceBorder = immersive
    ? canvas.immersiveSurfaceBorder ?? (isDark ? "border-white/12" : "border-slate-200/50")
    : canvas.surfaceBorder ?? (isDark ? "border-white/10" : "border-slate-200");

  return {
    bgPage,
    text,
    accentFrom: accent.accentFrom,
    accentTo: accent.accentTo,
    surfaceBg,
    surfaceBorder,
    isDark,
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
      return "py-8 md:py-10";
    case "spacious":
      return "py-20 md:py-24";
    default:
      return "py-12 md:py-16";
  }
}

export function heroPadY(density?: Density) {
  switch (String(density ?? "normal")) {
    case "compact":
      return "pt-10 md:pt-12 pb-10 md:pb-12";
    case "spacious":
      return "pt-16 md:pt-20 pb-14 md:pb-18";
    default:
      return "pt-12 md:pt-14 pb-10 md:pb-12";
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
