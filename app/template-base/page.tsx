"use client";

import React from "react";
import { TemplateEngine } from "../components/template-engine/template-engine";
import { DEFAULT_TEMPLATE_CONFIG } from "./template.config";

export default function TemplateBasePage() {
  const [config, setConfig] = React.useState(() =>
    structuredClone(DEFAULT_TEMPLATE_CONFIG)
  );

  return <TemplateEngine config={config} setConfig={setConfig} />;
}
