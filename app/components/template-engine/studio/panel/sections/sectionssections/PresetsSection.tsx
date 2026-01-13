"use client";

import React from "react";
import type { TemplateConfigInput } from "../../../../types";
import { deepClone } from "../../../../core/deep-clone";
import { usePresets } from "../../hooks/usePresets";

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

type Tab = "packs" | "mine";

export type PresetsSectionProps = {
  config: TemplateConfigInput;
  setConfig: React.Dispatch<React.SetStateAction<TemplateConfigInput>>;
};

export default function PresetsSection({
  config,
  setConfig,
}: PresetsSectionProps) {
  const p = usePresets(config);

  const [tab, setTab] = React.useState<Tab>("packs");
  const [name, setName] = React.useState("My Preset");
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [importJson, setImportJson] = React.useState("");
  const [toast, setToast] = React.useState<string>("");

  // marketplace state
  const [q, setQ] = React.useState("");
  const [tag, setTag] = React.useState<string>(""); // single-tag filter (simple + premium)

  // preview state
  const previewBaseRef = React.useRef<TemplateConfigInput | null>(null);
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [previewId, setPreviewId] = React.useState<string>("");

  const exportJson = React.useMemo(() => p.exportConfig(config), [p, config]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const selected = React.useMemo(
    () => (selectedId ? p.getPreset(selectedId) : null),
    [p, selectedId]
  );

  const applyPreset = React.useCallback(
    (cfg: TemplateConfigInput) => setConfig(() => deepClone(cfg)),
    [setConfig]
  );

  // Lists
  const mine = React.useMemo(() => p.listMine(), [p]);
  const packs = React.useMemo(() => p.listPacks(), [p]);

  const allPackTags = React.useMemo(() => {
    const s = new Set<string>();
    packs.forEach((x: any) => (x.tags ?? []).forEach((t: string) => s.add(t)));
    return Array.from(s).sort();
  }, [packs]);

  const packsFiltered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    return packs.filter((x: any) => {
      const hay = `${x.name ?? ""} ${x.description ?? ""} ${(x.tags ?? []).join(
        " "
      )}`.toLowerCase();
      const okQ = !qq || hay.includes(qq);
      const okTag = !tag || (x.tags ?? []).includes(tag);
      return okQ && okTag;
    });
  }, [packs, q, tag]);

  // --- My presets actions ---
  const onSave = React.useCallback(() => {
    const id = p.savePreset(name);
    setSelectedId(id);
    setTab("mine");
    setToast("Preset saved");
  }, [p, name]);

  const onOverwrite = React.useCallback(() => {
    if (!selected || (selected as any).source !== "mine") return;
    p.overwritePreset(selected.id);
    setToast("Preset updated");
  }, [p, selected]);

  const onLoad = React.useCallback(() => {
    if (!selected) return;
    applyPreset(selected.config);
    setToast(
      (selected as any).source === "pack" ? "Pack applied" : "Preset loaded"
    );
  }, [selected, applyPreset]);

  const onDelete = React.useCallback(() => {
    if (!selected || (selected as any).source !== "mine") return;
    p.deletePreset(selected.id);
    setSelectedId("");
    setToast("Preset deleted");
  }, [p, selected]);

  // --- Packs actions ---
  const onDuplicatePack = React.useCallback(
    (packId: string, packName: string) => {
      const id = p.duplicatePackToMine(packId, `${packName} (copy)`);
      if (id) {
        setSelectedId(id);
        setTab("mine");
        setToast("Copied to My presets");
      }
    },
    [p]
  );

  const onCopy = React.useCallback(async () => {
    const ok = await copyToClipboard(exportJson);
    setToast(ok ? "Copied" : "Copy failed");
  }, [exportJson]);

  const onImportApply = React.useCallback(() => {
    const next = p.importConfig(importJson);
    if (!next) {
      setToast("Invalid JSON");
      return;
    }
    applyPreset(next);
    setToast("Imported");
  }, [p, importJson, applyPreset]);

  // --- Preview / Revert ---
  const startPreview = React.useCallback(
    (id: string, cfg: TemplateConfigInput) => {
      if (!isPreviewing) {
        previewBaseRef.current = deepClone(config);
      }
      applyPreset(cfg);
      setIsPreviewing(true);
      setPreviewId(id);
      setToast("Preview");
    },
    [applyPreset, config, isPreviewing]
  );

  const revertPreview = React.useCallback(() => {
    if (!isPreviewing || !previewBaseRef.current) return;
    applyPreset(previewBaseRef.current);
    previewBaseRef.current = null;
    setIsPreviewing(false);
    setPreviewId("");
    setToast("Reverted");
  }, [applyPreset, isPreviewing]);

  const commitPreview = React.useCallback(() => {
    // "Apply" already applied; commit just clears preview base
    previewBaseRef.current = null;
    setIsPreviewing(false);
    setPreviewId("");
    setToast("Applied");
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-xs font-semibold tracking-wide text-slate-600">
          PRESETS
        </div>
        {toast ? (
          <div className="text-[11px] font-semibold text-slate-500">
            {toast}
          </div>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("packs")}
          className={cx(
            "h-9 flex-1 rounded-2xl border px-3 text-sm font-semibold transition",
            tab === "packs"
              ? "border-slate-300 bg-white text-slate-900"
              : "border-slate-200 bg-white/60 text-slate-600 hover:bg-white"
          )}
        >
          Packs
        </button>
        <button
          type="button"
          onClick={() => setTab("mine")}
          className={cx(
            "h-9 flex-1 rounded-2xl border px-3 text-sm font-semibold transition",
            tab === "mine"
              ? "border-slate-300 bg-white text-slate-900"
              : "border-slate-200 bg-white/60 text-slate-600 hover:bg-white"
          )}
        >
          My presets
        </button>
      </div>

      {/* PACKS marketplace */}
      {tab === "packs" && (
        <div className="space-y-2">
          {/* search + tag */}
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search packs…"
              className={cx(
                "h-10 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm",
                "outline-none focus:ring-2 focus:ring-slate-200"
              )}
            />
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className={cx(
                "h-10 w-[140px] rounded-2xl border border-slate-200 bg-white px-3 text-sm",
                "outline-none focus:ring-2 focus:ring-slate-200"
              )}
              title="Filter by tag"
            >
              <option value="">All</option>
              {allPackTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* preview bar */}
          {isPreviewing && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-slate-600">
                  Previewing:{" "}
                  <span className="font-semibold text-slate-900">
                    {previewId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={revertPreview}
                    className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Revert
                  </button>
                  <button
                    type="button"
                    onClick={commitPreview}
                    className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {packsFiltered.map((pack: any) => (
            <div
              key={pack.id}
              className="rounded-2xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {pack.name}
                  </div>
                  {pack.description ? (
                    <div className="mt-0.5 text-xs text-slate-500">
                      {pack.description}
                    </div>
                  ) : null}
                  {pack.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {pack.tags.slice(0, 6).map((t: string) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTag((cur) => (cur === t ? "" : t))}
                          className={cx(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            tag === t
                              ? "bg-slate-200 text-slate-800"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                          title="Filter by this tag"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startPreview(pack.id, pack.config)}
                    className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    title="Preview (temporary)"
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      applyPreset(pack.config);
                      commitPreview();
                    }}
                    className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    title="Apply (commit)"
                  >
                    Apply
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicatePack(pack.id, pack.name)}
                    className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    title="Copy into My presets"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MY PRESETS */}
      {tab === "mine" && (
        <>
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Preset name"
              className={cx(
                "h-10 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm",
                "outline-none focus:ring-2 focus:ring-slate-200"
              )}
            />
            <button
              type="button"
              onClick={onSave}
              className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              title="Save current config as a new preset"
            >
              Save
            </button>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={cx(
                "h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm",
                "outline-none focus:ring-2 focus:ring-slate-200"
              )}
            >
              <option value="">Select a preset…</option>
              {mine.map((x: any) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLoad}
                disabled={!selected || (selected as any).source !== "mine"}
                className={cx(
                  "h-10 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold",
                  selected && (selected as any).source === "mine"
                    ? "text-slate-800 hover:bg-slate-50"
                    : "text-slate-400 cursor-not-allowed"
                )}
              >
                Load
              </button>

              <button
                type="button"
                onClick={onOverwrite}
                disabled={!selected || (selected as any).source !== "mine"}
                className={cx(
                  "h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold",
                  selected && (selected as any).source === "mine"
                    ? "text-slate-700 hover:bg-slate-50"
                    : "text-slate-400 cursor-not-allowed"
                )}
                title="Overwrite selected preset with current config"
              >
                Update
              </button>

              <button
                type="button"
                onClick={onDelete}
                disabled={!selected || (selected as any).source !== "mine"}
                className={cx(
                  "h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold",
                  selected && (selected as any).source === "mine"
                    ? "text-slate-700 hover:bg-slate-50"
                    : "text-slate-400 cursor-not-allowed"
                )}
                title="Delete selected preset"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Export/Import always visible */}
      <div className="mt-4 grid grid-cols-1 gap-3">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-600">
              Export (current config)
            </div>
            <button
              type="button"
              onClick={onCopy}
              className="text-[10px] font-semibold text-slate-500 hover:text-slate-700"
            >
              Copy
            </button>
          </div>
          <textarea
            readOnly
            value={exportJson}
            className={cx(
              "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs",
              "font-mono text-slate-700 outline-none"
            )}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <div className="text-[11px] font-semibold text-slate-600">
              Import (paste JSON)
            </div>
            <button
              type="button"
              onClick={onImportApply}
              className="text-[10px] font-semibold text-slate-500 hover:text-slate-700"
              title="Apply imported config"
            >
              Apply
            </button>
          </div>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder="Paste JSON here…"
            className={cx(
              "min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs",
              "font-mono text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
            )}
          />
        </div>
      </div>
    </div>
  );
}
