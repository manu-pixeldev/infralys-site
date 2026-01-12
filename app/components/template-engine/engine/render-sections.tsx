"use client";

import React from "react";

import type { TemplateConfigInput, SectionType } from "../types";
import { cx } from "../theme";
import { resolveLegacyComponent } from "./legacy-adapter";

// core ids
import { domIdForSection, dataAttrForSection } from "../core/dom-ids";

type AnyRecord = Record<string, any>;

export type NormalizedSection = {
  id: string;
  type: SectionType;
  title?: string;
  label?: string;
  navLabel?: string;
  variant?: string;
  enabled?: boolean;
  hidden?: boolean;

  domId?: string;

  content?: any;
  options?: any;
  nav?: { label?: string; hide?: boolean };

  [k: string]: any;
};

function safeStr(v: unknown, fallback = ""): string {
  const s = String(v ?? "").trim();
  return s || fallback;
}

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

export function renderSections(args: RenderSectionsArgs) {
  const {
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
  } = args;

  const wrapSection = (
    sec: NormalizedSection,
    node: React.ReactNode,
    idx: number
  ) => {
    const t = String(sec.type || "").toLowerCase();
    if (t === "header" || t === "top") {
      return <React.Fragment key={sec.id}>{node}</React.Fragment>;
    }

    const domId = safeStr(sec.domId, domIdForSection(sec.id));
    const withDivider = idx > 0;

    const className = cx(
      "reveal",
      withDivider && "te-divider",
      fxAmbient && "fx-softglow",
      fxBorderScan && "fx-border-scan"
    );

    const { Variant } = resolveLegacyComponent(sec as any);

    return (
      <div
        key={`wrap-${sec.id}`}
        id={domId}
        ref={registerReveal(sec.id)}
        className={className}
        style={{ scrollMarginTop: "var(--header-offset, 84px)" }}
        data-domid={domId}
        {...dataAttrForSection(sec.id)}
        data-variant={Variant || sec.variant || "AUTO"}
      >
        {node}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {sections
        .filter((s) => s && s.enabled !== false && !s.hidden)
        .map((sec, idx) => {
          const { Variant, Component } = resolveLegacyComponent(sec as any);
          if (!Component) return null;

          const isHeader = String(sec.type).toLowerCase() === "header";

          const node = (
            <section
              className="te-section"
              {...dataAttrForSection(sec.id)}
              data-variant={Variant || sec.variant || "AUTO"}
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

          return wrapSection(sec, node, idx);
        })}
    </div>
  );
}
