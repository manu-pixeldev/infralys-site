"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type VariantOption = { value: string; label?: string };

export type SectionRowProps = {
  id: string;
  title: string;
  subtitle?: string;

  enabled: boolean;
  locked?: boolean;

  navLabel?: string;
  onNavLabelChange?: (next: string) => void;

  variant?: string;
  variantOptions?: VariantOption[];
  onVariantChange?: (next: string) => void;

  /** ✅ Optional "Duplicate" action (used for split) */
  showDuplicate?: boolean;
  onDuplicate?: () => void;

  onToggle: (next: boolean) => void;
};

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function Toggle({
  checked,
  disabled,
  onChange,
  title,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => (!disabled ? onChange(!checked) : null)}
      className={cx(
        "relative h-7 w-12 rounded-full border transition",
        disabled && "opacity-60 cursor-not-allowed",
        checked ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"
      )}
      aria-pressed={checked}
      aria-disabled={disabled ? true : undefined}
      title={title}
    >
      <span
        className={cx(
          "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition",
          checked ? "left-6 bg-white" : "left-1 bg-slate-900"
        )}
      />
    </button>
  );
}

export default function SectionRow({
  id,
  title,
  subtitle,
  enabled,
  locked,

  navLabel,
  onNavLabelChange,

  variant,
  variantOptions,
  onVariantChange,

  showDuplicate,
  onDuplicate,

  onToggle,
}: SectionRowProps) {
  const isLocked = Boolean(locked);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isLocked,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  const showNavLabel = typeof onNavLabelChange === "function";
  const showVariant =
    typeof onVariantChange === "function" &&
    Array.isArray(variantOptions) &&
    variantOptions.length > 0;

  const canEditNavLabel = showNavLabel && !isLocked;
  const canEditVariant = showVariant && !isLocked;

  const hasVariant = Boolean((variant ?? "").trim());
  const canDuplicate = Boolean(
    showDuplicate && !isLocked && typeof onDuplicate === "function"
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx(
        "rounded-2xl border border-slate-200 bg-white px-3 py-3",
        "flex items-start gap-3",
        isLocked && "opacity-80"
      )}
    >
      {/* drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={cx(
          "mt-0.5 h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-600",
          "flex items-center justify-center select-none",
          isLocked ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
        )}
        title={isLocked ? "Section verrouillée" : "Réordonner"}
        aria-label="Drag"
        disabled={isLocked}
      >
        ⠿
      </button>

      {/* main */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {title}
              </div>

              {isLocked && (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  PINNED
                </span>
              )}
            </div>

            {subtitle ? (
              <div className="text-xs text-slate-500 truncate">{subtitle}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {canDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate?.()}
                className="h-7 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                title="Dupliquer cette section"
              >
                Duplicate
              </button>
            )}

            <Toggle
              checked={enabled}
              disabled={isLocked}
              onChange={(next) => onToggle(next)}
              title={isLocked ? "Section verrouillée" : enabled ? "On" : "Off"}
            />
          </div>
        </div>

        {/* controls */}
        {(showNavLabel || showVariant) && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {showNavLabel && (
              <div>
                <div className="mb-1 text-[11px] font-semibold text-slate-600">
                  Label menu
                </div>
                <input
                  value={navLabel ?? ""}
                  onChange={(e) =>
                    canEditNavLabel ? onNavLabelChange?.(e.target.value) : null
                  }
                  disabled={!canEditNavLabel}
                  placeholder="Ex: Nos services"
                  className={cx(
                    "h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm",
                    "outline-none focus:ring-2 focus:ring-slate-200",
                    !canEditNavLabel &&
                      "cursor-not-allowed bg-slate-50 opacity-90"
                  )}
                />
              </div>
            )}

            {showVariant && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-600">
                    Variant
                  </div>

                  {!isLocked && hasVariant && (
                    <button
                      type="button"
                      onClick={() => onVariantChange?.("")}
                      className="text-[10px] font-semibold text-slate-500 hover:text-slate-700"
                      title="Revenir à Auto"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <select
                  value={variant ?? ""}
                  onChange={(e) =>
                    canEditVariant ? onVariantChange?.(e.target.value) : null
                  }
                  disabled={!canEditVariant}
                  className={cx(
                    "h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm",
                    "outline-none focus:ring-2 focus:ring-slate-200",
                    !canEditVariant &&
                      "cursor-not-allowed bg-slate-50 opacity-90"
                  )}
                >
                  <option value="">Auto</option>
                  {(variantOptions ?? []).map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label ?? v.value}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {isLocked ? (
          <div className="mt-2 text-[11px] text-slate-500">
            Verrouillée (pinned / critique)
          </div>
        ) : null}
      </div>
    </div>
  );
}
