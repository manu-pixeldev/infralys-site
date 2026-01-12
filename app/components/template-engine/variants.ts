// app/components/template-engine/variants.ts

/* ===============================
   Legacy components (legacy.tsx)
================================ */
import {
  LegacyHeader,
  LegacyHero,
  LegacySplit,
  LegacyServices,
  LegacyTeam,
  LegacyGalleries as LegacyGallery, // ✅ alias direct (pas via dossier legacy/)
  LegacyContact,
} from "./legacy";

/* ===============================
   Proof (root component)
================================ */
import { ProofStats } from "./proof";

/* ===============================
   VARIANTS
================================ */
export const VARIANTS = {
  header: { A: LegacyHeader, AUTO: LegacyHeader },
  hero: { A: LegacyHero, AUTO: LegacyHero },
  split: { A: LegacySplit, AUTO: LegacySplit },
  services: { A: LegacyServices, AUTO: LegacyServices },
  proof: { A: ProofStats, AUTO: ProofStats },
  team: { A: LegacyTeam, AUTO: LegacyTeam },
  gallery: { A: LegacyGallery, AUTO: LegacyGallery },
  contact: { A: LegacyContact, AUTO: LegacyContact },
} as const;

export const VARIANTS_BY_TYPE = {
  header: ["A", "AUTO"],
  hero: ["A", "AUTO"],
  split: ["A", "AUTO"],
  services: ["A", "AUTO"],
  proof: ["A", "AUTO"],
  gallery: ["A", "AUTO"],
  contact: ["A", "AUTO"],
} as const;
