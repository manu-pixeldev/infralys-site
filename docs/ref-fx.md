## FX — Shimmer CTA (Décision)

- Un seul shimmer CTA canonique (premium).
- Pas de variantes de vitesse/intensité multiples.
- Le shimmer est :
  - opt-in (`.fx-cta`)
  - globalement activé via `data-fx-shimmer`
  - modulé par contexte :
    - `.fx-cta-lg` → plus lent (gros boutons)
    - `.fx-cta-3x` → 3 passes puis stop (luxe)
- Objectif : attirer l’œil sans effet “promo” ni distraction.

# FX (divider / reveal / border scan / shimmer)

## Objectifs

- Divider premium entre sections (toujours ON).
- Reveal one-shot (apparition douce) uniquement en scroll DOWN.
- Aucun "shift" visuel au refresh (même si on refresh en bas de page).
- Pas de mismatch SSR/hydration (Next App Router).

## Conventions DOM / data-attrs

- Le root wrapper du TemplateEngine porte :
  - `data-ui="dark|light"`
  - `data-fx-enabled="1|0"`
  - `data-fx-shimmer="1|0"`
- Les wrappers de sections (non-header/non-top) portent :
  - classe `reveal`
  - classe `fx-divider` (toujours)
  - optionnel : `fx-border-scan`, `fx-softglow`
  - optionnel : `fx-divider-soft` pour la 1ère section après header

## Reveal : règles

- `data-reveal="pending"` est posé par JS au mount sur les wrappers.
- L'IntersectionObserver marque `.is-in` quand l'élément entre en viewport.
- One-shot : une fois `.is-in`, on n'anime plus cet élément.
- Direction-aware :
  - scroll DOWN -> transition opacity/translate
  - scroll UP -> stable direct (pas d’animation)

## Anti-shift au refresh (scroll restore)

- On utilise un verrou temporaire côté client :
  - `html[data-reveal-lock="1"]` neutralise `pending` (opacity 1, transform none)
  - lock posé en `useLayoutEffect` (avant paint), retiré après 2 RAF.
- IMPORTANT: aucun dataset dynamique n’est rendu côté SSR sur `<html>`.

## Border scan

- Actif seulement si `data-fx-enabled="1"` et classe `fx-border-scan`.
- Ligne 1px animée en `::after` (top: 0).
- En light, scan noir via variables RGB (blend multiply).

## Shimmer CTA

- Actif seulement si `data-fx-shimmer="1"` et classe `.fx-cta` (ou `.fx-shimmer-cta`)
- Par défaut: 3 passes puis stop (premium).
- `.fx-cta-loop` => boucle infinie.
- `.fx-cta-once.fx-cta-play` => déclenchement manuel.

## Accessibilité / reduced motion

- `prefers-reduced-motion: reduce` :
  - reveal = no motion
  - border scan / shimmer = disabled
