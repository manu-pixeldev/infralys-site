/* ===========================
   Infralys Tools — QR Generator
   app/tools/qr/page.tsx
   =========================== */

"use client";

import React from "react";
import QRCode from "qrcode";

type Tab = "url" | "wifi" | "whatsapp" | "text";

/** -------- Helpers -------- */
function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** Accepte +, espaces, 00..., et garde uniquement les chiffres pour wa.me */
function normalizePhone(input: string) {
  return input
    .trim()
    .replace(/\s/g, "")
    .replace(/^\+/, "")
    .replace(/^00/, "")
    .replace(/[^\d]/g, "");
}

/** Wi-Fi QR format standard */
function buildWifiPayload(ssid: string, pass: string, sec: "WPA" | "WEP" | "nopass", hidden: boolean) {
  // Escape ; , \ and "
  const esc = (s: string) => s.replace(/([\\;," ])/g, "\\$1");
  const H = hidden ? "true" : "false";
  return `WIFI:T:${sec};S:${esc(ssid)};P:${esc(pass)};H:${H};;`;
}

export default function QrToolPage() {
  const [tab, setTab] = React.useState<Tab>("url");

  // URL
  const [url, setUrl] = React.useState("https://infralys.be");

  // Wi-Fi
  const [ssid, setSsid] = React.useState("MonWifi");
  const [wifiPass, setWifiPass] = React.useState("");
  const [wifiSec, setWifiSec] = React.useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = React.useState(false);

  // WhatsApp
  const [phone, setPhone] = React.useState("+32 478 21 74 74");
  const [waMsg, setWaMsg] = React.useState("Bonjour, j’aimerais un devis.");

  // Texte
  const [text, setText] = React.useState("Tape ici ton texte…");

  // UI
  const [qrDataUrl, setQrDataUrl] = React.useState<string>("");
  const [encodedContent, setEncodedContent] = React.useState<string>("");
  const [copied, setCopied] = React.useState(false);

  // Lightbox (clic sur QR)
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  // Génère le contenu à encoder selon l’onglet
  const payload = React.useMemo(() => {
    if (tab === "url") {
      const clean = url.trim();
      return clean;
    }
    if (tab === "wifi") {
      return buildWifiPayload(ssid, wifiPass, wifiSec, wifiHidden);
    }
    if (tab === "whatsapp") {
      const cleanPhone = normalizePhone(phone);
      const msg = waMsg ?? "";
      // wa.me exige le numéro sans +
      const base = `https://wa.me/${cleanPhone}`;
      const withText = msg.trim().length ? `${base}?text=${encodeURIComponent(msg)}` : base;
      return withText;
    }
    // text
    return text;
  }, [tab, url, ssid, wifiPass, wifiSec, wifiHidden, phone, waMsg, text]);

  // Validation très simple + contenu affiché
  const validation = React.useMemo(() => {
    if (tab === "url") {
      if (!payload) return { ok: false, msg: "Entre une URL." };
      // Autorise sans https mais recommande
      return { ok: true, msg: payload.startsWith("http") ? "OK" : "Astuce : ajoute https:// pour un meilleur scan." };
    }
    if (tab === "wifi") {
      if (!ssid.trim()) return { ok: false, msg: "SSID requis." };
      if (wifiSec !== "nopass" && !wifiPass) return { ok: false, msg: "Mot de passe requis pour WPA/WEP." };
      return { ok: true, msg: "OK" };
    }
    if (tab === "whatsapp") {
      const p = normalizePhone(phone);
      if (!p) return { ok: false, msg: "Téléphone requis." };
      if (p.length < 8) return { ok: false, msg: "Numéro trop court." };
      return { ok: true, msg: `Numéro utilisé : ${p}` };
    }
    if (!payload.trim()) return { ok: false, msg: "Entre un texte." };
    return { ok: true, msg: "OK" };
  }, [tab, payload, phone, wifiPass, wifiSec, ssid]);

  // Génération QR à la volée
  React.useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setEncodedContent(payload);

        if (!payload || !validation.ok) {
          setQrDataUrl("");
          return;
        }

        const dataUrl = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 2,
          scale: 8,
          color: {
            dark: "#0b1220",
            light: "#ffffff",
          },
        });

        if (alive) setQrDataUrl(dataUrl);
      } catch {
        if (alive) setQrDataUrl("");
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [payload, validation.ok]);

  // Escape ferme lightbox
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
    }
    if (lightboxOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  async function copyContent() {
    try {
      await navigator.clipboard.writeText(encodedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  function downloadPng() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${tab}.png`;
    a.click();
  }

  /** -------- UI -------- */
  const Accent = "bg-gradient-to-r from-blue-600 to-purple-600";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cx("h-10 w-10 rounded-2xl", Accent)} />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">Outils Infralys</div>
              <div className="text-xs text-slate-500">Générateur de QR code (URL, Wi-Fi, WhatsApp, Texte)</div>
            </div>
          </div>

          <a
            href="/tools"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100"
          >
            ← Retour Tools
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Générateur de <span className={cx("bg-clip-text text-transparent", Accent)}>QR code</span>
            </h1>
            <p className="text-slate-600 max-w-3xl">
              Fais un QR en 10 secondes pour un flyer, une vitrine, un chantier, une carte de visite…
              <span className="ml-1 text-slate-500">Pas de compte. Pas de blabla.</span>
            </p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Left: inputs */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-6">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {([
                  { k: "url", label: "URL" },
                  { k: "wifi", label: "Wi-Fi" },
                  { k: "whatsapp", label: "WhatsApp" },
                  { k: "text", label: "Texte" },
                ] as const).map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setTab(t.k)}
                    className={cx(
                      "rounded-full px-4 py-2 text-sm font-semibold border transition",
                      tab === t.k
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                    )}
                    type="button"
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Forms */}
              <div className="mt-5">
                {tab === "url" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">URL</label>
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://exemple.be"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                    />
                    <p className="text-xs text-slate-500">
                      Conseil : utilise <span className="font-semibold">https://</span> pour éviter les scanners capricieux.
                    </p>
                  </div>
                )}

                {tab === "wifi" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold">Nom du réseau (SSID)</label>
                      <input
                        value={ssid}
                        onChange={(e) => setSsid(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold">Sécurité</label>
                        <select
                          value={wifiSec}
                          onChange={(e) => setWifiSec(e.target.value as any)}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                        >
                          <option value="WPA">WPA/WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">Sans mot de passe</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold">Mot de passe</label>
                        <input
                          value={wifiPass}
                          onChange={(e) => setWifiPass(e.target.value)}
                          disabled={wifiSec === "nopass"}
                          placeholder={wifiSec === "nopass" ? "—" : "••••••••"}
                          className={cx(
                            "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300",
                            wifiSec === "nopass" ? "border-slate-200 bg-slate-100 text-slate-400" : "border-slate-200 bg-white"
                          )}
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={(e) => setWifiHidden(e.target.checked)}
                      />
                      Réseau masqué
                    </label>

                    <p className="text-xs text-slate-500">
                      Le QR connecte automatiquement au Wi-Fi sur la plupart des smartphones.
                    </p>
                  </div>
                )}

                {tab === "whatsapp" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold">Téléphone (format international)</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+32 478 21 74 74"
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Tu peux mettre <span className="font-semibold">+</span>, <span className="font-semibold">espaces</span> ou{" "}
                        <span className="font-semibold">00</span> : c’est corrigé automatiquement.
                      </p>
                      {normalizePhone(phone) ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Numéro utilisé : <span className="font-semibold text-slate-700">{normalizePhone(phone)}</span>
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="text-sm font-semibold">Message (optionnel)</label>
                      <textarea
                        value={waMsg}
                        onChange={(e) => setWaMsg(e.target.value)}
                        rows={4}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        Astuce : parfait pour flyer / vitrine → le client scanne et arrive directement dans WhatsApp.
                      </p>
                    </div>
                  </div>
                )}

                {tab === "text" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Texte</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={6}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                    />
                    <p className="text-xs text-slate-500">Pour notes, instructions, mini mode d’emploi, etc.</p>
                  </div>
                )}
              </div>

              {/* Validation */}
              <div className="mt-5">
                <div
                  className={cx(
                    "rounded-xl border px-4 py-3 text-sm",
                    validation.ok
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  )}
                >
                  {validation.ok ? "✓ " : "⨯ "}
                  {validation.msg}
                </div>
              </div>
            </div>

            {/* Right: preview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Aperçu</h2>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyContent}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-100"
                  >
                    {copied ? "Copié ✓" : "Copier le contenu"}
                  </button>
                  <button
                    type="button"
                    onClick={downloadPng}
                    disabled={!qrDataUrl}
                    className={cx(
                      "rounded-xl px-3 py-2 text-sm font-semibold text-white",
                      qrDataUrl ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-300 cursor-not-allowed"
                    )}
                  >
                    Télécharger PNG
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold">QR</p>

                  <div className="mt-3 rounded-2xl bg-white border border-slate-200 p-3 flex items-center justify-center">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                <div className="w-full flex justify-center">
  <div className="relative w-full max-w-[320px] aspect-square">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={qrDataUrl}
      alt="QR"
      className="absolute inset-0 h-full w-full object-contain cursor-zoom-in"
      onClick={() => setLightboxOpen(true)}
    />
  </div>
                </div>
                    ) : (
                      <div className="h-[260px] w-[260px] rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-sm text-slate-500">
                        QR indisponible
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Clique sur le QR pour l’agrandir. <span className="font-semibold">Esc</span> pour fermer.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold">Contenu encodé</p>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-700 break-all min-h-[260px]">
                    {encodedContent || <span className="text-slate-400">—</span>}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Pour WhatsApp : format <span className="font-semibold">wa.me</span> sans “+”.
                  </p>
                </div>
              </div>

              <div className="mt-5 text-xs text-slate-500">
                Note : QR généré côté navigateur. Rien n’est envoyé sur un serveur.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && qrDataUrl ? (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="max-w-[92vw] max-h-[92vh] rounded-3xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">QR (aperçu)</div>
              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-100"
                onClick={() => setLightboxOpen(false)}
                type="button"
              >
                Fermer (Esc)
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR grand" className="max-h-[75vh] max-w-[85vw]" />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
