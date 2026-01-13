// app/components/template-engine/engine/normalize-config.ts

import type { TemplateConfigInput, SectionType } from "../types";
import { domIdForSection } from "../core/dom-ids";

type AnyRecord = Record<string, any>;

export type NormalizedSection = {
  id: string;
  type: SectionType;

  /** Canonical DOM id (always defined after normalize) */
  domId: string;

  title?: string;
  label?: string;
  navLabel?: string;
  variant?: string;

  enabled: boolean;
  hidden: boolean;

  content?: any;
  options?: any;
  nav?: { label?: string; hide?: boolean };

  /** Escape hatch for legacy / experiments */
  [k: string]: any;
};

export type NormalizedConfig = TemplateConfigInput & {
  sections: NormalizedSection[];
};

function safeStr(v: unknown, fallback = ""): string {
  const s = String(v ?? "").trim();
  return s || fallback;
}

function safeBool(v: unknown, fallback = true): boolean {
  if (typeof v === "boolean") return v;
  if (v == null) return fallback;
  return Boolean(v);
}

/** Make ids readable + stable-ish, but still deterministic */
function deriveId(s: AnyRecord, idx: number): string {
  const rawId = safeStr(s?.id, "");
  if (rawId) return rawId;

  const t = safeStr(s?.type, "section").toLowerCase();
  return `${t}-${idx + 1}`;
}

function isContactSection(s: AnyRecord): boolean {
  const t = safeStr(s?.type, "").toLowerCase();
  const id = safeStr(s?.id, "").toLowerCase();
  return t === "contact" || id === "contact";
}

function uniqueWithSuffix(base: string, used: Set<string>) {
  let out = base;
  if (!used.has(out)) {
    used.add(out);
    return out;
  }
  let n = 2;
  while (used.has(`${out}-${n}`)) n++;
  out = `${out}-${n}`;
  used.add(out);
  return out;
}

export function normalizeConfig(input: TemplateConfigInput): NormalizedConfig {
  const cfg = (input || ({} as any)) as AnyRecord;
  const rawSections = Array.isArray(cfg.sections) ? cfg.sections : [];

  const usedIds = new Set<string>();
  const usedDomIds = new Set<string>();

  const sections: NormalizedSection[] = rawSections.map(
    (raw: AnyRecord, idx: number) => {
      const s = (raw && typeof raw === "object" ? raw : {}) as AnyRecord;

      // logical id
      let id = safeStr(deriveId(s, idx), `section-${idx + 1}`);

      // contact special-case
      if (isContactSection(s)) id = "contact";
      id = uniqueWithSuffix(id, usedIds);

      // type
      const type = safeStr(s?.type, "split") as unknown as SectionType;

      // visibility
      const enabled = safeBool(s?.enabled, true);
      const hidden = safeBool(s?.hidden, false);

      // labels / variant
      const variant = safeStr(s?.variant, "") || undefined;
      const title = safeStr(s?.title, "") || undefined;
      const label = safeStr(s?.label, "") || undefined;
      const navLabel = safeStr(s?.navLabel, "") || undefined;

      // dom id
      const requestedDom = safeStr(s?.domId, "");
      let domId = requestedDom
        ? domIdForSection(requestedDom)
        : domIdForSection(id);

      if (id === "contact") domId = domIdForSection("contact");
      domId = uniqueWithSuffix(domId, usedDomIds);

      return {
        ...s,
        id,
        type,
        domId,
        enabled,
        hidden,
        variant,
        title,
        label,
        navLabel,
      };
    }
  );

  return {
    ...(cfg as any),
    sections,
  };
}
