/* ============================================================
   TEMPLATE CONFIG — V2040 (STABLE) + SPLIT + CTA + LOGO MODE
   + GLOBAL LAYOUT (container/density/radius) ✅
   + PROOF (stats) ✅
   ============================================================ */

export type GalleryStyle = "gridCards" | "masonry" | "carousel" | "split";
export type HeroVariant = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
export type HeaderVariant =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K";
export type ContactVariant = "AUTO" | "A" | "B" | "C" | "D" | "E";
export type ServicesVariant = "A" | "B" | "C" | "D" | "E";
export type TeamVariant = "A" | "B" | "C";
export type GalleryLayout = "stack" | "twoCol" | "threeCol";
export type SplitVariant = "A" | "B";

/** ✅ PROOF */
export type ProofVariant = "stats";

export type ThemeVariant =
  | "blueRed"
  | "purplePink"
  | "emeraldTeal"
  | "amberOrange"
  | "slateIndigo"
  | "monoDark"
  | "warm"
  | "cool"
  | "forest"
  | "sunset";

export type SocialKind = "website" | "facebook" | "whatsapp" | "instagram" | "linkedin";

/** ✅ MANUEL : modes d'affichage du bloc "brand" */
export type LogoMode = "logoOnly" | "logoPlusText" | "textOnly";

/* =======================
   CONTENT STRUCTURES
   ======================= */

export type GalleryImage = {
  src: string;
  alt?: string;
  caption?: string;
};

export type Gallery = {
  id: string; // ✅ anchor id (ex: "realisations")
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

  /** ✅ PROOF (une seule fois) */
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

  // legacy mirror (facultatif)
  splitTitle?: string;
  splitText?: string;
  splitImage?: string;
  splitImageAlt?: string;
  splitCtaLabel?: string;
  splitCtaHref?: string;
};

/* =======================
   OPTIONS (legacy defaults)
   ======================= */

export type Options = {
  enableLightbox: boolean;

  heroVariant: HeroVariant;
  headerVariant: HeaderVariant;
  contactVariant: ContactVariant;

  servicesVariant: ServicesVariant;
  teamVariant: TeamVariant;

  galleryLayout: GalleryLayout;

  showHeroBadges: boolean;
  showTeamSection: boolean;

  maxDirectLinksInMenu: number;

  fx: {
    enabled: boolean;
    softGlow: boolean;
    borderScan: boolean;
    ambient: boolean;
  };

  demoPanel: {
    enabled: boolean;
    allowRandomize: boolean;
  };
};

export const DEFAULT_OPTIONS: Options = {
  enableLightbox: true,

  heroVariant: "B",
  headerVariant: "D",
  contactVariant: "AUTO",

  servicesVariant: "C",
  teamVariant: "A",

  galleryLayout: "twoCol",

  showHeroBadges: false,
  showTeamSection: true,

  maxDirectLinksInMenu: 4,

  fx: {
    enabled: true,
    softGlow: true,
    borderScan: true,
    ambient: true,
  },

  demoPanel: {
    enabled: true,
    allowRandomize: true,
  },
};

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
      items: ["Analyse de la situation", "Conseils personnalisés", "Suivi clair"],
    },
    {
      title: "Intervention",
      items: ["Mise en œuvre efficace", "Respect des délais", "Travail soigné"],
    },
    {
      title: "Optimisation",
      items: ["Amélioration continue", "Solutions adaptées", "Approche durable"],
    },
  ],

  teamTitle: "Qui sommes-nous",
  teamText: "PME familiale orientée qualité. Une équipe terrain, un suivi clair, des interventions propres.",
  teamCards: [
    { title: "L’équipe", text: "Une équipe terrain, réactive, soigneuse." },
    { title: "Nos valeurs", text: "Qualité, transparence, respect du client." },
    { title: "Notre promesse", text: "Un résultat propre, durable, expliqué." },
  ],

  contactTitle: "Contact",
  contactText: "Expliquez votre besoin en 2 lignes, nous vous répondrons rapidement.",
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

  /** ✅ PROOF */
  proofTitle: "Preuves",
  proofItems: [
    { label: "Interventions", value: "250+" },
    { label: "Clients satisfaits", value: "4.9/5" },
    { label: "Délai moyen", value: "< 24h" },
  ],

  split: {
    title: "Une approche simple, pro, efficace.",
    text: "Diagnostic clair, intervention propre, et un résultat durable — avec des explications compréhensibles.",
    image: "/images/template-base/P2.jpg",
    imageAlt: "Illustration",
    reverse: false,
    ctaLabel: "Me contacter",
    ctaHref: "#contact",
  },

  // legacy mirror (ok)
  splitTitle: "Une approche simple, pro, efficace.",
  splitText: "Diagnostic clair, intervention propre, et un résultat durable — avec des explications compréhensibles.",
  splitImage: "/images/template-base/P2.jpg",
  splitImageAlt: "Illustration",
  splitCtaLabel: "Me contacter",
  splitCtaHref: "#contact",
};

/* =======================
   ENGINE TYPES
   ======================= */

export type Density = "compact" | "normal" | "spacious";
export type Radius = 16 | 24 | 32;
export type Container = "5xl" | "6xl" | "7xl" | "full";

export type LayoutTokens = {
  density?: Density;
  radius?: Radius;
  paddingY?: number;
  container?: Container;
  gap?: number;
  gridCols?: 1 | 2 | 3 | 4;
};

// ✅ NEW: top anchor section type
export type SectionType =
  | "top"
  | "header"
  | "hero"
  | "proof"
  | "split"
  | "services"
  | "team"
  | "gallery"
  | "contact"
  | "text"
  | "pricing"
  | "faq"
  | "links";

export type SectionVariantByType = {
  // ✅ top = dummy variant, unused
  top: "A";

  header: HeaderVariant;
  hero: HeroVariant;
  proof: ProofVariant;
  split: SplitVariant;
  services: ServicesVariant;
  team: TeamVariant;
  gallery: GalleryLayout;
  contact: ContactVariant;

  text: string;
  pricing: string;
  faq: string;
  links: string;
};

export type Section<T extends SectionType = SectionType> = {
  id: string;
  type: T;
  title?: string;

  /** IMPORTANT: variant = par type */
  variant: SectionVariantByType[T];

  enabled?: boolean;
  lock?: boolean;
  layout?: LayoutTokens;
};

/** INPUT LOOSE (studio/patch) */
export type SectionInput = {
  id: string;
  type: SectionType;

  title?: string;
  variant?: SectionVariantByType[SectionType] | string;

  enabled?: boolean;
  lock?: boolean;
  layout?: LayoutTokens;

  [k: string]: unknown;
};

export type EngineOptions = {
  themeVariant: ThemeVariant;
  enableLightbox?: boolean;
  layout?: LayoutTokens;

fx: Options["fx"] & { shimmerCta?: boolean };
studio: { enabled: boolean; allowRandomize: boolean };
maxDirectLinksInMenu: number;
};

export type TemplateConfig = {
  brand: Brand;
  content: Content;
  options: EngineOptions;
  sections: Section[];
};

export type TemplateConfigInput = {
  brand?: Partial<Brand>;
  content?: Partial<Content>;

  options?: Partial<EngineOptions> & {
    fx?: Partial<EngineOptions["fx"]>;
    studio?: Partial<EngineOptions["studio"]>;
  };

  sections?: SectionInput[];

  [k: string]: unknown;
};

export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  brand: DEFAULT_BRAND,
  content: DEFAULT_CONTENT,

  options: {
    themeVariant: "amberOrange",
    maxDirectLinksInMenu: DEFAULT_OPTIONS.maxDirectLinksInMenu,
    enableLightbox: DEFAULT_OPTIONS.enableLightbox,

    layout: {
      container: "7xl",
      density: "normal",
      radius: 24,
    },

    fx: { ...DEFAULT_OPTIONS.fx, shimmerCta: false },
    studio: {
      enabled: DEFAULT_OPTIONS.demoPanel.enabled,
      allowRandomize: DEFAULT_OPTIONS.demoPanel.allowRandomize,
    },
  },

  sections: [
    { id: "header", type: "header", title: "Header", variant: "D", enabled: true, lock: true },

    // ✅ plus de "top" section qui met du padding
    { id: "hero", type: "hero", title: "Accueil", variant: "B", enabled: true, lock: true },

    { id: "split-1", type: "split", title: "Approche", variant: "A", enabled: true },
    { id: "proof", type: "proof", title: "Preuves", variant: "stats", enabled: true },
    { id: "split-2", type: "split", title: "Méthode", variant: "B", enabled: true },

    { id: "services", type: "services", title: "Services", variant: "C", enabled: true },
    { id: "team", type: "team", title: "Équipe", variant: "A", enabled: true },
    { id: "realisations", type: "gallery", title: "Réalisations", variant: "twoCol", enabled: true },
    { id: "contact", type: "contact", title: "Contact", variant: "AUTO", enabled: true, lock: true },
  ],

};

/* =======================
   HELPERS
   ======================= */

export function captionOk(v?: string) {
  return !!(v && v.trim().length > 0);
}

export function hasText(v: string | null | undefined) {
  return !!(v && v.trim().length > 0);
}

export function resolveContactVariant(hero: HeroVariant): Exclude<ContactVariant, "AUTO"> {
  const dark = hero === "A" || hero === "B" || hero === "D" || hero === "E" || hero === "G" || hero === "H";
  return dark ? "B" : "A";
}
