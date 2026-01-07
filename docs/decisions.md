DECISIONS — infralys-site

Ce document centralise les décisions techniques et architecturales importantes du projet.
Il sert de mémoire long terme : pourquoi quelque chose a été fait ainsi, et ce qui ne doit pas être cassé.

ADR-001 — Utilisation d’un moteur de templates interne

Statut : accepté
Date : V1

Contexte

Le projet vise à générer des pages marketing :

modulaires

personnalisables

réutilisables pour plusieurs clients

évolutives vers un modèle SaaS

Les solutions classiques (CMS headless, builders externes) apportent :

trop de complexité

peu de contrôle UI

une dette produit à long terme

Décision

Créer un Template Engine interne basé sur :

React / Next.js

sections configurables

variantes structurées (A, B, C…)

thèmes par tokens

Conséquences

✅ Contrôle total du rendu
✅ Performance maximale
✅ UX studio intégrée
⚠️ Plus de code à maintenir → compensé par une architecture stricte

ADR-002 — Séparation stricte : TemplateEngine / Legacy / Theme

Statut : accepté
Date : V18

Décision

Séparer le système en trois couches distinctes :

TemplateEngine

orchestration

état global

mapping sections / variants

Legacy

composants UI stables

aucune logique globale

aucune mutation de config

Theme

tokens visuels

surfaces

canvas CSS vars

Règle

Les composants consomment le thème, ils ne le décident jamais.

Conséquences

✅ Refactor UI sans casser la logique
✅ Ajout de thèmes sans toucher aux sections
⚠️ Discipline stricte requise (pas de couleur hardcodée)

ADR-003 — Thèmes basés sur CSS Variables (canvas)

Statut : accepté
Date : V18

Décision

Utiliser des CSS variables globales (canvasVar) pour :

header

surfaces

menus

overlays

Variables typiques :

--te-canvas

--te-surface

--te-surface-2

--te-surface-border

Raisons

compatibilité glass / blur

héritage automatique (portals, dropdowns)

animation fluide au scroll

Conséquences

✅ Glass effects cohérents
✅ Header + dropdown toujours synchronisés
⚠️ Nécessite une propagation globale (document.documentElement)

ADR-004 — Scroll-spy local au Header (et non global)

Statut : accepté
Date : V21

Problème rencontré

Les scroll-spy basés sur :

router Next

hash uniquement

offsetHeight

sont instables avec :

header fixe

glass

layouts complexes

Décision

Implémenter un scroll-spy local au Header, basé sur :

positions réelles des sections

scrollHeight pour le bas de page

logique “dernière section atteinte”

const scrollH = Math.max(
document.documentElement.scrollHeight,
document.body.scrollHeight
);

Conséquences

✅ Navigation fiable jusqu’en bas
✅ Underline toujours cohérent
⚠️ Si scroll container ≠ window → adaptation nécessaire

ADR-005 — IDs DOM uniques pour sections répétées

Statut : accepté
Date : V19

Problème

Plusieurs sections peuvent partager le même sectionId (split, gallery, etc.).

Décision

Générer des IDs DOM uniques :

split

split-2

split-3

…

via un compteur global reset à chaque page.

Conséquences

✅ Navigation fiable
✅ Scroll-spy précis
⚠️ Interdit d’utiliser un id statique sans le helper

ADR-006 — Pas de duplication de composants (variants ≠ clones)

Statut : accepté
Date : V20

Décision

Les variantes (Header A/B/C, Hero A/B…) doivent être :

structurelles

paramétriques

❌ Pas de copier-coller de composants
❌ Pas de fichiers dupliqués

Règle

Une variante = une branche de rendu, pas un nouveau composant.

Conséquences

✅ Maintenance maîtrisée
✅ Ajout de variantes sans explosion du code
⚠️ Complexité locale plus élevée (acceptable)

ADR-007 — Studio Panel comme UI, jamais comme moteur

Statut : accepté
Date : V18

Décision

Le Studio Panel :

modifie la config

déclenche des re-renders

n’a aucune logique métier

Règle

Le studio ne décide rien, il pilote.

Conséquences

✅ Séparation claire UI / moteur
✅ Studio remplaçable plus tard (SaaS, admin externe)

ADR-008 — Orientation SaaS (long terme)

Statut : accepté
Date : V21

Vision

Le projet doit pouvoir évoluer vers :

multi-clients

multi-pages

templates vendables

thèmes par famille

versions “optimisées” sans sections

Implications actuelles

pas de dépendance client dans le core

config sérialisable

rendu déterministe

Notes finales

Ce document doit être mis à jour :

à chaque décision structurante

à chaque refactor majeur

avant toute rupture d’API interne

Si une décision n’est pas documentée ici, elle est considérée comme non officielle.

## 2026-01 — Reveal stable (no shift) + direction-aware

- Problème : refresh en bas => sections en pending => "saut" + doubles lignes perçues.
- Solution : `html[data-reveal-lock="1"]` posé en `useLayoutEffect`, retiré après 2 RAF.
- Raison : évite shift sans introduire d’hydration mismatch (pas de data-\* SSR sur html).
- Bonus UX : reveal uniquement en scroll DOWN (scroll UP = stable direct).
