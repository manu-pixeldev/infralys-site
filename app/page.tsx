import { Shell } from "./components/Shell";

export default function Home() {
  return (
    <Shell
      title="Assistance & optimisation PC"
      subtitle="Support rapide • Reset • BIOS • Performances"
      status="Disponible – réponse rapide"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Reset complet" desc="Réinstallation propre, nettoyage, configuration de base." />
        <Card title="Dépannage" desc="PC lent, erreurs, virus, mises à jour bloquées." />
        <Card title="BIOS & matériel" desc="UEFI, SSD, démarrage, optimisation performance." />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a
          href="mailto:infralys@outlook.com?subject=Demande%20d%27intervention%20PC"
          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 text-sm font-semibold py-3 px-5 hover:opacity-95 transition-opacity shadow-[0_0_30px_rgba(34,211,238,0.25)]"
        >
          Contacter Infralys
        </a>
        <a
          href="/tarifs"
          className="flex-1 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.05] text-slate-100 text-sm font-semibold py-3 px-5 hover:bg-white/[0.08] transition-colors"
        >
          Voir les tarifs
        </a>
      </div>

      <p className="text-xs text-slate-300/80 mt-4">
        E-mail :{" "}
        <a className="text-cyan-200 hover:text-cyan-100 underline underline-offset-4" href="mailto:infralys@outlook.com">
          infralys@outlook.com
        </a>
      </p>
    </Shell>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.06] transition-colors">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="text-xs text-slate-200/80 mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}
