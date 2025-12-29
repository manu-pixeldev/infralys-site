// app/template-base/page.tsx
"use client";

import React from "react";
import TemplateEngine from "../components/template-engine/template-engine";
import { DEFAULT_TEMPLATE_CONFIG } from "./template.config";
import type { TemplateConfigInput } from "../components/template-engine/types";

const LS_KEY = "infralys.templateBase.config.v1";

function clone<T>(v: T): T {
  if (typeof (globalThis as any).structuredClone === "function") return (globalThis as any).structuredClone(v);
  return JSON.parse(JSON.stringify(v));
}

function loadInitial(): TemplateConfigInput {
  // ✅ important: pas de localStorage côté “server render”
  if (typeof window === "undefined") return clone(DEFAULT_TEMPLATE_CONFIG) as any;

  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return clone(DEFAULT_TEMPLATE_CONFIG) as any;
    return JSON.parse(raw);
  } catch {
    return clone(DEFAULT_TEMPLATE_CONFIG) as any;
  }
}

export default function TemplateBasePage() {
  const [mounted, setMounted] = React.useState(false);

  // ✅ 1) On attend le mount pour éviter hydration mismatch (theme/panel flash)
  React.useEffect(() => setMounted(true), []);

  // ✅ 2) Init stable (même rendu SSR/CSR)
  const [config, setConfig] = React.useState<TemplateConfigInput>(() => clone(DEFAULT_TEMPLATE_CONFIG) as any);

  // ✅ 3) Hydrate depuis localStorage après mount
  React.useEffect(() => {
    if (!mounted) return;
    setConfig(loadInitial());
  }, [mounted]);

  // ✅ 4) Persist seulement après mount
  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(config));
    } catch {}
  }, [config, mounted]);

  if (!mounted) {
    // petite sortie propre (tu peux mettre un skeleton si tu veux)
    return <div suppressHydrationWarning />;
  }

  return <TemplateEngine config={config} setConfig={setConfig} />;
}
