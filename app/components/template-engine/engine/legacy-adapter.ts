// app/components/template-engine/engine/legacy-adapter.ts

import type { NormalizedSection } from "./normalize-config";
import { VARIANTS, VARIANTS_BY_TYPE } from "../variants";

type AnyRecord = Record<string, any>;

export type LegacyRenderResult = {
  Variant: string;
  Component: React.ComponentType<any> | null;
};

/**
 * Single adapter between modern engine & legacy variants system.
 * No DOM, no side effects.
 */
export function resolveLegacyComponent(
  section: NormalizedSection
): LegacyRenderResult {
  const type = String(section.type || "").toLowerCase();
  const requested = String(section.variant || "AUTO");

  const bucket =
    (VARIANTS as AnyRecord)[type] || (VARIANTS_BY_TYPE as AnyRecord)[type];

  if (!bucket) {
    return { Variant: requested, Component: null };
  }

  const Component = bucket[requested] || bucket.AUTO || bucket.A || null;

  return {
    Variant: requested,
    Component,
  };
}
