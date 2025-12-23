import type { SectionType } from "../../template-base/template.config";
import type { ComponentType } from "react";

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

type VariantMap = Partial<Record<SectionType, Record<string, ComponentType<any>>>>;

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
    F: LegacyHero,
    G: LegacyHero,
    H: LegacyHero,
  },

  proof: {
    stats: ProofStats,
  },

  split: {
    A: LegacySplit,
    B: LegacySplit,
  },

  services: {
    A: LegacyServices,
    B: LegacyServices,
    C: LegacyServices,
    D: LegacyServices,
    E: LegacyServices,
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
    D: LegacyContact,
    E: LegacyContact,
  },

  text: {},
  pricing: {},
  faq: {},
  links: {},
};
