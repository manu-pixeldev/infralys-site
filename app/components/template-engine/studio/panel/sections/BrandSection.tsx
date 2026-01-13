"use client";

import React from "react";
import type { TemplateConfigInput } from "../../../types";
import { useBrandControls, type LogoMode } from "../hooks/useBrandControls";

const LOGO_MODES: LogoMode[] = ["logoPlusText", "logoOnly", "textOnly"];

type UpdateFn = (fn: (draft: TemplateConfigInput) => void) => void;

export function BrandSection({
  config,
  update,
}: {
  config: TemplateConfigInput;
  update: UpdateFn;
}) {
  const b = useBrandControls(config, update);

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 text-xs font-semibold tracking-wide text-slate-600">
        BRAND
      </div>

      {/* Logo mode + src */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Logo mode
          </label>
          <select
            value={b.currentLogoMode}
            onChange={(e) => b.setLogoMode(e.target.value as LogoMode)}
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          >
            {LOGO_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Logo src
          </label>
          <input
            value={b.logoSrc}
            onChange={(e) => b.setLogoSrc(e.target.value)}
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            placeholder="https://… ou /logo.svg"
          />
        </div>
      </div>

      {/* Logo size */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Width
          </label>
          <input
            type="number"
            value={b.logoW}
            onChange={(e) =>
              b.setLogoW(
                Number.isFinite(parseInt(e.target.value, 10))
                  ? parseInt(e.target.value, 10)
                  : 80
              )
            }
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Height
          </label>
          <input
            type="number"
            value={b.logoH}
            onChange={(e) =>
              b.setLogoH(
                Number.isFinite(parseInt(e.target.value, 10))
                  ? parseInt(e.target.value, 10)
                  : 80
              )
            }
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
          />
        </div>
      </div>

      {/* Brand text */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Nom
          </label>
          <input
            value={b.brandName}
            onChange={(e) => b.setBrandName(e.target.value)}
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            placeholder="Infralys"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700">
            Sous-titre
          </label>
          <input
            value={b.brandSubtitle}
            onChange={(e) => b.setBrandSubtitle(e.target.value)}
            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
            placeholder="Ex: terrassement & aménagement"
          />
        </div>
      </div>
    </div>
  );
}
