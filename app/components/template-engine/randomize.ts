import type { TemplateConfig } from "./types";
import type { ThemeVariant } from "../../template-base/template.config";

const THEMES: ThemeVariant[] = ["blueRed","purplePink","emeraldTeal","amberOrange","slateIndigo","monoDark","warm","cool","forest","sunset"];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const rint = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const POOLS: Record<string, string[]> = {
  header: ["A","B","C","D","E","F"],
  hero: ["A","B","C","D","E","F","G","H"],
  services: ["A","B","C","D","E"],
  team: ["A","B","C"],
  contact: ["AUTO","A","B","C","D","E"],
  gallery: ["stack","twoCol","threeCol"],
};

export function randomizeConfig(prev: TemplateConfig): TemplateConfig {
  const next = structuredClone(prev);

  next.options.themeVariant = pick(THEMES);
  next.options.fx = {
    ...next.options.fx,
    enabled: true,
    ambient: Math.random() > 0.35,
    softGlow: Math.random() > 0.25,
    borderScan: Math.random() > 0.55,
    shimmerCta: Math.random() > 0.7,
  };

  next.sections = next.sections.map((s) => {
    if (s.enabled === false) return s;
    if (s.lock) return s;

    const pool = POOLS[s.type] ?? ["A"];
    const variant = pick(pool);

    return {
      ...s,
      variant,
      layout: {
        ...(s.layout ?? {}),
        paddingY: rint(10, 20),
        radius: pick([16,24,32] as const),
        gap: rint(8, 24),
        gridCols: pick([2,3,4] as const),
      },
    };
  });

  return next;
}
