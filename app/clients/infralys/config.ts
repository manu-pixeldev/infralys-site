import type { TemplateConfig } from "../../components/template-engine/types";

export const INFRALYS_CONFIG: TemplateConfig = {
  brand: {
    text: {
      name: "Infralys",
      accent: null, // ✅ pas imposé
      subtitle: "Support • Réseau • Maintenance",
    },
    logo: {
      enabled: true,
      src: "/brand/infralys.svg",
      width: 220,
      height: 80,
    },
  },

  options: {
    themeVariant: "amberOrange",
    maxDirectLinksInMenu: 5,
    fx: {
      enabled: true,
      softGlow: true,
      borderScan: true,
      ambient: true,
      shimmerCta: true, // ✅ si ton type l’accepte déjà
    },
    studio: {
      enabled: true,
      allowRandomize: true,
    },
  },

  sections: [
    { id: "header", type: "header", title: "Header", variant: "J", enabled: true },
    { id: "top", type: "hero", title: "Accueil", variant: "D", enabled: true },
    { id: "services", type: "services", title: "Services", variant: "E", enabled: true },
    { id: "team", type: "team", title: "Qui sommes-nous", variant: "A", enabled: true },
    { id: "realisations", type: "gallery", title: "Réalisations", variant: "twoCol", enabled: true },
    { id: "contact", type: "contact", title: "Contact", variant: "AUTO", enabled: true },

    // ✅ modules “sous le coude” (tu les activeras plus tard)
    { id: "intro-1", type: "text", title: "Intro", variant: "A", enabled: false },
    { id: "pricing", type: "pricing", title: "Tarifs", variant: "A", enabled: false },
    { id: "faq", type: "faq", title: "FAQ", variant: "A", enabled: false },
    { id: "links", type: "links", title: "Liens", variant: "A", enabled: false },
  ],

  content: {
    heroTitle: "Support IT rapide, clair, propre.",
    heroText:
      "Dépannage PC • Optimisation • Réseau • Installation — intervention à domicile ou à distance. Je t’explique ce que je fais, sans blabla.",
    heroImage: "/demos/template-base/hero.jpeg",
    heroBadges: ["Réponse rapide", "Résultat propre", "Transparence"],

    servicesTitle: "Services",
    servicesText: "Des solutions simples, efficaces, expliquées.",
    services: [
      { title: "Dépannage", items: ["PC lent / bugs", "Windows", "Virus / nettoyage"] },
      { title: "Optimisation", items: ["Démarrage", "Stabilité", "Performances"] },
      { title: "Réseau", items: ["Wi-Fi", "Imprimantes", "NAS / partages"] },
    ],

    teamTitle: "Qui suis-je ?",
    teamText:
      "Indépendant orienté qualité : diagnostic clair, solutions durables, et un PC qui repart nickel.",
    teamCards: [
      { title: "Approche", text: "On va droit au but : cause → solution → résultat." },
      { title: "Qualité", text: "Travail propre, réglages propres, explications claires." },
      // { title: "Suivi", text: "Je reste dispo après l’intervention si besoin." },
      // { title: "Exemple", text: "Je reste dispo après l’intervention si besoin." },
    ],

    contactTitle: "Contact",
    contactText: "Explique ton souci en 2 lignes et je te réponds rapidement.",
    contact: {
      address: "Région Ciney / Namur",
      phone: "+32 4xx xx xx xx",
      email: "infralys@outlook.com",
    },

    socials: {
      website: "https://infralys.be",
      facebook: null,
      whatsapp: null,
      instagram: null,
      linkedin: null,
    },

    galleries: [
      {
        id: "realisations",
        title: "Réalisations",
        description: "Quelques exemples (tu remplaceras par tes vraies photos).",
        style: "gridCards",
        images: [
          { src: "/demos/template-base/g1.jpeg", caption: "Intervention PC" },
          { src: "/demos/template-base/g2.jpeg", caption: "Optimisation" },
          { src: "/demos/template-base/g3.jpeg", caption: "Réseau / Wi-Fi" },
        ],
      },
    ],
  },
};
