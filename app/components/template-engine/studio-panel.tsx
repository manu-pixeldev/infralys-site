// app/components/template-engine/studio-panel.tsx
"use client";

import React from "react";
import type { TemplateConfigInput } from "./types";

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

import { VARIANTS_BY_TYPE } from "./variants";
import type { SocialKind } from "./socials";
import { SOCIAL_DEFS } from "./socials";

/** Theme pickers (match getTheme keys) */
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
] as const;

// ✅ more canvases (classic + premium)
const CANVAS = [
  "classic",
  "pearl",
  "paper",
  "frost",
  "sand",
  "warm",
  "cool",
  "forest",
  "sunset",
  "charcoal",
  "midnight",
  "graphite",
  "studio",
  "obsidian",
] as const;

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
  if (typeof (globalThis as any).structuredClone === "function") return (globalThis as any).structuredClone(v);
  return JSON.parse(JSON.stringify(v));
}

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return (i % len + len) % len;
}

function parseThemeVariant(v?: string) {
  const raw = String(v ?? "amberOrange|classic").trim();
  const [a, c] = raw.includes("|") ? raw.split("|") : [raw, "classic"];
  return { accent: (a || "amberOrange").trim(), canvas: (c || "classic").trim() };
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
  return tag === "input" || tag === "textarea" || tag === "select" || !!el?.isContentEditable;
}

/** Very small color helpers */
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

/**
 * Extract a dominant-ish color from an image via canvas sampling.
 * - Works best for same-origin images.
 * - If CORS blocks, it throws -> caller should fallback safely.
 */
async function extractDominantRgb(src: string): Promise<{ r: number; g: number; b: number } | null> {
  if (!src) return null;

  // data: URLs OK; local public paths OK; external needs CORS
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

  // simple weighted average ignoring near-transparent + near-white/near-black
  let rSum = 0, gSum = 0, bSum = 0, count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 60) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];

    // ignore extreme backgrounds
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (lum > 245) continue; // near-white
    if (lum < 10) continue;  // near-black

    rSum += r;
    gSum += g;
    bSum += b;
    count++;
  }

  if (!count) return null;
  return { r: Math.round(rSum / count), g: Math.round(gSum / count), b: Math.round(bSum / count) };
}

function pickAccentFromHsl(h: number, s: number, l: number, mode: AutoAccentMode): typeof ACCENTS[number] {
  // if low saturation -> mono-ish
  if (s < 0.18) {
    if (l < 0.35) return "monoDark";
    // give a bit of character:
    return mode === "vivid" ? "slateIndigo" : "monoDark";
  }

  // map hue to closest buckets
  // red(0) -> blueRed; orange(30) -> amberOrange; green(120) -> emeraldTeal; blue(210) -> slateIndigo; purple(290) -> purplePink
  const hue = h;

  // "muted" tends to more slate/mono, "vivid" keeps color
  if (mode === "muted") {
    if (hue >= 90 && hue <= 170) return "emeraldTeal";
    if (hue >= 200 && hue <= 260) return "slateIndigo";
    if (hue >= 260 && hue <= 330) return "monoDarkRose";
    if (hue >= 20 && hue <= 70) return "monoDarkGold";
    return "monoDark";
  }

  // vivid (default)
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

function SectionCard({
  s,
  onToggleEnabled,
  onChangeVariant,
  onRemove,
}: {
  s: any;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onChangeVariant: (id: string, variant: string) => void;
  onRemove: (id: string) => void;
}) {
  const locked = s.lock === true;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: s.id,
    disabled: locked,
  });

  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };

  const opts = (VARIANTS_BY_TYPE[String(s.type)] ?? null) as readonly string[] | null;
  const current = String(s.variant ?? "A");
  const value = opts && opts.includes(current) ? current : (opts?.[0] ?? current);

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
              <div className="truncate text-sm font-semibold text-slate-900">{s.title ?? s.type}</div>
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
            <IconBtn title="Variant précédent (←)" onClick={() => cycle(-1)} disabled={!opts?.length}>
              ◀
            </IconBtn>

            <select
              value={value}
              onChange={(e) => onChangeVariant(s.id, e.target.value)}
              className="h-10 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
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

            <IconBtn title="Variant suivant (→)" onClick={() => cycle(1)} disabled={!opts?.length}>
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
            Tip: clique la carte puis utilise <span className="font-semibold">←</span>/<span className="font-semibold">→</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function allSocialKinds(): SocialKind[] {
  return Object.keys(SOCIAL_DEFS) as SocialKind[];
}

export function StudioPanel({
  config,
  setConfig,
}: {
  config: TemplateConfigInput;
  setConfig: React.Dispatch<React.SetStateAction<TemplateConfigInput>>;
}) {
  const themeVariantRaw = (config as any)?.options?.themeVariant ?? "amberOrange|classic";
  const { accent, canvas } = parseThemeVariant(themeVariantRaw);

  const ui = (config as any)?.options?.studio?.ui ?? {};
  const dock: DockSide = (ui.dock ?? "right") as DockSide;
  const minimized = !!ui.minimized;

  const studioEnabled = !!(config as any)?.options?.studio?.enabled;
  const canvasStyle: CanvasStyle = (((config as any)?.options?.canvasStyle ?? "classic") as CanvasStyle) || "classic";

  // ✅ Auto accent settings
  const autoAccentMode: AutoAccentMode =
    (((config as any)?.options?.autoAccentMode ?? "off") as AutoAccentMode) || "off";

  const update = (fn: (draft: any) => any) => setConfig((prev) => fn(clone(prev)));

  const setStudioUi = (patch: Partial<{ dock: DockSide; minimized: boolean }>) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.studio = d.options.studio ?? {};
      d.options.studio.ui = d.options.studio.ui ?? {};
      Object.assign(d.options.studio.ui, patch);
      return d;
    });

  const toggleDock = () => setStudioUi({ dock: dock === "right" ? "left" : "right" });
  const toggleMinimize = () => setStudioUi({ minimized: !minimized });

  const setStudioEnabled = (v: boolean) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.studio = d.options.studio ?? {};
      d.options.studio.enabled = v;
      return d;
    });

  const accentIndex = Math.max(0, (ACCENTS as readonly string[]).indexOf(accent));
  const canvasIndex = Math.max(0, (CANVAS as readonly string[]).indexOf(canvas));

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

  // ✅ refs: keyboard focus-aware for theme selects (Option A)
  const accentSelectRef = React.useRef<HTMLSelectElement>(null);
  const canvasSelectRef = React.useRef<HTMLSelectElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);

  // ✅ Auto accent effect (guarded)
  const lastAutoRef = React.useRef<{ src: string; mode: AutoAccentMode; applied: string } | null>(null);
  const logoSrc = String((config as any)?.brand?.logo?.src ?? "");
  React.useEffect(() => {
    if (autoAccentMode === "off") return;
    if (!logoSrc) return;

    const key = { src: logoSrc, mode: autoAccentMode };
    const last = lastAutoRef.current;
    if (last && last.src === key.src && last.mode === key.mode && last.applied === accent) {
      return; // already applied for this exact state
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
          lastAutoRef.current = { src: logoSrc, mode: autoAccentMode, applied: picked };
        } else {
          lastAutoRef.current = { src: logoSrc, mode: autoAccentMode, applied: accent };
        }
      } catch {
        // CORS / decode / canvas tainted -> just stop safely (no loops)
        lastAutoRef.current = { src: logoSrc, mode: autoAccentMode, applied: accent };
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoSrc, autoAccentMode]); // intentionally not depending on accent/canvas to avoid churn

  const maxDirect = Number((config as any)?.options?.maxDirectLinksInMenu ?? 4);
  const setMaxDirect = (n: number) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.maxDirectLinksInMenu = Math.max(0, Math.min(12, Number.isFinite(n) ? n : 4));
      return d;
    });

  const currentContainer = ((config as any)?.options?.layout?.container ?? "7xl") as (typeof CONTAINERS)[number];
  const currentDensity = ((config as any)?.options?.layout?.density ?? "normal") as (typeof DENSITIES)[number];
  const currentRadius = Number((config as any)?.options?.layout?.radius ?? 24) as (typeof RADII)[number];

  const setLayoutToken = (key: "container" | "density" | "radius", value: any) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.layout = { ...(d.options.layout ?? {}), [key]: value };
      return d;
    });

  const currentLogoMode = (((config as any)?.brand?.logo?.mode ?? "logoPlusText") as any) as (typeof LOGO_MODES)[number];
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
      d.brand.logo.width = Math.max(24, Math.min(512, Number.isFinite(w) ? w : 80));
      return d;
    });

  const setLogoH = (h: number) =>
    update((d) => {
      d.brand = d.brand ?? {};
      d.brand.logo = d.brand.logo ?? {};
      d.brand.logo.height = Math.max(24, Math.min(512, Number.isFinite(h) ? h : 80));
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

  const setFx = (key: string, value: boolean) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.fx = { ...(d.options.fx ?? {}), [key]: value };
      return d;
    });

  // ---------------------------
  // SOCIALS (content.socials)
  // ---------------------------
  const socialKinds = allSocialKinds();
  const socialsCfg = ((config as any)?.content?.socials ?? {}) as any;
  const socialsOrder: SocialKind[] =
    Array.isArray(socialsCfg.order) && socialsCfg.order.length ? socialsCfg.order : socialKinds;

  const ensureSocialsRoot = (d: any) => {
    d.content = d.content ?? {};
    d.content.socials = d.content.socials ?? {};
    d.content.socials.links = d.content.socials.links ?? {};
    d.content.socials.enabled = d.content.socials.enabled ?? {};
    d.content.socials.order = Array.isArray(d.content.socials.order) ? d.content.socials.order : [];
  };

  const setSocialEnabled = (kind: SocialKind, enabled: boolean) =>
    update((d) => {
      ensureSocialsRoot(d);
      d.content.socials.enabled[kind] = enabled;
      const o: SocialKind[] = Array.isArray(d.content.socials.order) ? d.content.socials.order : [];
      if (enabled && !o.includes(kind)) o.push(kind);
      d.content.socials.order = o;
      return d;
    });

  const setSocialLink = (kind: SocialKind, value: string) =>
    update((d) => {
      ensureSocialsRoot(d);
      d.content.socials.links[kind] = value;
      if (String(value || "").trim().length) {
        d.content.socials.enabled[kind] = d.content.socials.enabled[kind] ?? true;
        const o: SocialKind[] = Array.isArray(d.content.socials.order) ? d.content.socials.order : [];
        if (!o.includes(kind)) o.push(kind);
        d.content.socials.order = o;
      }
      return d;
    });

  const moveSocial = (kind: SocialKind, dir: -1 | 1) =>
    update((d) => {
      ensureSocialsRoot(d);
      const o: SocialKind[] = Array.isArray(d.content.socials.order) ? d.content.socials.order : [];
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

  // ---------------------------
  // SECTIONS
  // ---------------------------
  const setSectionEnabled = (id: string, enabled: boolean) =>
    update((d) => {
      const s = (d.sections ?? []).find((x: any) => String(x.id) === String(id));
      if (s) s.enabled = enabled;
      return d;
    });

  const setSectionVariant = (id: string, variant: string) =>
    update((d) => {
      const s = (d.sections ?? []).find((x: any) => String(x.id) === String(id));
      if (s) s.variant = variant;
      return d;
    });

  const removeSection = (id: string) =>
    update((d) => {
      d.sections = (d.sections ?? []).filter((s: any) => String(s.id) !== String(id));
      return d;
    });

  const addSplit = () =>
    update((d) => {
      d.sections = Array.isArray(d.sections) ? d.sections : [];
      const id = nextId(d.sections, "split");
      const heroIndex = d.sections.findIndex((x: any) => x.type === "hero");
      const insertAt = heroIndex >= 0 ? heroIndex + 1 : Math.min(1, d.sections.length);
      d.sections.splice(insertAt, 0, { id, type: "split", title: "Section split", variant: "A", enabled: true });
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

  // ✅ UI: pin top+header first (UI ONLY) + hide "top" from list
  const pinnedTypes = new Set(["top", "header"]);
  const sectionsRaw: any[] = Array.isArray((config as any).sections) ? (config as any).sections : [];
  const sectionsView = React.useMemo(() => {
    const pinned = sectionsRaw.filter((s) => pinnedTypes.has(String(s.type)));
    const rest = sectionsRaw.filter((s) => !pinnedTypes.has(String(s.type)));

    pinned.sort((a, b) => {
      const pa = String(a.type) === "top" ? 0 : 1;
      const pb = String(b.type) === "top" ? 0 : 1;
      return pa - pb;
    });

    // ✅ filter out top from UI (never editable)
    const pinnedNoTop = pinned.filter((s) => String(s.type) !== "top");
    return [...pinnedNoTop, ...rest];
  }, [sectionsRaw]);

  const sectionIds = React.useMemo(() => sectionsView.map((s) => s.id), [sectionsView]);

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

      // ✅ forbid dragging pinned
      if (pinnedTypes.has(String(moving?.type))) return d;
      if (pinnedTypes.has(String(target?.type))) return d;

      if (moving?.lock) return d;
      if (target?.lock) return d;

      d.sections = arrayMove(arr, oldIndex, newIndex);
      return d;
    });
  };

  const panelPos =
    dock === "left"
      ? "fixed left-4 top-4 z-[9999] w-[380px] max-w-[92vw]"
      : "fixed right-4 top-4 z-[9999] w-[380px] max-w-[92vw]";

  const shell =
    "rounded-3xl border border-slate-200 bg-white/92 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.10)] overflow-hidden";

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
          // ✅ Option A UX:
          // - ArrowLeft/Right ONLY cycles when Accent select OR Canvas select is focused
          // - otherwise, do not hijack arrows (prevents surprises)
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

          const dir: -1 | 1 = e.key === "ArrowLeft" ? -1 : 1;
          const active = document.activeElement as any;

          // if user is typing somewhere else => never intercept
          if (isTypingTarget(active) && active !== accentSelectRef.current && active !== canvasSelectRef.current) {
            return;
          }

          if (active === accentSelectRef.current) {
            e.preventDefault();
            cycleAccent(dir);
            return;
          }

          if (active === canvasSelectRef.current) {
            e.preventDefault();
            cycleCanvas(dir);
            return;
          }

          // panel focused but not in theme selects -> do nothing
          return;
        }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">StudioPanel</div>
            <div className="text-xs text-slate-500 truncate">Template Engine • live config</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDock}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
              aria-label="Dock"
              title="Dock gauche/droite"
            >
              ⇆ Dock
            </button>
            <button
              type="button"
              onClick={toggleMinimize}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50"
              aria-label="Minimiser"
              title="Minimiser"
            >
              Minimiser
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-2rem-64px)] overflow-y-auto px-5 pb-5 pt-4 space-y-4">
          {/* Studio enabled */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Studio activé</div>
                <div className="text-xs text-slate-500">Ctrl+K pour afficher/cacher (rescue).</div>
              </div>
              <button
                type="button"
                onClick={() => setStudioEnabled(!studioEnabled)}
                className={cx("relative h-7 w-12 rounded-full border transition", studioEnabled ? "bg-slate-900" : "bg-white")}
                aria-pressed={studioEnabled}
                title="Activer/Désactiver"
              >
                <span
                  className={cx(
                    "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition",
                    studioEnabled ? "left-6 bg-white" : "left-1 bg-slate-900"
                  )}
                />
              </button>
            </div>
          </div>

          {/* THEME */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">THÈME</div>

            {/* Canvas style toggle */}
            <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">Canvas style</div>
                  <div className="text-xs text-slate-500 truncate">
                    Classic = cards nettes • Immersive = univers (fond + modules)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCanvasStyle(canvasStyle === "classic" ? "immersive" : "classic")}
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
                        canvasStyle === "immersive" ? "left-6 bg-white" : "left-1 bg-slate-900"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-500">
                Tip: pour le clavier, focus sur le select Accent/Fond puis <span className="font-semibold">←/→</span>.
              </div>
            </div>

            {/* Auto Accent */}
            <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">Accent auto (logo)</div>
                  <div className="text-xs text-slate-500 truncate">
                    Extrait une couleur dominante du logo et choisit un accent proche.
                  </div>
                </div>
                <select
                  value={autoAccentMode}
                  onChange={(e) => setAutoAccentMode(e.target.value as AutoAccentMode)}
                  className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                  title="Auto accent mode"
                >
                  <option value="off">Off</option>
                  <option value="muted">Muted</option>
                  <option value="vivid">Vivid</option>
                </select>
              </div>

              <div className="mt-2 text-[11px] text-slate-500">
                Note: PNG/JPG externe sans CORS → fallback silencieux (pas de crash).
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-2 text-xs font-semibold text-slate-700">Accent</div>
              <div className="flex items-center gap-2">
                <IconBtn title="Accent précédent (←)" onClick={() => cycleAccent(-1)} disabled={autoAccentMode !== "off"}>
                  ◀
                </IconBtn>

                <select
                  ref={accentSelectRef}
                  className={cx(
                    "h-10 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm",
                    autoAccentMode !== "off" && "opacity-60 cursor-not-allowed"
                  )}
                  value={accent}
                  disabled={autoAccentMode !== "off"}
                  onChange={(e) => setThemeVariant(e.target.value, canvas)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") { e.preventDefault(); cycleAccent(-1); }
                    if (e.key === "ArrowRight") { e.preventDefault(); cycleAccent(1); }
                  }}
                >
                  {ACCENTS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>

                <IconBtn title="Accent suivant (→)" onClick={() => cycleAccent(1)} disabled={autoAccentMode !== "off"}>
                  ▶
                </IconBtn>
              </div>

              {autoAccentMode !== "off" ? (
                <div className="mt-2 text-[11px] text-slate-500">
                  Accent manuel désactivé (mode auto).
                </div>
              ) : null}
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold text-slate-700">Fond (canvas)</div>
              <div className="flex items-center gap-2">
                <IconBtn title="Fond précédent (←)" onClick={() => cycleCanvas(-1)}>◀</IconBtn>
                <select
                  ref={canvasSelectRef}
                  className="h-10 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                  value={canvas}
                  onChange={(e) => setThemeVariant(accent, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") { e.preventDefault(); cycleCanvas(-1); }
                    if (e.key === "ArrowRight") { e.preventDefault(); cycleCanvas(1); }
                  }}
                >
                  {CANVAS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <IconBtn title="Fond suivant (→)" onClick={() => cycleCanvas(1)}>▶</IconBtn>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Raccourcis: focus select → <span className="font-semibold">←/→</span>
              </div>
            </div>
          </div>

          {/* BRAND */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">BRAND</div>

            <label className="block text-xs font-semibold text-slate-700 mb-2">Logo mode</label>
            <select
              value={currentLogoMode}
              onChange={(e) => setLogoMode(e.target.value as any)}
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            >
              {LOGO_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Logo width</label>
                <input
                  type="number"
                  value={Number((config as any)?.brand?.logo?.width ?? 80)}
                  onChange={(e) => setLogoW(parseInt(e.target.value || "80", 10))}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Logo height</label>
                <input
                  type="number"
                  value={Number((config as any)?.brand?.logo?.height ?? 80)}
                  onChange={(e) => setLogoH(parseInt(e.target.value || "80", 10))}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Logo src</label>
              <input
                value={String((config as any)?.brand?.logo?.src ?? "")}
                onChange={(e) => setLogoSrc(e.target.value)}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Nom</label>
              <input
                value={String((config as any)?.brand?.text?.name ?? "")}
                onChange={(e) => setBrandName(e.target.value)}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Sous-titre</label>
              <input
                value={String((config as any)?.brand?.text?.subtitle ?? "")}
                onChange={(e) => setBrandSubtitle(e.target.value)}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
              />
            </div>
          </div>

          {/* SOCIALS */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">SOCIALS</div>
            <div className="space-y-3">
              {socialsOrder.map((k, idx) => {
                const def = SOCIAL_DEFS[k];
                const enabled = ((socialsCfg.enabled ?? {}) as any)[k] !== false;
                const val = String(((socialsCfg.links ?? {}) as any)[k] ?? "");
                return (
                  <div key={k} className="rounded-3xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <def.Icon className="opacity-70" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{def.label}</div>
                          <div className="text-xs text-slate-500 truncate">{k}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <IconBtn title="Monter" onClick={() => moveSocial(k, -1)} disabled={idx === 0}>▲</IconBtn>
                        <IconBtn title="Descendre" onClick={() => moveSocial(k, 1)} disabled={idx === socialsOrder.length - 1}>▼</IconBtn>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          ON
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setSocialEnabled(k, e.target.checked)}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="mt-3">
                      <input
                        value={val}
                        onChange={(e) => setSocialLink(k, e.target.value)}
                        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                        placeholder={k === "whatsapp" ? "ex: +3247... ou 3247..." : "ex: https://..."}
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        {k === "whatsapp"
                          ? "WhatsApp: tu peux mettre juste les chiffres, on normalise au rendu."
                          : "Astuce: URL complète recommandée."}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Les flèches ici modifient l’ordre d’affichage (header + contact).
            </div>
          </div>

          {/* LAYOUT */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">LAYOUT</div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Container</label>
                <select
                  value={currentContainer}
                  onChange={(e) => setLayoutToken("container", e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {CONTAINERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Density</label>
                <select
                  value={currentDensity}
                  onChange={(e) => setLayoutToken("density", e.target.value)}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {DENSITIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Radius</label>
                <select
                  value={String(currentRadius)}
                  onChange={(e) => setLayoutToken("radius", Number(e.target.value))}
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                >
                  {RADII.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* NAV */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">NAV</div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Max direct links (menu)</label>
            <input
              type="number"
              min={0}
              max={12}
              value={maxDirect}
              onChange={(e) => setMaxDirect(parseInt(e.target.value || "0", 10))}
              className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            />
            <div className="mt-2 text-xs text-slate-500">(Les headers utilisent sections/galleries pour générer le menu)</div>
          </div>

          {/* FX */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">FX</div>

            <div className="space-y-2 text-sm text-slate-800">
              {[
                ["enabled", "FX activés"],
                ["ambient", "Ambient"],
                ["softGlow", "Soft glow"],
                ["borderScan", "Border scan"],
                ["shimmerCta", "Shimmer CTA"],
              ].map(([k, label]) => (
                <label key={k} className="flex items-center justify-between gap-3">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={!!(config as any)?.options?.fx?.[k]}
                    onChange={(e) => setFx(k, e.target.checked)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* SECTIONS */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold tracking-wide text-slate-600">SECTIONS</div>
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
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                  {sectionsView.map((s: any) => (
                    <SectionCard
                      key={s.id}
                      s={s}
                      onToggleEnabled={setSectionEnabled}
                      onChangeVariant={setSectionVariant}
                      onRemove={removeSection}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <div className="text-[11px] text-slate-500">
                “header” est fixé en haut dans l’UI. “top” est masqué (ancre technique).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudioPanel;
