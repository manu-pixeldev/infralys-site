"use client";

import React from "react";
import type { LayoutTokens } from "../../template-base/template.config";
import { cx, containerClass, resolveLayout, radiusClass } from "./theme";

export function ProofStats({ theme, content, layout, globalLayout }: any) {
  const l = resolveLayout(layout as LayoutTokens, globalLayout as LayoutTokens);

  const title = content?.proofTitle ?? "Preuves";

  const raw = Array.isArray(content?.proofItems) ? content.proofItems : [];
  const items = raw.slice(0, 4);

  const cols =
    items.length === 1
      ? "md:grid-cols-1"
      : items.length === 2
        ? "md:grid-cols-2"
        : items.length === 3
          ? "md:grid-cols-3"
          : "md:grid-cols-4";

  // fallback si vide
  const safeItems =
    items.length > 0
      ? items
      : [
          { label: "Interventions", value: "250+" },
          { label: "Clients satisfaits", value: "4.9/5" },
          { label: "Délai moyen", value: "< 24h" },
        ];

  return (
    <section id="proof" className="py-14 md:py-16">
      <div className={containerClass(l.container)}>
        <div
          className={cx(
            radiusClass(l.radius),
            "border p-8 md:p-12",
            theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
          )}
        >
          <h2 className={cx("text-2xl md:text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
            {title}
          </h2>

          <div className={cx("mt-8 grid gap-4", cols)}>
            {safeItems.map((it: any, i: number) => (
              <div
                key={i}
                className={cx(
                  radiusClass(l.radius),
                  "border p-6",
                  theme.isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                )}
              >
                <div className={cx("text-3xl font-semibold", theme.isDark ? "text-white" : "text-slate-900")}>
                  {it.value}
                </div>
                <div className={cx("mt-1 text-sm", theme.isDark ? "text-white/70" : "text-slate-600")}>
                  {it.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
