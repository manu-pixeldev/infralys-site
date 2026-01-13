"use client";

import * as React from "react";
import type { TemplateConfigInput } from "../../../types";

import {
  PINNED_TYPES,
  HIDDEN_TYPES_IN_STUDIO,
  type SectionType,
} from "../sections/definitions/section-types";

import {
  type SectionBase,
  type StudioSectionData,
  isSection,
} from "../sections/definitions/section-schema";

import { getSectionMeta } from "../sections/registry";

function nextId(sections: SectionBase[], base: string) {
  const used = new Set(sections.map((s) => String(s.id)));
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

/**
 * UI view model for the Studio list
 * (lightweight + stable)
 */
export type StudioSectionView = {
  id: string;

  // ✅ required for definitions mapping + subtitle
  type: string;

  title: string;
  subtitle?: string;
  enabled: boolean;
  lock?: boolean;

  navLabel?: string;

  variant?: string;
  variantOptions?: { value: string; label?: string }[];
};

function asSections(config: TemplateConfigInput): StudioSectionData[] {
  const raw = (config as any)?.sections;
  if (!Array.isArray(raw)) return [];
  // keep only objects with id/type
  return raw.filter(isSection) as StudioSectionData[];
}

export function useSectionsControls(
  config: TemplateConfigInput,
  update: (fn: (draft: TemplateConfigInput) => void) => void
) {
  const sectionsRaw = React.useMemo(() => asSections(config), [config]);

  /**
   * View model (for the list UI)
   * - hide "top"
   * - keep pinned types visually first
   */
  const sectionsView = React.useMemo<StudioSectionView[]>(() => {
    const pinned = sectionsRaw.filter((s) => PINNED_TYPES.has(s.type));
    const rest = sectionsRaw.filter((s) => !PINNED_TYPES.has(s.type));

    pinned.sort((a, b) => {
      const pa = a.type === "top" ? 0 : 1;
      const pb = b.type === "top" ? 0 : 1;
      return pa - pb;
    });

    const visiblePinned = pinned.filter(
      (s) => !HIDDEN_TYPES_IN_STUDIO.has(s.type)
    );

    const toView = (s: StudioSectionData): StudioSectionView => {
      const meta = getSectionMeta(s.type);
      const label = meta.studio?.label ?? s.type;

      const title =
        (s.navLabel && s.navLabel.trim()) ||
        (s.title && s.title.trim()) ||
        label;

      const subtitle = s.variant ? `${s.type} • ${s.variant}` : s.type;

      return {
        id: String(s.id),
        type: s.type,
        title,
        subtitle,
        enabled: s.enabled !== false,
        lock: Boolean(s.lock) || PINNED_TYPES.has(s.type as SectionType),
        variant: s.variant,
        navLabel: s.navLabel,
        variantOptions: meta.studio?.variants,
      };
    };

    return [...visiblePinned, ...rest].map(toView);
  }, [sectionsRaw]);

  const sectionIds = React.useMemo(
    () => sectionsView.map((s) => s.id),
    [sectionsView]
  );

  const setEnabled = React.useCallback(
    (id: string, enabled: boolean) =>
      update((d) => {
        const arr = asSections(d);
        const s = arr.find((x) => String(x.id) === String(id));
        if (!s) return;
        if (s.lock) return;
        if (PINNED_TYPES.has(s.type as SectionType)) return;
        s.enabled = enabled;
        (d as any).sections = arr;
      }),
    [update]
  );

  const toggle = React.useCallback(
    (id: string) =>
      update((d) => {
        const arr = asSections(d);
        const s = arr.find((x) => String(x.id) === String(id));
        if (!s) return;
        if (s.lock) return;
        if (PINNED_TYPES.has(s.type as SectionType)) return;
        s.enabled = s.enabled !== false ? false : true;
        (d as any).sections = arr;
      }),
    [update]
  );

  const setVariant = React.useCallback(
    (id: string, variant: string) =>
      update((d) => {
        const arr = asSections(d);
        const s = arr.find((x) => String(x.id) === String(id));
        if (!s) return;
        if (s.lock) return;
        if (PINNED_TYPES.has(s.type as SectionType)) return;
        s.variant = variant;
        (d as any).sections = arr;
      }),
    [update]
  );

  const setNavLabel = React.useCallback(
    (id: string, navLabel: string) =>
      update((d) => {
        const arr = asSections(d);
        const s = arr.find((x) => String(x.id) === String(id));
        if (!s) return;
        if (s.lock) return;
        if (PINNED_TYPES.has(s.type as SectionType)) return;
        s.navLabel = navLabel;
        (d as any).sections = arr;
      }),
    [update]
  );

  const remove = React.useCallback(
    (id: string) =>
      update((d) => {
        const arr = asSections(d);
        const s = arr.find((x) => String(x.id) === String(id));
        if (!s) return;

        // safety: pinned not removable
        if (PINNED_TYPES.has(s.type as SectionType)) return;
        if (s.lock) return;

        // phase rule: allow delete only for split (for now)
        if (s.type !== "split") return;

        (d as any).sections = arr.filter((x) => String(x.id) !== String(id));
      }),
    [update]
  );

  const addSplit = React.useCallback(
    () =>
      update((d) => {
        const arr = asSections(d);

        const id = nextId(arr, "split");
        const heroIndex = arr.findIndex((x) => x.type === "hero");
        const insertAt =
          heroIndex >= 0 ? heroIndex + 1 : Math.min(1, arr.length);

        const split: StudioSectionData = {
          id,
          type: "split",
          title: "Section split",
          variant: "A",
          enabled: true,
        } as any;

        const next = [...arr];
        next.splice(insertAt, 0, split);
        (d as any).sections = next;
      }),
    [update]
  );

  const removeAllSplits = React.useCallback(
    () =>
      update((d) => {
        const arr = asSections(d);
        (d as any).sections = arr.filter((s) => s.type !== "split");
      }),
    [update]
  );

  /**
   * ✅ Duplicate a split section (insert right after)
   * - only for type === "split"
   * - blocks pinned + blocks lock
   */
  const duplicateSplit = React.useCallback(
    (id: string) =>
      update((d) => {
        const arr = asSections(d);
        const idx = arr.findIndex((x) => String(x.id) === String(id));
        if (idx < 0) return;

        const src = arr[idx];
        if (!src) return;

        // rules
        if (src.type !== "split") return;
        if (src.lock) return;
        if (PINNED_TYPES.has(src.type as SectionType)) return;

        const newId = nextId(arr, "split");

        // shallow clone (keeps content/props if present)
        const clone: StudioSectionData = {
          ...(src as any),
          id: newId,
          type: "split",
        };

        const next = [...arr];
        next.splice(idx + 1, 0, clone);
        (d as any).sections = next;
      }),
    [update]
  );

  /**
   * Reorder by ids (DnD)
   * - blocks pinned
   * - blocks lock
   */
  const moveByIds = React.useCallback(
    (activeId: string, overId: string) =>
      update((d) => {
        const arr = asSections(d);
        const from = arr.findIndex((x) => String(x.id) === String(activeId));
        const to = arr.findIndex((x) => String(x.id) === String(overId));
        if (from < 0 || to < 0 || from === to) return;

        const moving = arr[from];
        const target = arr[to];

        if (
          PINNED_TYPES.has(moving.type as SectionType) ||
          PINNED_TYPES.has(target.type as SectionType)
        )
          return;
        if (moving.lock || target.lock) return;

        const copy = [...arr];
        const [it] = copy.splice(from, 1);
        copy.splice(to, 0, it);
        (d as any).sections = copy;
      }),
    [update]
  );

  return {
    sectionsView,
    sectionIds,

    setEnabled,
    toggle,
    setVariant,
    setNavLabel,

    remove,
    addSplit,
    duplicateSplit,
    removeAllSplits,
    moveByIds,

    pinnedTypes: PINNED_TYPES,
  };
}
