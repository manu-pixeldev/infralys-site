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

type VariantMap = Record<string, ComponentType<any>>;

// ✅ important: Partial = pas besoin de couvrir *tous* les SectionType possibles
type Registry = Partial<Record<SectionType, VariantMap>>;

export const VARIANTS: Registry = {
  top: { A: () => null },

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

  hero: { A: LegacyHero, B: LegacyHero },

  split: { A: LegacySplit, B: LegacySplit },

  services: { A: LegacyServices, B: LegacyServices, C: LegacyServices },

  team: { A: LegacyTeam, B: LegacyTeam, C: LegacyTeam },

  gallery: {
    stack: LegacyGalleries,
    twoCol: LegacyGalleries,
    threeCol: LegacyGalleries,
  },

  proof: { stats: ProofStats },

  contact: { AUTO: LegacyContact, A: LegacyContact, B: LegacyContact, C: LegacyContact },
};

export const VARIANTS_BY_TYPE: Record<string, readonly string[]> = {
  header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
  hero: ["A", "B"],
  split: ["A", "B"],
  proof: ["stats"],
  gallery: ["stack", "twoCol", "threeCol"],
  contact: ["AUTO", "A", "B", "C"],
  services: ["A", "B", "C"],
  team: ["A", "B", "C"],
};
