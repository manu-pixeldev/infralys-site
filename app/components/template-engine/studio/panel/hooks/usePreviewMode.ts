"use client";

import * as React from "react";
import type { TemplateConfigInput } from "../../../types";
import { deepClone } from "../../../core/deep-clone";
import { mergeConfig } from "../utils/mergeConfig";

export function usePreviewMode(
  setConfig: React.Dispatch<React.SetStateAction<TemplateConfigInput>>
) {
  const baseRef = React.useRef<TemplateConfigInput | null>(null);
  const [isPreviewing, setIsPreviewing] = React.useState(false);

  // Preview = apply a PATCH merged into current config (never wipes full config)
  const startPreview = React.useCallback(
    (patch: TemplateConfigInput) => {
      setConfig((prev: TemplateConfigInput) => {
        if (!baseRef.current) {
          baseRef.current = deepClone(prev);
        }
        const merged = mergeConfig(prev, patch);
        return deepClone(merged);
      });

      // mark previewing OUTSIDE setConfig callback
      setIsPreviewing(true);
    },
    [setConfig]
  );

  const revertPreview = React.useCallback(() => {
    const base = baseRef.current;
    if (!base) return;

    setConfig(() => deepClone(base));
    baseRef.current = null;
    setIsPreviewing(false);
  }, [setConfig]);

  const commitPreview = React.useCallback(() => {
    baseRef.current = null;
    setIsPreviewing(false);
  }, []);

  // ESC safety (only while previewing)
  React.useEffect(() => {
    if (!isPreviewing) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        revertPreview();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPreviewing, revertPreview]);

  return {
    isPreviewing,
    startPreview,
    revertPreview,
    commitPreview,
  };
}
