// app/components/template-engine/studio/panel/hooks/useNavControls.ts
"use client";

import React from "react";
import type { TemplateConfigInput } from "../../../types";

export function normalizeDigitString(v: string) {
  const raw = String(v ?? "").replace(/[^\d]/g, "");
  if (!raw) return "";
  return raw.replace(/^0+(?=\d)/, "");
}

export function clampInt(n: number, min: number, max: number) {
  const x = Number.isFinite(n) ? n : min;
  return Math.max(min, Math.min(max, x));
}

export function readMaxDirectLinks(config: TemplateConfigInput) {
  const anyCfg = config as any;
  const v =
    anyCfg?.options?.nav?.maxDirectLinksInMenu ??
    anyCfg?.options?.maxDirectLinksInMenu ??
    anyCfg?.options?.maxDirectLinks ??
    anyCfg?.content?.nav?.maxDirectLinksInMenu ??
    anyCfg?.content?.nav?.maxDirectLinks ??
    4;

  return clampInt(Number(v), 0, 12);
}

export function useNavControls(
  config: TemplateConfigInput,
  update: (fn: (draft: TemplateConfigInput) => void) => void
) {
  const maxDirect = React.useMemo(() => readMaxDirectLinks(config), [config]);

  const setMaxDirect = React.useCallback(
    (n: number) => {
      update((d) => {
        const v = clampInt(Number(n), 0, 12);

        (d as any).options = (d as any).options ?? {};
        (d as any).options.nav = (d as any).options.nav ?? {};
        (d as any).content = (d as any).content ?? {};
        (d as any).content.nav = (d as any).content.nav ?? {};

        // source of truth
        (d as any).options.nav.maxDirectLinksInMenu = v;

        // compat / fallbacks
        (d as any).options.maxDirectLinksInMenu = v;
        (d as any).options.maxDirectLinks = v;
        (d as any).content.nav.maxDirectLinksInMenu = v;
        (d as any).content.nav.maxDirectLinks = v;
      });
    },
    [update]
  );

  return { maxDirect, setMaxDirect };
}
