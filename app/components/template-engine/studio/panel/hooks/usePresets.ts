"use client";

import * as React from "react";
import type { TemplateConfigInput } from "../../../types";
import { deepClone } from "../../../core/deep-clone";

import { BUILTIN_PACKS, type BuiltinPack } from "../presets/builtin-packs";

const STORAGE_KEY = "infralys:template-presets:v1";

export type StudioPreset = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  config: TemplateConfigInput;
};

export type PresetLike = {
  id: string;
  name: string;
  tags?: string[];
  locked?: boolean; // true for packs
  source: "pack" | "mine";
  createdAt?: number;
  updatedAt?: number;
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

function loadMine(): StudioPreset[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse<{ presets?: StudioPreset[] }>(raw);
  const list = parsed?.presets;
  if (!Array.isArray(list)) return [];
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

function saveMine(presets: StudioPreset[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, safeStringify({ presets }));
}

function packToPresetLike(pack: BuiltinPack): PresetLike {
  return {
    id: pack.id,
    name: pack.name,
    tags: pack.tags,
    locked: true,
    source: "pack",
    config: deepClone(pack.config),
  };
}

function mineToPresetLike(p: StudioPreset): PresetLike {
  return {
    id: p.id,
    name: p.name,
    source: "mine",
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    config: deepClone(p.config),
  };
}

export function usePresets(currentConfig: TemplateConfigInput) {
  const [mine, setMine] = React.useState<StudioPreset[]>(() => loadMine());

  // Sync localStorage changes from another tab
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      setMine(loadMine());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const packs = React.useMemo(() => BUILTIN_PACKS.map(packToPresetLike), []);

  const mineAsLike = React.useMemo(() => mine.map(mineToPresetLike), [mine]);

  const listMine = React.useCallback(() => mineAsLike, [mineAsLike]);
  const listPacks = React.useCallback(() => packs, [packs]);

  const listAll = React.useCallback(() => {
    // packs first, then mine (recent first already)
    return [...packs, ...mineAsLike];
  }, [packs, mineAsLike]);

  const refresh = React.useCallback(() => {
    setMine(loadMine());
  }, []);

  const getPreset = React.useCallback(
    (id: string): PresetLike | null => {
      if (!id) return null;
      const p1 = packs.find((x) => x.id === id);
      if (p1) return p1;
      const p2 = mineAsLike.find((x) => x.id === id);
      return p2 ?? null;
    },
    [packs, mineAsLike]
  );

  // --- mine actions ---
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
      const all = [next, ...mine];
      setMine(all);
      saveMine(all);
      return next.id;
    },
    [currentConfig, mine]
  );

  const overwritePreset = React.useCallback(
    (id: string) => {
      const now = safeNow();
      const all = mine.map((p) =>
        p.id === id
          ? { ...p, updatedAt: now, config: deepClone(currentConfig) }
          : p
      );
      setMine(all);
      saveMine(all);
    },
    [currentConfig, mine]
  );

  const deletePreset = React.useCallback(
    (id: string) => {
      // only mine
      const all = mine.filter((p) => p.id !== id);
      setMine(all);
      saveMine(all);
    },
    [mine]
  );

  // --- pack actions ---
  const duplicatePackToMine = React.useCallback(
    (packId: string, name?: string) => {
      const pack = BUILTIN_PACKS.find((x) => x.id === packId);
      if (!pack) return null;

      const now = safeNow();
      const next: StudioPreset = {
        id: makeId(name ?? pack.name),
        name: sanitizeName(name ?? `${pack.name} (copy)`),
        createdAt: now,
        updatedAt: now,
        config: deepClone(pack.config),
      };

      const all = [next, ...mine];
      setMine(all);
      saveMine(all);
      return next.id;
    },
    [mine]
  );

  // --- utils ---
  const exportConfig = React.useCallback((cfg: TemplateConfigInput) => {
    return safeStringify(cfg);
  }, []);

  const importConfig = React.useCallback(
    (json: string): TemplateConfigInput | null => {
      const parsed = safeParse<unknown>(json);
      if (!parsed || !isObject(parsed)) return null;
      return parsed as TemplateConfigInput;
    },
    []
  );

  return {
    // lists
    packs,
    mine: mineAsLike,
    listAll,
    listMine,
    listPacks,

    // selectors
    getPreset,

    // actions (mine)
    savePreset,
    overwritePreset,
    deletePreset,

    // actions (packs)
    duplicatePackToMine,

    // utils
    refresh,
    exportConfig,
    importConfig,
  };
}
