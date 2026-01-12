# FX — Border Scan

## Purpose

Subtle premium motion on section boundaries.
Designed to feel "alive" without being noticeable or repetitive.

## UX Rules (non-negotiable)

- **No gadget**: should never steal attention from content.
- **One-shot per section**: plays once when a section is first revealed.
- **No replay** when scrolling back up/down.
- Divider lines remain visible even if scan is disabled.
- Respect `prefers-reduced-motion`.

## Public API (Classes)

Applied to the section wrapper (the same wrapper that has `.reveal`):

- `.reveal`  
  Base wrapper used by reveal/scroll logic. Hosts the divider lines.

- `.fx-border-scan`  
  Enables the scan FX for this section (gated by Studio toggle).

- `.fx-scan-once`  
  Added by JS when the section first enters the viewport to trigger one pass.

- `.fx-scan-played`  
  Added after the animation ends: scan is removed and the section stays silent.

## Default Behavior

- Desktop: **2 passes** (top + bottom).
- Mobile: **1 pass** (top only).
- Motion: **linear** only (no easing).
- Intensity: hairline beam (1px) with low alpha.
- Divider: subtle gradient line always visible independent of scan.

## Implementation Notes (current)

### CSS approach (current)

- Scan implemented via `background-image` gradients on the wrapper and `background-position` animation.
- Tokens used (subject to tuning):
  - beam width: `--fx-scan-w`
  - beam height: `--fx-scan-h`
  - duration: `--fx-scan-once-dur` / `--fx-scan-idle-dur`
  - overshoot: `--fx-scan-over`

### JS approach (one-shot)

- Uses `IntersectionObserver` (via `useReveal`).
- Stores a per-section memory flag:
  - `el.dataset.fxScanPlayed = "1"`
- On first intersect:
  - add `.fx-scan-once`
- On animation end:
  - remove `.fx-scan-once`
  - add `.fx-scan-played`

## Known Issues / TODO

### TODO: True offscreen (viewport-based)

Current implementation animates relative to the section width.
This can cause:

- beam appears "already inside" (not starting at screen edge)
- beam disappears before reaching screen edge

**Planned fix:** move to a viewport-based scan (fixed overlay) driven by section Y position.

### TODO: Finalize tokens

Durations, overshoot, and beam width are still being tuned.

## Testing Checklist

- Scan plays once per section on first reveal
- Returning to a section does not replay scan
- Divider gradient remains when scan toggle is OFF
- Mobile shows only 1 pass
- Reduced motion disables scan
- Works on dark + light canvases
