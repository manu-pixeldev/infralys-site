//PAGE EXEMPLE CLIENT 
import { TemplateEngine } from "@/app/components/template-engine/TemplateEngine";
import { CONFIG_DUPONT } from "./config";

export default function Page() {
  return <TemplateEngine config={CONFIG_DUPONT} />;
}
