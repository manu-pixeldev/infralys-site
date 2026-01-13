"use client";

import React from "react";

export function PreviewBanner({
  onRevert,
  onApply,
}: {
  onRevert: () => void;
  onApply: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 mb-3 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold text-amber-900">
          Preview mode — press <kbd className="rounded border px-1">ESC</kbd> to
          revert
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRevert}
            className="h-8 rounded-xl border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100"
          >
            Revert
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-8 rounded-xl border border-amber-400 bg-amber-200 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-300"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
