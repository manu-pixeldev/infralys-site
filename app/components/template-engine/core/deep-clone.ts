// app/components/template-engine/core/deep-clone.ts
export function deepClone<T>(value: T): T {
  const sc = (globalThis as any).structuredClone as
    | undefined
    | ((v: any) => any);
  if (typeof sc === "function") return sc(value);

  if (Array.isArray(value)) return value.map((x) => deepClone(x)) as any;

  if (value && typeof value === "object") {
    const out: any = {};
    for (const k of Object.keys(value as any)) {
      const v: any = (value as any)[k];
      if (typeof v === "function") continue;
      out[k] = deepClone(v);
    }
    return out;
  }

  return value;
}
