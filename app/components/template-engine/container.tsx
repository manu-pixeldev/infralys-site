import React from "react";
import type { ThemeLike } from "./theme";
import type { JSX } from "react";
import { cx } from "./theme";

/* ===== BLOCK: Container (layout width) ===== */
export function Container({
  children,
  size = "7xl",
  className,
}: {
  children: React.ReactNode;
  size?: "5xl" | "6xl" | "7xl";
  className?: string;
}) {
  const max =
    size === "5xl" ? "max-w-5xl" : size === "6xl" ? "max-w-6xl" : "max-w-7xl";
  return (
    <div className={cx("mx-auto w-full px-4", max, className)}>{children}</div>
  );
}
/* ===== END BLOCK: Container ===== */

/* ===== BLOCK: Surface (theme-aware card/module wrapper) ===== */
export function Surface({
  children,
  theme,
  className,
  as: As = "div",
  style,
}: {
  children: React.ReactNode;
  theme: ThemeLike;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}) {
  return (
    <As
      className={cx("rounded-2xl border", className)}
      style={{
        background: theme.surfaceBg,
        borderColor: theme.surfaceBorder,
        ...style,
      }}
    >
      {children}
    </As>
  );
}
/* ===== END BLOCK: Surface ===== */
