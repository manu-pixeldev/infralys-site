# Architecture — infralys-site

## Vue d’ensemble

Projet Next.js structuré autour d’un moteur de templates modulaire.

- Header / Hero / Sections = template-engine
- Thèmes = tokens + canvas CSS vars
- Clients spécifiques = app/clients (jamais versionnés)

---

## Dossiers clés

### app/components/template-engine/

Cœur du système de rendu.

Fichiers principaux :

- legacy.tsx  
  → Header, Hero, Sections (Split, Services, Team, Galleries, Contact)
- theme.ts  
  → Tokens visuels (colors, surfaces, canvas, accents)
- variants.ts  
  → Variantes structurelles (A, B, C…)
- socials.tsx  
  → Icônes & liens sociaux
- studio-panel.tsx  
  → UI d’édition (studio)

---

### Header (source de vérité)

📍 Fichier :

Responsabilités :

- Gestion du scroll (`isScrolled`)
- Glass effect header
- Dropdown "Plus"
- Navigation active / overflow

⚠️ Toute modif header ou menu doit se faire ici.

---

### Thèmes & surfaces

📍 Fichier :

Contient :

- `canvasVar` (CSS vars)
- `surfaceBg`, `surfaceBorder`
- `isDark`
- Accents (gradients)

Les composants **consomment**, ils ne décident pas.

---

### Surfaces (cards, blocs)

📍 Composant :

Règle :

- Une surface = même logique partout
- Pas de couleur hardcodée dans les sections

////////////////////Note de V21:///////////////////////////////////////////////

# Architecture générale

Ce document décrit les règles structurelles et les choix techniques du projet.

---

## Scroll-spy du header (navigation active)

### Problème rencontré

Dans Next.js (App Router), l’utilisation de `document.body.offsetHeight` pour détecter le bas de page est **non fiable**. Selon le layout, `offsetHeight` peut être proche de la hauteur du viewport, ce qui déclenche un faux _"bas de page"_ en permanence.

Effet observé :

- le lien **Contact** devient actif trop tôt
- la navigation semble "figée" et ne réagit plus au scroll

### Règle à respecter

👉 **Toujours utiliser `scrollHeight` (documentElement + body) pour détecter le bas de page.**

### Implémentation correcte

```ts
const scrollH = Math.max(
  document.documentElement.scrollHeight,
  document.body.scrollHeight
);

const atBottom = window.innerHeight + window.scrollY >= scrollH - 4;
```

### Logique du scroll-spy

- On parcourt les sections visibles (`getBoundingClientRect().top`)
- On sélectionne la **dernière section passée sous le header**
- **Exception** : si on est réellement tout en bas → forcer `#contact`

```ts
if (atBottom && linksAll.some((l) => l.href === "#contact")) {
  setActiveHrefLocal("#contact");
} else {
  setActiveHrefLocal(best?.href ?? "#top");
}
```

### Bonnes pratiques

- Le `href` du menu **doit correspondre exactement** à l’`id` DOM
- Ne jamais dupliquer les `id` dans les sections
- Le scroll-spy doit être :

  - local au header
  - indépendant du router
  - robuste au resize

### Pourquoi c’est important

Ce comportement garantit :

- une navigation fiable
- un underline toujours cohérent
- un comportement stable même avec des layouts complexes (header fixe, glass, canvas)

> ⚠️ Si un jour le scroll se fait dans un container (et non `window`), le scroll-spy devra écouter ce container explicitement.
