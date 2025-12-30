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

// Base canvases (classic). Immersive is a style toggle that maps to *Immersive keys.
const CANVAS_BASE = ["classic", "warm", "cool", "forest", "sunset", "charcoal", "midnight", "graphite", "studio"] as const;

const CONTAINERS = ["5xl", "6xl", "7xl", "full"] as const;
const DENSITIES = ["compact", "normal", "spacious"] as const;
const RADII = [16, 24, 32] as const;

const LOGO_MODES = ["logoPlusText", "logoOnly", "textOnly"] as const;

type DockSide = "left" | "right";
type CanvasStyle = "classic" | "immersive";

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

function isImmersiveCanvasKey(canvasKey: string) {
  return String(canvasKey || "").toLowerCase().endsWith("immersive");
}

function baseFromCanvasKey(canvasKey: string): string {
  const k = String(canvasKey || "classic").trim();
  if (!isImmersiveCanvasKey(k)) return k;
  return k.slice(0, -"Immersive".length);
}

function styleFromCanvasKey(canvasKey: string): CanvasStyle {
  return isImmersiveCanvasKey(canvasKey) ? "immersive" : "classic";
}

function canvasKeyFromBase(base: string, style: CanvasStyle): string {
  const b = String(base || "classic").trim();
  return style === "immersive" ? `${b}Immersive` : b;
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
  canDrag,
}: {
  s: any;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onChangeVariant: (id: string, variant: string) => void;
  onRemove: (id: string) => void;
  canDrag: boolean;
}) {
  const locked = s.lock === true;
  const dragDisabled = locked || !canDrag;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: s.id,
    disabled: dragDisabled,
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
                dragDisabled
                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-grab active:cursor-grabbing"
              )}
              title={dragDisabled ? "Section fixée" : "Glisser pour réordonner"}
              {...attributes}
              {...listeners}
              disabled={dragDisabled}
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
  const parsed = parseThemeVariant(themeVariantRaw);

  const accent = parsed.accent;
  const canvasKey = parsed.canvas;

  const canvasStyle: CanvasStyle = styleFromCanvasKey(canvasKey);
  const canvasBaseRaw = baseFromCanvasKey(canvasKey);
  const canvasBase = (CANVAS_BASE as readonly string[]).includes(canvasBaseRaw) ? canvasBaseRaw : "classic";

  const ui = (config as any)?.options?.studio?.ui ?? {};
  const dock: DockSide = (ui.dock ?? "right") as DockSide;
  const minimized = !!ui.minimized;

  const studioEnabled = !!(config as any)?.options?.studio?.enabled;

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
  const canvasIndex = Math.max(0, (CANVAS_BASE as readonly string[]).indexOf(canvasBase));

  const setThemeVariant = (nextAccent: string, nextCanvasKey: string) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.themeVariant = joinThemeVariant(nextAccent, nextCanvasKey);
      return d;
    });

  const setCanvasBase = (nextBase: string) => {
    const nextKey = canvasKeyFromBase(nextBase, canvasStyle);
    setThemeVariant(accent, nextKey);
  };

  const setCanvasStyle = (nextStyle: CanvasStyle) => {
    const nextKey = canvasKeyFromBase(canvasBase, nextStyle);
    setThemeVariant(accent, nextKey);
  };

  const cycleAccent = (dir: -1 | 1) => {
    const next = ACCENTS[clampIndex(accentIndex + dir, ACCENTS.length)];
    setThemeVariant(next, canvasKey);
  };

  const cycleCanvasBase = (dir: -1 | 1) => {
    const next = CANVAS_BASE[clampIndex(canvasIndex + dir, CANVAS_BASE.length)];
    const nextKey = canvasKeyFromBase(next, canvasStyle);
    setThemeVariant(accent, nextKey);
  };

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
    Array.isArray(socialsCfg.order) && socialsCfg.order.length
      ? socialsCfg.order
      : socialKinds;

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

      // auto: si on active et pas dans order → on l’ajoute
      const o: SocialKind[] = Array.isArray(d.content.socials.order) ? d.content.socials.order : [];
      if (enabled && !o.includes(kind)) o.push(kind);
      d.content.socials.order = o;
      return d;
    });

  const setSocialLink = (kind: SocialKind, value: string) =>
    update((d) => {
      ensureSocialsRoot(d);
      d.content.socials.links[kind] = value;

      // auto: si user tape un lien, on active
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

  const enableAllSocials = () =>
    update((d) => {
      ensureSocialsRoot(d);
      const o: SocialKind[] = socialKinds.slice();
      d.content.socials.order = o;
      for (const k of o) d.content.socials.enabled[k] = true;
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

      // keep top stable at beginning if exists
      const tops = d.sections.filter((s: any) => String(s.type) === "top");
      const rest = d.sections.filter((s: any) => String(s.type) !== "top");
      d.sections = [...tops, ...rest];

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

  // UI rules:
  // - hide "top"
  // - keep header pinned first in UI
  const sectionsRaw: any[] = Array.isArray((config as any).sections) ? (config as any).sections : [];
  const sectionsUI = React.useMemo(() => {
    const withoutTop = sectionsRaw.filter((s) => String(s.type) !== "top");
    const header = withoutTop.filter((s) => String(s.type) === "header");
    const rest = withoutTop.filter((s) => String(s.type) !== "header");
    return [...header, ...rest];
  }, [sectionsRaw]);

  const sectionIds = React.useMemo(() => sectionsUI.map((s) => s.id), [sectionsUI]);

  const canDragSection = (s: any) => {
    const type = String(s?.type || "");
    if (type === "header") return false;
    if (type === "top") return false;
    if (s?.lock) return false;
    return true;
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    if (active.id === over.id) return;

    update((d) => {
      const arrAll: any[] = Array.isArray(d.sections) ? d.sections : [];
      const tops = arrAll.filter((s: any) => String(s.type) === "top");

      const uiArr = arrAll.filter((s: any) => String(s.type) !== "top");

      // pin header in UI always first
      const header = uiArr.filter((s: any) => String(s.type) === "header");
      const rest = uiArr.filter((s: any) => String(s.type) !== "header");
      const uiPinned = [...header, ...rest];

      const ids = uiPinned.map((x: any) => String(x.id));
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return d;

      const moving = uiPinned[oldIndex];
      const target = uiPinned[newIndex];

      // forbid dragging header / dropping onto header
      if (!canDragSection(moving)) return d;
      if (String(target?.type) === "header") return d;

      const nextUi = arrayMove(uiPinned, oldIndex, newIndex);

      // re-pin header at start no matter what
      const nextHeader = nextUi.filter((s: any) => String(s.type) === "header");
      const nextRest = nextUi.filter((s: any) => String(s.type) !== "header");
      d.sections = [...tops, ...nextHeader, ...nextRest];

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
      <div className={shell}>
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

            <div className="mb-4">
              <div className="mb-2 text-xs font-semibold text-slate-700">Accent</div>
              <div className="flex items-center gap-2">
                <IconBtn title="Accent précédent" onClick={() => cycleAccent(-1)}>◀</IconBtn>
                <select
                  className="h-10 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                  value={accent}
                  onChange={(e) => setThemeVariant(e.target.value, canvasKey)}
                >
                  {ACCENTS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <IconBtn title="Accent suivant" onClick={() => cycleAccent(1)}>▶</IconBtn>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-2 text-xs font-semibold text-slate-700">Fond (canvas)</div>
              <div className="flex items-center gap-2">
                <IconBtn title="Fond précédent" onClick={() => cycleCanvasBase(-1)}>◀</IconBtn>
                <select
                  className="h-10 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                  value={canvasBase}
                  onChange={(e) => setCanvasBase(e.target.value)}
                >
                  {CANVAS_BASE.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <IconBtn title="Fond suivant" onClick={() => cycleCanvasBase(1)}>▶</IconBtn>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900">Canvas style</div>
                  <div className="text-[11px] text-slate-500 truncate">Classic = simple. Immersive = “canvas qui englobe”.</div>
                </div>

                <button
                  type="button"
                  onClick={() => setCanvasStyle(canvasStyle === "classic" ? "immersive" : "classic")}
                  className={cx(
                    "relative h-7 w-12 rounded-full border transition shrink-0",
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
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-xs font-semibold tracking-wide text-slate-600">SOCIALS</div>
              <button
                type="button"
                onClick={enableAllSocials}
                className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                title="Activer tout + ordre par défaut"
              >
                Enable all
              </button>
            </div>

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
                        {k === "whatsapp" ? "WhatsApp: tu peux mettre juste les chiffres, on normalise au rendu." : "Astuce: URL complète recommandée."}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 text-xs text-slate-500">
              L’ordre ici pilote l’affichage (header + contact).
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
            <div className="mt-2 text-xs text-slate-500">(Ce param doit être utilisé par le header pour couper avant le dropdown)</div>
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
                  {sectionsUI.map((s: any) => (
                    <SectionCard
                      key={s.id}
                      s={s}
                      onToggleEnabled={setSectionEnabled}
                      onChangeVariant={setSectionVariant}
                      onRemove={removeSection}
                      canDrag={canDragSection(s)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <div className="text-[11px] text-slate-500">
                “top” est caché (ancre technique). “header” est fixé en haut (non-draggable).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudioPanel;
