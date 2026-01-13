"use client";

import React from "react";

import type { TemplateConfigInput } from "./types";
import { cx } from "./theme";
import { FxStyles } from "./fx-styles";

// engine
import { normalizeConfig } from "./engine/normalize-config";
import { renderSections } from "./engine/render-sections";
import { useTemplateEngine } from "./engine/use-template-engine";

// studio (isolated portal)
import { StudioPortal } from "./studio/StudioPortal";

// core
import { useScrollRestoreNoFlash } from "./core/nav/scroll-restore";

type Props = {
  config: TemplateConfigInput;
  // ✅ IMPORTANT: dispatch React (permet setConfig(prev => next))
  setConfig?: React.Dispatch<React.SetStateAction<TemplateConfigInput>>;
};

type AnyRecord = Record<string, any>;

export function TemplateEngine({ config, setConfig }: Props) {
  // Phase 0 — no-flash scroll restore
  useScrollRestoreNoFlash();

  /**
   * 1) Normalize ONCE
   * - pure
   * - deterministic
   * - no DOM
   */
  const norm = React.useMemo(() => normalizeConfig(config), [config]);

  const cfg = React.useMemo(
    () => norm as AnyRecord as TemplateConfigInput,
    [norm]
  );

  const sections = React.useMemo(
    () => (norm as AnyRecord).sections ?? [],
    [norm]
  );

  /**
   * 2) Engine brain
   * (theme, nav, spy, fx, reveal)
   */
  const engine = useTemplateEngine(cfg, sections);

  const {
    theme,
    parsedTheme,
    canvasStyle,
    fxEnabled,
    fxAmbient,
    fxShimmer,
    fxBorderScan,
    navModel,
    onNavTo,
    activeDomId,
    activeHref,
    isScrolled,
    scrollT,
    registerReveal,
  } = engine;

  /**
   * Mounted guard
   * (StudioPortal + data-mounted attr)
   */
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      document.documentElement.setAttribute("data-mounted", "1");
    } catch {}
  }, []);

  /**
   * Root CSS variables
   */
  const rootStyle = React.useMemo(() => {
    const out: React.CSSProperties = {};
    (out as any)["--header-offset"] = "84px";

    const canvasVar = (theme as any)?.canvasVar;
    if (canvasVar && typeof canvasVar === "object") {
      Object.assign(out as any, canvasVar);
    }

    return out;
  }, [theme]);

  // ✅ où est le flag studio ? (dans tes fichiers c’est options.studio.enabled)
  const studioEnabled = Boolean((cfg as AnyRecord)?.options?.studio?.enabled);

  return (
    <>
      {/* Global FX styles */}
      <FxStyles enabled={fxEnabled} ambient={fxAmbient} shimmer={fxShimmer} />

      <div
        className={cx(
          "template-engine",
          (theme as any)?.bgPage,
          (theme as any)?.text
        )}
        data-theme={`${parsedTheme.accent}|${parsedTheme.canvas}`}
        data-canvas-style={(theme as any)?.canvasStyle ?? canvasStyle}
        style={rootStyle}
      >
        {/* Anchor for scroll-to-top */}
        <div id="top" />

        {renderSections({
          sections,
          theme,

          navModel,
          onNavTo,
          activeDomId,
          activeHref,
          isScrolled,
          scrollT,

          registerReveal,

          fxAmbient,
          fxBorderScan,

          cfg,
          setConfig, // ✅ dispatch, ok
        })}
      </div>

      {/* Studio (isolated, guarded) */}
      <StudioPortal
        enabled={studioEnabled && mounted}
        config={cfg}
        setConfig={setConfig}
      />
    </>
  );
}
