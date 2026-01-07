// app/components/template-engine/core/fx/reveal.ts

"use client";

import * as React from "react";

export type RevealOptions = {
  /**
   * CSS class applied to wrappers we control.
   * You likely already use "reveal".
   */
  baseClass?: string; // default: "reveal"

  /**
   * Class added when element is revealed.
   */
  revealedClass?: string; // default: "is-revealed"

  /**
   * Only reveal when scrolling down (prevents pop-in when scrolling up).
   */
  downOnly?: boolean; // default: true

  /**
   * Reveal once only (recommended).
   */
  once?: boolean; // default: true

  /**
   * IntersectionObserver options
   */
  threshold?: number | number[]; // default: 0.12
  rootMargin?: string; // default: "0px 0px -10% 0px"

  /**
   * Respect reduced motion (true => disable animation, reveal immediately)
   */
  respectReducedMotion?: boolean; // default: true
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
  );
}

/**
 * Reveal — V24 Canon
 * - registerReveal(sectionId) -> ref callback
 * - down-only (optional)
 * - one-shot (optional)
 * - stable on refresh (doesn't "unreveal")
 */
export function useReveal(opts?: RevealOptions) {
  const options: Required<RevealOptions> = {
    baseClass: opts?.baseClass ?? "reveal",
    revealedClass: opts?.revealedClass ?? "is-revealed",
    downOnly: opts?.downOnly ?? true,
    once: opts?.once ?? true,
    threshold: opts?.threshold ?? 0.12,
    rootMargin: opts?.rootMargin ?? "0px 0px -10% 0px",
    respectReducedMotion: opts?.respectReducedMotion ?? true,
  };

  const ioRef = React.useRef<IntersectionObserver | null>(null);
  const seenRef = React.useRef<Set<string>>(new Set());

  const lastYRef = React.useRef<number>(0);
  const lastDirRef = React.useRef<"down" | "up">("down");

  // track scroll direction (cheap)
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    lastYRef.current = window.scrollY || 0;

    const onScroll = () => {
      const y = window.scrollY || 0;
      const dir = y >= lastYRef.current ? "down" : "up";
      lastDirRef.current = dir;
      lastYRef.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Reduced motion => reveal everything immediately by just adding class on mount when registered.
    const reduced = options.respectReducedMotion && prefersReducedMotion();

    // IO setup
    if (!reduced) {
      ioRef.current = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const el = e.target as HTMLElement;
            const key = el.getAttribute("data-reveal-key") || el.id || "";

            if (!key) continue;

            if (options.once && seenRef.current.has(key)) {
              // already revealed, no-op
              continue;
            }

            if (!e.isIntersecting) continue;

            if (options.downOnly && lastDirRef.current !== "down") {
              continue;
            }

            el.classList.add(options.revealedClass);
            if (options.once) seenRef.current.add(key);

            if (options.once) {
              ioRef.current?.unobserve(el);
            }
          }
        },
        {
          root: null,
          threshold: options.threshold,
          rootMargin: options.rootMargin,
        }
      );
    }

    return () => {
      ioRef.current?.disconnect();
      ioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerReveal = React.useCallback(
    (key: string) => {
      return (node: HTMLElement | null) => {
        if (!node) return;

        // mark base class always (so styling is consistent)
        node.classList.add(options.baseClass);

        // stable key for one-shot tracking
        const k = String(key || node.id || "");
        if (k) node.setAttribute("data-reveal-key", k);

        const reduced = options.respectReducedMotion && prefersReducedMotion();

        // If reduced motion OR already seen => reveal immediately.
        if (reduced || (options.once && k && seenRef.current.has(k))) {
          node.classList.add(options.revealedClass);
          return;
        }

        // Observe
        ioRef.current?.observe(node);
      };
    },
    [
      options.baseClass,
      options.revealedClass,
      options.once,
      options.respectReducedMotion,
    ]
  );

  return { registerReveal };
}
