"use client";

import React from "react";
import { TemplateEngine } from "../components/template-engine/template-engine";
import { DEFAULT_TEMPLATE_CONFIG } from "./template.config";

export default function TemplateBasePage() {
  const [config, setConfig] = React.useState(() => {
    const anyGlobal = globalThis as any;
    if (typeof anyGlobal.structuredClone === "function") {
      return anyGlobal.structuredClone(DEFAULT_TEMPLATE_CONFIG);
    }
    return JSON.parse(JSON.stringify(DEFAULT_TEMPLATE_CONFIG));
  });

  return <TemplateEngine config={config} setConfig={setConfig} />;
}
