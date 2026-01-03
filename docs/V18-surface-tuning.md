# V18 — Surface Tuning / Header & Dropdown Glass

## Statut

✅ BACKUP OK  
✅ Branch: `v18-step1-surface-tuning`  
✅ Push effectué sur origin

---

## Objectif de V18

Améliorer le rendu **glass / surface / header / dropdown** pour :

- réduire l’effet miroir excessif
- garder un rendu premium
- conserver de la profondeur visuelle
- harmoniser header / menu / surfaces

---

## Fichiers modifiés (confirmés)

- `app/components/template-engine/legacy.tsx`
- `app/components/template-engine/theme.ts`

Aucun autre fichier fonctionnel impacté.

---

## Changements clés (VALIDÉS)

### 1. Header (glass contrôlé)

- Header légèrement translucide
- Plus opaque au top
- Légèrement plus glass au scroll
- Blur réduit (pas d’effet miroir)

```ts
backgroundColor: isScrolled
  ? "color-mix(in srgb, var(--te-canvas, #020617) 88%, transparent)"
  : "color-mix(in srgb, var(--te-canvas, #020617) 94%, transparent)";
```
