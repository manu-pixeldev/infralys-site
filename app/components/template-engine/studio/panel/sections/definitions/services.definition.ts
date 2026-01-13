import type { SectionDefinition } from "./index";

// ✅ même si vide avant, il faut au moins exporter un truc
export const servicesDefinition: SectionDefinition = {
  type: "services",
  label: "Services",
  variants: [{ value: "A", label: "A (Standard)" }],
};
