export const DEFAULT_THEME_VARIANT = "amberOrange|classic";

export function parseThemeVariant(v?: string) {
  const raw = String(v ?? DEFAULT_THEME_VARIANT).trim();
  const [a, c] = raw.includes("|") ? raw.split("|") : [raw, "classic"];
  return {
    accent: (a || "amberOrange").trim(),
    canvas: (c || "classic").trim(),
  };
}

export function joinThemeVariant(accent: string, canvas: string) {
  return `${accent}|${canvas}`;
}
