// components/template-engine/core/dom-ids.ts

export type SectionId = string;

/**
 * DOM IDs — V24 Canon
 * Single source of truth for:
 * - anchor hrefs (#...)
 * - DOM element ids
 * - reveal & scroll-spy selectors
 */

export const DOM_ID_PREFIX = "sec-";

export function slugifyId(input: string): string {
  const s =
    String(input ?? "")
      .trim()
      .toLowerCase()
      // replace diacritics if supported
      .normalize?.("NFKD")
      .replace?.(/[\u0300-\u036f]/g, "") ??
    String(input ?? "")
      .trim()
      .toLowerCase();

  const slug = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  return slug || "section";
}

/** DOM element id for a section wrapper */
export function domIdForSection(sectionId: SectionId): string {
  return `${DOM_ID_PREFIX}${slugifyId(sectionId)}`;
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

/**
 * Helper to detect duplicates at runtime (dev only).
 * Call it after normalize() if you want.
 */
export function findDuplicateDomIds(sectionIds: SectionId[]): string[] {
  const ids = sectionIds.map(domIdForSection);
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dup.add(id);
    else seen.add(id);
  }
  return Array.from(dup);
}
