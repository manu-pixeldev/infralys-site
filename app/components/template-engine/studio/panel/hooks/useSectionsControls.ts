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
  return raw.filter(isSection) as StudioSectionData[];
}

export function useSectionsControls(
  config: TemplateConfigInput,
  update: (fn: (draft: TemplateConfigInput) => void) => void
) {
  const sectionsRaw = React.useMemo(() => asSections(config), [config]);

  /**
   * View model (for the list UI)
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
        navLabel: s.navLabel,
        variant: s.variant,
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
    setVariant,
    setNavLabel,
    moveByIds,
    pinnedTypes: PINNED_TYPES,
  };
}
