// app/components/template-engine/engine/render-sections.tsx
"use client";

import React from "react";
import { cx } from "../theme";
import { VARIANTS, VARIANTS_BY_TYPE } from "../variants";
import { dataAttrForSection } from "../core/dom-ids";
import type { NormalizedSection } from "./normalize-config";

type AnyRecord = Record<string, any>;

function safeStr(v: unknown, fallback = ""): string {
  const s = String(v ?? "").trim();
  return s || fallback;
}

function pickVariant(type: string, requested?: string) {
  const t = String(type || "").toLowerCase();
  const v = safeStr(requested, "") || "AUTO";
  const bucket =
    (VARIANTS as AnyRecord)[t] || (VARIANTS_BY_TYPE as AnyRecord)[t];
  if (!bucket) return { variant: v, Comp: null as any };
  const Comp = bucket[v] || bucket.AUTO || bucket.A || null;
  return { variant: v, Comp };
}

export function renderSections(opts: {
  cfg: any;
  sections: NormalizedSection[];
  theme: any;
  fxAmbient: boolean;
  fxBorderScan: boolean;
  registerReveal: (id: string) => (node: HTMLElement | null) => void;

  navModel: any;
  onNavTo: (href: string) => void;
  activeDomId: string | null;
  activeHref: string;
  isScrolled: boolean;
  scrollT: number;

  setConfig?: (next: any) => void;
}) {
  const {
    cfg,
    sections,
    theme,
    fxAmbient,
    fxBorderScan,
    registerReveal,
    navModel,
    onNavTo,
    activeDomId,
    activeHref,
    isScrolled,
    scrollT,
    setConfig,
  } = opts;

  const wrap = (sec: NormalizedSection, node: React.ReactNode, idx: number) => {
    const t = String(sec.type || "").toLowerCase();
    if (t === "header" || t === "top")
      return <React.Fragment key={sec.id}>{node}</React.Fragment>;

    const withDivider = idx > 0;
    const className = cx(
      "reveal",
      withDivider && "te-divider",
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
        data-variant={sec.variant || "AUTO"}
      >
        {node}
      </div>
    );
  };

  return sections
    .filter((s) => s && s.enabled !== false && !s.hidden)
    .map((sec, idx) => {
      const { variant, Comp } = pickVariant(sec.type, sec.variant);
      if (!Comp) return null;

      const isHeader = String(sec.type).toLowerCase() === "header";

      const node = (
        <section
          className="te-section"
          {...dataAttrForSection(sec.id)}
          data-variant={variant}
        >
          <Comp
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

      return wrap(sec, node, idx);
    });
}
