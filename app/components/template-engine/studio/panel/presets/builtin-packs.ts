import type { TemplateConfigInput } from "../../../types";

export type BuiltinPack = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  locked: true;
  config: TemplateConfigInput;
};

export const BUILTIN_PACKS: BuiltinPack[] = [
  {
    id: "pack-classic-clean",
    name: "Classic Clean",
    description: "Default ultra propre, lisible, conversion-friendly.",
    tags: ["starter", "clean", "classic", "business"],
    locked: true,
    config: {
      options: {
        themeVariant: "amberOrange|classic",
        canvasStyle: "classic",
        autoAccentMode: "off",
      },
    } as any,
  },
  {
    id: "pack-immersive-dark",
    name: "Immersive Dark",
    description: "Ambiance premium sombre + canvas immersif.",
    tags: ["pro", "dark", "immersive", "premium"],
    locked: true,
    config: {
      options: {
        themeVariant: "amberOrange|immersive",
        canvasStyle: "immersive",
        autoAccentMode: "muted",
      },
    } as any,
  },
  {
    id: "pack-vivid-pro",
    name: "Vivid Pro",
    description: "Accents punchy, look énergique, effet “wow”.",
    tags: ["ultra", "vivid", "premium", "creator"],
    locked: true,
    config: {
      options: {
        themeVariant: "amberOrange|classic",
        canvasStyle: "classic",
        autoAccentMode: "vivid",
      },
    } as any,
  },
];
