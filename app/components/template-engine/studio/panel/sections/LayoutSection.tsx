"use client";

import React from "react";
import type { TemplateConfigInput } from "../../../types";
import {
  useLayoutControls,
  type ContainerToken,
  type DensityToken,
  type RadiusToken,
} from "../hooks/useLayoutControls";

const CONTAINERS: ContainerToken[] = ["5xl", "6xl", "7xl", "full"];
const DENSITIES: DensityToken[] = ["compact", "normal", "spacious"];
const RADII: RadiusToken[] = [16, 24, 32];

export type LayoutSectionProps = {
  config: TemplateConfigInput;
  update: (fn: (draft: TemplateConfigInput) => void) => void;
};

export default function LayoutSection({ config, update }: LayoutSectionProps) {
  const l = useLayoutControls(config, update);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
        LAYOUT
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Container
          </label>
          <select
            value={l.currentContainer}
            onChange={(e) =>
              l.setLayoutToken("container", e.target.value as ContainerToken)
            }
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          >
            {CONTAINERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Density
          </label>
          <select
            value={l.currentDensity}
            onChange={(e) =>
              l.setLayoutToken("density", e.target.value as DensityToken)
            }
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          >
            {DENSITIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Radius
          </label>
          <select
            value={String(l.currentRadius)}
            onChange={(e) =>
              l.setLayoutToken("radius", Number(e.target.value) as RadiusToken)
            }
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          >
            {RADII.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
