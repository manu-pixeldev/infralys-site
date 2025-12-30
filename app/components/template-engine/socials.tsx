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
  /** optional prefix helper (ex: wa.me/) */
  hrefPrefix?: string;
  Icon: React.FC<{ className?: string }>;
};

/** ✅ SAFE placeholder icons (replace with your SVG components later) */
const Glyph = ({ children, className }: { children: React.ReactNode; className?: string }) => (
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
  whatsapp: { label: "WhatsApp", hrefPrefix: "https://wa.me/", Icon: IconWhatsApp },
  youtube: { label: "YouTube", Icon: IconYouTube },
};

export type SocialConfig = {
  /** URLs or handles. Ex: { facebook:"https://fb.com/...", whatsapp:"3247..." } */
  links?: Partial<Record<SocialKind, string>>;
  /** enable/disable each item */
  enabled?: Partial<Record<SocialKind, boolean>>;
  /** order (optional) */
  order?: SocialKind[];
};

function normalizeUrl(kind: SocialKind, raw: string, def: SocialDef) {
  const v = String(raw || "").trim();
  if (!v) return "";

  // already absolute / anchor / mailto / tel
  if (/^(https?:)?\/\//i.test(v) || v.startsWith("#") || v.startsWith("mailto:") || v.startsWith("tel:")) return v;

  // whatsapp: allow digits or +digits
  if (kind === "whatsapp" && def.hrefPrefix) {
    const digits = v.replace(/[^\d]/g, "");
    return digits ? `${def.hrefPrefix}${digits}` : "";
  }

  // otherwise just prefix https://
  return `https://${v}`;
}

export function resolveSocialLinks(cfg?: SocialConfig) {
  const links = cfg?.links ?? {};
  const enabled = cfg?.enabled ?? {};
  const order = (cfg?.order?.length ? cfg.order : (Object.keys(SOCIAL_DEFS) as SocialKind[])) as SocialKind[];

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
