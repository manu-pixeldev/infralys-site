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

// core (phase 0)
import { useScrollRestoreNoFlash } from "./core/nav/scroll-restore";

type Props = {
  config: TemplateConfigInput;
  setConfig?: (next: TemplateConfigInput) => void;
};

type AnyRecord = Record<string, any>;

export function TemplateEngine({ config, setConfig }: Props) {
  // Phase 0: no-flash scroll restore
  useScrollRestoreNoFlash();

  // 1) Normalize once (NO DOM)
  const norm = React.useMemo(() => normalizeConfig(config), [config]);
  const cfg = norm as AnyRecord as TemplateConfigInput;
  const sections = (norm as AnyRecord).sections ?? [];

  // 2) Engine (theme/nav/spy/fx/reveal)
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

  // mounted guard (studio portal + data attr)
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    try {
      document.documentElement.setAttribute("data-mounted", "1");
    } catch {}
  }, []);

  // root vars
  const rootStyle = React.useMemo(() => {
    const out: React.CSSProperties = {};
    (out as any)["--header-offset"] = "84px";

    const canvasVar = (theme as any)?.canvasVar;
    if (
      canvasVar &&
      typeof canvasVar === "object" &&
      !Array.isArray(canvasVar)
    ) {
      Object.assign(out as any, canvasVar);
    }
    return out;
  }, [theme]);

  return (
    <>
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
          setConfig,
        })}
      </div>

      <StudioPortal
        enabled={Boolean((cfg as AnyRecord)?.studio?.enabled) && mounted}
        config={cfg}
        setConfig={setConfig}
      />
    </>
  );
}
