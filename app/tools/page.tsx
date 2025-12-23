"use client";

import Link from "next/link";
import React from "react";

type Tool = {
  title: string;
  desc: string;
  href: string;
  badge?: string;
  category: "Marketing" | "Sécurité" | "Utilitaires";
};

const TOOLS: Tool[] = [
  {
    title: "Générateur de QR code",
    desc: "URL, Wi-Fi, WhatsApp, vCard… export PNG.",
    href: "/tools/qr",
    badge: "Populaire",
    category: "Utilitaires",
  },
  {
    title: "UTM Builder",
    desc: "Crée des liens trackés propres (Google Analytics).",
    href: "/tools/utm",
    badge: "Nouveau",
    category: "Marketing",
  },
  // Tu peux en rajouter ici plus tard:
  // { title:"Générateur de mots de passe", desc:"…", href:"/tools/password", category:"Sécurité" },
];

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={tool.href}
      className={cx(
        "group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm",
        "hover:shadow-md hover:-translate-y-0.5 transition"
      )}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-600/15 to-red-600/15 blur-2xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-slate-900">{tool.title}</div>
          <div className="mt-2 text-sm text-slate-600">{tool.desc}</div>
        </div>
        {tool.badge ? (
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {tool.badge}
          </span>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-slate-500">{tool.category}</span>
        <span className="text-sm font-semibold text-slate-900 group-hover:underline">
          Ouvrir →
        </span>
      </div>
    </Link>
  );
}

export default function Tools() {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<"Tous" | Tool["category"]>("Tous");

  const filtered = TOOLS.filter((t) => {
    const matchQ =
      !q ||
      t.title.toLowerCase().includes(q.toLowerCase()) ||
      t.desc.toLowerCase().includes(q.toLowerCase());
    const matchCat = cat === "Tous" ? true : t.category === cat;
    return matchQ && matchCat;
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top / Hero */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-red-600" />
            Outils gratuits
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Tools Infralys
            <span className="ml-2 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
              V2035
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Des outils simples, rapides et propres. Pas d’inscription. Pas de pub.
          </p>

          {/* Search + filters */}
          <div className="mt-8 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-8">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un outil… (ex: QR, UTM)"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as any)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="Tous">Toutes catégories</option>
                <option value="Utilitaires">Utilitaires</option>
                <option value="Marketing">Marketing</option>
                <option value="Sécurité">Sécurité</option>
              </select>
            </div>
          </div>

          {/* Micro CTA strip */}
          <div className="mt-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-600/10 to-red-600/10 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold">Tu veux un outil “sur mesure” pour ton site client ?</div>
                <div className="text-sm text-slate-600">
                  Ex : calculateur devis, simulateur, prise de RDV, configurateur…
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Me contacter →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Cards */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((t) => (
            <ToolCard key={t.href} tool={t} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            Aucun résultat. Essaie “QR” ou “UTM”.
          </div>
        ) : null}

        <footer className="mt-12 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} — Infralys Tools
        </footer>
      </section>
    </main>
  );
}
