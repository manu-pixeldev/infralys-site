ROADMAP — infralys-site

Ce document est la boussole absolue du projet.

Il définit :

la trajectoire technique

la trajectoire produit

la trajectoire business (SaaS)

👉 Tout ce qui n’est pas aligné avec ce document est secondaire, jetable ou parking-lot.

🧭 PRINCIPES FONDATEURS (non négociables)

Ce qui sert le 10M → on garde

Ce qui flatte l’ego mais ralentit → on jette

Ce qui peut attendre → parking lot

🟢 ÉTAT ACTUEL — SOCLE (V21)
✅ Ce qui est STABLE et VALIDÉ
Moteur (Template Engine)

Rendu déterministe

Zéro magie implicite

Séparation claire :

config

rendu

UI studio

Scroll-spy fiable (bas de page inclus)

Navigation robuste :

DOM ids uniques

underline stable

menu “Plus” auto-fit

FX system :

ambient

border-scan

shimmer CTA

activables indépendamment

Système de thème

Tokens clairs

Canvas via CSS vars

Surfaces cohérentes

Accent / canvas découplés

Variants upgrade-safe

Sections legacy (socle produit)

Header

Hero

Split

Services

Team

Galleries

Contact

Studio Panel (nouvelle génération)

Panel isolé (portal)

Scroll interne correct

Sections modulaires :

Theme

Brand

Layout

Nav + FX

Sections (reorder / enable)

Hooks dédiés par domaine

Update immutable, typed, upgrade-safe

Documentation

Docs structurées :

overview

architecture

décisions

ROADMAP comme source de vérité

➡️ Le socle est digne d’un produit pro.

🟡 PHASE 1 — CONSOLIDATION PRODUIT (court terme)

🎯 Objectif : qualité irréprochable, pas plus de features.

1. UI & polish premium

Harmoniser les espacements legacy

Finaliser FX :

shimmer propre (opt-in)

glow subtil

Vérifier cohérence visuelle :

header ↔ hero ↔ sections

tous thèmes

👉 Rien de nouveau, seulement du meilleur.

2. Variants propres (fondation long terme)

Variants = branches structurelles

Pas de duplication de fichiers

Header / Hero / Contact :

A / B / C / D…

Variants compatibles futur multi-pages

👉 Zéro dette, zéro bricolage.

3. Studio = autonomie totale

Renommage section (navLabel)

Synchronisation optionnelle title

Ordre des sections

Enable / disable

Preview instantanée

👉 L’utilisateur n’a jamais besoin de dev.

🟠 PHASE 2 — STRUCTURE DE SITE (fondation SaaS)

🎯 Objectif : sites complets, pas des landing pages.

4. Architecture multi-pages

1 page = 1 config

Chaque page possède :

sections

thème

options

Header :

partagé ou spécifique

Navigation inter-pages native

👉 Base indispensable pour agences & clients sérieux.

5. Pages “spéciales” (non modulaires)

Pages figées ultra-optimisées :

SEO

conversion

produit

Pas de sections dynamiques

Rendu contrôlé à 100%

👉 Performance, SEO, ventes.

🔵 PHASE 3 — STUDIO → PRODUIT

🎯 Objectif : outil vendable sans support humain.

6. Config portable

Export JSON

Import JSON

Validation schema

Versioning de config

👉 Le site devient un actif.

7. Presets & familles

Presets de thèmes

Presets de pages

Familles métier :

artisan

industrie

consultant

SaaS

créatif

👉 Onboarding rapide = conversion.

8. Maintenance intelligente (différenciation clé)

Détection de données “potentiellement obsolètes”

Warnings subtils, jamais intrusifs

Historique des changements

Mode “smart” opt-in

👉 Personne ne fait ça proprement aujourd’hui.

🔴 PHASE 4 — MONÉTISATION 💰

🎯 Objectif : revenus sans contact client.

Modèles possibles

Achat unique (site)

Options premium :

maintenance smart

presets avancés

export prod

Multi-sites

White-label (agences)

Hébergement managé (optionnel)

Pricing (indicatif)

Free → preview / demo

Pro → 1–3 sites

Agency → multi-clients

👉 Le produit se vend tout seul.

🧠 RÈGLES D’OR (gravées dans le marbre)

Le moteur ne décide jamais du design

Studio = UI, pas logique métier

Variants ≠ clones

IDs DOM toujours uniques

Rendu toujours déterministe

Legacy = socle stable

Toute décision structurante → DECISIONS.md

🏁 VISION FINALE

Un éditeur de sites ultra-pro,
modulaire, élégant, extensible,
pensé pour durer,
et devenir un SaaS rentable sans dette technique.

Dernière mise à jour : V21
À relire avant chaque refactor majeur.
