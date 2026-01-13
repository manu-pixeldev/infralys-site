import type { TemplateConfigInput } from "../../../types";

/**
 * Shallow + safe merge:
 * - keep existing config structure
 * - override only keys provided by patch
 * - deep merge for plain objects, arrays replaced
 */
function isObj(x: unknown): x is Record<string, any> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

export function mergeConfig(
  base: TemplateConfigInput,
  patch: TemplateConfigInput
): TemplateConfigInput {
  const b: any = base ?? {};
  const p: any = patch ?? {};
  const out: any = Array.isArray(b) ? [...b] : { ...b };

  for (const k of Object.keys(p)) {
    const pv = p[k];
    const bv = b[k];

    if (isObj(bv) && isObj(pv)) out[k] = mergeConfig(bv, pv);
    else out[k] = pv; // arrays or primitives override
  }

  return out as TemplateConfigInput;
}
