// app/components/template-engine/core/fx/reveal.ts
"use client";

import * as React from "react";

/**
 * Reveal (IntersectionObserver)
 * - Sections wrapped with class "reveal" start hidden via CSS when html[data-reveal-ready="1"]
 * - This hook adds class "is-in" when a section enters the viewport
 *
 * ✅ Hash-safe:
 * If the page loads with a hash (#sec-contact), we immediately mark ALL reveals as "is-in"
 * to avoid the classic “blank page” when the anchor is already in view before IO boots.
 */

type RegisterFn = (domId: string) => (el: HTMLElement | null) => void;

export function useReveal(): { registerReveal: RegisterFn } {
  const mapRef = React.useRef(new Map<string, HTMLElement>());
  const obsRef = React.useRef<IntersectionObserver | null>(null);

  // one-time hash detection (stable for initial load)
  const hasInitialHashRef = React.useRef(false);
  if (typeof window !== "undefined" && !hasInitialHashRef.current) {
    hasInitialHashRef.current = window.location.hash.length > 1;
  }

  React.useEffect(() => {
    // Mark reveal system ready (your CSS relies on this)
    // If this is already done elsewhere, it's harmless.
    document.documentElement.setAttribute("data-reveal-ready", "1");

    // ✅ If initial load had a hash, unlock immediately (avoid blank page)
    if (hasInitialHashRef.current) {
      // Make already-mounted elements visible
      mapRef.current.forEach((el) => el.classList.add("is-in"));

      // Also catch any reveal nodes not registered yet (belt + suspenders)
      document
        .querySelectorAll<HTMLElement>(".reveal")
        .forEach((el) => el.classList.add("is-in"));

      // No observer needed in this mode (keeps it super safe)
      return;
    }

    // Normal mode: IntersectionObserver reveal
    obsRef.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.classList.add("is-in");
            // One-shot reveal: stop observing once revealed (premium + perf)
            obsRef.current?.unobserve(el);
          }
        }
      },
      {
        // Trigger a bit before fully in-view
        root: null,
        threshold: 0.12,
        rootMargin: "64px 0px -10% 0px",
      }
    );

    // Observe everything that was registered before the observer existed
    mapRef.current.forEach((el) => obsRef.current?.observe(el));

    return () => {
      obsRef.current?.disconnect();
      obsRef.current = null;
    };
  }, []);

  const registerReveal = React.useCallback<RegisterFn>((domId: string) => {
    return (el: HTMLElement | null) => {
      const key = String(domId || "");

      // unmount
      if (!el) {
        const prev = mapRef.current.get(key);
        if (prev) obsRef.current?.unobserve(prev);
        mapRef.current.delete(key);
        return;
      }

      // mount
      mapRef.current.set(key, el);

      // ✅ Hash-safe: if we loaded with a hash, force visible immediately
      if (hasInitialHashRef.current) {
        el.classList.add("is-in");
        return;
      }

      // Normal: observe for reveal
      obsRef.current?.observe(el);
    };
  }, []);

  return { registerReveal };
}
