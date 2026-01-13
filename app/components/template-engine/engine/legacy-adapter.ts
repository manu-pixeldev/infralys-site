// app/components/template-engine/engine/legacy-adapter.ts

import type { ComponentType } from "react";
import type { NormalizedSection } from "./normalize-config";
import { VARIANTS, VARIANTS_BY_TYPE } from "../variants";

type AnyRecord = Record<string, any>;

export type LegacyRenderResult = {
  /** Variant actually resolved (used by data-variant, fx, debug) */
  variant: string;
  Component: ComponentType<any> | null;
};

/**
 * Single adapter between modern engine & legacy variants system.
 * - pure
 * - deterministic
 * - no DOM / no side effects
 */
export function resolveLegacyComponent(
  section: NormalizedSection
): LegacyRenderResult {
  const type = String(section.type).toLowerCase();
  const requested = String(section.variant || "AUTO").trim();

  const bucket: AnyRecord | undefined =
    (VARIANTS as AnyRecord)[type] || (VARIANTS_BY_TYPE as AnyRecord)[type];

  if (!bucket) {
    return { variant: requested || "AUTO", Component: null };
  }

  // resolution order (legacy-compatible)
  if (bucket[requested]) {
    return { variant: requested, Component: bucket[requested] };
  }

  const upper = requested.toUpperCase();
  if (bucket[upper]) {
    return { variant: upper, Component: bucket[upper] };
  }

  if (bucket.AUTO) {
    return { variant: "AUTO", Component: bucket.AUTO };
  }

  if (bucket.A) {
    return { variant: "A", Component: bucket.A };
  }

  return { variant: requested || "AUTO", Component: null };
}
