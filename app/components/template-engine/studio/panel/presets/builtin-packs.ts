import type { TemplateConfigInput } from "../../../types";

export type BuiltinPack = {
  id: string;
  name: string;
  tags: string[];
  locked: true;
  config: TemplateConfigInput;
};

/**
 * Built-in packs (monetizable later)
 * - locked: cannot delete (not in localStorage)
 * - tags: used for UI + future filters
 *
 * NOTE: These are deliberately minimal and upgrade-safe.
 * We only touch `config.options` keys that already exist in your Studio.
 */
export const BUILTIN_PACKS: BuiltinPack[] = [
  {
    id: "pack-classic-clean",
    name: "Classic Clean",
    tags: ["starter", "clean", "classic"],
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
    tags: ["pro", "dark", "immersive"],
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
    tags: ["ultra", "vivid", "premium"],
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
