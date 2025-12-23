"use client";

import React from "react";

function buildUrl(base: string, params: Record<string, string>) {
  try {
    const u = new URL(base);
    Object.entries(params).forEach(([k, v]) => {
      if (v.trim()) u.searchParams.set(k, v.trim());
    });
    return u.toString();
  } catch {
    return "";
  }
}

export default function UTMTool() {
  const [base, setBase] = React.useState("https://infralys.be");
  const [source, setSource] = React.useState("facebook");
  const [medium, setMedium] = React.useState("cpc");
  const [campaign, setCampaign] = React.useState("promo-hiver");
  const [term, setTerm] = React.useState("");
  const [content, setContent] = React.useState("");

  const final = React.useMemo(() => {
    return buildUrl(base, {
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      utm_term: term,
      utm_content: content,
    });
  }, [base, source, medium, campaign, term, content]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="text-sm text-slate-500">
            <a className="hover:underline" href="/tools">← Tools</a>
          </div>
          <h1 className="mt-2 text-3xl font-semibold">UTM Builder</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Génère un lien tracké propre (Google Analytics / Matomo). Copie-colle et c’est fini.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">URL de base</label>
                <input
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                  placeholder="https://ton-site.be/page"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">utm_source</label>
                  <input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                    placeholder="facebook"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">utm_medium</label>
                  <input
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                    placeholder="cpc / email / social"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">utm_campaign</label>
                <input
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                  placeholder="promo-hiver"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">utm_term (optionnel)</label>
                  <input
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                    placeholder="mot-clé"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">utm_content (optionnel)</label>
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                    placeholder="bouton-a / visuel-2"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold">Lien final</div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 break-words">
              {final || "URL invalide (vérifie l’URL de base)."}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button
                onClick={async () => {
                  if (!final) return;
                  await navigator.clipboard.writeText(final);
                  alert("Lien copié ✅");
                }}
                className="inline-flex justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Copier
              </button>

              <a
                href={final || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Tester →
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Tip : garde une convention (source/medium/campaign) et tes stats seront clean.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
