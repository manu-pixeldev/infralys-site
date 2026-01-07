// app/template-base/page.tsx
import type { Metadata } from "next";
import TemplateBaseClient from "./TemplateBaseClient";

export const metadata: Metadata = {
  title: "Template Base — Infralys",
  description: "Studio Template Engine (template-base)",
};

export default function TemplateBasePage() {
  return <TemplateBaseClient />;
}
