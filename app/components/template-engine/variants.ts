// app/components/template-engine/variants.ts
import type { ComponentType } from "react";
import type { SectionType } from "./types";

import ProHeader, { ProServices, ProGallery } from "./pro";
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
    PRO: ProHeader,
  },

  hero: {
    A: LegacyHero,
    B: LegacyHero,
    C: LegacyHero,
    D: LegacyHero,
    E: LegacyHero,
    F: LegacyHero,
    G: LegacyHero,
    H: LegacyHero,
  },

  split: { A: LegacySplit, B: LegacySplit },

  services: {
    A: LegacyServices,
    B: LegacyServices,
    C: LegacyServices,
    D: ProServices,
    E: LegacyServices,
  },

  team: { A: LegacyTeam, B: LegacyTeam, C: LegacyTeam },

  gallery: {
    stack: LegacyGalleries,
    twoCol: LegacyGalleries,
    threeCol: LegacyGalleries,
    proStack: ProGallery,
    proTwoCol: ProGallery,
    proThreeCol: ProGallery,
  },

  proof: { stats: ProofStats },

  contact: {
    AUTO: LegacyContact,
    A: LegacyContact,
    B: LegacyContact,
    C: LegacyContact,
    D: LegacyContact,
    E: LegacyContact,
  },
};

export const VARIANTS_BY_TYPE: Record<string, readonly string[]> = {
  header: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "PRO"],
  hero: ["A", "B", "C", "D", "E", "F", "G", "H"],
  split: ["A", "B"],
  proof: ["stats"],
  gallery: [
    "stack",
    "twoCol",
    "threeCol",
    "proStack",
    "proTwoCol",
    "proThreeCol",
  ],
  contact: ["AUTO", "A", "B", "C", "D", "E"],
  services: ["A", "B", "C", "D", "E"],
  team: ["A", "B", "C"],
};
