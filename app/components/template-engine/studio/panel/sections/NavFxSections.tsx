// app/components/template-engine/studio/panel/sections/NavFxSections.tsx
"use client";

import React from "react";
import type { TemplateConfigInput } from "../../../types";
import {
  useNavControls,
  normalizeDigitString,
  clampInt,
} from "../hooks/useNavControls";
import { useFxControls, type FxKey } from "../hooks/useFxControls";

export type NavFxSectionsProps = {
  config: TemplateConfigInput;
  update: (fn: (draft: TemplateConfigInput) => void) => void;
};

export default function NavFxSections({ config, update }: NavFxSectionsProps) {
  const nav = useNavControls(config, update);
  const fx = useFxControls(config, update);

  const [maxDirectDraft, setMaxDirectDraft] = React.useState<string>(
    String(nav.maxDirect)
  );

  React.useEffect(() => {
    setMaxDirectDraft(String(nav.maxDirect));
  }, [nav.maxDirect]);

  const FX_ROWS: Array<[FxKey, string]> = [
    ["enabled", "FX activés"],
    ["ambient", "Ambient"],
    ["softGlow", "Soft glow"],
    ["borderScan", "Border scan"],
    ["shimmerCta", "Shimmer CTA"],
  ];

  return (
    <>
      {/* NAV */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
          NAV
        </div>

        <label className="mb-2 block text-xs font-semibold text-slate-700">
          Max direct links (menu)
        </label>

        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={maxDirectDraft}
          onChange={(e) => {
            const norm = normalizeDigitString(e.target.value);
            setMaxDirectDraft(norm);

            if (norm === "") return;
            nav.setMaxDirect(clampInt(parseInt(norm, 10), 0, 12));
          }}
          onBlur={() => {
            const norm = normalizeDigitString(maxDirectDraft);
            const n =
              norm === "" ? nav.maxDirect : clampInt(parseInt(norm, 10), 0, 12);

            setMaxDirectDraft(String(n));
            nav.setMaxDirect(n);
          }}
          className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
        />
      </div>

      {/* FX */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
          FX
        </div>

        <div className="space-y-2 text-sm text-slate-800">
          {FX_ROWS.map(([k, label]) => (
            <label key={k} className="flex items-center justify-between gap-3">
              <span>{label}</span>
              <input
                type="checkbox"
                checked={fx.isOn(k)}
                onChange={(e) => fx.setFx(k, e.target.checked)}
              />
            </label>
          ))}
        </div>

        <div className="mt-2 text-xs text-slate-500">
          Shimmer CTA = uniquement sur les éléments qui ont la classe{" "}
          <span className="font-semibold">fx-cta</span>.
        </div>
      </div>
    </>
  );
}
