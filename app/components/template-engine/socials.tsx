"use client";

import React from "react";

export type SocialKind =
  | "website"
  | "facebook"
  | "whatsapp"
  | "instagram"
  | "linkedin"
  | "youtube";

export type SocialDef = {
  label: string;
  hrefPrefix?: string; // ex: https://wa.me/
  Icon: React.FC<{ className?: string }>;
};

/** ✅ SAFE placeholder icons (tu remplaceras par des SVG plus tard) */
const Glyph = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={className}
    style={{
      display: "inline-flex",
      width: 18,
      height: 18,
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 800,
      lineHeight: 1,
    }}
    aria-hidden="true"
  >
    {children}
  </span>
);

const IconGlobe = (p: { className?: string }) => <Glyph {...p}>🌐</Glyph>;
const IconFacebook = (p: { className?: string }) => <Glyph {...p}>f</Glyph>;
const IconInstagram = (p: { className?: string }) => <Glyph {...p}>◎</Glyph>;
const IconLinkedIn = (p: { className?: string }) => <Glyph {...p}>in</Glyph>;
const IconWhatsApp = (p: { className?: string }) => <Glyph {...p}>wa</Glyph>;
const IconYouTube = (p: { className?: string }) => <Glyph {...p}>▶</Glyph>;

export const SOCIAL_DEFS: Record<SocialKind, SocialDef> = {
  website: { label: "Site", Icon: IconGlobe },
  facebook: { label: "Facebook", Icon: IconFacebook },
  instagram: { label: "Instagram", Icon: IconInstagram },
  linkedin: { label: "LinkedIn", Icon: IconLinkedIn },
  whatsapp: {
    label: "WhatsApp",
    hrefPrefix: "https://wa.me/",
    Icon: IconWhatsApp,
  },
  youtube: { label: "YouTube", Icon: IconYouTube },
};

export type SocialRecord = Partial<Record<SocialKind, string | null>>;

export type SocialConfig =
  | SocialRecord
  | {
      links?: SocialRecord;
      enabled?: Partial<Record<SocialKind, boolean>>;
      order?: SocialKind[];
    };

function normalizeUrl(kind: SocialKind, raw: string, def: SocialDef) {
  const v = String(raw || "").trim();
  if (!v) return "";

  if (
    /^(https?:)?\/\//i.test(v) ||
    v.startsWith("#") ||
    v.startsWith("mailto:") ||
    v.startsWith("tel:")
  )
    return v;

  if (kind === "whatsapp" && def.hrefPrefix) {
    const digits = v.replace(/[^\d]/g, "");
    return digits ? `${def.hrefPrefix}${digits}` : "";
  }

  return `https://${v}`;
}

function isNewShape(cfg: any): cfg is Exclude<SocialConfig, SocialRecord> {
  return (
    !!cfg &&
    typeof cfg === "object" &&
    ("links" in cfg || "enabled" in cfg || "order" in cfg)
  );
}

export function resolveSocialLinks(cfg?: SocialConfig) {
  const orderDefault = Object.keys(SOCIAL_DEFS) as SocialKind[];

  const links: SocialRecord = !cfg
    ? {}
    : isNewShape(cfg)
    ? cfg.links ?? {}
    : (cfg as SocialRecord);

  const enabled = isNewShape(cfg) ? cfg.enabled ?? {} : {};
  const order = (
    isNewShape(cfg) && cfg.order?.length ? cfg.order : orderDefault
  ) as SocialKind[];

  return order
    .filter((k) => enabled[k] !== false)
    .map((k) => {
      const def = SOCIAL_DEFS[k];
      const raw = links[k];
      const href = raw ? normalizeUrl(k, raw, def) : "";
      return href ? { kind: k, href, def } : null;
    })
    .filter(Boolean) as { kind: SocialKind; href: string; def: SocialDef }[];
}
