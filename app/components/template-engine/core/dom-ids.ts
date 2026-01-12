// components/template-engine/core/dom-ids.ts

export type SectionId = string;

/**
 * DOM IDs — Canon
 * Single source of truth for:
 * - anchor hrefs (#...)
 * - DOM element ids
 * - reveal & scroll-spy selectors
 */

export const DOM_ID_PREFIX = "sec-";

/**
 * Slugify a section id into a DOM-safe identifier
 */
export function slugifyId(input: string): string {
  const raw = String(input ?? "")
    .trim()
    .toLowerCase();

  // remove diacritics if supported
  const normalized =
    typeof raw.normalize === "function"
      ? raw.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      : raw;

  const slug = normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  return slug || "section";
}

/**
 * DOM element id for a section wrapper
 * Example: "contact" → "sec-contact"
 */
export function domIdForSection(sectionId: SectionId): string {
  return `${DOM_ID_PREFIX}${slugifyId(sectionId)}`;
}

/**
 * href for nav links
 * Example: "contact" → "#sec-contact"
 */
export function hrefForSection(sectionId: SectionId): string {
  return `#${domIdForSection(sectionId)}`;
}

/**
 * data attribute for debugging / devtools
 *
 * IMPORTANT:
 * - returns an object meant to be SPREAD in JSX
 * - usage: <div {...dataAttrForSection(sec.id)} />
 */
export function dataAttrForSection(sectionId: SectionId): {
  "data-sec": string;
} {
  return { "data-sec": String(sectionId) };
}

/**
 * Helper to detect duplicate DOM ids at runtime (dev only)
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
