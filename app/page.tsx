import type { Metadata } from "next"
import HeroHeader from "../components/HeroHeader"
import TextPreview from "../components/TextPreview"
import { getVersionedPublicAsset } from "../lib/getVersionedPublicAsset"

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
  const sceneImageSrc = getVersionedPublicAsset("/maiherz-scene.png")

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wie genau ist die 3D-Vorschau?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Die Vorschau zeigt Proportionen, Abstände und die Wirkung des Textes im Herz. Für exakte Maße nutze die angezeigten Zentimeterwerte und die PDF-Schablone.",
        },
      },
      {
        "@type": "Question",
        name: "Kann ich eigene Schriftarten nutzen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Wähle aus den verfügbaren Schriften im Konfigurator. Wenn du eine spezielle Schrift brauchst, vermerke den Wunsch in der Anfrage.",
        },
      },
      {
        "@type": "Question",
        name: "Was passiert nach dem Absenden?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Wir prüfen die Angaben, melden uns bei Rückfragen und bestätigen die Umsetzung. Danach vereinbaren wir den nächsten Schritt.",
        },
      },
      {
        "@type": "Question",
        name: "Ist der Lasertest verpflichtend?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, der Lasertest stellt sicher, dass dein Text stabil bleibt. Erst danach kann die Anfrage abgeschickt werden.",
        },
      },
      {
        "@type": "Question",
        name: "Kann ich mehrere Größen ausprobieren?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, ändere Höhe, Breite und Abstand, bis die Vorschau und die Abstände passen. Die grobe Fläche hilft dir bei der Einschätzung.",
        },
      },
      {
        "@type": "Question",
        name: "Welche Materialien stehen zur Wahl?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Du kannst zwischen MDF, Multiplex und Acryl wählen. Je nach Material wirken Kanten, Farbe und Lichtdurchlass unterschiedlich.",
        },
      },
    ],
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
                Bestimme das Holz und die Schriftart deiner Wahl und erstelle so
                etwas ganz Individuelles für deinen Lieblingsmenschen.
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
                Wähle Schrift, Größe, Material bzw. Holzart und Herzform. Prüfe den Text im
                Herz, berechne einen groben Preis und sende deine Anfrage mit
                einem Klick, oder drucke sie dir als Schablone aus.
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

      <TextPreview sceneImageSrc={sceneImageSrc} />

      <section className="w-full px-3 pb-10 pt-8 md:px-6 md:pt-10">
        <div className="mx-auto grid w-[90%] gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <figure
            className="relative min-h-[320px] overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply shadow-[0_18px_45px_rgba(0,0,0,0.35)] md:min-h-[380px]"
            style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
          >
            <img
              src={sceneImageSrc}
              alt="3D Vorschau eines personalisierten Maiherzens"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/10 to-transparent" />
            <figcaption className="relative px-4 py-3 text-sm text-amber-100/80">
              Beispielansicht: 3D-Vorschau im Konfigurator zur realistischen Einschätzung von Größe und Form.
            </figcaption>
          </figure>

          <div
            className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-6 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
          >
            <h2 className="text-2xl font-semibold text-amber-50">
              Dein Entwurf, professionell umgesetzt
            </h2>
            <p className="mt-3 text-lg leading-7 text-amber-100/80">
              Jedes Maiherz wird individuell nach deinen Angaben gefertigt: Name,
              Schriftstil, Größe, Material, Herzform und optional eine Gravur. Die
              3D-Vorschau hilft dir dabei, Lesbarkeit, Abstände und die Gesamtwirkung
              realistisch einzuschätzen.
            </p>
            <p className="mt-3 text-lg leading-7 text-amber-100/80">
              Sonderwünsche wie zusätzliche Motive, Drehungen, spezielle Maße oder
              Materialien kannst du einfach in deiner Anfrage angeben. Gemeinsam klären
              wir anschließend per E-Mail, wie sich deine Ideen optimal umsetzen lassen.
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
                verspielt oder mit Gravur – dein Maiherz aus Holz wird exakt nach deinen
                Vorstellungen gefertigt. So kannst du dich entspannt zurücklehnen und
                weißt genau, wie dein individuelles Holz-Maiherz am Ende aussehen wird.
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
                Der Laserschnitt sorgt für präzise Konturen und saubere Kanten – auch
                bei feinen Details. Bei Holz entstehen so saubere Schnittkanten
                und ein hochwertiges Ergebnis. Du kannst zwischen MDF, Multiplex (Holz)
                und Acryl sowie verschiedenen Materialstärken wählen. Vorschau und
                Lasertest helfen dir, dein Design aus Holz sicher und stabil umzusetzen.
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
                Materialwahl – besonders bei Holz sehr beliebt wegen der natürlichen Optik.
                Grenzen: Sehr filigrane Schriften oder enge Innenräume können bei Holz
                empfindlich sein. Der Lasertest zeigt dir frühzeitig, ob dein Entwurf stabil
                genug ist.
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
                Beim Download erhältst du eine maßstabsgetreue PDF-Schablone, die bei
                größeren Formaten auf mehrere Seiten aufgeteilt ist. Achte darauf, den
                Ausdruck ohne Skalierung zu drucken. Für die Laserfertigung von Holz ist es
                erforderlich, vor dem Absenden den Lasertest durchzuführen, um ein sauberes
                und stabiles Ergebnis zu gewährleisten.
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
                Die Vorschau zeigt dir realistische Proportionen, Abstände und die
                Wirkung des Textes im Herz. Kleine Abweichungen sind möglich, da beim
                Laserschneiden minimale Toleranzen entstehen können. Für exakte Maße
                orientiere dich bitte an den angegebenen Zentimeterwerten sowie an der
                PDF-Schablone.
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
                Du kannst aus den verfügbaren Schriftarten im Konfigurator wählen.
                Wenn du eine individuelle Schrift verwenden möchtest, schreibe mir
                einfach eine Nachricht – ich prüfe gerne, ob sich diese umsetzen lässt.
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
                Nach dem Absenden erhältst du eine E-Mail mit deinen Angaben. Ich
                prüfe deine Anfrage und melde mich bei dir – entweder zur Bestätigung
                oder mit Rückfragen. Sobald alles passt, bestätigen wir gemeinsam die
                Umsetzung und besprechen die nächsten Schritte.
              </p>
            </article>

            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Wofür ist der Lasertest?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Der Lasertest stellt sicher, dass dein gewünschtes Design technisch
                sauber umgesetzt werden kann und stabil bleibt. Besonders bei
                filigranen Schriften verhindert er, dass Teile beim Schneiden brechen.
                Für den Download der PDF-Schablone ist der Lasertest nicht erforderlich.
              </p>
            </article>

            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Kann ich die Größen von Schrift und Herz verändern?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                Ja, Höhe, Breite und Abstände lassen sich individuell anpassen, bis
                alles für dich stimmig ist. Nutze die Hintergrundfläche als Orientierung
                für die tatsächliche Größe. Bitte beachte: Größere Maße erhöhen den
                Materialverbrauch und können sich auf den Preis auswirken.
              </p>
            </article>
            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Was ist MDF und wann eignet es sich?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                <strong>MDF (Mitteldichte Faserplatte)</strong> ist die preisgünstigere
                Option. Es besteht aus fein gepressten Holzfasern und hat eine sehr
                glatte Oberfläche, die sich ideal zum Bemalen eignet. Allerdings ist MDF
                weniger stabil und nur bedingt witterungsbeständig – daher eher für
                kurzfristige oder geschützte Einsätze geeignet.
              </p>
            </article>

            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Was ist Multiplex und welche Vorteile hat es?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                <strong>Multiplex</strong> ist deutlich stabiler und hochwertiger. Es
                besteht aus mehreren verleimten Echtholz-Schichten und ist dadurch
                besonders robust und formstabil. Gerade bei filigranen Schriftzügen ist
                Multiplex die bessere Wahl, da es weniger bruchanfällig ist und sich auch
                für den Außenbereich eignet.
              </p>
            </article>

            <article
              className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-5 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
              style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
            >
              <h3 className="text-base font-semibold text-amber-50">
                Was ist Acryl und wann ist es die beste Wahl?
              </h3>
              <p className="mt-2 text-base leading-7 text-amber-100/80">
                <strong>Acryl</strong> ist ein wetterfestes, langlebiges
                Kunststoffmaterial mit einer modernen, glatten Optik. Es ist bereits weiß
                (oder in Wunschfarbe erhältlich) und muss nicht gestrichen werden.
                Dadurch ist es besonders pflegeleicht und ideal für Maipherzen, die
                dauerhaft draußen aufgehängt werden.
              </p>
            </article>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  )
}
