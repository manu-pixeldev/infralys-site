"use client";

import type { TemplateConfigInput } from "../../../types";

export type ContainerToken = "5xl" | "6xl" | "7xl" | "full";
export type DensityToken = "compact" | "normal" | "spacious";
export type RadiusToken = 16 | 24 | 32;

export function useLayoutControls(
  config: TemplateConfigInput,
  update: (fn: (draft: TemplateConfigInput) => void) => void
) {
  const currentContainer = ((config as any)?.options?.layout?.container ??
    "7xl") as ContainerToken;

  const currentDensity = ((config as any)?.options?.layout?.density ??
    "normal") as DensityToken;

  const currentRadius = Number(
    (config as any)?.options?.layout?.radius ?? 24
  ) as RadiusToken;

  const setLayoutToken = (
    key: "container" | "density" | "radius",
    value: ContainerToken | DensityToken | RadiusToken
  ) =>
    update((d) => {
      d.options = d.options ?? {};
      d.options.layout = d.options.layout ?? {};
      (d.options.layout as any)[key] = value;
    });

  return {
    currentContainer,
    currentDensity,
    currentRadius,
    setLayoutToken,
  };
}
