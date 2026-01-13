"use client";

import * as React from "react";
import type { TemplateConfigInput } from "../../../types";

export type LogoMode = "logoPlusText" | "logoOnly" | "textOnly";

export function useBrandControls(
  config: TemplateConfigInput,
  update: (fn: (draft: TemplateConfigInput) => void) => void
) {
  const currentLogoMode = ((config as any)?.brand?.logo?.mode ??
    "logoPlusText") as LogoMode;

  const logoSrc = String((config as any)?.brand?.logo?.src ?? "");
  const logoW = Number((config as any)?.brand?.logo?.width ?? 80);
  const logoH = Number((config as any)?.brand?.logo?.height ?? 80);

  const brandName = String((config as any)?.brand?.text?.name ?? "");
  const brandSubtitle = String((config as any)?.brand?.text?.subtitle ?? "");

  const setLogoMode = React.useCallback(
    (mode: LogoMode) =>
      update((d) => {
        (d as any).brand = (d as any).brand ?? {};
        (d as any).brand.logo = (d as any).brand.logo ?? {};
        (d as any).brand.logo.mode = mode;
      }),
    [update]
  );

  const setLogoSrc = React.useCallback(
    (src: string) =>
      update((d) => {
        (d as any).brand = (d as any).brand ?? {};
        (d as any).brand.logo = (d as any).brand.logo ?? {};
        (d as any).brand.logo.src = src;
      }),
    [update]
  );

  const setLogoW = React.useCallback(
    (w: number) =>
      update((d) => {
        const v = Math.max(24, Math.min(512, Number.isFinite(w) ? w : 80));
        (d as any).brand = (d as any).brand ?? {};
        (d as any).brand.logo = (d as any).brand.logo ?? {};
        (d as any).brand.logo.width = v;
      }),
    [update]
  );

  const setLogoH = React.useCallback(
    (h: number) =>
      update((d) => {
        const v = Math.max(24, Math.min(512, Number.isFinite(h) ? h : 80));
        (d as any).brand = (d as any).brand ?? {};
        (d as any).brand.logo = (d as any).brand.logo ?? {};
        (d as any).brand.logo.height = v;
      }),
    [update]
  );

  const setBrandName = React.useCallback(
    (name: string) =>
      update((d) => {
        (d as any).brand = (d as any).brand ?? {};
        (d as any).brand.text = (d as any).brand.text ?? {};
        (d as any).brand.text.name = name;
      }),
    [update]
  );

  const setBrandSubtitle = React.useCallback(
    (subtitle: string) =>
      update((d) => {
        (d as any).brand = (d as any).brand ?? {};
        (d as any).brand.text = (d as any).brand.text ?? {};
        (d as any).brand.text.subtitle = subtitle;
      }),
    [update]
  );

  return {
    currentLogoMode,
    logoSrc,
    logoW,
    logoH,
    brandName,
    brandSubtitle,
    setLogoMode,
    setLogoSrc,
    setLogoW,
    setLogoH,
    setBrandName,
    setBrandSubtitle,
  };
}
