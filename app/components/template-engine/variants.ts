import type { ComponentType } from "react";
import type { SectionType } from "./types";

import { ProHeader, ProServices, ProGallery } from "./pro";
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
    // template.config: A..K + PRO
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
    // template.config: A..H (on map tout sur LegacyHero tant que tu n'as pas de HeroPro dédié)
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
    // template.config: A..E
    A: LegacyServices,
    B: LegacyServices,
    C: LegacyServices,
    D: ProServices,
    E: LegacyServices,
  },

  team: { A: LegacyTeam, B: LegacyTeam, C: LegacyTeam },

  gallery: {
    // template.config: stack/twoCol/threeCol + proStack/proTwoCol/proThreeCol
    stack: LegacyGalleries,
    twoCol: LegacyGalleries,
    threeCol: LegacyGalleries,

    proStack: ProGallery,
    proTwoCol: ProGallery,
    proThreeCol: ProGallery,
  },

  proof: { stats: ProofStats },

  contact: {
    // template.config: AUTO + A..E (tu as D/E dans config)
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
  gallery: ["stack", "twoCol", "threeCol", "proStack", "proTwoCol", "proThreeCol"],
  contact: ["AUTO", "A", "B", "C", "D", "E"],
  services: ["A", "B", "C", "D", "E"],
  team: ["A", "B", "C"],
};
