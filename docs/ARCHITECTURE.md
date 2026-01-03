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
