"use client";

import React from "react";

import type { TemplateConfigInput } from "../types";
import type { NormalizedSection } from "./normalize-config";

import { cx } from "../theme";
import { resolveLegacyComponent } from "./legacy-adapter";
import { dataAttrForSection } from "../core/dom-ids";

type AnyRecord = Record<string, any>;

export type RenderSectionsArgs = {
  sections: NormalizedSection[];
  theme: any;

  // header wiring
  navModel: any;
  onNavTo: (href: string) => void;
  activeDomId: string | null;
  activeHref: string;
  isScrolled: boolean;
  scrollT: number;

  // reveal wrapper
  registerReveal: (id: string) => (node: HTMLElement | null) => void;

  // fx
  fxAmbient: boolean;
  fxBorderScan: boolean;

  // config passthrough
  cfg: TemplateConfigInput;
  setConfig?: (next: TemplateConfigInput) => void;
};

export function renderSections({
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
}: RenderSectionsArgs) {
  const wrapSection = (
    sec: NormalizedSection,
    node: React.ReactNode,
    idx: number,
    variant: string
  ) => {
    const t = String(sec.type).toLowerCase();
    if (t === "header" || t === "top") {
      return <React.Fragment key={sec.id}>{node}</React.Fragment>;
    }

    const className = cx(
      "reveal",
      idx > 0 && "te-divider",
      fxAmbient && "fx-softglow",
      fxBorderScan && "fx-border-scan"
    );

    return (
      <div
        key={`wrap-${sec.id}`}
        id={sec.domId}
        ref={registerReveal(sec.id)}
        className={className}
        style={{ scrollMarginTop: "var(--header-offset, 84px)" }}
        data-domid={sec.domId}
        {...dataAttrForSection(sec.id)}
        data-variant={variant}
      >
        {node}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {sections
        .filter((s) => s.enabled && !s.hidden)
        .map((sec, idx) => {
          const { variant, Component } = resolveLegacyComponent(sec);
          if (!Component) return null;

          const isHeader = String(sec.type).toLowerCase() === "header";

          const node = (
            <section
              className="te-section"
              {...dataAttrForSection(sec.id)}
              data-variant={variant}
            >
              <Component
                theme={theme}
                section={sec}
                content={(sec as AnyRecord)?.content}
                options={(sec as AnyRecord)?.options}
                navModel={isHeader ? navModel : undefined}
                onNavTo={isHeader ? onNavTo : undefined}
                activeDomId={isHeader ? activeDomId : undefined}
                activeHref={isHeader ? activeHref : undefined}
                isScrolled={isHeader ? isScrolled : undefined}
                scrollT={isHeader ? scrollT : undefined}
                sections={isHeader ? sections : undefined}
                config={cfg}
                setConfig={setConfig}
              />
            </section>
          );

          return wrapSection(sec, node, idx, variant);
        })}
    </div>
  );
}
