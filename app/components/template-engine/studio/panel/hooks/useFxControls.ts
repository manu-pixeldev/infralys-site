// app/components/template-engine/studio/panel/hooks/useFxControls.ts
"use client";

import React from "react";
import type { TemplateConfigInput } from "../../../types";

export type FxKey =
  | "enabled"
  | "ambient"
  | "softGlow"
  | "borderScan"
  | "shimmerCta";

export function useFxControls(
  config: TemplateConfigInput,
  update: (fn: (draft: TemplateConfigInput) => void) => void
) {
  const fx = ((config as any)?.options?.fx ?? {}) as Record<string, any>;

  const isOn = React.useCallback((key: FxKey) => !!fx?.[key], [fx]);

  const setFx = React.useCallback(
    (key: FxKey, value: boolean) => {
      update((d) => {
        (d as any).options = (d as any).options ?? {};
        (d as any).options.fx = {
          ...((d as any).options.fx ?? {}),
          [key]: !!value,
        };
      });
    },
    [update]
  );

  return { fx, isOn, setFx };
}
