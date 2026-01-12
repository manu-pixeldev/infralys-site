# Themes — règles confirmées

## Principe

Un thème définit :

- couleurs de fond
- surfaces
- accents
- comportement glass

Les composants ne doivent PAS inventer de styles.

---

## Canvas & surfaces

Variables CSS utilisées :

- --te-canvas
- --te-surface
- --te-surface-2
- --te-surface-border

Si présentes → mode "canvas actif"

---

## Header & dropdown

- Header :

  - quasi opaque au top
  - plus glass au scroll
  - blur léger (pas miroir)

- Dropdown :
  - plus dense que le header
  - jamais effet miroir
  - lisible sur image

---

## Interdit

❌ bg-gray arbitraire  
❌ opacité forte sans blur  
❌ styles inline divergents
