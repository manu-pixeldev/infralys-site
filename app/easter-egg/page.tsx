// app/easter-eggs/page.tsx
"use client";

import React from "react";

export default function EasterEggsPage() {
  const [melt, setMelt] = React.useState(false);
  const [shake, setShake] = React.useState(false);
  const [glitch, setGlitch] = React.useState(false);

  // ✅ secret unlock (Konami)
  const [secret, setSecret] = React.useState(false);

  // ✅ Konami: ↑↑↓↓←→←→BA
  React.useEffect(() => {
    // restore (optional)
    try {
      if (localStorage.getItem("te:easter") === "1") setSecret(true);
    } catch {}

    const code = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let i = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (k === code[i]) {
        i++;
        if (i === code.length) {
          i = 0;
          setSecret(true);
          try {
            localStorage.setItem("te:easter", "1");
          } catch {}
        }
      } else {
        i = 0;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">
          🥚 Easter Eggs
        </h1>
        <p className="mt-3 text-white/70">
          Page débile officielle. À activer quand tu veux “un peu de fun”.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Btn onClick={() => setMelt((v) => !v)} active={melt}>
            🔥 Melt page
          </Btn>
          <Btn onClick={() => setShake((v) => !v)} active={shake}>
            🫨 Shake mode
          </Btn>
          <Btn onClick={() => setGlitch((v) => !v)} active={glitch}>
            📺 Glitch CRT
          </Btn>

          {secret ? (
            <Btn
              onClick={() => {
                setMelt(true);
                setShake(true);
                setGlitch(true);
              }}
              active={melt && shake && glitch}
            >
              😈 Chaos mode (secret)
            </Btn>
          ) : null}
        </div>

        <div
          className={[
            "mt-10 rounded-3xl border border-white/10 bg-white/5 p-8",
            melt ? "animate-[melt_2.2s_ease-in-out_infinite]" : "",
            shake ? "animate-[shake_0.35s_linear_infinite]" : "",
            glitch ? "animate-[glitch_1.2s_steps(2,end)_infinite]" : "",
            secret ? "animate-[hyper_2.4s_linear_infinite]" : "",
          ].join(" ")}
        >
          <div className="text-xl font-semibold">Zone de test</div>
          <p className="mt-2 text-white/70">
            Si tu lis ceci, t’es officiellement dans le multivers Infralys.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
              v2035
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
              broken theme
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
              chaos approved
            </span>
          </div>
        </div>

        {secret ? (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/template-base?egg=1"
              className="rounded-3xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/15"
            >
              🧪 Go template (egg=1)
            </a>
            <span className="text-xs text-white/60">Tip: tape ↑↑↓↓←→←→BA</span>
          </div>
        ) : null}

        <style jsx global>{`
          @keyframes shake {
            0% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(1px, -1px) rotate(-0.2deg);
            }
            50% {
              transform: translate(-1px, 1px) rotate(0.2deg);
            }
            75% {
              transform: translate(1px, 1px) rotate(0deg);
            }
            100% {
              transform: translate(0, 0) rotate(-0.2deg);
            }
          }
          @keyframes glitch {
            0% {
              filter: hue-rotate(0deg) contrast(1.1);
              transform: translate(0, 0);
            }
            20% {
              filter: hue-rotate(25deg) contrast(1.3);
              transform: translate(-1px, 0);
            }
            40% {
              filter: hue-rotate(-25deg) contrast(1.2);
              transform: translate(1px, 0);
            }
            60% {
              filter: hue-rotate(15deg) contrast(1.35);
              transform: translate(0, 1px);
            }
            80% {
              filter: hue-rotate(-15deg) contrast(1.25);
              transform: translate(0, -1px);
            }
            100% {
              filter: hue-rotate(0deg) contrast(1.1);
              transform: translate(0, 0);
            }
          }
          @keyframes melt {
            0% {
              border-radius: 24px;
            }
            50% {
              border-radius: 44px;
              transform: skewX(-0.4deg) skewY(0.4deg);
            }
            100% {
              border-radius: 24px;
            }
          }
          @keyframes hyper {
            0% {
              filter: hue-rotate(0deg) saturate(1.05);
            }
            50% {
              filter: hue-rotate(35deg) saturate(1.25);
            }
            100% {
              filter: hue-rotate(0deg) saturate(1.05);
            }
          }
        `}</style>

        <div className="mt-10 text-xs text-white/50">
          Tip: ajoute un lien vers /easter-eggs dans ton StudioPanel (ou un
          raccourci clavier).
        </div>
      </div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-3xl border px-4 py-4 text-left text-sm font-semibold transition",
        active
          ? "border-white/20 bg-white/10"
          : "border-white/10 bg-white/5 hover:bg-white/8",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
