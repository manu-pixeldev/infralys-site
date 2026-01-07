/* ============================================================
   TEMPLATE CONFIG — V2040 (STABLE)
   - Ce fichier NE redéfinit PAS les types engine.
   - Source of truth des types: app/components/template-engine/types.ts
   ============================================================ */

import type { TemplateConfigInput } from "../components/template-engine/types";

/* =======================
   DOMAIN TYPES (OK ICI)
   ======================= */

export type GalleryStyle = "gridCards" | "masonry" | "carousel" | "split";

export type SocialKind =
  | "website"
  | "facebook"
  | "whatsapp"
  | "instagram"
  | "linkedin"
  | "youtube";

export type LogoMode = "logoOnly" | "logoPlusText" | "textOnly";

export type GalleryImage = {
  src: string;
  alt?: string;
  caption?: string;
};

export type Gallery = {
  id: string;
  title: string;
  description?: string;
  style: GalleryStyle;
  images: GalleryImage[];
};

export type Brand = {
  logo: {
    enabled?: boolean;
    src?: string;
    width?: number;
    height?: number;
    mode?: LogoMode;
  };
  text: {
    name: string | null;
    accent: string | null;
    subtitle: string | null;
  };
};

export type Content = {
  heroTitle: string;
  heroText: string;
  heroImage: string;
  heroBadges: string[];

  servicesTitle: string;
  servicesText: string;
  services: { title: string; items: string[] }[];

  proofTitle?: string;
  proofItems?: { label: string; value: string }[];

  teamTitle: string;
  teamText: string;
  teamCards: { title: string; text: string }[];

  contactTitle: string;
  contactText: string;
  contact: { address: string; phone: string; email: string };

  galleries: Gallery[];

  socials: Record<SocialKind, string | null>;

  cta?: {
    header?: string;
    heroPrimary?: string;
    heroSecondary?: string;
  };

  split?: {
    title?: string;
    text?: string;
    image?: string;
    imageAlt?: string;
    reverse?: boolean;
    ctaLabel?: string;
    ctaHref?: string;
  };

  // legacy mirror (compat)
  splitTitle?: string;
  splitText?: string;
  splitImage?: string;
  splitImageAlt?: string;
  splitCtaLabel?: string;
  splitCtaHref?: string;
};

/* =======================
   DEFAULTS (brand/content)
   ======================= */

export const DEFAULT_BRAND: Brand = {
  logo: {
    enabled: true,
    src: "/brand/template/logo-square.png",
    width: 80,
    height: 80,
    mode: "logoPlusText",
  },
  text: {
    name: "Le nom de la société",
    accent: null,
    subtitle: "Sous-titre et/ou slogan",
  },
};

export const DEFAULT_CONTENT: Content = {
  heroTitle: "Titre de la section HERO",
  heroText:
    "Une approche professionnelle orientée qualité, transparence et solutions durables, adaptée aux particuliers comme aux entreprises.",
  heroImage: "/images/template-base/P4.jpg",
  heroBadges: ["Approche personnalisée", "Travail soigné", "Réponse rapide"],

  servicesTitle: "Nos services",
  servicesText: "Des prestations claires et adaptées à vos besoins.",
  services: [
    {
      title: "Accompagnement",
      items: [
        "Analyse de la situation",
        "Conseils personnalisés",
        "Suivi clair",
      ],
    },
    {
      title: "Intervention",
      items: ["Mise en œuvre efficace", "Respect des délais", "Travail soigné"],
    },
    {
      title: "Optimisation",
      items: [
        "Amélioration continue",
        "Solutions adaptées",
        "Approche durable",
      ],
    },
  ],

  proofTitle: "Preuves",
  proofItems: [
    { label: "Interventions", value: "250+" },
    { label: "Clients satisfaits", value: "4.9/5" },
    { label: "Délai moyen", value: "< 24h" },
  ],

  teamTitle: "Qui sommes-nous",
  teamText:
    "PME familiale orientée qualité. Une équipe terrain, un suivi clair, des interventions propres.",
  teamCards: [
    { title: "L’équipe", text: "Une équipe terrain, réactive, soigneuse." },
    { title: "Nos valeurs", text: "Qualité, transparence, respect du client." },
    { title: "Notre promesse", text: "Un résultat propre, durable, expliqué." },
  ],

  contactTitle: "Contact",
  contactText:
    "Expliquez votre besoin en 2 lignes, nous vous répondrons rapidement.",
  contact: {
    address: "Adresse — Ville",
    phone: "+32 400 00 00 00",
    email: "contact@exemple.be",
  },

  socials: {
    website: "https://exemple.be",
    facebook: null,
    whatsapp: null,
    instagram: null,
    linkedin: null,
    youtube: null,
  },

  galleries: [
    {
      id: "realisations",
      title: "Galeries",
      description: "Quelques exemples de projets.",
      style: "gridCards",
      images: [
        { src: "/images/template-base/P1.jpg", caption: "" },
        { src: "/images/template-base/P2.jpg", caption: "" },
        { src: "/images/template-base/P3.jpg", caption: "" },
        { src: "/images/template-base/P4.jpg", caption: "" },
        { src: "/images/template-base/P5.jpg", caption: "" },
        { src: "/images/template-base/P6.jpg", caption: "" },
      ],
    },
  ],

  cta: {
    header: "Contact",
    heroPrimary: "Me contacter",
    heroSecondary: "Voir nos services",
  },

  split: {
    title: "Une approche simple, pro, efficace.",
    text: "Diagnostic clair, intervention propre, et un résultat durable — avec des explications compréhensibles.",
    image: "/images/template-base/P2.jpg",
    imageAlt: "Illustration",
    reverse: false,
    ctaLabel: "Me contacter",
    ctaHref: "#contact",
  },

  // legacy mirror (compat)
  splitTitle: "Une approche simple, pro, efficace.",
  splitText:
    "Diagnostic clair, intervention propre, et un résultat durable — avec des explications compréhensibles.",
  splitImage: "/images/template-base/P2.jpg",
  splitImageAlt: "Illustration",
  splitCtaLabel: "Me contacter",
  splitCtaHref: "#contact",
};

/* =========================
   TEMPLATE CONFIG (ENGINE)
   ========================= */

export const templateConfig = {
  brand: DEFAULT_BRAND,
  content: DEFAULT_CONTENT,

  options: {
    themeVariant: "amberOrange|classic",
    canvasStyle: "classic",

    layout: {
      container: "7xl",
      density: "normal", // si ton type n'accepte pas: essaie "comfortable" ou "compact"
      radius: 24,
    },

    // menu
    maxDirectLinksInMenu: 4,
    nav: {
      maxDirectLinksInMenu: 4,
    },

    // FX / Studio (noms attendus côté engine v24)
    fx: {
      enabled: true,
      ambient: true,
      softGlow: true,
      borderScan: true,
      shimmerCta: false,
    },
    studio: {
      enabled: true,
      allowRandomize: true,
      ui: { dock: "right", minimized: false },
    },
  },

  sections: [
    {
      id: "header",
      type: "header",
      title: "Header",
      variant: "A",
      enabled: true,
      lock: true,
    },
    {
      id: "hero",
      type: "hero",
      title: "Accueil",
      variant: "A",
      enabled: true,
      lock: true,
    },

    {
      id: "split-1",
      type: "split",
      title: "Approche",
      variant: "A",
      enabled: true,
    },
    {
      id: "proof",
      type: "proof",
      title: "Preuves",
      variant: "A",
      enabled: true,
    },
    {
      id: "split-2",
      type: "split",
      title: "Méthode",
      variant: "A",
      enabled: true,
    },

    {
      id: "services",
      type: "services",
      title: "Services",
      variant: "A",
      enabled: true,
    },
    { id: "team", type: "team", title: "Équipe", variant: "A", enabled: true },

    // IMPORTANT: id = "realisations" => utilisé par gallery + nav anchor
    {
      id: "realisations",
      type: "gallery",
      title: "Réalisations",
      variant: "A",
      enabled: true,
    },

    {
      id: "contact",
      type: "contact",
      title: "Contact",
      variant: "AUTO",
      enabled: true,
      lock: true,
    },
  ] as const,
} satisfies TemplateConfigInput;
