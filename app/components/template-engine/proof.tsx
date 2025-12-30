"use client";

import React from "react";
import type { ThemeLike } from "./theme";
import { cx, resolveLayout, containerClass, sectionPadY } from "./theme";

/* ============================================================
   BLOC A — SMALL HELPERS
   ============================================================ */

function Wrap({
  children,
  layout,
  globalLayout,
}: {
  children: React.ReactNode;
  layout?: any;
  globalLayout?: any;
}) {
  const l = resolveLayout(layout, globalLayout);
  return <div className={containerClass(l.container)}>{children}</div>;
}

/* ============================================================
   BLOC B — PROOF STATS (SAFE)
   ============================================================ */

export function ProofStats(props: any) {
  const theme = props?.theme as ThemeLike;
  const content = props?.content ?? {};
  const layout = props?.layout;
  const globalLayout = props?.globalLayout ?? props?.globalLayout; // ✅ tolérant
  const sectionId = props?.sectionId ?? "proof";

  const l = resolveLayout(layout, globalLayout);

  const title = content?.proofTitle ?? "Preuves";
  const itemsRaw = content?.proofItems;

  const safeItems: { label: string; value: string }[] = Array.isArray(itemsRaw)
    ? itemsRaw
        .map((x: any) => ({
          label: typeof x?.label === "string" ? x.label : "",
          value: typeof x?.value === "string" ? x.value : "",
        }))
        .filter((x: any) => x.label && x.value)
    : [];

  if (!safeItems.length) return null;

  return (
    <section id={sectionId} className={sectionPadY(l.density)}>
      <Wrap layout={layout} globalLayout={globalLayout}>
        <div className="mb-8">
          <div
            className={cx(
              "text-xs font-semibold uppercase tracking-[0.18em]",
              theme.isDark ? "text-white/60" : "text-slate-500"
            )}
          >
            Preuves
          </div>
          <h2
            className={cx(
              "mt-2 text-3xl font-semibold tracking-tight",
              theme.isDark ? "text-white" : "text-slate-950"
            )}
          >
            {title}
          </h2>
        </div>

        <div
          className={cx(
            "grid gap-6",
            safeItems.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"
          )}
        >
          {safeItems.map((it, i) => (
            <div
              key={i}
              className={cx(
                "rounded-2xl border p-6",
                theme.isDark
                  ? "border-white/10 bg-white/5"
                  : "border-slate-200 bg-white"
              )}
            >
              <div
                className={cx(
                  "text-3xl font-semibold",
                  theme.isDark ? "text-white" : "text-slate-900"
                )}
              >
                {it.value}
              </div>
              <div
                className={cx(
                  "mt-1 text-sm",
                  theme.isDark ? "text-white/70" : "text-slate-600"
                )}
              >
                {it.label}
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
