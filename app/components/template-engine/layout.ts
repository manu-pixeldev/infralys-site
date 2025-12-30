// app/components/template-engine/layout.ts
// ✅ Ce fichier ne DOIT PAS redéfinir des helpers.
// Il sert juste de "barrel" si tu en as besoin.

export type { LayoutTokens, Density, Radius, Container } from "./types";
export { cx, resolveLayout, containerClass, sectionPadY, heroPadY, radiusClass, radiusStyle } from "./theme";
