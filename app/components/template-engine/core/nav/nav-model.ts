// app/components/template-engine/core/nav/nav-model.ts
import { hrefForSection } from "../dom-ids";

export type NavItemKind = "direct" | "overflow";

export type NavItem = {
  key: string;
  sectionId: string;
  label: string;
  href: string; // "#sec-..."
  kind: NavItemKind;
};

export type NavModel = {
  items: NavItem[];
  direct: NavItem[];
  overflow: NavItem[];
  maxDirect: number;
  overflowLabel: string;
};

export type NavSectionLike = {
  id: string;
  type?: string;

  label?: string;
  title?: string;

  hidden?: boolean;
  disabled?: boolean;

  nav?: {
    label?: string;
    hide?: boolean;
  };
};

function cleanLabel(v: unknown) {
  return String(v ?? "").trim();
}

function pickLabel(s: NavSectionLike): string {
  const t = String(s.type ?? "").toLowerCase();

  const raw =
    cleanLabel(s.nav?.label) ||
    cleanLabel(s.label) ||
    cleanLabel(s.title) ||
    "";

  // hero fallback
  if (!raw && (t === "hero" || String(s.id).toLowerCase() === "hero")) {
    return "Accueil";
  }

  return raw || String(s.id);
}

function isNavEligible(s: NavSectionLike): boolean {
  const t = String(s.type ?? "").toLowerCase();

  if (!s?.id) return false;
  if (t === "header" || t === "top") return false;

  if (s.nav?.hide) return false;
  if (s.hidden) return false;
  if (s.disabled) return false;

  return true;
}

function dedupeBySectionId(items: NavSectionLike[]) {
  const seen = new Set<string>();
  const out: NavSectionLike[] = [];

  for (const s of items) {
    const id = String(s?.id ?? "").trim();
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(s);
  }

  return out;
}

export function buildNavModel(args: {
  sections: NavSectionLike[];
  maxDirect?: number;
  overflowLabel?: string;
}): NavModel {
  const sections = Array.isArray(args.sections) ? args.sections : [];

  const maxDirectRaw = Number(args.maxDirect ?? 4);
  const maxDirect = Number.isFinite(maxDirectRaw)
    ? Math.max(0, Math.floor(maxDirectRaw))
    : 4;

  const overflowLabel = cleanLabel(args.overflowLabel ?? "Plus") || "Plus";

  const eligible = dedupeBySectionId(sections.filter(isNavEligible));

  const baseItems: NavItem[] = eligible.map((s) => {
    const sectionId = String(s.id);
    return {
      key: sectionId,
      sectionId,
      label: pickLabel(s),
      href: hrefForSection(sectionId),
      kind: "direct",
    };
  });

  const direct: NavItem[] = baseItems
    .slice(0, maxDirect)
    .map((it) => ({ ...it, kind: "direct" }));

  const overflow: NavItem[] = baseItems
    .slice(maxDirect)
    .map((it) => ({ ...it, kind: "overflow" }));

  return {
    items: [...direct, ...overflow],
    direct,
    overflow,
    maxDirect,
    overflowLabel,
  };
}
