// app/components/template-engine/studio/panel/sections/definitions/index.ts

/**
 * Types communs aux définitions de sections (Studio)
 */

export type SectionVariantOption = {
  value: string;
  label?: string;
};

export type SectionDefinition = {
  type: string;
  label: string;
  variants?: SectionVariantOption[];
};

/**
 * Constantes & types globaux
 */
export {
  PINNED_TYPES,
  HIDDEN_TYPES_IN_STUDIO,
  SECTION_TYPE_LABELS,
  type SectionType,
} from "./section-types";

/**
 * Import des définitions Studio
 */
import { heroDefinition } from "./hero.definition";
import { servicesDefinition } from "./services.definition";
import { teamDefinition } from "./team.definition";
import { contactDefinition } from "./contact.definition";

/**
 * Re-export individuel (pratique pour imports ciblés)
 */
export { heroDefinition };
export { servicesDefinition };
export { teamDefinition };
export { contactDefinition };

/**
 * Registry canonique des sections (Studio)
 * → utilisé par le panel, contrôles, smart features plus tard
 */
export const SECTION_DEFINITIONS = {
  hero: heroDefinition,
  services: servicesDefinition,
  team: teamDefinition,
  contact: contactDefinition,
} as const;
