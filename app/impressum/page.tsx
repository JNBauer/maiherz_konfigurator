import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Impressum",
  description: "Rechtliche Angaben und Kontaktinformationen zu mai-herz.de.",
}

export default function ImpressumPage() {
  return (
    <section className="mx-auto w-[90%] max-w-4xl py-10 text-stone-900">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Impressum</h1>

        <div className="mt-6 space-y-6 text-base leading-7 text-stone-800">
          
          <p className="font-medium">Angaben gemäß § 5 DDG</p>

          <div>
            <p className="font-medium">Anbieter:</p>
            <p>
              Julian Bauer<br />
              Provinzialstraße 26<br />
              53859 Niederkassel<br />
              Deutschland
            </p>
          </div>

          <div>
            <p className="font-medium">Kontakt:</p>
            <p>
              E-Mail:{" "}
              <a href="mailto:anfrage@mai-herz.de" className="underline">
                anfrage@mai-herz.de
              </a><br />
              Telefon:{" "}
              <a href="tel:+49123456789" className="underline">
                +49 1575 6866042
              </a>
            </p>
          </div>

          <div>
            <p className="font-medium">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
            </p>
            <p>
              Julian Bauer<br />
              Provinzialstraße 26<br />
              53859 Niederkassel<br />
              Deutschland
            </p>
          </div>

          <div>
            <p className="font-medium">EU-Streitschlichtung:</p>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>.
              Meine E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </div>

          <div>
            <p className="font-medium">Verbraucherstreitbeilegung / Universalschlichtungsstelle:</p>
            <p>
              Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
