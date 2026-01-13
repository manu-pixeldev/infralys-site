import type { SectionDefinition } from "./index";

export const heroDefinition: SectionDefinition = {
  type: "hero",
  label: "Hero",
  variants: [
    { value: "A", label: "A (Classic)" },
    { value: "B", label: "B (Alt)" },
  ],
};
