// app/components/template-engine/studio/panel/sections/registry.ts

import type { SectionDefinition } from "./definitions";

// --- Studio (UI) definitions (label + variants) ---
import { SECTION_DEFINITIONS } from "./definitions";

// --- Canon (métier / long-terme) ---
// On importe uniquement ce qui existe déjà côté canon.
// (On peut compléter au fur et à mesure sans casser le Studio.)
import { TeamDefinition } from "../../../sections/definitions/team.definition";

// Types canon minimal (on ne force pas un mega-type maintenant)
export type CanonDefinition = {
  type: string;
  // + optional fields (intent, risks, etc.) but keep it flexible
  [k: string]: unknown;
};

export type SectionMeta = {
  type: string;
  canon?: CanonDefinition;
  studio?: SectionDefinition;
};

// --- registry internal map ---
const CANON_DEFINITIONS: Record<string, CanonDefinition> = {
  [TeamDefinition.type]: TeamDefinition as unknown as CanonDefinition,
};

const ALL_TYPES = new Set<string>([
  ...Object.keys(SECTION_DEFINITIONS),
  ...Object.keys(CANON_DEFINITIONS),
]);

const REGISTRY: Record<string, SectionMeta> = Object.fromEntries(
  Array.from(ALL_TYPES).map((type) => [
    type,
    {
      type,
      studio: (SECTION_DEFINITIONS as any)[type] as
        | SectionDefinition
        | undefined,
      canon: CANON_DEFINITIONS[type],
    } satisfies SectionMeta,
  ])
) as Record<string, SectionMeta>;

/**
 * Get meta for a section type.
 * Always returns an object (safe fallback) to keep UI deterministic.
 */
export function getSectionMeta(type: string): SectionMeta {
  const key = String(type || "");
  return (
    REGISTRY[key] ?? {
      type: key,
      studio: (SECTION_DEFINITIONS as any)[key] as
        | SectionDefinition
        | undefined,
      canon: CANON_DEFINITIONS[key],
    }
  );
}

/**
 * List all metas (stable order).
 */
export function getAllSectionMetas(): SectionMeta[] {
  return Array.from(ALL_TYPES)
    .sort()
    .map((t) => getSectionMeta(t));
}
