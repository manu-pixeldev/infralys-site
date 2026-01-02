"use client";

import React from "react";

export type SocialKind =
  | "website"
  | "facebook"
  | "whatsapp"
  | "instagram"
  | "linkedin"
  | "youtube"
  | "tiktok";

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
const IconTikTok = (p: { className?: string }) => <Glyph {...p}>♪</Glyph>;

export const SOCIAL_DEFS: Record<SocialKind, SocialDef> = {
  website: { label: "Site", Icon: IconGlobe },
  facebook: { label: "Facebook", Icon: IconFacebook },
  instagram: { label: "Instagram", Icon: IconInstagram },
  linkedin: { label: "LinkedIn", Icon: IconLinkedIn },
  youtube: { label: "YouTube", Icon: IconYouTube },
  whatsapp: {
    label: "WhatsApp",
    hrefPrefix: "https://wa.me/",
    Icon: IconWhatsApp,
  },
  tiktok: { label: "TikTok", Icon: IconTikTok },
};

export type SocialRecord = Partial<Record<SocialKind, string | null>>;

export type SocialConfig =
  | SocialRecord
  | {
      links?: SocialRecord;
      enabled?: Partial<Record<SocialKind, boolean>>;
      order?: SocialKind[];
    };

const ORDER_DEFAULT: SocialKind[] = [
  "website",
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
  "whatsapp",
  "tiktok",
];

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

/** ✅ Tolérance legacy (si ton localStorage a encore des anciennes clés) */
function coerceLegacyLinks(rawLinks: any): SocialRecord {
  const links: any = { ...(rawLinks ?? {}) };

  // legacy: site/url/web -> website
  if (!links.website) {
    links.website = links.site || links.url || links.web || links.www || null;
  }

  // legacy: "wa" -> whatsapp
  if (!links.whatsapp) {
    links.whatsapp = links.wa || null;
  }

  return links as SocialRecord;
}

export function resolveSocialLinks(cfg?: SocialConfig) {
  const links: SocialRecord = !cfg
    ? {}
    : isNewShape(cfg)
    ? coerceLegacyLinks(cfg.links ?? {})
    : coerceLegacyLinks(cfg as SocialRecord);

  const enabled = isNewShape(cfg) ? cfg.enabled ?? {} : {};
  const order = (
    isNewShape(cfg) && cfg.order?.length ? cfg.order : ORDER_DEFAULT
  ) as SocialKind[];

  return order
    .filter((k) => enabled[k] !== false)
    .map((k) => {
      const def = SOCIAL_DEFS[k];
      const raw = (links as any)[k];
      const href = raw ? normalizeUrl(k, raw, def) : "";
      return href ? { kind: k, href, def } : null;
    })
    .filter(Boolean) as { kind: SocialKind; href: string; def: SocialDef }[];
}
