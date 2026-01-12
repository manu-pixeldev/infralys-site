// app/components/template-engine/core/nav/scroll-restore.ts
"use client";

import * as React from "react";

/**
 * Keep scroll position on hard refresh / HMR without showing “top then jump”.
 * - sessionStorage key per pathname + hash
 * - restores after mount (double pass)
 * - ignores restore if user explicitly navigated to an anchor
 */
export function useScrollRestoreNoFlash(): boolean {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {}

    const key = `te:scroll:${window.location.pathname}${
      window.location.hash || ""
    }`;

    let raf = 0;
    const save = () => {
      try {
        sessionStorage.setItem(key, String(window.scrollY || 0));
      } catch {}
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        save();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("beforeunload", save);

    // If navigation explicitly targets an anchor, don't restore
    const explicitAnchorNav =
      Boolean((window as any).__TE_ANCHOR_NAV) && Boolean(window.location.hash);

    let y = 0;
    if (!explicitAnchorNav) {
      try {
        y = Number(sessionStorage.getItem(key) || "0") || 0;
      } catch {}
    }

    requestAnimationFrame(() => {
      if (!explicitAnchorNav && y > 0) {
        window.scrollTo(0, Math.max(0, y));
        // One more pass (late layout / images)
        requestAnimationFrame(() => {
          window.scrollTo(0, Math.max(0, y));
          setReady(true);
        });
      } else {
        setReady(true);
      }
    });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", save);
    };
  }, []);

  return ready;
}
