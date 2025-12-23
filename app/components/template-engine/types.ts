import type {
  TemplateConfig as BaseTemplateConfig,
  Section,
  SectionType,
  LayoutTokens,
  EngineOptions as BaseEngineOptions,
} from "../../template-base/template.config";

/* =========================
   FX / STUDIO
   ========================= */

export type EngineFx = {
  enabled: boolean;
  ambient: boolean;
  softGlow: boolean;
  borderScan: boolean;
  shimmerCta?: boolean;
};

export type StudioOptions = {
  enabled: boolean;
  allowRandomize?: boolean;
};

/* =========================
   ENGINE OPTIONS
   ========================= */

export type EngineOptions = Omit<BaseEngineOptions, "fx" | "studio"> & {
  fx: EngineFx;
  studio?: StudioOptions;
};

/* =========================
   CONTENT (ENGINE-SIDE)
   ========================= */

export type TemplateContent = {
  /** CTA header (override) */
  ctaLabel?: string;

  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };

  heroTitle?: string;
  heroText?: string;
  heroImage?: string;

  servicesTitle?: string;
  servicesText?: string;
  services?: Array<{
    title?: string;
    items?: string[];
  }>;

  teamTitle?: string;
  teamText?: string;
  teamCards?: Array<{
    title?: string;
    text?: string;
  }>;

  galleries?: Array<{
    id: string;
    title: string;
    description?: string;
    images: Array<{
      src: string;
      alt?: string;
      caption?: string;
    }>;
  }>;

  /** 🔮 FUTUR : blocs libres (split, texte, image…) */
  blocks?: unknown[];

  socials?: Record<string, string>;

  /** fallback volontaire */
  [key: string]: unknown;
};

/* =========================
   TEMPLATE CONFIG (ENGINE)
   ========================= */

export type TemplateConfig = Omit<BaseTemplateConfig, "options" | "content"> & {
  options: EngineOptions;
  content: TemplateContent;
};

export type { Section, SectionType, LayoutTokens };
