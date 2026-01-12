"use client";

import React from "react";

import { TemplateEngine } from "../components/template-engine/template-engine";
import type { TemplateConfigInput } from "../components/template-engine/types";
import { templateConfig } from "./template.config";

const LS_KEY_NEW = "template-base-config-v2040";
const LS_KEY_OLD = "template-base-config-v24";

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
 * => surtout PAS d'objets computed.
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

function isObject(v: unknown): v is Record<string, any> {
  return typeof v === "object" && v !== null;
}

export default function TemplateBaseClient() {
  const [config, setConfig] = React.useState<TemplateConfigInput | null>(null);

  // Load (NEW then OLD)
  React.useEffect(() => {
    try {
      const rawNew = localStorage.getItem(LS_KEY_NEW);
      if (rawNew) {
        const parsed = JSON.parse(rawNew);
        if (isObject(parsed)) {
          const p = parsed as Persisted;
          setConfig({
            ...templateConfig,
            brand: p.brand ?? templateConfig.brand,
            content: p.content ?? templateConfig.content,
            options: p.options ?? templateConfig.options,
            sections: p.sections ?? templateConfig.sections,
          });
          return;
        }
      }

      const rawOld = localStorage.getItem(LS_KEY_OLD);
      if (rawOld) {
        const parsed = JSON.parse(rawOld);
        if (isObject(parsed)) {
          const p = parsed as Persisted;
          const merged: TemplateConfigInput = {
            ...templateConfig,
            brand: p.brand ?? templateConfig.brand,
            content: p.content ?? templateConfig.content,
            options: p.options ?? templateConfig.options,
            sections: p.sections ?? templateConfig.sections,
          };
          setConfig(merged);

          // migrate -> NEW key
          try {
            localStorage.setItem(
              LS_KEY_NEW,
              safeJsonStringify(coercePersisted(merged))
            );
          } catch {}
          return;
        }
      }
    } catch {
      // ignore
    }

    setConfig(templateConfig);
  }, []);

  // Save (NEW)
  React.useEffect(() => {
    if (!config) return;
    try {
      const persistable = coercePersisted(config);
      localStorage.setItem(LS_KEY_NEW, safeJsonStringify(persistable));
    } catch {
      // ignore
    }
  }, [config]);

  if (!config) return <div className="min-h-screen bg-slate-950" />;

  return <TemplateEngine config={config} setConfig={setConfig} />;
}
