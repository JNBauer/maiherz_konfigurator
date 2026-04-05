import HeroHeader from "@/components/HeroHeader"

export default function AcknowledgmentPage() {
  return (
    <div className="min-h-screen w-full bg-stone-100 pt-4">
      <HeroHeader />

      <main className="w-full px-4 pb-10 pt-6 md:px-6 md:pt-8">
        <section className="mx-auto w-full max-w-4xl text-stone-900">
          <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm md:p-8">

            <h1 className="text-3xl font-semibold">Danksagungen</h1>

            <div className="mt-6 space-y-8 text-base leading-7 text-stone-800">

              <p>
                Hier werden die in diesem Konfigurator verwendeten Schriftarten, Texturen und 3D-Assets aufgeführt.
                Ich bin den Entwickler:innen und Künstler:innen sehr dankbar, die ihre Arbeiten öffentlich zur Verfügung stellen.
                Falls dir fehlende Quellenangaben auffallen, melde dich bitte gerne.
              </p>

              {/* Schriftarten */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Schriftarten</h2>

                <p className="text-stone-700">
                  Borel, Cherry Bomb One, Dancing Script, Geist, Geist Mono, Josefin Sans,
                  Lobster, Tangerine
                </p>

                <ul className="space-y-3 text-sm leading-6">
                  <li>
                    <span className="font-medium">Tangerine</span>{" "}
                    <span className="text-stone-500">von Toshi Omagari</span><br />

                    <span className="text-stone-600">
                      Leicht modifiziert und variiert für dieses Projekt
                    </span><br />

                    <a href="https://www.tosche.net/fonts" className="underline">
                      Künstlerseite
                    </a>
                  </li>

                  <li>
                    <span className="font-medium">Borel</span>{" "}
                    <span className="text-stone-500">von Rosalie Wagner</span><br />
                    <a href="https://github.com/RosaWagner/Borel" className="underline">
                      GitHub Repository
                    </a>
                  </li>

                  <li>
                    <span className="font-medium">Lobster</span>{" "}
                    <span className="text-stone-500">von Impallari</span><br />
                    <a href="https://github.com/impallari/The-Lobster-Font" className="underline">
                      GitHub Repository
                    </a>
                  </li>

                  <li>
                    <span className="font-medium">Cherry Bomb One</span>{" "}
                    <span className="text-stone-500">von Satsuyako</span><br />
                    <a href="https://github.com/satsuyako/CherryBomb" className="underline block">
                      GitHub Repository
                    </a>
                    <a href="https://satsuyako.booth.pm/" className="underline block">
                      Projektseite
                    </a>
                  </li>
                </ul>
              </section>

              {/* Lizenzen */}
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Schriftlizenzen</h2>
                <p>
                  Alle aufgeführten Schriftarten stehen unter der SIL Open Font License 1.1.
                  Den vollständigen Lizenztext findest du auf der{" "}
                  <a href="/ofl" className="underline">
                    Seite zur SIL Open Font License
                  </a>.
                </p>
              </section>

              {/* Texturen */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Texturen</h2>

                <div className="space-y-3 text-sm leading-6">
                  <p>
                    <span className="font-medium">Plywood-Textur</span>{" "}
                    <span className="text-stone-500">von Rob Tuytel</span>
                  </p>

                  <a
                    href="https://polyhaven.com/a/plywood"
                    className="underline"
                  >
                    Auf Poly Haven ansehen
                  </a>

                  <p className="text-stone-600">
                    Quelle: Poly Haven
                  </p>

                  <p className="text-stone-600">
                    <span className="font-medium">Lizenz:</span>{" "}
                    CC0 (frei nutzbar, keine Namensnennung erforderlich)
                  </p>

                  <a
                    href="https://polyhaven.com"
                    className="underline"
                  >
                    Künstler-Portfolio
                  </a>
                </div>
              </section>

              {/* 3D Modelle */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">3D-Modelle</h2>

                <div className="space-y-3 text-sm leading-6">
                  <p>
                    <span className="font-medium">
                      DIN 315 Flügelmuttern M4–M24
                    </span>{" "}
                    <span className="text-stone-500">von Yaqu13</span>
                  </p>

                  <a
                    href="https://www.printables.com/model/1212477-din-315-wing-nuts-m4-m24"
                    className="underline"
                  >
                    Auf Printables ansehen
                  </a>

                  <p className="text-stone-600">
                    <span className="font-medium">Lizenz:</span>{" "}
                    Creative Commons 4.0 (Namensnennung erforderlich, kommerzielle Nutzung und Bearbeitung erlaubt)
                  </p>
                </div>
              </section>

            </div>
          </div>
        </section>
      </main>
    </div>
  )
}