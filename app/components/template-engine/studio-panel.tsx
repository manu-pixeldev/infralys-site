// app/components/template-engine/studio-panel.tsx
"use client";

import React from "react";
import type { TemplateConfigInput } from "./types";
import type { ThemeLike } from "./theme";

import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { VARIANTS, VARIANTS_BY_TYPE } from "./variants";
import type { SocialKind } from "./socials";
import { SOCIAL_DEFS } from "./socials";

/** Theme pickers (ACCENTS = gradients only) */
const ACCENTS = [
  "amberOrange",
  "emeraldTeal",
  "blueRed",
  "purplePink",
  "slateIndigo",
  "monoDark",
  "monoDarkRose",
  "monoDarkGold",
  "monoDarkLime",

  // 🔥 FUTUR / FX accents
  "neon",
  "aurora",
  "volcano",
  "cyber",
] as const;

/** CANVAS = full page univers */
const CANVAS = [
  // light
  "classic",
  "pearl",
  "paper",
  "frost",
  "sand",

  // ✅ LIGHT SIGNATURE (V14)
  "porcelain",
  "cloud",
  "latte",
  "sage",
  "clay",
  "lilac",

  // legacy light
  "warm",
  "cool",
  "forest",
  "sunset",

  // dark classic
  "charcoal",
  "midnight",
  "graphite",
  "studio",
  "obsidian",

  // 🔥 GLOBAL UNIVERSE (immersive only)
  "neon",
  "aurora",
  "volcano",
  "cyber",

  // 🤡 fun
  "broken",
] as const;

const SIGNATURE_CANVAS = new Set([
  "porcelain",
  "cloud",
  "latte",
  "sage",
  "clay",
  "lilac",
]);

const CONTAINERS = ["5xl", "6xl", "7xl", "full"] as const;
const DENSITIES = ["compact", "normal", "spacious"] as const;
const RADII = [16, 24, 32] as const;

const LOGO_MODES = ["logoPlusText", "logoOnly", "textOnly"] as const;

type DockSide = "left" | "right";
type CanvasStyle = "classic" | "immersive";
type AutoAccentMode = "off" | "muted" | "vivid";

/* ------------------------ utils ------------------------ */

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function clone<T>(v: T): T {
  if (typeof (globalThis as any).structuredClone === "function")
    return (globalThis as any).structuredClone(v);
  return JSON.parse(JSON.stringify(v));
}

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return ((i % len) + len) % len;
}

function parseThemeVariant(v?: string) {
  const raw = String(v ?? "amberOrange|classic").trim();
  const [a, c] = raw.includes("|") ? raw.split("|") : [raw, "classic"];
  return {
    accent: (a || "amberOrange").trim(),
    canvas: (c || "classic").trim(),
  };
}

function joinThemeVariant(accent: string, canvas: string) {
  return `${accent}|${canvas}`;
}

function nextId(sections: any[], base: string) {
  const used = new Set(sections.map((s) => String(s.id)));
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

function cycleInList(current: string, list: readonly string[], dir: -1 | 1) {
  if (!list.length) return current;
  const idx = list.indexOf(current);
  const i = idx >= 0 ? idx : 0;
  return list[(i + dir + list.length) % list.length];
}

function isTypingTarget(el: any) {
  const tag = String(el?.tagName ?? "").toLowerCase();
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    !!el?.isContentEditable
  );
}

/** ✅ Digits only + strip leading zeros (so "03" -> "3") */
function normalizeDigitString(v: string) {
  const raw = String(v ?? "").replace(/[^\d]/g, "");
  if (!raw) return "";
  // keep single "0", but remove leading zeros otherwise
  return raw.replace(/^0+(?=\d)/, "");
}

/**
 * ✅ Robust variants resolver:
 * - Prefer VARIANTS_BY_TYPE (explicit ordering)
 * - Fallback to Object.keys(VARIANTS[type]) if BY_TYPE is stale/incorrect
 * - Stable ordering for header: A..K then PRO
 */
function getVariantOptions(type: string): readonly string[] | null {
  const t = String(type || "").trim();
  const byType = (VARIANTS_BY_TYPE as any)?.[t] as
    | readonly string[]
    | undefined;

  if (Array.isArray(byType) && byType.length) return byType;

  const reg = (VARIANTS as any)?.[t];
  if (!reg) return null;

  const keys = Object.keys(reg);
  if (!keys.length) return null;

  if (t === "header") {
    const order = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "PRO",
    ];
    const rank = new Map(order.map((v, i) => [v, i]));
    keys.sort((a, b) => {
      const ra = rank.get(a) ?? 999;
      const rb = rank.get(b) ?? 999;
      if (ra !== rb) return ra - rb;
      return String(a).localeCompare(String(b));
    });
    return keys;
  }

  keys.sort((a, b) => String(a).localeCompare(String(b)));
  return keys;
}

/** Very small color helpers */
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

/**
 * Extract a dominant-ish color from an image via canvas sampling.
 * If CORS blocks -> throws -> caller should fallback safely.
 */
async function extractDominantRgb(
  src: string
): Promise<{ r: number; g: number; b: number } | null> {
  if (!src) return null;

  const img = new Image();
  img.crossOrigin = "anonymous";

  const p = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("image load failed"));
  });

  img.src = src;
  await p;

  const w = Math.max(8, Math.min(64, img.naturalWidth || 64));
  const h = Math.max(8, Math.min(64, img.naturalHeight || 64));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, w, h);

  const data = ctx.getImageData(0, 0, w, h).data;

  let rSum = 0,
    gSum = 0,
    bSum = 0,
    count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 60) continue;
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum > 245) continue;
    if (lum < 10) continue;

    rSum += r;
    gSum += g;
    bSum += b;
    count++;
  }

  if (!count) return null;
  return {
    r: Math.round(rSum / count),
    g: Math.round(gSum / count),
    b: Math.round(bSum / count),
  };
}

function pickAccentFromHsl(
  h: number,
  s: number,
  l: number,
  mode: AutoAccentMode
): (typeof ACCENTS)[number] {
  if (s < 0.18) {
    if (l < 0.35) return "monoDark";
    return mode === "vivid" ? "slateIndigo" : "monoDark";
  }

  const hue = h;

  if (mode === "muted") {
    if (hue >= 90 && hue <= 170) return "emeraldTeal";
    if (hue >= 200 && hue <= 260) return "slateIndigo";
    if (hue >= 260 && hue <= 330) return "monoDarkRose";
    if (hue >= 20 && hue <= 70) return "monoDarkGold";
    return "monoDark";
  }

  if (hue >= 90 && hue <= 170) return "emeraldTeal";
  if (hue >= 200 && hue <= 260) return "slateIndigo";
  if (hue >= 260 && hue <= 330) return "purplePink";
  if (hue >= 20 && hue <= 70) return "amberOrange";
  return "blueRed";
}

function IconBtn({
  title,
  onClick,
  children,
  disabled,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "h-10 w-10 rounded-2xl border text-sm font-semibold",
        disabled
          ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

function allSocialKinds(): SocialKind[] {
  return Object.keys(SOCIAL_DEFS) as SocialKind[];
}

/* ------------------------ sections card ------------------------ */

function SectionCard({
  s,
  onToggleEnabled,
  onChangeVariant,
  onRemove,
  onFocusCard,
}: {
  s: any;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onChangeVariant: (id: string, variant: string) => void;
  onRemove: (id: string) => void;
  onFocusCard: (id: string) => void;
}) {
  const locked = s.lock === true;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: s.id,
    disabled: locked,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const opts = (getVariantOptions(String(s.type)) ?? null) as
    | readonly string[]
    | null;

  const current = String(s.variant ?? "A");
  const value = opts && opts.includes(current) ? current : opts?.[0] ?? current;

  const canDelete = !locked && String(s.type) === "split";

  const cycle = (dir: -1 | 1) => {
    if (!opts?.length) return;
    onChangeVariant(String(s.id), cycleInList(value, opts, dir));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      tabIndex={0}
      onFocus={() => onFocusCard(String(s.id))}
      onPointerDown={() => onFocusCard(String(s.id))}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          cycle(-1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          cycle(1);
        }
      }}
      className={cx(
        "rounded-3xl border border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-slate-300",
        isDragging && "opacity-70 ring-2 ring-slate-300"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cx(
                "inline-flex h-9 w-9 items-center justify-center rounded-2xl border text-xs font-semibold",
                locked
                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-grab active:cursor-grabbing"
              )}
              title={locked ? "Section verrouillée" : "Glisser pour réordonner"}
              {...attributes}
              {...listeners}
              disabled={locked}
            >
              ⠿
            </button>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {s.title ?? s.type}
              </div>
              <div className="truncate text-xs text-slate-500">
                {s.type} — {s.id}
                {locked ? " — lock" : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canDelete ? (
            <button
              type="button"
              onClick={() => onRemove(String(s.id))}
              className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Supprimer cette section split"
            >
              🗑
            </button>
          ) : null}

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            ON
            <input
              type="checkbox"
              checked={s.enabled !== false}
              onChange={(e) => onToggleEnabled(s.id, e.target.checked)}
              disabled={locked}
            />
          </label>
        </div>
      </div>

      <div className="mt-3">
        {opts ? (
          <div className="flex items-center gap-2">
            <IconBtn
              title="Variant précédent (←)"
              onClick={() => cycle(-1)}
              disabled={!opts?.length}
            >
              ◀
            </IconBtn>

            <select
              value={value}
              onChange={(e) => onChangeVariant(s.id, e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              title="Variant"
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  cycle(-1);
                }
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  cycle(1);
                }
              }}
            >
              {opts.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <IconBtn
              title="Variant suivant (→)"
              onClick={() => cycle(1)}
              disabled={!opts?.length}
            >
              ▶
            </IconBtn>
          </div>
        ) : (
          <input
            value={current}
            onChange={(e) => onChangeVariant(s.id, e.target.value)}
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            placeholder="variant (ex: A, B, stats...)"
          />
        )}

        {opts?.length ? (
          <div className="mt-2 text-[11px] text-slate-500">
            Tip: clique la carte puis utilise{" "}
            <span className="font-semibold">←</span>/
            <span className="font-semibold">→</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------ main ------------------------ */

export function StudioPanel({
  config,
  setConfig,
  theme,
}: {
  config: TemplateConfigInput;
  setConfig: React.Dispatch<React.SetStateAction<TemplateConfigInput>>;
  theme?: ThemeLike;
}) {
  const themeVariantRaw =
    (config as any)?.options?.themeVariant ?? "amberOrange|classic";
  const { accent, canvas } = parseThemeVariant(themeVariantRaw);

  const ui = (config as any)?.options?.studio?.ui ?? {};
  const dock: DockSide = (ui.dock ?? "right") as DockSide;
  const minimized = !!ui.minimized;

  const studioEnabled = !!(config as any)?.options?.studio?.enabled;
  const canvasStyle: CanvasStyle =
    (((config as any)?.options?.canvasStyle ?? "classic") as CanvasStyle) ||
    "classic";

  const autoAccentMode: AutoAccentMode =
    (((config as any)?.options?.autoAccentMode ?? "off") as AutoAccentMode) ||
    "off";

  const update = (fn: (draft: any) => any) =>
    setConfig((prev) => fn(clone(prev)));

  const setStudioUi = (
    patch: Partial<{ dock: DockSide; minimized: boolean }>
  ) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.studio = d.options.studio ?? {};
      d.options.studio.ui = d.options.studio.ui ?? {};
      Object.assign(d.options.studio.ui, patch);
      return d;
    });

  const toggleDock = () =>
    setStudioUi({ dock: dock === "right" ? "left" : "right" });
  const toggleMinimize = () => setStudioUi({ minimized: !minimized });

  const setStudioEnabled = (v: boolean) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.studio = d.options.studio ?? {};
      d.options.studio.enabled = v;
      return d;
    });

  const accentIndex = Math.max(
    0,
    (ACCENTS as readonly string[]).indexOf(accent)
  );
  const canvasIndex = Math.max(
    0,
    (CANVAS as readonly string[]).indexOf(canvas)
  );

  const setThemeVariant = (nextAccent: string, nextCanvas: string) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.themeVariant = joinThemeVariant(nextAccent, nextCanvas);
      return d;
    });

  const cycleAccent = (dir: -1 | 1) => {
    const next = ACCENTS[clampIndex(accentIndex + dir, ACCENTS.length)];
    setThemeVariant(next, canvas);
  };

  const cycleCanvas = (dir: -1 | 1) => {
    const next = CANVAS[clampIndex(canvasIndex + dir, CANVAS.length)];
    setThemeVariant(accent, next);
  };

  const setCanvasStyle = (style: CanvasStyle) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.canvasStyle = style;
      return d;
    });

  const setAutoAccentMode = (mode: AutoAccentMode) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.autoAccentMode = mode;
      return d;
    });

  // refs for keyboard focus-aware theme controls
  const accentSelectRef = React.useRef<HTMLSelectElement>(null);
  const canvasSelectRef = React.useRef<HTMLSelectElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);

  const [activeScope, setActiveScope] = React.useState<
    null | "accent" | "canvas"
  >(null);
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(
    null
  );

  // ✅ Auto accent effect (guarded)
  const lastAutoRef = React.useRef<{
    src: string;
    mode: AutoAccentMode;
    applied: string;
  } | null>(null);
  const logoSrc = String((config as any)?.brand?.logo?.src ?? "");
  React.useEffect(() => {
    if (autoAccentMode === "off") return;
    if (!logoSrc) return;

    const key = { src: logoSrc, mode: autoAccentMode };
    const last = lastAutoRef.current;
    if (
      last &&
      last.src === key.src &&
      last.mode === key.mode &&
      last.applied === accent
    ) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const rgb = await extractDominantRgb(logoSrc);
        if (cancelled || !rgb) return;

        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const picked = pickAccentFromHsl(hsl.h, hsl.s, hsl.l, autoAccentMode);

        if (cancelled) return;
        if (picked && picked !== accent) {
          setThemeVariant(picked, canvas);
          lastAutoRef.current = {
            src: logoSrc,
            mode: autoAccentMode,
            applied: picked,
          };
        } else {
          lastAutoRef.current = {
            src: logoSrc,
            mode: autoAccentMode,
            applied: accent,
          };
        }
      } catch {
        lastAutoRef.current = {
          src: logoSrc,
          mode: autoAccentMode,
          applied: accent,
        };
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoSrc, autoAccentMode, canvas, accent]);

  // ---------------------------
  // ✅ NAV (max direct links) — read + write (single source of truth)
  // ---------------------------
  const maxDirect = Number(
    (config as any)?.options?.nav?.maxDirectLinksInMenu ??
      (config as any)?.options?.maxDirectLinksInMenu ??
      (config as any)?.options?.maxDirectLinks ??
      (config as any)?.content?.nav?.maxDirectLinksInMenu ??
      (config as any)?.content?.nav?.maxDirectLinks ??
      4
  );

  const setMaxDirect = (n: number) =>
    update((d) => {
      const v = Math.max(0, Math.min(12, Number.isFinite(n) ? n : 4));

      d.options = d.options ?? {};
      d.options.nav = d.options.nav ?? {};
      d.content = d.content ?? {};
      d.content.nav = d.content.nav ?? {};

      // ✅ source propre (future)
      d.options.nav.maxDirectLinksInMenu = v;

      // ✅ compat legacy / fallbacks existants
      d.options.maxDirectLinksInMenu = v;
      d.options.maxDirectLinks = v;
      d.content.nav.maxDirectLinksInMenu = v;
      d.content.nav.maxDirectLinks = v;

      return d;
    });

  // ✅ Draft string (allow empty while typing + strip leading zeros)
  const [maxDirectDraft, setMaxDirectDraft] = React.useState<string>(
    String(maxDirect)
  );

  React.useEffect(() => {
    setMaxDirectDraft(String(maxDirect));
  }, [maxDirect]);

  // ---------------------------
  // ✅ LAYOUT tokens
  // ---------------------------
  const currentContainer = ((config as any)?.options?.layout?.container ??
    "7xl") as (typeof CONTAINERS)[number];

  const currentDensity = ((config as any)?.options?.layout?.density ??
    "normal") as (typeof DENSITIES)[number];

  const currentRadius = Number(
    (config as any)?.options?.layout?.radius ?? 24
  ) as (typeof RADII)[number] | number;

  const setLayoutToken = (
    key: "container" | "density" | "radius",
    value: any
  ) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.layout = { ...(d.options.layout ?? {}), [key]: value };
      return d;
    });

  // ---------------------------
  // ✅ BRAND
  // ---------------------------
  const currentLogoMode = ((config as any)?.brand?.logo?.mode ??
    "logoPlusText") as (typeof LOGO_MODES)[number];

  const setLogoMode = (mode: (typeof LOGO_MODES)[number]) =>
    update((d) => {
      d.brand = d.brand ?? {};
      d.brand.logo = d.brand.logo ?? {};
      d.brand.logo.mode = mode;
      return d;
    });

  const setLogoSrc = (src: string) =>
    update((d) => {
      d.brand = d.brand ?? {};
      d.brand.logo = d.brand.logo ?? {};
      d.brand.logo.src = src;
      return d;
    });

  const setLogoW = (w: number) =>
    update((d) => {
      d.brand = d.brand ?? {};
      d.brand.logo = d.brand.logo ?? {};
      d.brand.logo.width = Math.max(
        24,
        Math.min(512, Number.isFinite(w) ? w : 80)
      );
      return d;
    });

  const setLogoH = (h: number) =>
    update((d) => {
      d.brand = d.brand ?? {};
      d.brand.logo = d.brand.logo ?? {};
      d.brand.logo.height = Math.max(
        24,
        Math.min(512, Number.isFinite(h) ? h : 80)
      );
      return d;
    });

  const setBrandName = (name: string) =>
    update((d) => {
      d.brand = d.brand ?? {};
      d.brand.text = d.brand.text ?? {};
      d.brand.text.name = name;
      return d;
    });

  const setBrandSubtitle = (subtitle: string) =>
    update((d) => {
      d.brand = d.brand ?? {};
      d.brand.text = d.brand.text ?? {};
      d.brand.text.subtitle = subtitle;
      return d;
    });

  // ---------------------------
  // ✅ FX
  // ---------------------------
  const setFx = (key: string, value: boolean) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.fx = { ...(d.options.fx ?? {}), [key]: value };
      return d;
    });

  // ---------------------------
  // SOCIALS
  // ---------------------------
  const socialKinds = allSocialKinds();
  const socialsCfg = ((config as any)?.content?.socials ?? {}) as any;

  const ensureSocialsRoot = (d: any) => {
    d.content = d.content ?? {};
    d.content.socials = d.content.socials ?? {};
    d.content.socials.links = d.content.socials.links ?? {};
    d.content.socials.enabled = d.content.socials.enabled ?? {};
    d.content.socials.order = Array.isArray(d.content.socials.order)
      ? d.content.socials.order
      : [];
  };

  const enabledSocials: SocialKind[] = React.useMemo(() => {
    const enabledMap = (socialsCfg.enabled ?? {}) as any;
    const order: SocialKind[] =
      Array.isArray(socialsCfg.order) && socialsCfg.order.length
        ? socialsCfg.order
        : socialKinds;

    return order.filter((k) => enabledMap[k] !== false);
  }, [socialsCfg.enabled, socialsCfg.order, socialKinds]);

  const disabledSocials: SocialKind[] = React.useMemo(() => {
    const enabledMap = (socialsCfg.enabled ?? {}) as any;
    const order: SocialKind[] = Array.isArray(socialsCfg.order)
      ? socialsCfg.order
      : [];

    return socialKinds.filter((k) => {
      const isEnabled = enabledMap[k] !== false;
      const inOrder = order.includes(k);
      return !(isEnabled && inOrder);
    });
  }, [socialKinds, socialsCfg.enabled, socialsCfg.order]);

  const setSocialEnabled = (kind: SocialKind, enabled: boolean) =>
    update((d) => {
      ensureSocialsRoot(d);
      d.content.socials.enabled[kind] = enabled;

      const o: SocialKind[] = Array.isArray(d.content.socials.order)
        ? d.content.socials.order
        : [];

      if (enabled) {
        if (!o.includes(kind)) o.push(kind);
      } else {
        d.content.socials.order = o.filter((x) => x !== kind);
      }

      if (!enabled) {
        const links = d.content.socials.links ?? {};
        d.content.socials.links = links;
      }

      return d;
    });

  const setSocialLink = (kind: SocialKind, value: string) =>
    update((d) => {
      ensureSocialsRoot(d);
      d.content.socials.links[kind] = value;

      if (String(value || "").trim().length) {
        d.content.socials.enabled[kind] =
          d.content.socials.enabled[kind] ?? true;

        const o: SocialKind[] = Array.isArray(d.content.socials.order)
          ? d.content.socials.order
          : [];
        if (!o.includes(kind)) o.push(kind);
        d.content.socials.order = o;
      }

      return d;
    });

  const moveSocial = (kind: SocialKind, dir: -1 | 1) =>
    update((d) => {
      ensureSocialsRoot(d);
      const o: SocialKind[] = Array.isArray(d.content.socials.order)
        ? d.content.socials.order
        : [];
      const idx = o.indexOf(kind);
      if (idx < 0) return d;
      const next = idx + dir;
      if (next < 0 || next >= o.length) return d;
      const copy = [...o];
      const [it] = copy.splice(idx, 1);
      copy.splice(next, 0, it);
      d.content.socials.order = copy;
      return d;
    });

  const addSocial = (kind: SocialKind) => setSocialEnabled(kind, true);

  // ---------------------------
  // SECTIONS
  // ---------------------------
  const setSectionEnabled = (id: string, enabled: boolean) =>
    update((d) => {
      const s = (d.sections ?? []).find(
        (x: any) => String(x.id) === String(id)
      );
      if (s) s.enabled = enabled;
      return d;
    });

  const setSectionVariant = (id: string, variant: string) =>
    update((d) => {
      const s = (d.sections ?? []).find(
        (x: any) => String(x.id) === String(id)
      );
      if (s) s.variant = variant;
      return d;
    });

  const removeSection = (id: string) =>
    update((d) => {
      d.sections = (d.sections ?? []).filter(
        (s: any) => String(s.id) !== String(id)
      );
      return d;
    });

  const addSplit = () =>
    update((d) => {
      d.sections = Array.isArray(d.sections) ? d.sections : [];
      const id = nextId(d.sections, "split");
      const heroIndex = d.sections.findIndex((x: any) => x.type === "hero");
      const insertAt =
        heroIndex >= 0 ? heroIndex + 1 : Math.min(1, d.sections.length);
      d.sections.splice(insertAt, 0, {
        id,
        type: "split",
        title: "Section split",
        variant: "A",
        enabled: true,
      });
      return d;
    });

  const removeAllSplits = () =>
    update((d) => {
      d.sections = (d.sections ?? []).filter((s: any) => s.type !== "split");
      return d;
    });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // UI pin header first + hide top
  const pinnedTypes = new Set(["top", "header"]);
  const sectionsRaw: any[] = Array.isArray((config as any).sections)
    ? (config as any).sections
    : [];
  const sectionsView = React.useMemo(() => {
    const pinned = sectionsRaw.filter((s) => pinnedTypes.has(String(s.type)));
    const rest = sectionsRaw.filter((s) => !pinnedTypes.has(String(s.type)));

    pinned.sort((a, b) => {
      const pa = String(a.type) === "top" ? 0 : 1;
      const pb = String(b.type) === "top" ? 0 : 1;
      return pa - pb;
    });

    const pinnedNoTop = pinned.filter((s) => String(s.type) !== "top");
    return [...pinnedNoTop, ...rest];
  }, [sectionsRaw]);

  const cycleGlobalVariant = (dir: -1 | 1) => {
    const id = activeSectionId ?? String(sectionsView?.[0]?.id ?? "");
    if (!id) return;

    const s = sectionsView.find((x: any) => String(x.id) === String(id));
    if (!s) return;

    const opts = (getVariantOptions(String(s.type)) ?? null) as
      | readonly string[]
      | null;
    if (!opts?.length) return;

    const current = String(s.variant ?? opts[0]);
    const value = opts.includes(current) ? current : opts[0];
    setSectionVariant(id, cycleInList(value, opts, dir));
  };

  const sectionIds = React.useMemo(
    () => sectionsView.map((s) => s.id),
    [sectionsView]
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    if (active.id === over.id) return;

    update((d) => {
      const arr: any[] = Array.isArray(d.sections) ? d.sections : [];
      const ids = arr.map((x: any) => String(x.id));

      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return d;

      const moving = arr[oldIndex];
      const target = arr[newIndex];

      if (pinnedTypes.has(String(moving?.type))) return d;
      if (pinnedTypes.has(String(target?.type))) return d;

      if (moving?.lock) return d;
      if (target?.lock) return d;

      d.sections = arrayMove(arr, oldIndex, newIndex);
      return d;
    });
  };

  // ---------------------------
  // PRESETS
  // ---------------------------
  const applyPreset = (name: "saas" | "pme" | "creative" | "family") => {
    update((d) => {
      d.options = d.options ?? {};
      d.options.fx = d.options.fx ?? {};

      const setTV = (a: string, c: string) => {
        d.options.themeVariant = joinThemeVariant(a, c);
      };

      if (name === "saas") {
        d.options.canvasStyle = "immersive";
        setTV("slateIndigo", "cloud");
        d.options.fx.enabled = true;
        d.options.fx.ambient = true;
        d.options.fx.softGlow = true;
        d.options.fx.borderScan = true;
        d.options.fx.shimmerCta = true;
      }

      if (name === "pme") {
        d.options.canvasStyle = "classic";
        setTV("amberOrange", "porcelain");
        d.options.fx.enabled = true;
        d.options.fx.ambient = false;
        d.options.fx.softGlow = true;
        d.options.fx.borderScan = false;
        d.options.fx.shimmerCta = false;
      }

      if (name === "creative") {
        d.options.canvasStyle = "immersive";
        setTV("purplePink", "lilac");
        d.options.fx.enabled = true;
        d.options.fx.ambient = true;
        d.options.fx.softGlow = true;
        d.options.fx.borderScan = false;
        d.options.fx.shimmerCta = true;
      }

      if (name === "family") {
        d.options.canvasStyle = "classic";
        setTV("emeraldTeal", "paper");
        d.options.fx.enabled = false;
        d.options.fx.ambient = false;
        d.options.fx.softGlow = false;
        d.options.fx.borderScan = false;
        d.options.fx.shimmerCta = false;
      }

      return d;
    });
  };

  const applyChaos = () => {
    update((d) => {
      d.options = d.options ?? {};
      d.options.fx = d.options.fx ?? {};
      const pick = <T,>(arr: readonly T[]) =>
        arr[Math.floor(Math.random() * arr.length)];

      const a = pick(ACCENTS);
      const c = pick(CANVAS);
      const style: CanvasStyle = Math.random() < 0.55 ? "immersive" : "classic";

      d.options.themeVariant = joinThemeVariant(String(a), String(c));
      d.options.canvasStyle = style;

      const fxOn = Math.random() < 0.85;
      d.options.fx.enabled = fxOn;
      d.options.fx.ambient = fxOn && Math.random() < 0.7;
      d.options.fx.softGlow = fxOn && Math.random() < 0.8;
      d.options.fx.borderScan = fxOn && Math.random() < 0.6;
      d.options.fx.shimmerCta = fxOn && Math.random() < 0.6;

      return d;
    });
  };

  // ---------------------------
  // panel layout
  // ---------------------------
  const panelPos =
    dock === "left"
      ? "fixed left-4 top-4 z-[9999] w-[380px] max-w-[92vw]"
      : "fixed right-4 top-4 z-[9999] w-[380px] max-w-[92vw]";

  const shell =
    "rounded-3xl border border-slate-200 bg-white/92 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.10)] overflow-hidden";

  const TogglePill = ({
    pressed,
    onClick,
    title,
    label,
  }: {
    pressed: boolean;
    onClick: () => void;
    title: string;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold",
        pressed
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
      )}
    >
      <span
        className={cx(
          "h-2 w-2 rounded-full",
          pressed ? "bg-white" : "bg-slate-300"
        )}
      />
      {label}
    </button>
  );

  if (minimized) {
    return (
      <div className={panelPos}>
        <div className={cx(shell, "p-3")}>
          <button
            type="button"
            onClick={() => setStudioUi({ minimized: false })}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            StudioPanel ▸ (Ctrl+K)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={panelPos}>
      <div
        ref={shellRef}
        className={shell}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          if (e.altKey || e.ctrlKey || e.metaKey) return;

          const dir: -1 | 1 = e.key === "ArrowLeft" ? -1 : 1;
          const active = document.activeElement as any;

          if (
            isTypingTarget(active) &&
            active !== accentSelectRef.current &&
            active !== canvasSelectRef.current
          ) {
            return;
          }

          if (active === accentSelectRef.current) {
            if (autoAccentMode !== "off") return;
            e.preventDefault();
            cycleAccent(dir);
            return;
          }
          if (active === canvasSelectRef.current) {
            e.preventDefault();
            cycleCanvas(dir);
            return;
          }

          if (activeScope === "accent") {
            if (autoAccentMode !== "off") return;
            e.preventDefault();
            cycleAccent(dir);
            return;
          }
          if (activeScope === "canvas") {
            e.preventDefault();
            cycleCanvas(dir);
            return;
          }

          e.preventDefault();
          cycleGlobalVariant(dir);
        }}
      >
        {/* header compact (1 line actions) */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                StudioPanel
              </div>
              <div className="text-xs text-slate-500 truncate">
                Template Engine • live config
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleDock}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                title="Dock gauche/droite"
              >
                ⇆ Dock
              </button>
              <button
                type="button"
                onClick={toggleMinimize}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                title="Minimiser"
              >
                Minimiser
              </button>

              <TogglePill
                pressed={studioEnabled}
                onClick={() => setStudioEnabled(!studioEnabled)}
                title="Activer/Désactiver Studio (Ctrl+K)"
                label="Studio"
              />
            </div>
          </div>
        </div>

        <div className="max-h-[calc(100vh-2rem-64px)] overflow-y-auto px-5 pb-5 pt-4 space-y-4">
          {/* TOOLS */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
              TOOLS
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/easter-eggs"
                className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 hover:bg-slate-50 flex items-center justify-center"
                title="Page Easter Eggs"
              >
                🥚 Easter
              </a>
              <a
                href="/template-base?egg=1"
                className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 hover:bg-slate-50 flex items-center justify-center"
                title="Ouvre la demo avec egg=1"
              >
                🧪 egg=1
              </a>
            </div>
          </div>

          {/* THEME compact */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
              THÈME
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                      Canvas
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      Classic / Immersive
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCanvasStyle(
                        canvasStyle === "classic" ? "immersive" : "classic"
                      )
                    }
                    className={cx(
                      "relative h-7 w-12 rounded-full border transition",
                      canvasStyle === "immersive" ? "bg-slate-900" : "bg-white"
                    )}
                    aria-pressed={canvasStyle === "immersive"}
                    title="Classic / Immersive"
                  >
                    <span
                      className={cx(
                        "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition",
                        canvasStyle === "immersive"
                          ? "left-6 bg-white"
                          : "left-1 bg-slate-900"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">
                      Accent auto
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      depuis logo
                    </div>
                  </div>
                  <select
                    value={autoAccentMode}
                    onChange={(e) =>
                      setAutoAccentMode(e.target.value as AutoAccentMode)
                    }
                    className="h-10 w-[120px] rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                    title="Auto accent mode"
                  >
                    <option value="off">Off</option>
                    <option value="muted">Muted</option>
                    <option value="vivid">Vivid</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-3xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">
                    Preset rapide
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    1 clic = thème + style + FX
                  </div>
                </div>

                <button
                  type="button"
                  onClick={applyChaos}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                  title="Chaos contrôlé"
                >
                  🎲 <span>Chaos</span>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  ["SaaS 2030", "saas"],
                  ["PME premium", "pme"],
                  ["Creative", "creative"],
                  ["Site famille", "family"],
                ].map(([label, key]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key as any)}
                    className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="mt-4"
              data-scope="accent"
              onFocusCapture={() => setActiveScope("accent")}
              onPointerDownCapture={() => setActiveScope("accent")}
            >
              <div className="mb-2 text-xs font-semibold text-slate-700">
                Accent
              </div>
              <div className="flex items-center gap-2">
                <IconBtn
                  title="Accent précédent (←)"
                  onClick={() => cycleAccent(-1)}
                  disabled={autoAccentMode !== "off"}
                >
                  ◀
                </IconBtn>

                <select
                  ref={accentSelectRef}
                  className={cx(
                    "h-10 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm",
                    autoAccentMode !== "off" && "opacity-60 cursor-not-allowed"
                  )}
                  value={accent}
                  disabled={autoAccentMode !== "off"}
                  onChange={(e) => setThemeVariant(e.target.value, canvas)}
                >
                  {ACCENTS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <IconBtn
                  title="Accent suivant (→)"
                  onClick={() => cycleAccent(1)}
                  disabled={autoAccentMode !== "off"}
                >
                  ▶
                </IconBtn>
              </div>
            </div>

            <div
              className="mt-4"
              data-scope="canvas"
              onFocusCapture={() => setActiveScope("canvas")}
              onPointerDownCapture={() => setActiveScope("canvas")}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-slate-700">
                  Fond (canvas)
                </div>
                {SIGNATURE_CANVAS.has(canvas) ? <Badge>Signature</Badge> : null}
              </div>

              <div className="flex items-center gap-2">
                <IconBtn
                  title="Fond précédent (←)"
                  onClick={() => cycleCanvas(-1)}
                >
                  ◀
                </IconBtn>

                <select
                  ref={canvasSelectRef}
                  className="h-10 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                  value={canvas}
                  onChange={(e) => setThemeVariant(accent, e.target.value)}
                >
                  {CANVAS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <IconBtn
                  title="Fond suivant (→)"
                  onClick={() => cycleCanvas(1)}
                >
                  ▶
                </IconBtn>
              </div>
            </div>
          </div>

          {/* BRAND */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
              BRAND
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Logo mode
                </label>
                <select
                  value={currentLogoMode}
                  onChange={(e) => setLogoMode(e.target.value as any)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {LOGO_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Logo src
                </label>
                <input
                  value={String((config as any)?.brand?.logo?.src ?? "")}
                  onChange={(e) => setLogoSrc(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  value={Number((config as any)?.brand?.logo?.width ?? 80)}
                  onChange={(e) =>
                    setLogoW(parseInt(e.target.value || "80", 10))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Height
                </label>
                <input
                  type="number"
                  value={Number((config as any)?.brand?.logo?.height ?? 80)}
                  onChange={(e) =>
                    setLogoH(parseInt(e.target.value || "80", 10))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Nom
                </label>
                <input
                  value={String((config as any)?.brand?.text?.name ?? "")}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Sous-titre
                </label>
                <input
                  value={String((config as any)?.brand?.text?.subtitle ?? "")}
                  onChange={(e) => setBrandSubtitle(e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                />
              </div>
            </div>
          </div>

          {/* SOCIALS */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-xs font-semibold tracking-wide text-slate-600">
                SOCIALS
              </div>

              <select
                className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900"
                value=""
                onChange={(e) => {
                  const v = e.target.value as SocialKind;
                  if (v) addSocial(v);
                  e.currentTarget.value = "";
                }}
                title="Ajouter un social"
              >
                <option value="">+ Add</option>
                {disabledSocials.map((k) => (
                  <option key={k} value={k}>
                    {SOCIAL_DEFS[k]?.label ?? k}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {enabledSocials.map((k, idx) => {
                const def = SOCIAL_DEFS[k];
                const val = String(((socialsCfg.links ?? {}) as any)[k] ?? "");
                return (
                  <div
                    key={k}
                    className="rounded-3xl border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <def.Icon className="opacity-70" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">
                            {def.label}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {k}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <IconBtn
                          title="Monter"
                          onClick={() => moveSocial(k, -1)}
                          disabled={idx === 0}
                        >
                          ▲
                        </IconBtn>
                        <IconBtn
                          title="Descendre"
                          onClick={() => moveSocial(k, 1)}
                          disabled={idx === enabledSocials.length - 1}
                        >
                          ▼
                        </IconBtn>
                        <button
                          type="button"
                          onClick={() => setSocialEnabled(k, false)}
                          className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          title="Retirer de la liste"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <input
                        value={val}
                        onChange={(e) => setSocialLink(k, e.target.value)}
                        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                        placeholder={
                          k === "whatsapp"
                            ? "ex: +3247... ou 3247..."
                            : "ex: https://..."
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 text-xs text-slate-500">
              (Les flèches changent l’ordre d’affichage header/contact)
            </div>
          </div>

          {/* LAYOUT */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
              LAYOUT
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Container
                </label>
                <select
                  value={currentContainer}
                  onChange={(e) => setLayoutToken("container", e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {CONTAINERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Density
                </label>
                <select
                  value={currentDensity}
                  onChange={(e) => setLayoutToken("density", e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {DENSITIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Radius
                </label>
                <select
                  value={String(currentRadius)}
                  onChange={(e) =>
                    setLayoutToken("radius", Number(e.target.value))
                  }
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {RADII.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* NAV (single source of truth ✅) */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
              NAV
            </div>

            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Max direct links (menu)
            </label>

            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={maxDirectDraft}
              onChange={(e) => {
                const norm = normalizeDigitString(e.target.value);
                setMaxDirectDraft(norm);

                // live commit if not empty
                if (norm === "") return;
                const n = Math.max(0, Math.min(12, parseInt(norm, 10)));
                setMaxDirect(n);
              }}
              onBlur={() => {
                const norm = normalizeDigitString(maxDirectDraft);
                const n =
                  norm === ""
                    ? Math.max(
                        0,
                        Math.min(12, Number.isFinite(maxDirect) ? maxDirect : 4)
                      )
                    : Math.max(0, Math.min(12, parseInt(norm, 10)));

                setMaxDirectDraft(String(n));
                setMaxDirect(n);
              }}
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            />
          </div>

          {/* FX */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
              FX
            </div>

            <div className="space-y-2 text-sm text-slate-800">
              {[
                ["enabled", "FX activés"],
                ["ambient", "Ambient"],
                ["softGlow", "Soft glow"],
                ["borderScan", "Border scan"],
                ["shimmerCta", "Shimmer CTA"],
              ].map(([k, label]) => (
                <label
                  key={k}
                  className="flex items-center justify-between gap-3"
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={!!(config as any)?.options?.fx?.[k]}
                    onChange={(e) => setFx(k, e.target.checked)}
                  />
                </label>
              ))}
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Shimmer CTA = uniquement sur les éléments qui ont la classe{" "}
              <span className="font-semibold">fx-cta</span> (boutons/CTA).
            </div>
          </div>

          {/* SECTIONS */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold tracking-wide text-slate-600">
                SECTIONS
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addSplit}
                  className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  + Split
                </button>
                <button
                  type="button"
                  onClick={removeAllSplits}
                  className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  - Splits
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={sectionIds}
                  strategy={verticalListSortingStrategy}
                >
                  {sectionsView.map((s: any) => (
                    <SectionCard
                      key={s.id}
                      s={s}
                      onToggleEnabled={setSectionEnabled}
                      onChangeVariant={setSectionVariant}
                      onRemove={removeSection}
                      onFocusCard={(id) => setActiveSectionId(id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <div className="text-[11px] text-slate-500">
                “header” est fixé en haut dans l’UI. “top” est masqué (ancre
                technique).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
