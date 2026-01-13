"use client";

import * as React from "react";
import type { TemplateConfigInput } from "../../../types";
import { deepClone } from "../../../core/deep-clone";

export function useStudioUpdate(
  setConfig: React.Dispatch<React.SetStateAction<TemplateConfigInput>>
) {
  return React.useCallback(
    (fn: (draft: TemplateConfigInput) => void) => {
      setConfig((prev: TemplateConfigInput) => {
        const next: TemplateConfigInput = deepClone(prev);
        fn(next);
        return next;
      });
    },
    [setConfig]
  );
}
