"use client";

import { TemplateEngine } from "@/app/components/template-engine/template-engine";

import { INFRALYS_CONFIG } from "./config";

export default function InfralysPage() {
  return <TemplateEngine config={INFRALYS_CONFIG} />;
}
