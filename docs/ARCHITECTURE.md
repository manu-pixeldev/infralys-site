Architecture — infralys-site

1. Vue d’ensemble

infralys-site est un projet Next.js (App Router) structuré autour d’un moteur de templates modulaire.

Objectifs clés :

Générer des pages marketing professionnelles à partir de sections configurables

Séparer strictement structure / thème / contenu

Préparer une évolution SaaS multi-clients / multipages

Architecture conceptuelle :

TemplateEngine
├─ Theme (tokens + canvas CSS vars)
├─ Sections (Header, Hero, Split, Services, …)
├─ Studio Panel (édition live)
└─ Legacy Variants (UI stable, réutilisable)

2. Dossiers clés
   app/components/template-engine/

Cœur du système de rendu.

Fichiers principaux :

template-engine.tsx
Orchestrateur :

normalise la config (liveConfig)

rend les sections dans l’ordre

injecte les props communes (theme, layout, scroll state, nav state)

monte le StudioPanel via portal

legacy.tsx
UI legacy stable :

Header

Hero

Sections (Split, Services, Team, Galleries, Contact)

Helpers visuels (Surface, Glass, Navigation)

theme.ts
Source de vérité visuelle :

tokens de couleur

surfaces

canvas CSS variables

accents (gradients)

isDark

variants.ts
Mapping type + variant → composant
👉 aucune logique métier ici, uniquement structure.

studio-panel.tsx
UI d’édition :

drag & drop sections

activation / désactivation

options globales (thème, layout, nav…)

3. Header — source de vérité

📍 Implémentation principale : legacy.tsx

Le Header est un composant critique :
toute la navigation, le scroll-spy et le glass effect y sont centralisés.

Responsabilités :

Détection du scroll (isScrolled, scrollT)

Glass / canvas header (opaque → translucide)

Navigation principale + overflow (“Plus”)

Gestion du lien actif (underline stable)

Calcul et exposition de --header-offset

⚠️ Règle absolue
Toute modification liée à :

navigation

underline

scroll

dropdown
👉 doit être faite ici, jamais dans les sections.

4. Thèmes & surfaces

📍 Fichier : theme.ts

Le thème définit, les composants consomment.

Contenu :

canvasVar → CSS variables globales (--te-canvas, --te-surface, …)

surfaceBg, surfaceBorder

isDark

accents (accentFrom, accentTo)

Règles :

❌ aucune couleur hardcodée dans les sections

✅ tout passe par les tokens du thème

✅ changement de thème = aucun refactor UI

5. Surfaces (cards, blocs)

📍 Composant : Surface (legacy)

Principe :

Une Surface = une carte visuelle cohérente partout

Même logique pour Hero, Split, Services, Contact, etc.

Règles :

même rayon

même gestion border / backdrop

aucune logique métier dans Surface

👉 garantit une harmonisation visuelle globale.

6. Navigation & scroll-spy (règle critique)
   Problème rencontré

Dans Next.js App Router, l’utilisation de :

document.body.offsetHeight

est non fiable pour détecter le bas de page.

Effets observés :

lien Contact activé trop tôt

navigation figée

underline incohérent

Règle obligatoire

👉 Toujours utiliser scrollHeight pour détecter le bas réel de la page.

Implémentation correcte :

const scrollH = Math.max(
document.documentElement.scrollHeight,
document.body.scrollHeight
);

const atBottom = window.innerHeight + window.scrollY >= scrollH - 4;

Logique du scroll-spy

On parcourt les sections du menu

On récupère leur position réelle dans la page

On sélectionne la dernière section passée sous le header

Exception : si on est réellement tout en bas → forcer #contact

if (atBottom && linksAll.some((l) => l.href === "#contact")) {
setActiveHrefLocal("#contact");
} else {
setActiveHrefLocal(best?.href ?? "#top");
}

Bonnes pratiques impératives

Le href du menu doit correspondre exactement à l’id DOM

Les id doivent être uniques (split, split-2, …)

Le scroll-spy doit être :

local au Header

indépendant du router Next

robuste au resize

stable avec un header fixe

⚠️ Si un jour le scroll se fait dans un container (et non window),
le scroll-spy devra écouter explicitement ce container.

7. Philosophie globale

TemplateEngine = orchestration

Legacy = UI stable et éprouvée

Theme = seule source visuelle

StudioPanel = contrôle, jamais logique de rendu

👉 Cette séparation permet :

évolution rapide

ajout de thèmes / variants

transformation en SaaS multi-clients sans refonte
