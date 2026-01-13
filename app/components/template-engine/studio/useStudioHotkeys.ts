"use client";

import * as React from "react";
import type { TemplateConfigInput } from "../types";
import { deepClone } from "../core/deep-clone";

type SetConfig = React.Dispatch<React.SetStateAction<TemplateConfigInput>>;

export function useStudioHotkeys(
  config: TemplateConfigInput,
  setConfig?: SetConfig
) {
  React.useEffect(() => {
    if (!setConfig) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = (e.key || "").toLowerCase();

      // Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && key === "k") {
        e.preventDefault();
        e.stopPropagation();

        setConfig((prev: TemplateConfigInput) => {
          const next: TemplateConfigInput = deepClone(prev);
          (next as any).options = (next as any).options ?? {};
          (next as any).options.studio = (next as any).options.studio ?? {};
          (next as any).options.studio.enabled = !Boolean(
            (next as any).options.studio.enabled
          );
          return next;
        });
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKeyDown, {
        capture: true,
      } as any);
  }, [setConfig]);

  void config;
}
