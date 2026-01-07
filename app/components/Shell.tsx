"use client";

import React from "react";
import Image from "next/image";
import type { Brand } from "@/app/template-base/template.config";

type ShellProps = {
  title: string;
  subtitle?: string;
  status?: string;
  children: React.ReactNode;
  brand?: Brand;
};

export function Shell({
  title,
  subtitle,
  status,
  children,
  brand,
}: ShellProps) {
  const brandName = brand?.text?.name ?? "Infralys";
  const logoEnabled = brand?.logo?.enabled !== false;
  const logoSrc = brand?.logo?.src;
  const logoW = Math.max(24, Number(brand?.logo?.width ?? 40));
  const logoH = Math.max(24, Number(brand?.logo?.height ?? 40));

  // ✅ évite toute différence SSR/hydration sur l'année
  const [year, setYear] = React.useState<number | null>(null);
  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    // ✅ fallback background immédiat (si le gradient/blur arrive “après”, pas de flash clair)
    <div className="min-h-screen bg-slate-950">
      <main className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-50 flex items-center justify-center px-4 py-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-10 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl" />
          <div className="absolute -bottom-48 right-[-40px] h-80 w-80 rounded-full bg-purple-500/25 blur-3xl" />
        </div>

        <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 shadow-[0_22px_70px_rgba(0,0,0,0.75)] px-6 py-6 md:px-10 md:py-8">
          <header className="mb-6 flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-700">
              {logoEnabled && logoSrc ? (
                <Image
                  src={logoSrc}
                  alt={brandName}
                  width={logoW}
                  height={logoH}
                  priority
                />
              ) : (
                <span className="text-xs font-bold tracking-wide text-cyan-400">
                  {brandName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 truncate">
                {brandName}
              </p>
              {subtitle ? (
                <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
              ) : null}
            </div>
          </header>

          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-50">
              {title}
            </h1>
            {status ? (
              <div className="inline-flex items-center gap-2 text-xs text-slate-300 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{status}</span>
              </div>
            ) : null}
          </div>

          <div className="space-y-4 text-slate-100 text-sm md:text-[15px]">
            {children}
          </div>

          <footer className="mt-6 text-[11px] text-slate-500 text-right">
            {/* ✅ rendu stable SSR: année vide jusqu’au mount */}© {year ?? ""}{" "}
            {brandName}
          </footer>
        </div>
      </main>
    </div>
  );
}
