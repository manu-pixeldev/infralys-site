"use client";

import React from "react";
import {
  parseThemeVariant,
  joinThemeVariant,
  DEFAULT_THEME_VARIANT,
} from "../utils/theme-variant";

/* -------------------------------- constants -------------------------------- */

const ACCENTS = [
  "amberOrange",
  "emeraldTeal",
  "blueRed",
  "purplePink",
  "slateIndigo",
  "monoDark",
  "monoDarkRose",
  "monoDarkGold",
  "monoDarkLime",
  "neon",
  "aurora",
  "volcano",
  "cyber",
] as const;

const CANVAS = [
  "classic",
  "pearl",
  "paper",
  "frost",
  "sand",
  "porcelain",
  "cloud",
  "latte",
  "sage",
  "clay",
  "lilac",
  "warm",
  "cool",
  "forest",
  "sunset",
  "charcoal",
  "midnight",
  "graphite",
  "studio",
  "obsidian",
  "neon",
  "aurora",
  "volcano",
  "cyber",
  "broken",
] as const;

const SIGNATURE_CANVAS = new Set([
  "porcelain",
  "cloud",
  "latte",
  "sage",
  "clay",
  "lilac",
]);

/* -------------------------------- utils -------------------------------- */

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

/* -------------------------------- types -------------------------------- */

export type ThemeSectionProps = {
  themeVariantRaw?: string;
  canvasStyle: "classic" | "immersive";
  autoAccentMode: "off" | "muted" | "vivid";
  setThemeVariant: (next: string) => void;
  setCanvasStyle: (style: "classic" | "immersive") => void;
  setAutoAccentMode: (mode: "off" | "muted" | "vivid") => void;
};

/* -------------------------------- component -------------------------------- */

export default function ThemeSection({
  themeVariantRaw,
  canvasStyle,
  autoAccentMode,
  setThemeVariant,
  setCanvasStyle,
  setAutoAccentMode,
}: ThemeSectionProps) {
  const { accent, canvas } = parseThemeVariant(
    themeVariantRaw ?? DEFAULT_THEME_VARIANT
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
        THÈME
      </div>

      {/* canvas style + auto accent */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">Canvas</div>
              <div className="text-xs text-slate-500 truncate">
                Classic / Immersive
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setCanvasStyle(
                  canvasStyle === "classic" ? "immersive" : "classic"
                )
              }
              className={cx(
                "relative h-7 w-12 rounded-full border transition",
                canvasStyle === "immersive" ? "bg-slate-900" : "bg-white"
              )}
              aria-pressed={canvasStyle === "immersive"}
              title="Classic / Immersive"
            >
              <span
                className={cx(
                  "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition",
                  canvasStyle === "immersive"
                    ? "left-6 bg-white"
                    : "left-1 bg-slate-900"
                )}
              />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">
                Accent auto
              </div>
              <div className="text-xs text-slate-500 truncate">
                depuis le logo
              </div>
            </div>
            <select
              value={autoAccentMode}
              onChange={(e) =>
                setAutoAccentMode(
                  e.target.value as ThemeSectionProps["autoAccentMode"]
                )
              }
              className="h-10 w-[120px] rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="off">Off</option>
              <option value="muted">Muted</option>
              <option value="vivid">Vivid</option>
            </select>
          </div>
        </div>
      </div>

      {/* accent */}
      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold text-slate-700">Accent</div>
        <select
          value={accent}
          disabled={autoAccentMode !== "off"}
          onChange={(e) =>
            setThemeVariant(joinThemeVariant(e.target.value, canvas))
          }
          className={cx(
            "h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm",
            autoAccentMode !== "off" && "opacity-60 cursor-not-allowed"
          )}
        >
          {ACCENTS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {/* canvas */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-slate-700">
            Fond (canvas)
          </div>
          {SIGNATURE_CANVAS.has(canvas) ? <Badge>Signature</Badge> : null}
        </div>

        <select
          value={canvas}
          onChange={(e) =>
            setThemeVariant(joinThemeVariant(accent, e.target.value))
          }
          className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
        >
          {CANVAS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
