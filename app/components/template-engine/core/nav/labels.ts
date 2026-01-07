import type { SectionType } from "../../types";

export function resolveSectionNavLabel(section: {
  type?: SectionType | string;
  title?: string;
  id?: string;
}) {
  const t = String(section?.type ?? "");
  const title = String(section?.title ?? "").trim();
  if (title) return title;

  if (t === "hero") return "Accueil";
  if (t === "services") return "Services";
  if (t === "gallery") return "Galerie";
  if (t === "proof") return "Preuves";
  if (t === "contact") return "Contact";
  if (t === "split") return "Section";

  return "Section";
}
