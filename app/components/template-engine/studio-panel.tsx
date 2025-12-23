"use client";

import React from "react";
import type { TemplateConfig } from "./types";

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

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function cloneConfig<T>(v: T): T {
  if (typeof (globalThis as any).structuredClone === "function") {
    return (globalThis as any).structuredClone(v);
  }
  return JSON.parse(JSON.stringify(v));
}

export function StudioPanel({
  config,
  setConfig,
}: {
  config: TemplateConfig;
  setConfig: React.Dispatch<React.SetStateAction<TemplateConfig>>;
}) {
  const [min, setMin] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const v = localStorage.getItem("studioPanel:min");
    if (v === "1") setMin(true);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("studioPanel:min", min ? "1" : "0");
  }, [min]);

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

  const setSectionEnabled = (id: string, enabled: boolean) =>
    update((d) => {
      const s = d.sections?.find((x) => x.id === id);
      if (s) s.enabled = enabled;
      return d;
    });

  const setSectionVariant = (id: string, variant: string) =>
    update((d) => {
      const s = d.sections?.find((x) => x.id === id);
      if (s) s.variant = variant as any;
      return d;
    });

  const panelBase =
    "fixed left-4 bottom-4 z-[9999] w-[320px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-[0_18px_60px_rgba(0,0,0,0.18)] overflow-hidden";

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

  return (
    <div className={panelBase}>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="text-sm font-semibold text-slate-900">StudioPanel</div>
        <button
          onClick={() => setMin(true)}
          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
        >
          Minimiser
        </button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(100vh-2rem-56px)]">
        <div className="space-y-4">
          {/* THEME */}
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

          {/* LAYOUT */}
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
                <div className="mt-1 text-[11px] text-slate-500">
                  7xl = large pro. full = très large (attention lisibilité).
                </div>
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

          {/* FX */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">FX</div>

            <div className="mt-3 space-y-2 text-sm text-slate-800">
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
                    checked={!!(config.options?.fx as any)?.[k]}
                    onChange={(e) => setFx(k, e.target.checked)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* SECTIONS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sections</div>

            <div className="mt-3 space-y-3">
              {(config.sections ?? []).map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{s.title ?? s.type}</div>
                      <div className="text-xs text-slate-500">
                        {s.type} — {s.id}
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      ON
                      <input
                        type="checkbox"
                        checked={s.enabled !== false}
                        onChange={(e) => setSectionEnabled(s.id, e.target.checked)}
                      />
                    </label>
                  </div>

                  <div className="mt-2">
                    <input
                      value={(s.variant as any) ?? "A"}
                      onChange={(e) => setSectionVariant(s.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      placeholder="variant (ex: A, B, stats, twoCol...)"
                    />
                    <div className="mt-1 text-[11px] text-slate-500">
                      gallery → <b>stack</b> / <b>twoCol</b> / <b>threeCol</b> — proof → <b>stats</b> — split → <b>A</b> / <b>B</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Si le header “sticky” saute : vérifie qu’aucun parent n’a <b>overflow-hidden</b> ou <b>transform</b>.
          </div>
        </div>
      </div>
    </div>
  );
}
