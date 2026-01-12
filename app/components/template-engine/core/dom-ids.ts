// app/components/template-engine/core/dom-ids.ts
export type SectionId = string;

/**
 * DOM IDs — Canon
 * Single source of truth for:
 * - anchor hrefs (#...)
 * - DOM element ids
 * - reveal & scroll-spy selectors
 */

export const DOM_ID_PREFIX = "sec-";

export function slugifyId(input: string): string {
  const raw = String(input ?? "")
    .trim()
    .toLowerCase();
  const s = raw.normalize?.("NFKD").replace?.(/[\u0300-\u036f]/g, "") ?? raw;

  const slug = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "section";
}

/**
 * Accepts either:
 * - a logical section id (ex: "contact", "proof")
 * - OR an already-built dom id (ex: "sec-contact")
 */
export function domIdForSection(sectionId: SectionId): string {
  const s = String(sectionId ?? "").trim();
  if (!s) return `${DOM_ID_PREFIX}section`;

  // If already a domId, keep it stable (but normalize)
  if (s.toLowerCase().startsWith(DOM_ID_PREFIX)) {
    const tail = s.slice(DOM_ID_PREFIX.length);
    return `${DOM_ID_PREFIX}${slugifyId(tail)}`;
  }

  return `${DOM_ID_PREFIX}${slugifyId(s)}`;
}

/** href for nav links */
export function hrefForSection(sectionId: SectionId): string {
  return `#${domIdForSection(sectionId)}`;
}

/** data attribute for debugging / devtools */
export function dataAttrForSection(sectionId: SectionId): {
  "data-sec": string;
} {
  return { "data-sec": String(sectionId) };
}
