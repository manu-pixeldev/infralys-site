// app/components/template-engine/variants.ts
import type { ComponentType } from "react";
import type { SectionType } from "./types";

import { ProofStats } from "./proof";

import {
  LegacyHeader,
  LegacyHero,
  LegacySplit,
  LegacyServices,
  LegacyTeam,
  LegacyGalleries,
  LegacyContact,
} from "./legacy";

/**
 * Maps: sectionType -> variantKey -> React component
 * ⚠️ Keep this PURE (no logic, no layout, no spacing)
 */
export type VariantMap = Partial<
  Record<SectionType, Record<string, ComponentType<any>>>
>;

/**
 * ============================================================
 * ✅ MAIN REGISTRY
 * ============================================================
 */
export const VARIANTS: VariantMap = {
  header: {
    A: LegacyHeader,
    B: LegacyHeader,
    C: LegacyHeader,
    D: LegacyHeader,
    E: LegacyHeader,
    F: LegacyHeader,
    G: LegacyHeader,
    H: LegacyHeader,
    I: LegacyHeader,
    J: LegacyHeader,
    K: LegacyHeader,
  },

  hero: {
    A: LegacyHero,
    B: LegacyHero,
    C: LegacyHero,
    D: LegacyHero,
    E: LegacyHero,
  },

  split: {
    A: LegacySplit,
    B: LegacySplit,
  },

  proof: {
    stats: ProofStats,
  },

  services: {
    A: LegacyServices,
    B: LegacyServices,
    C: LegacyServices,
  },

  team: {
    A: LegacyTeam,
    B: LegacyTeam,
    C: LegacyTeam,
  },

  gallery: {
    stack: LegacyGalleries,
    twoCol: LegacyGalleries,
    threeCol: LegacyGalleries,
  },

  contact: {
    AUTO: LegacyContact,
    A: LegacyContact,
    B: LegacyContact,
    C: LegacyContact,
  },

  /**
   * ❌ IMPORTANT
   * "top" is NOT a visual section → handled in TemplateEngine
   * DO NOT register it here.
   */
};

/**
 * ============================================================
 * ✅ VARIANT LISTS (StudioPanel / dropdowns)
 * ============================================================
 * ⚠️ Must stay in sync with VARIANTS
 */
export const VARIANTS_BY_TYPE: Record<string, readonly string[]> = {
  header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
  hero: ["A", "B", "C", "D", "E"],
  split: ["A", "B"],
  proof: ["stats"],
  gallery: ["stack", "twoCol", "threeCol"],
  contact: ["AUTO", "A", "B", "C"],
  services: ["A", "B", "C"],
  team: ["A", "B", "C"],

  /**
   * ❌ no "top" here either
   */
};
