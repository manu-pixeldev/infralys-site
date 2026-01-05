# ROADMAP — infralys-site

Ce document décrit la trajectoire du projet :  
technique, produit et business (SaaS).

Il sert de **boussole** : ce qui est fait, ce qui est figé, ce qui arrive.

---

## 🟢 ÉTAT ACTUEL (V19 / V21)

### Ce qui est STABLE

- Template Engine fonctionnel et déterministe
- Header scroll-spy fiable (bas de page corrigé)
- Navigation avec :
  - ids DOM uniques
  - underline stable
  - overflow menu (“Plus”) auto-fit
- Système de thèmes :
  - tokens
  - canvas CSS vars
  - surfaces unifiées
- Sections legacy solides :
  - Header
  - Hero
  - Split
  - Services
  - Team
  - Galleries
  - Contact
- Studio Panel opérationnel (édition live)
- Docs structurées (architecture, refs, décisions)

➡️ **Le socle est prêt.**

---

## 🟡 PHASE 1 — CONSOLIDATION (court terme)

### 1. Harmonisation UI finale

- [ ] Ajuster le **legacy** (sans urgence)
- [ ] Finaliser :
  - shimmer FX (opt-in, fiable)
  - détachement subtil des cards selon thème
- [ ] Vérifier cohérence header / hero / sections sur tous les thèmes

🎯 Objectif : qualité visuelle “premium”.

---

### 2. Variants propres (pas des clones)

- [ ] Regénérer variants :
  - Header (A/B/C/D…)
  - Hero
  - Contact
- [ ] Variants = branches structurelles
- [ ] Zéro duplication de fichier

🎯 Objectif : extensibilité sans dette.

---

### 3. Renommage via Studio

- [ ] `navLabel` éditable par section
- [ ] `title` synchronisé optionnellement
- [ ] Ordre des sections maîtrisé
- [ ] Visibilité section (enabled)

🎯 Objectif : autonomie utilisateur.

---

## 🟠 PHASE 2 — MULTI-PAGES (fondation SaaS)

### 4. Architecture multi-pages

Principe :

- 1 page = 1 config
- Chaque page a :
  - sections
  - theme
  - options

À implémenter :

- [ ] routing multi-pages
- [ ] header partagé ou spécifique
- [ ] navigation inter-pages

🎯 Objectif : sites complets, pas juste landing.

---

### 5. Pages “optimisées” (sans sections)

- Templates figés :
  - landing SEO
  - page produit
  - page conversion
- Pas de sections dynamiques
- Rendu ultra contrôlé

🎯 Objectif : performance + SEO + ventes.

---

## 🔵 PHASE 3 — STUDIO → PRODUIT

### 6. Export / Import de config

- [ ] Export JSON propre
- [ ] Import JSON
- [ ] Validation schema
- [ ] Versionning de config

🎯 Objectif : portabilité + SaaS.

---

### 7. Presets & familles

- [ ] Presets de thèmes
- [ ] Presets de pages
- [ ] Familles :
  - artisan
  - industrie
  - SaaS
  - consultant
  - créatif

🎯 Objectif : onboarding rapide.

---

## 🔴 PHASE 4 — SAAS & ARGENT 💰

### 8. Modèle SaaS (projection)

Fonctionnalités monétisables :

- Templates premium
- Thèmes premium
- Export prod
- Multi-sites
- White-label
- Hébergement managé

Pricing possible :

- Free (preview / demo)
- Pro (1–3 sites)
- Agency (multi-clients)

🎯 Objectif : machine à cash propre.

---

## 🧠 RÈGLES D’OR (à ne jamais casser)

- Le moteur ne décide pas du design
- Le legacy reste la UI stable
- Variants ≠ clones
- IDs DOM toujours uniques
- Rendu déterministe
- Studio = UI, pas logique métier
- Toute décision structurante → `DECISIONS.md`

---

## 🏁 Vision finale

> Un **éditeur de sites ultra-pro**,  
> modulaire, élégant, extensible,  
> qui peut devenir un **SaaS rentable** sans dette technique.

---

Dernière mise à jour : V21  
À relire avant chaque refactor majeur.
