# Ref — Template Engine

Objectif : décrire **le moteur de rendu**, les responsabilités par fichier, et les règles “non négociables” (IDs, scroll, header, variants, themes).

Le Template Engine est le **runtime** : il lit une config, résout des composants, et rend une page **déterministe**.

---

## 1) Vue d’ensemble

📍 Dossier : `app/components/template-engine/`

Le système est composé de 3 couches :

1. **Config (data)**

- structure déclarative : sections + options + content + brand
- éditable via Studio Panel

2. **Resolver (moteur)**

- choisit quel composant afficher pour chaque section
- passe les props nécessaires
- orchestre wrappers / layout / fx

3. **UI (variants)**

- composants de sections (Header/Hero/Split/Services/…)
- consomment tokens & content
- ne décident pas de l’architecture

---

## 2) Source de vérité

### 2.1 Config

La config doit rester :

- sérialisable (JSON)
- stable (pas de fonctions)
- versionnable (migrations possibles)
- portable (SaaS + export/import)

Structure logique :

- `brand`
- `content`
- `options`
- `sections[]`

> Le moteur rend uniquement en fonction de cette config.

---

## 3) Fichiers clés

### `template-engine.tsx`

Rôle :

- composant racine d’orchestration
- charge la config “live”
- connecte StudioPanel
- rend chaque section via `VARIANTS`

Responsabilités :

- boucle `sections.map(...)`
- sélection variant :
  - `type` = `section.type`
  - `variant` = `resolveSectionVariant(section)`
  - `Comp` = `VARIANTS[type][variant]`
- props communes passées aux sections :
  - `theme`, `brand`, `content`, `sections`
  - `activeHref`, `isScrolled`, `scrollT`
  - `layout`, `options`, etc.
- wrap / container / fx

⚠️ Important :

- `key` doit être stable (id + variant ok)
- le moteur ne doit pas créer des IDs DOM différents de ceux utilisés en nav
- aucune logique “spécifique header” ici (sauf injection props)

---

### `legacy.tsx`

Rôle :

- implémentations “Legacy” des composants :
  - `LegacyHeader`
  - `LegacyHero`
  - `LegacySplit`
  - `LegacyServices`
  - `LegacyTeam`
  - `LegacyGalleries`
  - `LegacyContact`
- helpers UI (Surface, Wrap, SocialRow, OverflowMenu…)

⚠️ Règle :

- si on corrige un comportement global (header/nav/scroll/ids),
  on le fait **dans le header** (pas dans le moteur, pas dans le studio).

---

### `variants.ts`

Rôle :

- map `type -> variant -> component`
- unique point de résolution des variants

Ex :

- `VARIANTS.header.A = LegacyHeader`
- `VARIANTS.hero.A = LegacyHero`
- etc.

Règle :

- un variant doit être **une variation réelle**, pas un clone
- on évite “A copy / A2 / A3” sans intention UX claire

---

### `theme.ts`

Rôle :

- tokens / utilitaires de layout
- `resolveLayout`, `containerClass`, `radiusStyle`, etc.
- tokens de thème :
  - `isDark`
  - `accentFrom`, `accentTo`
  - `surfaceBg`, `surfaceBorder`
  - `canvasVar` (CSS vars)

Règle :

- les composants consomment le thème
- le thème ne dépend pas des composants

---

### `studio-panel.tsx`

Rôle :

- UI d’édition (voir ref dédiée)
- modifie la config, pas le runtime

---

### `socials.tsx`

Rôle :

- defs d’icônes + labels + mapping
- `resolveSocialLinks(cfg)` retourne une liste normalisée

---

## 4) Navigation / IDs DOM (règle CRITIQUE)

### 4.1 Golden rule

> Le `href` du menu doit correspondre EXACTEMENT à un `id` DOM unique.

Interdictions :

- ids dupliqués
- nav générée avec `#split-2` mais DOM en `id="split"`
- remapping “magique” côté activeHref

### 4.2 Sections répétées (split, split, split…)

Si des sections partagent le même `section.id`, on doit générer des DOM ids uniques :

- `split`
- `split-2`
- `split-3`

Mais attention :

- la génération doit être cohérente :
  - nav = DOM ids
- et reset “par page” en dev/hot reload

Décision actuelle :

- la nav peut générer des ids uniques via un compteur local `usedIds`
- le rendu DOM doit suivre la même règle (sinon “ça saute”)

➡️ Si on veut du “pro” long terme :

- imposer `section.id` unique dans la config (recommandé SaaS)
- OU stocker un champ stable `domId` dans la config (migration)

---

## 5) Header : scroll-spy local

Le header est responsable de :

- mesurer sa hauteur (`--header-h`, `--header-offset`)
- gérer l’active link (scroll-spy)
- gérer overflow menu
- gérer underline stable

Règle :

- l’active state ne dépend pas du router
- le scroll-spy utilise `scrollHeight` (pas `offsetHeight`)
- en bas de page, si `#contact` existe, on force `#contact`

---

## 6) Surfaces & cards (cohérence visuelle)

Le moteur ne hardcode pas les fonds.

Règle :

- une “Surface” (card) a une logique unique (border + background + blur)
- les sections doivent utiliser Surface / tokens
- pas de `bg-black/80` perdu dans un variant si le theme fournit déjà `canvasVar`

Objectif :

- thèmes plus lisibles (cards détachées du fond sans casser le glass)
- familles de thèmes (light, dark, neon, studio, obsidian…)

---

## 7) Shimmer / FX (à finaliser)

FX doivent être :

- activables globalement (`options.fx`)
- appliqués via wrappers CSS (pas du JS partout)
- compatibles avec canvasVar
- non invasifs (pas de layout shift)

Quand shimmer ne marche pas :

- vérifier CSS (keyframes importées ?)
- vérifier que l’élément a un background compatible (gradient + opacity)
- éviter que `backdrop-filter` masque l’effet

---

## 8) Renommage sections / menus (à venir)

Objectif :

- renommer un menu sans toucher l’id technique
- UX Studio Panel : “Label menu” editable

Décision prévue :

- `section.navLabel` (source de vérité menu)
- fallback :
  - `navLabel ?? title ?? id`

Important :

- changer un label ne doit jamais casser les ancres.

---

## 9) Multi-pages (future architecture)

Direction SaaS :

- une page = un document (config)
- chaque page peut avoir :
  - son thème
  - ses sections
  - ses réglages nav
- blog intégré (posts)
- composants “live” (âge en temps réel, etc.)

Le moteur doit rester :

- indépendant du contenu
- capable de rendre N pages
- compatible “export static” / SEO

---

## 10) Règles de dev / qualité

- Pas de logique métier dans les variants
- Pas de DOM manipulation hors header (mesure header OK)
- Keys React stables
- L’engine doit rester testable : config -> rendu déterministe

---

## 11) Check-list avant commit (Template Engine)

- scroll-spy header stable
- menu overflow stable selon `maxDirectLinksInMenu`
- ancres fiables (pas de “saut” split)
- underline aligné texte
- hot reload : ids reset / cohérents
- Studio Panel modifie config sans casser rendu
