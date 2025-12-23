"use client";

import { TemplateEngine } from "../../components/template-engine/TemplateEngine";

import { INFRALYS_CONFIG } from "./config";

export default function InfralysPage() {
  return <TemplateEngine config={INFRALYS_CONFIG} />;
}
