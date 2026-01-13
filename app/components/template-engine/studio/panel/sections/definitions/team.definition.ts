// app/components/template-engine/studio/panel/sections/definitions/team.definition.ts

import type { SectionDefinition } from "./index";

// ✅ canon (métier / long terme)
import { TeamDefinition } from "../../../../sections/definitions/team.definition";

// optionnel
export { TeamDefinition };

// ✅ Studio (UI)
export const teamDefinition: SectionDefinition = {
  type: TeamDefinition.type,
  label: "Équipe",
  variants: [{ value: "A", label: "A (Standard)" }],
};
