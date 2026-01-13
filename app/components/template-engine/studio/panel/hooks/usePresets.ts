"use client";

import * as React from "react";
import type { TemplateConfigInput } from "../../../types";
import { deepClone } from "../../../core/deep-clone";

const STORAGE_KEY = "infralys:template-presets:v1";

export type StudioPreset = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  config: TemplateConfigInput;
};

function safeNow() {
  return Date.now();
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "";
  }
}

function isObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

function sanitizeName(name: string) {
  const n = (name ?? "").trim();
  return n.length ? n : "Preset";
}

function makeId(name: string) {
  const base = sanitizeName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "preset"}-${safeNow()}`;
}

function loadAll(): StudioPreset[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse<{ presets?: StudioPreset[] }>(raw);
  const list = parsed?.presets;
  if (!Array.isArray(list)) return [];
  // minimal hardening
  return list
    .filter(
      (p) =>
        p &&
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        typeof p.createdAt === "number" &&
        typeof p.updatedAt === "number" &&
        isObject(p.config)
    )
    .map((p) => ({
      ...p,
      name: sanitizeName(p.name),
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

function saveAll(presets: StudioPreset[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, safeStringify({ presets }));
}

export function usePresets(currentConfig: TemplateConfigInput) {
  const [presets, setPresets] = React.useState<StudioPreset[]>(() => loadAll());

  // Keep in sync if another tab changes localStorage
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      setPresets(loadAll());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refresh = React.useCallback(() => {
    setPresets(loadAll());
  }, []);

  const savePreset = React.useCallback(
    (name: string) => {
      const now = safeNow();
      const next: StudioPreset = {
        id: makeId(name),
        name: sanitizeName(name),
        createdAt: now,
        updatedAt: now,
        config: deepClone(currentConfig),
      };
      const all = [next, ...presets];
      setPresets(all);
      saveAll(all);
      return next.id;
    },
    [currentConfig, presets]
  );

  const overwritePreset = React.useCallback(
    (id: string) => {
      const now = safeNow();
      const all = presets.map((p) =>
        p.id === id
          ? { ...p, updatedAt: now, config: deepClone(currentConfig) }
          : p
      );
      setPresets(all);
      saveAll(all);
    },
    [currentConfig, presets]
  );

  const deletePreset = React.useCallback(
    (id: string) => {
      const all = presets.filter((p) => p.id !== id);
      setPresets(all);
      saveAll(all);
    },
    [presets]
  );

  const getPreset = React.useCallback(
    (id: string) => presets.find((p) => p.id === id) ?? null,
    [presets]
  );

  const exportConfig = React.useCallback((cfg: TemplateConfigInput) => {
    return safeStringify(cfg);
  }, []);

  const importConfig = React.useCallback(
    (json: string): TemplateConfigInput | null => {
      const parsed = safeParse<unknown>(json);
      if (!parsed || !isObject(parsed)) return null;
      // We accept any object that looks like a config (upgrade-friendly)
      return parsed as TemplateConfigInput;
    },
    []
  );

  return {
    presets,
    refresh,
    getPreset,
    savePreset,
    overwritePreset,
    deletePreset,
    exportConfig,
    importConfig,
  };
}
