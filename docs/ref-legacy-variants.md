# Ref — Template Engine (infralys-site)

Objectif : documenter **la source de vérité** du moteur (rendu, config, variants, scroll, ids, studio).  
Ce doc doit permettre de reprendre le projet sans contexte et d’éviter les régressions.

---

## 1) Rôle du Template Engine

Le Template Engine est le **runtime** qui transforme une `config` (brand/content/sections/options/theme) en page rendue.

Il gère :

- l’orchestration des sections
- le mapping `type + variant -> Component`
- la propagation des props globales (theme, content, layout, activeHref, etc.)
- la cohérence des `id` DOM utilisés par la navigation
- l’intégration du Studio Panel (édition live)
- les “FX” globaux (lightbox, scroll state…)

Il **ne doit pas** :

- décider du design (c’est `theme.ts`)
- dupliquer des composants (c’est `legacy.tsx` + `variants.ts`)
- contenir des règles clients (c’est `app/clients/*`)

---

## 2) Fichiers et responsabilités

### `app/components/template-engine/template-engine.tsx`

**Orchestrateur principal**

- charge la config (ou reçoit `liveConfig`)
- rend les sections dans l’ordre
- gère l’état global (scroll, lightbox, studio open)
- passe `activeHref` aux sections
- garantit que `maxDirectLinksInMenu` et options nav sont correctement propagées

### `app/components/template-engine/variants.ts`

**Registry**

- dictionnaire `VARIANTS[type][variant] -> Component`
- **source de vérité** pour savoir ce qui est rendu pour chaque section

### `app/components/template-engine/legacy.tsx`

**Pack UI stable**

- implémente : Header/Hero/Split/Services/Team/Galleries/Contact
- intègre surfaces, glass, dropdown, scroll-spy header
- ne doit pas contenir de logique de mapping sections/variants (c’est le moteur)

### `app/components/template-engine/theme.ts`

**Tokens**

- `isDark`
- accents (gradients)
- surfaces (`surfaceBg`, `surfaceBorder`)
- canvas CSS vars (`canvasVar`)

### `app/components/template-engine/studio-panel.tsx`

**UI d’édition**

- modifie la config (live)
- ne fait pas de logique métier de rendu

---

## 3) Flux de données (runtime)

### 3.1 Source de config

Le moteur part d’une config globale (ex `liveConfig`):

- `brand`
- `content`
- `sections[]`
- `options` (layout/nav/etc.)
- theme sélectionné + tokens

Règle :

> Le rendu doit être déterministe : même config => même page.

### 3.2 Boucle de rendu des sections

Pseudo-flow :

1. Filtrer sections `enabled !== false`
2. Résoudre le variant de section (`resolveSectionVariant`)
3. Résoudre le composant via `VARIANTS[type][variant]`
4. Rendre `<section id=...><Comp ... /></section>`
5. Wrap éventuel (decorators, spacing, etc.)

**Important** :

- la valeur de `href` dans le header doit pointer vers un **id DOM réel** rendu ici.

---

## 4) Ids DOM, navigation et duplication “split/split/split”

### Problème

Plusieurs sections peuvent partager le même `sectionId` (“split” répété).  
HTML interdit les ids dupliqués → la navigation “saute” ou devient imprévisible.

### Décision

**IDs DOM uniques** : `split`, `split-2`, `split-3`, etc.

**Principe** : l’ID DOM utilisé pour `<section id="...">` doit matcher l’`href` du menu.

### Où se fait quoi (important)

- Le header construit des liens `href` basés sur des ids uniques.
- Le rendu des sections doit **poser les mêmes ids uniques**.

#### Règle d’or

> Si tu rends `<section id={String(s.id)}>` alors la nav unique ne marchera jamais avec des sections répétées.

---

## 5) ActiveHref : conventions

- `activeHref` = la “section active” (ex `#split-2`)
- `#top` = Accueil (scroll top)
- Le moteur ne doit pas “remapper” `activeHref` de manière opaque.
- Le header peut implémenter un scroll-spy local fiable.

**Règle**

> `activeHref` doit être un hash DOM réel ou `#top`.

---

## 6) Header : responsabilités (contrat)

Le header fait :

- calcul `--header-h` + `--header-offset` (scroll-padding)
- glass style + dropdown style basé sur `canvasVar`
- scroll-spy local (robuste jusqu’en bas)
- overflow menu “Plus” (maxDirectLinks / auto-fit)

Le header ne fait pas :

- mapping sections->variants
- config studio
- logique client

---

## 7) Options Nav : `maxDirectLinksInMenu`

Contrat :

- `maxDirectLinksInMenu` peut venir de plusieurs sources (options/studio/content)
- le moteur doit transmettre une valeur finale cohérente au header

Règle :

> Toujours **caster en Number** + clamp entre 1..12 côté header.

---

## 8) Surfaces / Cards : contrat minimal

Les sections utilisent une abstraction “Surface” (card/bloc):

- border
- bg
- radius
- backdrop-blur
- variants de surface uniquement via tokens/canvas

Règle :

> Pas de couleur hardcodée dans les sections (sauf fallback neutre).

---

## 9) Studio Panel : contrat minimal

Le studio :

- édite la config (state)
- déclenche un rerender
- doit rester indépendant du rendu

Règle :

> “Studio = UI”, pas “Studio = logique”.

---

## 10) Tests manuels à faire avant commit

Checklist rapide :

1. Page avec 3 splits : les 3 liens menu scrollent vers le bon bloc
2. Underline actif stable en scroll (pas de “Contact” trop tôt)
3. Overflow menu : si beaucoup de sections, “Plus” fonctionne
4. Resize : header recalcul `--header-offset`
5. Theme switch : canvas + surfaces restent cohérents
6. Aucun `id` dupliqué dans le DOM

---

## 11) Conventions de nommage

- `sectionId` = id logique (config)
- `domId` = id rendu (unique)
- `href` = `#${domId}`

Règle :

> Toujours distinguer `sectionId` (config) et `domId` (DOM).

---

## 12) TODO / évolutions prévues

- Multi-pages : une page = config + sections + theme
- Renommer sections depuis studio (navLabel/title)
- Variants supplémentaires (pas clones)
- “Optimized pages” sans sections (templates figés)
- Export/import de config (JSON) pour SaaS

---

## Glossaire

- **Canvas** : set de CSS vars globales qui pilotent surfaces et glass
- **Surface** : composant card uniforme (bg/border/radius)
- **Variant** : branche structurelle (A/B/C), pas un clone de fichier
- **Scroll-spy** : logique “active section” basée sur le scroll réel
