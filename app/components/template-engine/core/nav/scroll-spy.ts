// app/components/template-engine/core/nav/scroll-spy.ts
"use client";

export type SpyOpts = {
  /** Called with the active href (ex: "#sec-contact") */
  onActiveChange?: (href: string) => void;

  /** Optional: called with active DOM id (without #) */
  onActiveDomId?: (domId: string | null) => void;

  /** Resolve scroll offset (header height etc.) */
  getOffsetPx?: () => number;

  /** Additional bias added to offset (px) */
  biasPx?: number;
};

type Link = { href: string };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function getDocScrollHeight() {
  return Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
}

function normalizeLinks(input: any): Link[] {
  // Accept:
  // - array of {href} / strings
  // - object with .links / .items / .direct / .overflow
  if (Array.isArray(input)) {
    return input
      .map((x) => {
        if (typeof x === "string") return { href: x };
        if (x && typeof x === "object" && typeof x.href === "string")
          return { href: x.href };
        return null;
      })
      .filter(Boolean) as Link[];
  }

  if (input && typeof input === "object") {
    const candidateArrays: any[] = [];
    if (Array.isArray((input as any).links))
      candidateArrays.push((input as any).links);
    if (Array.isArray((input as any).items))
      candidateArrays.push((input as any).items);
    if (Array.isArray((input as any).direct))
      candidateArrays.push((input as any).direct);
    if (Array.isArray((input as any).overflow))
      candidateArrays.push((input as any).overflow);

    // If it looks like a NavModel, combine direct+overflow
    if (candidateArrays.length) {
      const flat = candidateArrays.flat();
      return normalizeLinks(flat);
    }
  }

  return [];
}

export function scrollToDomId(domId: string, offsetPx = 0) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(domId);
  if (!el) return;

  const topAbs = el.getBoundingClientRect().top + window.scrollY;
  const y = Math.max(0, topAbs - Math.max(0, offsetPx));

  window.scrollTo({ top: y, behavior: "smooth" });
}

/**
 * Robust scroll-spy:
 * - accepts ANY input (array, navModel, null) without crashing
 * - IntersectionObserver + scroll fallback
 */
export function createScrollSpy(linksOrModel: any, opts?: SpyOpts) {
  if (typeof window === "undefined") {
    return { destroy() {}, refresh() {} };
  }

  const onActiveChange =
    typeof opts?.onActiveChange === "function"
      ? opts.onActiveChange
      : undefined;
  const onActiveDomId =
    typeof opts?.onActiveDomId === "function" ? opts.onActiveDomId : undefined;

  const getOffsetPx =
    typeof opts?.getOffsetPx === "function"
      ? opts.getOffsetPx
      : () => {
          const raw = getComputedStyle(document.documentElement)
            .getPropertyValue("--header-offset")
            .trim();
          const n = Number(String(raw).replace("px", ""));
          return Number.isFinite(n) && n > 0 ? n : 84;
        };

  const biasPx = Number.isFinite(opts?.biasPx as number)
    ? Number(opts?.biasPx)
    : 8;

  let destroyed = false;
  let activeHref: string | null = null;
  let raf = 0;

  const links = normalizeLinks(linksOrModel);

  // hrefs normalized + deduped
  const hrefs = Array.from(
    new Set(
      links
        .map((l) => String(l?.href ?? "").trim())
        .filter((h) => h.startsWith("#") && h.length > 1)
    )
  );

  if (hrefs.length === 0) {
    // no-op but safe
    return { destroy() {}, refresh() {} };
  }

  const pickActive = () => {
    if (destroyed) return;

    const offset = getOffsetPx() + biasPx;
    const y = window.scrollY + offset;

    const atBottom =
      window.innerHeight + window.scrollY >= getDocScrollHeight() - 2;

    let best = "#top";
    let bestTop = -Infinity;

    for (const href of hrefs) {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (!el) continue;

      const topAbs = el.getBoundingClientRect().top + window.scrollY;
      if (topAbs <= y && topAbs > bestTop) {
        bestTop = topAbs;
        best = href;
      }
    }

    if (atBottom) {
      const contactHref =
        hrefs.find((h) => h === "#contact") ??
        hrefs.find((h) => h.toLowerCase().includes("contact"));
      if (contactHref) best = contactHref;
    }

    if (best !== activeHref) {
      activeHref = best;
      onActiveChange?.(best);
      onActiveDomId?.(best.startsWith("#") ? best.slice(1) : best);
    }
  };

  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(pickActive);
  };

  // IntersectionObserver (nice-to-have)
  let io: IntersectionObserver | null = null;
  try {
    io = new IntersectionObserver(() => schedule(), {
      root: null,
      rootMargin: `-${clamp(getOffsetPx() + biasPx, 0, 240)}px 0px -60% 0px`,
      threshold: [0, 0.01, 0.1],
    });

    for (const href of hrefs) {
      const el = document.getElementById(href.slice(1));
      if (el) io.observe(el);
    }
  } catch {
    io = null;
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);

  // First compute
  pickActive();

  return {
    refresh() {
      schedule();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule as any);
      window.removeEventListener("resize", schedule as any);
      try {
        io?.disconnect();
      } catch {}
    },
  };
}
