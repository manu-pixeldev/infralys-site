// app/components/template-engine/engine/normalize-config.ts
import type { TemplateConfigInput, SectionType } from "../types";
import { domIdForSection } from "../core/dom-ids";

type AnyRecord = Record<string, any>;

export type NormalizedSection = {
  id: string;
  type: SectionType;
  title?: string;
  label?: string;
  navLabel?: string;
  variant?: string;
  enabled?: boolean;
  hidden?: boolean;
  lock?: boolean;
  domId: string;
  content?: any;
  options?: any;
  nav?: { label?: string; hide?: boolean };
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

export function normalizeConfig(input: TemplateConfigInput): NormalizedConfig {
  const cfg = (input || ({} as any)) as AnyRecord;
  const raw = Array.isArray(cfg.sections) ? cfg.sections : [];
  const seenDom = new Set<string>();

  const sections: NormalizedSection[] = raw.map((s: AnyRecord, idx: number) => {
    const id = safeStr(s?.id, `sec-${idx + 1}`);
    const type = safeStr(s?.type, "split") as unknown as SectionType;

    const base: AnyRecord = {
      ...s,
      id,
      type,
      enabled: safeBool(s?.enabled, true),
      hidden: safeBool(s?.hidden, false),
      variant: safeStr(s?.variant, "") || undefined,
      title: safeStr(s?.title, "") || undefined,
      label: safeStr(s?.label, "") || undefined,
      navLabel: safeStr(s?.navLabel, "") || undefined,
    };

    let domId = safeStr(s?.domId, "") || domIdForSection(id);
    if (seenDom.has(domId)) {
      let n = 2;
      while (seenDom.has(`${domId}-${n}`)) n++;
      domId = `${domId}-${n}`;
    }
    seenDom.add(domId);

    return { ...(base as any), domId } as NormalizedSection;
  });

  return { ...(cfg as any), sections } as NormalizedConfig;
}
