// app/components/template-engine/template-engine.tsx
"use client";

import React from "react";

import type { TemplateConfigInput } from "./types";
import { cx } from "./theme";
import { FxStyles } from "./fx-styles";

// engine
import { normalizeConfig } from "./engine/normalize-config";
import { renderSections } from "./engine/renderSections";
import { useTemplateEngine } from "./engine/useTemplateEngine";

// core
import { useReveal } from "./core/fx/reveal";
import { useScrollRestoreNoFlash } from "./core/nav/scroll-restore";

// studio
import { StudioPortal } from "./studio/StudioPortal";

type Props = {
  config: TemplateConfigInput;
  setConfig?: (next: TemplateConfigInput) => void;
};

export function TemplateEngine({ config, setConfig }: Props) {
  // ---------------------------------------------------------------------------
  // Phase 0 guards
  // ---------------------------------------------------------------------------
  useScrollRestoreNoFlash();

  // ---------------------------------------------------------------------------
  // Normalize config (Phase 1 canonical)
  // ---------------------------------------------------------------------------
  const cfg = React.useMemo(() => normalizeConfig(config), [config]);
  const sections = cfg.sections;

  // ---------------------------------------------------------------------------
  // Reveal system
  // ---------------------------------------------------------------------------
  const revealApi: any = useReveal();
  const registerReveal: (id: string) => (node: HTMLElement | null) => void =
    typeof revealApi === "function"
      ? revealApi
      : typeof revealApi?.registerReveal === "function"
      ? revealApi.registerReveal
      : typeof revealApi?.register === "function"
      ? revealApi.register
      : () => () => {};

  // ---------------------------------------------------------------------------
  // Engine orchestration (theme, nav, scroll, fx)
  // ---------------------------------------------------------------------------
  const engine = useTemplateEngine(cfg, sections);

  // ---------------------------------------------------------------------------
  // Root CSS vars
  // ---------------------------------------------------------------------------
  const rootStyle = React.useMemo(() => {
    const out: React.CSSProperties = {};
    (out as any)["--header-offset"] = "84px";

    const canvasVar = (engine.theme as any)?.canvasVar;
    if (
      canvasVar &&
      typeof canvasVar === "object" &&
      !Array.isArray(canvasVar)
    ) {
      Object.assign(out as any, canvasVar);
    }

    return out;
  }, [engine.theme]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <FxStyles
        enabled={engine.fxEnabled}
        ambient={engine.fxAmbient}
        shimmer={engine.fxShimmer}
      />

      <div
        className={cx(
          "template-engine",
          (engine.theme as any)?.bgPage,
          (engine.theme as any)?.text
        )}
        data-theme={`${engine.parsedTheme?.accent}|${engine.parsedTheme?.canvas}`}
        data-canvas-style={engine.canvasStyle}
        style={rootStyle}
      >
        <div id="top" />

        <div className="min-h-screen">
          {renderSections({
            cfg,
            sections,
            theme: engine.theme,
            fxAmbient: engine.fxAmbient,
            fxBorderScan: engine.fxBorderScan,
            registerReveal,

            navModel: engine.navModel,
            onNavTo: engine.onNavTo,
            activeDomId: engine.activeDomId,
            activeHref: engine.activeHref,
            isScrolled: engine.isScrolled,
            scrollT: engine.scrollT,

            setConfig,
          })}
        </div>
      </div>

      {/* Studio (isolated, guarded) */}
      <StudioPortal
        enabled={Boolean((cfg as any)?.studio?.enabled)}
        config={cfg}
        setConfig={setConfig}
      />
    </>
  );
}
