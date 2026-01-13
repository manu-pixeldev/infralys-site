// app/components/template-engine/studio/panel/StudioPanel.tsx
"use client";

import React from "react";
import type { TemplateConfigInput } from "../../types";
import { deepClone } from "../../core/deep-clone";

// sections UI
import ThemeSection from "./sections/ThemeSection";
import { BrandSection } from "./sections/BrandSection";
import LayoutSection from "./sections/LayoutSection";
import NavFxSections from "./sections/NavFxSections";
import { TeamDefinition } from "../../../../sections/definitions/team.definition";

import SectionsSection from "./sections/sectionssections/SectionsSection";

type CanvasStyle = "classic" | "immersive";
type AutoAccentMode = "off" | "muted" | "vivid";

export type StudioPanelProps = {
  config: TemplateConfigInput;
  setConfig: React.Dispatch<React.SetStateAction<TemplateConfigInput>>;
};

export default function StudioPanel({ config, setConfig }: StudioPanelProps) {
  /**
   * ✅ Typed immutable update helper
   * - no "prev implicitly any"
   * - deepClone for safety (upgrade-friendly)
   */
  const update = React.useCallback(
    (fn: (draft: TemplateConfigInput) => void) => {
      setConfig((prev: TemplateConfigInput) => {
        const next: TemplateConfigInput = deepClone(prev);
        fn(next);
        return next;
      });
    },
    [setConfig]
  );

  /**
   * Theme bridge (minimal + upgrade-safe)
   * (still stored under config.options.* for now)
   */
  const themeVariantRaw =
    (config as any)?.options?.themeVariant ?? "amberOrange|classic";

  const canvasStyle: CanvasStyle =
    (((config as any)?.options?.canvasStyle ?? "classic") as CanvasStyle) ??
    "classic";

  const autoAccentMode: AutoAccentMode =
    (((config as any)?.options?.autoAccentMode ?? "off") as AutoAccentMode) ??
    "off";

  const setThemeVariant = React.useCallback(
    (nextThemeVariant: string) =>
      update((d) => {
        (d as any).options = (d as any).options ?? {};
        (d as any).options.themeVariant = nextThemeVariant;
      }),
    [update]
  );

  const setCanvasStyle = React.useCallback(
    (style: CanvasStyle) =>
      update((d) => {
        (d as any).options = (d as any).options ?? {};
        (d as any).options.canvasStyle = style;
      }),
    [update]
  );

  const setAutoAccentMode = React.useCallback(
    (mode: AutoAccentMode) =>
      update((d) => {
        (d as any).options = (d as any).options ?? {};
        (d as any).options.autoAccentMode = mode;
      }),
    [update]
  );

  /**
   * Panel layout (maxHeight on shell + proper scroll area)
   */
  const panelTopStyle = React.useMemo<React.CSSProperties>(
    () => ({
      top: "calc(var(--header-h, 84px) + env(safe-area-inset-top, 0px) + 12px)",
    }),
    []
  );

  const panelShellStyle = React.useMemo<React.CSSProperties>(
    () => ({
      maxHeight:
        "calc(100dvh - var(--header-h, 84px) - env(safe-area-inset-top, 0px) - 24px)",
    }),
    []
  );

  return (
    <div
      className="fixed right-4 z-[99999] w-[380px] max-w-[92vw]"
      style={panelTopStyle}
    >
      {/* ✅ shell flex-col + maxHeight here */}
      <div
        className="rounded-3xl border border-slate-200 bg-white/92 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.10)] overflow-hidden flex flex-col"
        style={panelShellStyle}
      >
        {/* header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="text-sm font-semibold text-slate-900">
            StudioPanel
          </div>
          <div className="text-xs text-slate-500 truncate">
            Template Engine • live config
          </div>
        </div>

        {/* ✅ real scrolling area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5 pt-4 space-y-4">
          <ThemeSection
            themeVariantRaw={themeVariantRaw}
            canvasStyle={canvasStyle}
            autoAccentMode={autoAccentMode}
            setThemeVariant={setThemeVariant}
            setCanvasStyle={setCanvasStyle}
            setAutoAccentMode={setAutoAccentMode}
          />

          <BrandSection config={config} update={update} />

          <LayoutSection config={config} update={update} />

          <NavFxSections config={config} update={update} />

          {/* ✅ Sections: reorder + enable/disable + variants */}
          <SectionsSection config={config} update={update} />
        </div>
      </div>
    </div>
  );
}
