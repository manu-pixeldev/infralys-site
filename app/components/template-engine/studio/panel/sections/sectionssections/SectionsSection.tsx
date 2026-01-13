"use client";

import React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

// ✅ paths FIX (folder moved into sections/sectionssections)
import type { TemplateConfigInput } from "../../../../types";
import {
  useSectionsControls,
  type StudioSectionView,
} from "../../hooks/useSectionsControls";

import SectionRow from "./SectionRow";

export type SectionsSectionProps = {
  config: TemplateConfigInput;
  update: (fn: (draft: TemplateConfigInput) => void) => void;
};

export default function SectionsSection({
  config,
  update,
}: SectionsSectionProps) {
  const s = useSectionsControls(config, update);

  const items: StudioSectionView[] = s.sectionsView;
  const ids: string[] = s.sectionIds;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = React.useCallback(
    (e: DragEndEvent) => {
      const activeId = String(e.active?.id ?? "");
      const overId = e.over ? String(e.over.id) : "";
      if (!activeId || !overId || activeId === overId) return;

      s.moveByIds(activeId, overId);
    },
    [s]
  );

  // ✅ upgrade-safe fallbacks (si jamais une action manque)
  const setNavLabel = React.useCallback(
    (id: string, next: string) => {
      if (typeof (s as any).setNavLabel === "function") {
        (s as any).setNavLabel(id, next);
        return;
      }
      update((d) => {
        const list = ((d as any).sections ?? []) as any[];
        const found = list.find((x) => String(x?.id) === String(id));
        if (!found) return;
        found.navLabel = next;
      });
    },
    [s, update]
  );

  const setVariant = React.useCallback(
    (id: string, next: string) => {
      if (typeof (s as any).setVariant === "function") {
        (s as any).setVariant(id, next);
        return;
      }
      update((d) => {
        const list = ((d as any).sections ?? []) as any[];
        const found = list.find((x) => String(x?.id) === String(id));
        if (!found) return;
        found.variant = next;
      });
    },
    [s, update]
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
        SECTIONS
      </div>

      <div className="mb-3 text-xs text-slate-500">
        Drag & drop pour réordonner • Toggle pour activer/désactiver • Label
        menu • Variant
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((it) => (
              <SectionRow
                key={it.id}
                id={it.id}
                title={it.title}
                subtitle={it.subtitle}
                enabled={it.enabled}
                locked={it.lock}
                onToggle={(next) => s.setEnabled(it.id, next)}
                // ✅ NEW: nav label (menu)
                navLabel={it.navLabel ?? ""}
                onNavLabelChange={(next) => setNavLabel(it.id, next)}
                // ✅ NEW: variants (optional — only shows if options exist)
                variant={it.variant ?? ""}
                variantOptions={it.variantOptions}
                onVariantChange={(next) => setVariant(it.id, next)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
