import React from "react";
import { cx } from "./theme";

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

  return <div className={cx("mx-auto w-full px-4", max, className)}>{children}</div>;
}
