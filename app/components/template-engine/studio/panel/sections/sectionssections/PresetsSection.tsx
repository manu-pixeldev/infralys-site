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

export type PresetsSectionProps = {
  config: TemplateConfigInput;
  setConfig: React.Dispatch<React.SetStateAction<TemplateConfigInput>>;
};

export default function PresetsSection({
  config,
  setConfig,
}: PresetsSectionProps) {
  const p = usePresets(config);

  const [name, setName] = React.useState("My Preset");
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [importJson, setImportJson] = React.useState("");
  const [toast, setToast] = React.useState<string>("");

  const exportJson = React.useMemo(() => p.exportConfig(config), [p, config]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const selectedPreset = React.useMemo(
    () => (selectedId ? p.getPreset(selectedId) : null),
    [p, selectedId]
  );

  const onSave = React.useCallback(() => {
    const id = p.savePreset(name);
    setSelectedId(id);
    setToast("Preset saved");
  }, [p, name]);

  const onOverwrite = React.useCallback(() => {
    if (!selectedId) return;
    p.overwritePreset(selectedId);
    setToast("Preset updated");
  }, [p, selectedId]);

  const onLoad = React.useCallback(() => {
    if (!selectedPreset) return;
    setConfig(() => deepClone(selectedPreset.config));
    setToast("Preset loaded");
  }, [selectedPreset, setConfig]);

  const onDelete = React.useCallback(() => {
    if (!selectedId) return;
    p.deletePreset(selectedId);
    setSelectedId("");
    setToast("Preset deleted");
  }, [p, selectedId]);

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
    setConfig(() => deepClone(next));
    setToast("Imported");
  }, [p, importJson, setConfig]);

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

      {/* Save row */}
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

      {/* Load row */}
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
          {p.presets.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoad}
            disabled={!selectedPreset}
            className={cx(
              "h-10 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold",
              selectedPreset
                ? "text-slate-800 hover:bg-slate-50"
                : "text-slate-400 cursor-not-allowed"
            )}
          >
            Load
          </button>

          <button
            type="button"
            onClick={onOverwrite}
            disabled={!selectedPreset}
            className={cx(
              "h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold",
              selectedPreset
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
            disabled={!selectedPreset}
            className={cx(
              "h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold",
              selectedPreset
                ? "text-slate-700 hover:bg-slate-50"
                : "text-slate-400 cursor-not-allowed"
            )}
            title="Delete selected preset"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Export/Import */}
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
