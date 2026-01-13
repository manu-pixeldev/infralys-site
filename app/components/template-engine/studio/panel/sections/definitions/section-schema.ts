// app/components/template-engine/studio/panel/sections/definitions/section-schema.ts

import type { SectionType } from "./section-types";

/**
 * Socle commun à TOUTES les sections.
 * Ultra important: stable, upgrade-safe.
 */
export type SectionBase = {
  id: string; // unique stable
  type: SectionType;

  enabled?: boolean; // default true
  lock?: boolean; // prevent delete/reorder/toggle

  navLabel?: string; // label menu (Studio)
  title?: string; // label interne (Studio)
  variant?: string; // "A" | "B" | "AUTO" etc.

  // optionnel si tu veux un override du dom id
  anchorId?: string;
};

/* ------------------------------ HERO ------------------------------ */

export type HeroSectionData = SectionBase & {
  type: "hero";
  headline?: string;
  subheadline?: string;
  proofLine?: string;

  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };

  media?: { src: string; alt?: string };
};

/* ---------------------------- SERVICES ---------------------------- */

export type ServicesSectionData = SectionBase & {
  type: "services";
  items?: Array<{
    title: string;
    desc?: string;
    icon?: string; // (plus tard: mapping icon system)
    tags?: string[];
  }>;
};

/* ------------------------------ TEAM ------------------------------ */

export type TeamSectionData = SectionBase & {
  type: "team";
  members?: Array<{
    name: string;
    role?: string;
    photo?: { src: string; alt?: string };
    shortBio?: string;
    socials?: Array<{ label: string; href: string }>;
  }>;
};

/* ----------------------------- GALLERY ---------------------------- */

export type GallerySectionData = SectionBase & {
  type: "gallery";
  images?: Array<{
    src: string;
    alt?: string;
    caption?: string;
    group?: string;
  }>;
};

/* ------------------------------ PROOF ----------------------------- */

export type ProofSectionData = SectionBase & {
  type: "proof";
  stats?: Array<{ label: string; value: string }>;
  badges?: string[];
  testimonials?: Array<{
    name: string;
    text: string;
    rating?: number; // 1..5
  }>;
};

/* ----------------------------- PROCESS ---------------------------- */

export type ProcessSectionData = SectionBase & {
  type: "process";
  steps?: Array<{ title: string; desc?: string; icon?: string }>;
};

/* ----------------------------- PRICING ---------------------------- */

export type PricingSectionData = SectionBase & {
  type: "pricing";
  plans?: Array<{
    name: string;
    price?: string;
    desc?: string;
    features?: string[];
    cta?: { label: string; href: string };
    featured?: boolean;
  }>;
};

/* ------------------------------- FAQ ------------------------------ */

export type FaqSectionData = SectionBase & {
  type: "faq";
  items?: Array<{ q: string; a: string }>;
};

/* ----------------------------- CONTACT ---------------------------- */

export type ContactSectionData = SectionBase & {
  type: "contact";
  phone?: string;
  email?: string;
  address?: string;
  formEnabled?: boolean;
};

/* ------------------------------ SPLIT ----------------------------- */
/** Split = section générique "content", super utile pour éviter de multiplier les types */
export type SplitSectionData = SectionBase & {
  type: "split";
  eyebrow?: string;
  headline?: string;
  body?: string;
  media?: { src: string; alt?: string };
  bullets?: string[];
  cta?: { label: string; href: string };
};

/* ------------------------- HEADER / FOOTER ------------------------ */
/** On garde simple, souvent géré via options ou legacy, mais on type quand même */
export type HeaderSectionData = SectionBase & { type: "header" };
export type FooterSectionData = SectionBase & { type: "footer" };
export type TopSectionData = SectionBase & { type: "top" };

/* ----------------------------- UNION ------------------------------ */

export type StudioSectionData =
  | TopSectionData
  | HeaderSectionData
  | HeroSectionData
  | SplitSectionData
  | ServicesSectionData
  | ProofSectionData
  | TeamSectionData
  | GallerySectionData
  | ProcessSectionData
  | PricingSectionData
  | FaqSectionData
  | ContactSectionData
  | FooterSectionData;

/**
 * Helper: safe runtime-ish guard
 */
export function isSection(x: any): x is SectionBase {
  return (
    !!x &&
    typeof x === "object" &&
    typeof x.id === "string" &&
    typeof x.type === "string"
  );
}
