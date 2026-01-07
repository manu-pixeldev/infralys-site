// app/page.tsx
import type { Metadata } from "next";
import { Shell } from "./components/Shell";

export const metadata: Metadata = {
  title: "Infralys — Assistance & optimisation PC",
  description: "Support rapide • Reset • BIOS • Performances",
};

export default function Home() {
  return (
    // ✅ Fond SSR stable (évite flash blanc avant hydration)
    // Note: Shell a déjà son propre fond + layout, donc ici on met juste un "backdrop" neutre.
    <div className="min-h-screen bg-slate-950">
      <Shell
        title="Assistance & optimisation PC"
        subtitle="Support rapide • Reset • BIOS • Performances"
        status="Disponible – réponse rapide"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card
            title="Reset complet"
            desc="Réinstallation propre, nettoyage, configuration de base."
          />
          <Card
            title="Dépannage"
            desc="PC lent, erreurs, virus, mises à jour bloquées."
          />
          <Card
            title="BIOS & matériel"
            desc="UEFI, SSD, démarrage, optimisation performance."
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="mailto:infralys@outlook.com?subject=Demande%20d%27intervention%20PC"
            className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.25)] transition-opacity hover:opacity-95"
          >
            Contacter Infralys
          </a>

          <a
            href="/tarifs"
            className="flex-1 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08]"
          >
            Voir les tarifs
          </a>
        </div>

        <p className="mt-4 text-xs text-slate-300/80">
          E-mail :{" "}
          <a
            className="text-cyan-200 underline underline-offset-4 hover:text-cyan-100"
            href="mailto:infralys@outlook.com"
          >
            infralys@outlook.com
          </a>
        </p>
      </Shell>
    </div>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.06]">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-200/80">{desc}</p>
    </div>
  );
}
