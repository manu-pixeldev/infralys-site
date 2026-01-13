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

  /** Optional editable nav label (menu label) */
  navLabel?: string;
  onNavLabelChange?: (next: string) => void;

  /** Optional variant picker */
  variant?: string;
  variantOptions?: VariantOption[];
  onVariantChange?: (next: string) => void;

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

  onToggle,
}: SectionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: Boolean(locked),
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  const canEditNavLabel = typeof onNavLabelChange === "function";
  const canEditVariant =
    typeof onVariantChange === "function" &&
    Array.isArray(variantOptions) &&
    variantOptions.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx(
        "rounded-2xl border border-slate-200 bg-white px-3 py-3",
        "flex items-start gap-3",
        locked && "opacity-80"
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
          locked ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
        )}
        title={locked ? "Section verrouillée" : "Réordonner"}
        aria-label="Drag"
        disabled={Boolean(locked)}
      >
        ⠿
      </button>

      {/* main */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">
              {title}
            </div>
            {subtitle ? (
              <div className="text-xs text-slate-500 truncate">{subtitle}</div>
            ) : null}
          </div>

          <Toggle
            checked={enabled}
            disabled={Boolean(locked)}
            onChange={(next) => onToggle(next)}
            title={locked ? "Section verrouillée" : enabled ? "On" : "Off"}
          />
        </div>

        {/* controls */}
        {(canEditNavLabel || canEditVariant) && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {canEditNavLabel && (
              <div>
                <div className="mb-1 text-[11px] font-semibold text-slate-600">
                  Label menu
                </div>
                <input
                  value={navLabel ?? ""}
                  onChange={(e) => onNavLabelChange?.(e.target.value)}
                  disabled={Boolean(locked)}
                  placeholder="Ex: Nos services"
                  className={cx(
                    "h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm",
                    "outline-none focus:ring-2 focus:ring-slate-200",
                    locked && "cursor-not-allowed bg-slate-50"
                  )}
                />
              </div>
            )}

            {canEditVariant && (
              <div>
                <div className="mb-1 text-[11px] font-semibold text-slate-600">
                  Variant
                </div>
                <select
                  value={variant ?? ""}
                  onChange={(e) => onVariantChange?.(e.target.value)}
                  disabled={Boolean(locked)}
                  className={cx(
                    "h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm",
                    "outline-none focus:ring-2 focus:ring-slate-200",
                    locked && "cursor-not-allowed bg-slate-50"
                  )}
                >
                  {variantOptions!.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label ?? v.value}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {locked ? (
          <div className="mt-2 text-[11px] text-slate-500">
            Verrouillée (pinned / critique)
          </div>
        ) : null}
      </div>
    </div>
  );
}
