// app/components/template-engine/studio-panel.tsx
"use client";

import React from "react";
import type { TemplateConfig } from "./types";

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

const THEME_VARIANTS = [
  "blueRed",
  "purplePink",
  "emeraldTeal",
  "amberOrange",
  "slateIndigo",
  "monoDark",
  "warm",
  "cool",
  "forest",
  "sunset",
] as const;

const CONTAINERS = ["5xl", "6xl", "7xl", "full"] as const;
const DENSITIES = ["compact", "normal", "spacious"] as const;
const RADII = [16, 24, 32] as const;

const LOGO_MODES = ["logoPlusText", "logoOnly", "textOnly"] as const;

/** ✅ Variant options per section type (UI) */
const VARIANTS_BY_TYPE: Record<string, readonly string[]> = {
  header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
  hero: ["A", "B", "C", "D", "E"],
  split: ["A", "B"],
  proof: ["stats"],
  gallery: ["stack", "twoCol", "threeCol"],
  contact: ["AUTO", "A", "B", "C"],
  services: ["A", "B", "C"],
  team: ["A", "B", "C"],
};

type DockSide = "left" | "right";

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function cloneConfig<T>(v: T): T {
  if (typeof (globalThis as any).structuredClone === "function")
    return (globalThis as any).structuredClone(v);
  return JSON.parse(JSON.stringify(v));
}

function nextId(sections: any[], base: string) {
  const used = new Set(sections.map((s) => String(s.id)));
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

function getVariantOptions(sectionType: string): readonly string[] | null {
  const opts = VARIANTS_BY_TYPE[String(sectionType)];
  return opts && opts.length ? opts : null;
}

function cycleVariant(current: string, options: readonly string[], dir: -1 | 1) {
  if (!options.length) return current;
  const idx = options.indexOf(current);
  const i = idx >= 0 ? idx : 0;
  return options[(i + dir + options.length) % options.length];
}

function isKnownVariant(v: string, options: readonly string[]) {
  return options.includes(String(v));
}

function SortableSectionCard({
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

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: s.id,
      disabled: locked,
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const canDelete = !locked && String(s.type) === "split";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx(
        "rounded-2xl border border-slate-200 bg-slate-50 p-3",
        isDragging && "opacity-70 ring-2 ring-slate-300"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={cx(
                "inline-flex items-center justify-center rounded-xl border px-2 py-1 text-xs font-semibold",
                locked
                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-grab active:cursor-grabbing"
              )}
              title={locked ? "Section verrouillée (lock:true)" : "Glisser pour réordonner"}
              {...attributes}
              {...listeners}
              disabled={locked}
            >
              ⠿
            </button>

            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {s.title ?? s.type}
              </div>
              <div className="text-xs text-slate-500">
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
              className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
            />
          </label>
        </div>
      </div>

      <div className="mt-2">
        {(() => {
          const current = String((s.variant as any) ?? "A");
          const opts = getVariantOptions(String(s.type));

          if (opts) {
            const value = isKnownVariant(current, opts) ? current : opts[0];

            return (
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  className="w-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  title="Variant précédent"
                  onClick={() => onChangeVariant(s.id, cycleVariant(value, opts, -1))}
                >
                  ◀
                </button>

                <select
                  value={value}
                  onChange={(e) => onChangeVariant(s.id, e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  title="Variant"
                >
                  {opts.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="w-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  title="Variant suivant"
                  onClick={() => onChangeVariant(s.id, cycleVariant(value, opts, 1))}
                >
                  ▶
                </button>
              </div>
            );
          }

          return (
            <input
              value={current}
              onChange={(e) => onChangeVariant(s.id, e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              placeholder="variant (ex: A, B, stats, twoCol...)"
            />
          );
        })()}

        <div className="mt-1 text-[11px] text-slate-500">
          Variants = select + ◀ ▶. Si tu ajoutes un nouveau variant dans le code, ajoute-le aussi dans{" "}
          <b>VARIANTS_BY_TYPE</b>.
        </div>
      </div>
    </div>
  );
}

export function StudioPanel({
  config,
  setConfig,
}: {
  config: TemplateConfig;
  setConfig: React.Dispatch<React.SetStateAction<TemplateConfig>>;
}) {
  const [min, setMin] = React.useState(false);
  const [dock, setDock] = React.useState<DockSide>("left");

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const v = localStorage.getItem("studioPanel:min");
    if (v === "1") setMin(true);

    const d = (localStorage.getItem("studioPanel:dock") as DockSide | null) ?? null;
    if (d === "left" || d === "right") setDock(d);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("studioPanel:min", min ? "1" : "0");
  }, [min]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("studioPanel:dock", dock);
  }, [dock]);

  const update = (fn: (draft: TemplateConfig) => TemplateConfig) => {
    setConfig((prev) => fn(cloneConfig(prev)));
  };

  const setThemeVariant = (v: string) =>
    update((d) => {
      d.options = d.options ?? ({} as any);
      d.options.themeVariant = v as any;
      return d;
    });

  const setFx = (key: string, value: boolean) =>
    update((d) => {
      d.options = d.options ?? ({} as any);
      d.options.fx = { ...(d.options.fx ?? {}), [key]: value } as any;
      return d;
    });

  const setLayoutToken = (key: "container" | "density" | "radius", value: any) =>
    update((d) => {
      d.options = d.options ?? ({} as any);
      d.options.layout = { ...(d.options.layout ?? {}), [key]: value } as any;
      return d;
    });

  const setLogoMode = (mode: (typeof LOGO_MODES)[number]) =>
    update((d) => {
      d.brand = d.brand ?? ({} as any);
      (d.brand as any).logo = (d.brand as any).logo ?? {};
      (d.brand as any).logo.mode = mode as any;
      return d;
    });

  const setSectionEnabled = (id: string, enabled: boolean) =>
    update((d) => {
      const s = d.sections?.find((x: any) => x.id === id);
      if (s) s.enabled = enabled;
      return d;
    });

  const setSectionVariant = (id: string, variant: string) =>
    update((d) => {
      const s = d.sections?.find((x: any) => x.id === id);
      if (s) s.variant = variant as any;
      return d;
    });

  const removeSection = (id: string) =>
    update((d) => {
      d.sections = (d.sections ?? []).filter((s: any) => String(s.id) !== String(id));
      return d;
    });

  const addSplit = () =>
    update((d) => {
      d.sections = Array.isArray(d.sections) ? d.sections : ([] as any);
      const id = nextId(d.sections as any[], "split");

      const heroIndex = (d.sections as any[]).findIndex((x) => x.type === "hero");
      const insertAt = heroIndex >= 0 ? heroIndex + 1 : Math.min(1, (d.sections as any[]).length);

      (d.sections as any[]).splice(insertAt, 0, {
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

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    if (active.id === over.id) return;

    update((d) => {
      const ids = (d.sections ?? []).map((x: any) => x.id);
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return d;

      const moving = (d.sections as any[])[oldIndex];
      if (moving?.lock) return d;

      const target = (d.sections as any[])[newIndex];
      if (target?.lock) return d;

      d.sections = arrayMove(d.sections as any[], oldIndex, newIndex) as any;
      return d;
    });
  };

  const panelBaseCore =
    "fixed bottom-4 z-[9999] w-[340px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-[0_18px_60px_rgba(0,0,0,0.18)] overflow-hidden";
  const panelDock = dock === "right" ? "right-4" : "left-4";
  const panelBase = cx(panelBaseCore, panelDock);

  if (min) {
    return (
      <div className={cx(panelBase, "p-3")}>
        <button
          onClick={() => setMin(false)}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          StudioPanel ▸
        </button>
      </div>
    );
  }

  const currentContainer = ((config.options?.layout as any)?.container ?? "7xl") as (typeof CONTAINERS)[number];
  const currentDensity = ((config.options?.layout as any)?.density ?? "normal") as (typeof DENSITIES)[number];
  const currentRadius = Number((config.options?.layout as any)?.radius ?? 24) as (typeof RADII)[number];
  const currentLogoMode = (((config.brand as any)?.logo?.mode ?? "logoPlusText") as any) as (typeof LOGO_MODES)[number];

  const sectionIds = React.useMemo(() => (config.sections ?? []).map((s: any) => s.id), [config.sections]);

  return (
    <div className={panelBase}>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">StudioPanel</div>
          <div className="text-[11px] text-slate-500 truncate">
            Dock: <b>{dock}</b>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDock((d) => (d === "left" ? "right" : "left"))}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            title="Basculer à gauche/droite"
          >
            ⇆ Dock
          </button>

          <button
            onClick={() => setMin(true)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            Minimiser
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(100vh-2rem-56px)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Thème global</div>
            <select
              value={(config.options?.themeVariant as any) ?? "amberOrange"}
              onChange={(e) => setThemeVariant(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {THEME_VARIANTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Brand</div>
            <div className="mt-3">
              <div className="text-[11px] font-semibold text-slate-600 mb-1">Logo mode</div>
              <select
                value={currentLogoMode}
                onChange={(e) => setLogoMode(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {LOGO_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Layout global</div>

            <div className="mt-3 space-y-3">
              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-1">Container</div>
                <select
                  value={currentContainer}
                  onChange={(e) => setLayoutToken("container", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {CONTAINERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-1">Density</div>
                <select
                  value={currentDensity}
                  onChange={(e) => setLayoutToken("density", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {DENSITIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-600 mb-1">Radius</div>
                <select
                  value={String(currentRadius)}
                  onChange={(e) => setLayoutToken("radius", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
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

          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">FX</div>

            <div className="mt-3 space-y-2 text-sm text-slate-800">
              {[
                ["enabled", "FX activés"],
                ["ambient", "Ambient"],
                ["softGlow", "Soft glow"],
              ].map(([k, label]) => (
                <label key={k} className="flex items-center justify-between gap-3">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={!!(config.options?.fx as any)?.[k]}
                    onChange={(e) => setFx(k, e.target.checked)}
                  />
                </label>
              ))}
            </div>

            <div className="mt-2 text-[11px] text-slate-500">
              (BorderScan/Shimmer CTA masqués pour l’instant — on les remettra si on a un vrai use-case.)
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sections</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addSplit}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  + Split
                </button>
                <button
                  type="button"
                  onClick={removeAllSplits}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                >
                  - Splits
                </button>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-500">
              Glisse avec ⠿ pour réordonner. Les sections <b>lock</b> ne bougent pas. Les <b>split</b> sont supprimables (🗑).
            </div>

            <div className="mt-3 space-y-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                  {(config.sections ?? []).map((s: any) => (
                    <SortableSectionCard
                      key={s.id}
                      s={s}
                      onToggleEnabled={setSectionEnabled}
                      onChangeVariant={setSectionVariant}
                      onRemove={removeSection}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Si le header sticky saute: un parent avec <b>transform</b>/<b>filter</b>/<b>overflow</b> peut casser sticky.
          </div>
        </div>
      </div>
    </div>
  );
}
