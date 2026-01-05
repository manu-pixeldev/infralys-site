# Ref — Studio Panel (Template Engine)

Objectif : documenter **le rôle exact du Studio Panel**, ses limites, et les règles à respecter pour éviter toute dérive (logique métier, rendu, effets de bord).

Le Studio Panel est une **UI d’édition**.  
Il ne doit **jamais devenir un moteur**.

---

## 1) Rôle du Studio Panel

Le Studio Panel permet :

- l’édition **live** de la config (`TemplateConfig`)
- le re-order des sections (drag & drop)
- l’activation / désactivation de sections
- le changement de variant (A / B / C…)
- l’édition d’options globales (theme, layout, nav…)

Il **ne fait pas** :

- le rendu des sections
- la logique de scroll
- la gestion des ids DOM
- la logique de navigation active
- la décision des couleurs ou surfaces

---

## 2) Positionnement dans l’architecture

📍 Fichier :  
`app/components/template-engine/studio-panel.tsx`

📌 Rendu via **portal** :

```tsx
ReactDOM.createPortal(<StudioPanel />, document.body);
```

Raison :

éviter les contraintes de z-index

ne pas dépendre du layout de la page

rester indépendant du DOM des sections

3. Flux de données
   3.1 Source de vérité

Le Studio Panel ne possède pas son propre état métier.

Il reçoit :

config (état courant)

setConfig (setter du moteur)

Schéma :

TemplateEngine
├─ liveConfig
├─ setLiveConfig
└─ StudioPanel(config, setConfig)

Toute action du studio :
→ produit une nouvelle config
→ transmise au moteur
→ rerender global

4. Mutations autorisées

Le Studio Panel peut modifier :

Sections

ordre (arrayMove)

enabled

variant

props spécifiques à une section (futur)

Options globales

theme / accent

canvas style

layout (density, container, radius)

navigation (maxDirectLinksInMenu)

FX flags (ambient, glow, shimmer…)

Brand / Content

logo mode / taille

titres / labels globaux

CTA labels

5. Mutations interdites (règle ABSOLUE)

🚫 Le Studio Panel ne doit jamais :

générer ou modifier des ids DOM

gérer le scroll ou l’active section

calculer activeHref

manipuler le DOM directement

modifier des CSS vars globales

accéder à window.scrollY

“corriger” des comportements du header

Toute tentative de ce type est un bug d’architecture.

6. Drag & Drop (sections)

Implémentation :

@dnd-kit

SortableContext

arrayMove

Règles :

seul l’ordre change

l’objet section reste identique

pas de recalcul d’id ici

onDragEnd(({ active, over }) => {
if (!over || active.id === over.id) return;
setConfig(cfg => ({
...cfg,
sections: arrayMove(cfg.sections, oldIndex, newIndex),
}));
});

7. Variants (A / B / C…)

Le Studio Panel :

liste les variants disponibles par type

ne connaît pas le contenu des variants

ne fait que changer section.variant

La résolution finale :
→ TemplateEngine
→ VARIANTS[type][variant]

8. État UI interne (autorisé)

Le Studio Panel peut avoir :

état d’UI (onglet ouvert, accordéon, focus)

état temporaire (dragging, hover)

filtres de listing

Mais :

aucun état ne doit survivre sans être reflété dans la config.

9. Studio ≠ Preview Engine

Le Studio Panel :

ne simule rien

n’interprète rien

ne corrige rien

Il modifie la config → le moteur décide.

10. Renommage des sections (à venir)
    Objectif

Permettre :

renommer un menu sans changer l’id

renommer une section sans casser le scroll

Décision prévue

ajouter navLabel sur la section

le header utilise :

label = navLabel ?? title ?? id

l’id reste stable et technique

11. Sauvegarde / SaaS (projection)

À terme, le Studio Panel servira à :

générer une config JSON exportable

stocker des presets

charger des templates par famille

éditer des pages multi-sections / multi-pages

➡️ Le panel est un éditeur de produit, pas un composant visuel.

12. Tests manuels avant commit

Checklist :

changer l’ordre des sections → rendu OK

activer/désactiver une section → menu + page cohérents

changer un variant → rendu correct

changer maxDirectLinksInMenu → overflow réagit

fermer le studio → aucun effet persistant non désiré

13. Anti-patterns à bannir

❌ “Fix rapide dans le studio”
❌ Accès direct au DOM
❌ Calcul d’id
❌ Condition métier liée au thème
❌ Logique de scroll

Résumé

Le Studio Panel est un éditeur déclaratif.
Le moteur est le seul interprète.
Le rendu est 100% déterministe.

Si cette règle est respectée, le système reste :

scalable

testable

monétisable (SaaS)
