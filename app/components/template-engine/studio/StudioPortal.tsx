"use client";

import React from "react";
import { createPortal } from "react-dom";
import type { TemplateConfigInput } from "../types";
import StudioPanel from "./panel/StudioPanel";
import { useStudioHotkeys } from "./useStudioHotkeys";

type Props = {
  enabled: boolean;
  config: TemplateConfigInput;
  setConfig?: React.Dispatch<React.SetStateAction<TemplateConfigInput>>;
};

export function StudioPortal({ enabled, config, setConfig }: Props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // ✅ hotkey actif même quand le panel est fermé
  useStudioHotkeys(config, setConfig);

  if (!mounted || !enabled || typeof setConfig !== "function") return null;

  return createPortal(
    <StudioPanel config={config} setConfig={setConfig} />,
    document.body
  );
}
