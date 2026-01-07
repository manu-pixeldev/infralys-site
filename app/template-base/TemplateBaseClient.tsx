"use client";

import React from "react";

import TemplateEngine from "../components/template-engine/template-engine";
import type { TemplateConfigInput } from "../components/template-engine/types";
import { templateConfig } from "./template.config";

const LS_KEY = "template-base-config-v24";

/** JSON stringify anti-cycles */
function safeJsonStringify(value: unknown) {
  const seen = new WeakSet<object>();
  return JSON.stringify(value, (_k, v) => {
    if (typeof v === "function") return undefined;
    if (typeof v === "object" && v !== null) {
      if (seen.has(v as object)) return undefined;
      seen.add(v as object);
    }
    return v;
  });
}

/**
 * On ne persiste QUE du JSON "domain" :
 * - brand/content/options/sections
 * => surtout PAS d'objets "computed" potentiellement circulaires.
 */
type Persisted = Pick<
  TemplateConfigInput,
  "brand" | "content" | "options" | "sections"
>;

function coercePersisted(input: TemplateConfigInput): Persisted {
  return {
    brand: input.brand,
    content: input.content,
    options: input.options,
    sections: input.sections,
  };
}

export default function TemplateBaseClient() {
  const [config, setConfig] = React.useState<TemplateConfigInput | null>(null);

  // Load
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        // merge safe: on repart de templateConfig et on override ce qui est persisted
        setConfig({
          ...templateConfig,
          brand: parsed.brand ?? templateConfig.brand,
          content: parsed.content ?? templateConfig.content,
          options: parsed.options ?? templateConfig.options,
          sections: parsed.sections ?? templateConfig.sections,
        });
        return;
      }
    } catch {
      // ignore
    }
    setConfig(templateConfig);
  }, []);

  // Save
  React.useEffect(() => {
    if (!config) return;
    try {
      const persistable = coercePersisted(config);
      localStorage.setItem(LS_KEY, safeJsonStringify(persistable));
    } catch {
      // ignore
    }
  }, [config]);

  if (!config) return <div className="min-h-screen bg-slate-950" />;

  return <TemplateEngine config={config} setConfig={setConfig} />;
}
