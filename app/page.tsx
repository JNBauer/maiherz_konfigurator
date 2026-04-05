import type { Metadata } from "next"
import HeroHeader from "../components/HeroHeader"
import TextPreview from "../components/TextPreview"

export const metadata: Metadata = {
  title: "Maiherz Konfigurator | Dein persönliches Maiherz",
  description:
    "Gestalte dein persönliches Maiherz: Wähle Schrift, Größe, Material und Herzform. Vorschau in 3D und direkt Anfrage stellen.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Maiherz Konfigurator",
    description:
      "Gestalte dein persönliches Maiherz mit 3D Vorschau, Materialien und Lasercheck.",
    type: "website",
    url: "/",
  },
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Maiherz Konfigurator",
    description:
      "Konfigurator für personalisierte Maiherzen mit 3D Vorschau, Materialauswahl und Lasercheck.",
    brand: {
      "@type": "Brand",
      name: "mai-herz.de",
    },
    category: "Handmade Decor",
  }

  return (
    <div className="min-h-screen w-full bg-transparent pt-4">
      <HeroHeader />
      <section className="w-full px-3 pt-5 md:px-6 md:pt-7">
        <div className="mx-auto w-[90%]">
          <div className="grid gap-4 md:grid-cols-3">
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-4 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)] md:p-5"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h1 className="text-2xl font-semibold text-amber-50 md:text-3xl">
                Dein persönliches Maiherz gestalten
              </h1>
              <p className="mt-3 text-base leading-7 text-amber-100/80">
                Der Konfigurator zeigt dir dein Herz direkt in 3D und hilft dir,
                Proportionen, Wirkung und Platzbedarf realistisch einzuschätzen.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-4 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)] md:p-5"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h2 className="text-lg font-semibold text-amber-100">
                So geht&apos;s
              </h2>
              <p className="mt-3 text-base leading-7 text-amber-100/80">
                Wähle Schrift, Größe, Material und Herzform. Prüfe den Text im
                Herz, berechne eine grobe Fläche und sende deine Anfrage mit
                einem Klick.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-4 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)] md:p-5"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h2 className="text-lg font-semibold text-amber-100">Optionen</h2>
              <div className="mt-3 grid gap-3 text-base leading-7 text-amber-100/80">
                <p>
                  <span className="font-semibold text-amber-50">
                    Download &amp; Print:
                  </span>{" "}
                  Erstelle eine maßstabgetreue Schablone, um dein Design selbst
                  zu testen oder zu übertragen.
                </p>
                <p>
                  <span className="font-semibold text-amber-50">
                    Laserauftrag:
                  </span>{" "}
                  Schicke deine Konfiguration als Anfrage und lass die
                  Fertigung übernehmen.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <TextPreview />

      <section className="w-full px-3 pb-10 pt-8 md:px-6 md:pt-10">
        <div className="mx-auto grid w-[90%] gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <figure
            className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
          >
            <img
              src="/maiherz-scene.png"
              alt="3D Vorschau eines personalisierten Maiherzens"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/10 to-transparent" />
            <figcaption className="relative px-4 py-3 text-sm text-amber-100/80">
              Platzhalterbild: 3D Szene im Konfigurator als realistische Größen-
              und Formhilfe.
            </figcaption>
          </figure>
          <div
            className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-6 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
          >
            <h2 className="text-2xl font-semibold text-amber-50">
              Dein Entwurf, sauber vorbereitet
            </h2>
            <p className="mt-3 text-lg leading-7 text-amber-100/80">
              Jedes Maiherz entsteht nach deinen Angaben: Name, Schriftstil,
              Größe, Material, Herzform und optional Gravur. Die 3D-Vorschau
              hilft dir, Lesbarkeit, Abstände und die Wirkung im Raum zu prüfen.
            </p>
            <p className="mt-3 text-lg leading-7 text-amber-100/80">
              Für Sonderwünsche wie Logos, spezielle Maße oder Materialien kannst
              du Hinweise direkt in der Anfrage ergänzen.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full px-3 pb-10 md:px-6">
        <div className="mx-auto w-[90%]">
          <h2 className="text-2xl font-semibold text-stone-900">
            Details, Vorteile und Hinweise
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Individuelle Anfertigung
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Du bestimmst Schrift, Größe, Material und Herzform. Ob schlicht,
                verspielt oder mit Gravur – das Maiherz wird passend zu deinem
                Anlass vorbereitet. Ideal für persönliche Geschenke, Vereine
                oder Firmen.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Laserschneiden &amp; Materialien
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Für saubere Kanten und präzise Details eignet sich der
                Laserschnitt besonders gut. Wähle zwischen MDF, Multiplex oder
                Acryl und verschiedenen Materialstärken. Die Vorschau und der
                Lasertest helfen, feine Stege sicher umzusetzen.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Vorteile &amp; Grenzen
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Vorteile: hohe Präzision, gleichmäßige Ergebnisse und flexible
                Materialien. Grenzen: sehr filigrane Schriften oder enge
                Innenräume können empfindlich sein. Der Lasertest zeigt dir früh,
                ob ein Design stabil genug ist.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Weitere Hinweise
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Beim Download-Print erhältst du eine maßstabgetreue Schablone,
                die sich bei großen Größen auf mehrere Seiten verteilt. Achte
                darauf, den Ausdruck ohne Skalierung zu drucken. Für den
                Laserauftrag bitte vor dem Absenden den Lasertest durchführen.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="w-full px-3 pb-12 md:px-6">
        <div className="mx-auto w-[90%]">
          <h2 className="text-2xl font-semibold text-stone-900">
            Fragen &amp; Antworten
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Wie genau ist die 3D-Vorschau?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Die Vorschau zeigt Proportionen, Abstände und die Wirkung des
                Textes im Herz. Für exakte Maße nutze die angezeigten
                Zentimeterwerte und die PDF-Schablone.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Kann ich eigene Schriftarten nutzen?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Wähle aus den verfügbaren Schriften im Konfigurator. Wenn du
                eine spezielle Schrift brauchst, vermerke den Wunsch in der
                Anfrage.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Was passiert nach dem Absenden?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Wir prüfen die Angaben, melden uns bei Rückfragen und bestätigen
                die Umsetzung. Danach vereinbaren wir den nächsten Schritt.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Ist der Lasertest verpflichtend?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Ja, der Lasertest stellt sicher, dass dein Text stabil bleibt.
                Erst danach kann die Anfrage abgeschickt werden.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Kann ich mehrere Größen ausprobieren?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Ja, ändere Höhe, Breite und Abstand, bis die Vorschau und die
                Abstände passen. Die grobe Fläche hilft dir bei der Einschätzung.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Welche Materialien stehen zur Wahl?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Du kannst zwischen MDF, Multiplex und Acryl wählen. Je nach
                Material wirken Kanten, Farbe und Lichtdurchlass unterschiedlich.
              </p>
            </article>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
