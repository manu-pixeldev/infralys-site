// app/boot-flags.tsx
"use client";

import { useEffect } from "react";

export default function BootFlags() {
  useEffect(() => {
    document.documentElement.setAttribute("data-booted", "1");
  }, []);

  return null;
}
