// app/components/template-engine/studio/panel/sections/definitions/section-types.ts

export const SECTION_TYPES = [
  "top",
  "header",
  "hero",
  "split",
  "services",
  "proof",
  "team",
  "gallery",
  "process",
  "pricing",
  "faq",
  "contact",
  "footer",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  top: "Top (anchor)",
  header: "Header",
  hero: "Hero",
  split: "Split",
  services: "Services",
  proof: "Proof",
  team: "Équipe",
  gallery: "Galerie",
  process: "Process",
  pricing: "Tarifs",
  faq: "FAQ",
  contact: "Contact",
  footer: "Footer",
};

export const PINNED_TYPES = new Set<SectionType>(["top", "header"]);
export const HIDDEN_TYPES_IN_STUDIO = new Set<SectionType>(["top"]); // on garde header, on cache top
