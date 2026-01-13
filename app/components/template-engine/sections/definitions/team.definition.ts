// app/components/template-engine/sections/definitions/team.definition.ts

export type TeamMemberRole =
  | "founder"
  | "employee"
  | "technician"
  | "manager"
  | "partner"
  | "other";

export type TeamMember = {
  id: string;
  name: string;
  role?: TeamMemberRole;
  title?: string;
  photo?: string;
  active?: boolean;
};

export const TeamDefinition = {
  type: "team",

  intent:
    "Présenter les personnes qui incarnent l’entreprise et rassurer le visiteur.",

  dataShape: {
    members: "TeamMember[]",
  },

  constraints: {
    minMembers: 1,
    allowEmpty: false,
    allowAnonymous: false,
  },

  risks: ["members_outdated", "roles_inaccurate", "missing_photos"],

  allowedActions: {
    enableDisable: true,
    reorder: true,
    editContent: true,
    deleteSection: false,
  },

  uxHints: {
    suggestUpdateEveryMonths: 6,
    warnIfOnlyOneMember: true,
    recommendPhotos: true,
  },

  timeSensitiveFields: ["members"],

  version: 1,
} as const;
