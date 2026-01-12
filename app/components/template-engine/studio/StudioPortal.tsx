// app/components/template-engine/studio/StudioPortal.tsx
"use client";

import React from "react";
import { createPortal } from "react-dom";
import { StudioPanel } from "../studio-panel"; // on garde l'existant pour l’instant

export function StudioPortal(props: {
  enabled: boolean;
  config: any;
  setConfig?: (next: any) => void;
}) {
  const { enabled, config, setConfig } = props;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted || !enabled || typeof setConfig !== "function") return null;
  return createPortal(
    <StudioPanel config={config} setConfig={setConfig!} />,
    document.body
  );
}
