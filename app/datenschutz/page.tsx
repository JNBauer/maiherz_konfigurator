import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Informationen zur Verarbeitung personenbezogener Daten und zum Datenschutz bei mai-herz.de.",
}

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto w-[90%] max-w-4xl py-10 text-stone-900">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Datenschutzerklaerung</h1>

        <div className="mt-6 space-y-5 text-base leading-7 text-stone-800">
          <p>
            Diese Datenschutzerklaerung informiert Sie ueber die Art, den Umfang
            und Zweck der Verarbeitung von personenbezogenen Daten auf dieser
            Website.
          </p>

          <h2 className="text-lg font-semibold">1. Verantwortlicher</h2>
          <p>
            Julian Bauer<br />
            Aggerstrasse 2<br />
            53859 Niederkassel<br />
            Deutschland<br />
            E-Mail: anfrage@mai-herz.de
          </p>

          <h2 className="text-lg font-semibold">2. Hosting</h2>
          <p>
            Diese Website wird bei Vercel Inc., 340 S Lemon Ave #4133, Walnut,
            CA 91789, USA gehostet. Beim Aufruf der Website werden durch den
            Hosting-Anbieter automatisch Informationen erfasst (z. B. IP-Adresse,
            Datum und Uhrzeit der Anfrage, Browserinformationen).
          </p>
          <p>
            Die Verarbeitung erfolgt zur Sicherstellung des Betriebs und der
            Sicherheit der Website gemaess Art. 6 Abs. 1 lit. f DSGVO.
          </p>
          <p>
            Es kann nicht ausgeschlossen werden, dass Daten in die USA uebertragen
            werden. Vercel verwendet hierfuer Standardvertragsklauseln (SCCs)
            gemaess Art. 46 DSGVO.
          </p>

          <h2 className="text-lg font-semibold">3. Kontaktaufnahme</h2>
          <p>
            Wenn Sie mich per Formular oder E-Mail kontaktieren, werden die von
            Ihnen angegebenen Daten (z. B. Name, E-Mail-Adresse, Nachricht) zum
            Zweck der Bearbeitung Ihrer Anfrage verarbeitet.
          </p>
          <p>
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
            (vorvertragliche Massnahmen) oder Art. 6 Abs. 1 lit. f DSGVO
            (berechtigtes Interesse an der Bearbeitung von Anfragen).
          </p>

          <h2 className="text-lg font-semibold">4. Speicherdauer</h2>
          <p>
            Ihre Daten werden nur so lange gespeichert, wie dies zur Bearbeitung
            Ihrer Anfrage erforderlich ist oder gesetzliche Aufbewahrungspflichten
            bestehen.
          </p>

          <h2 className="text-lg font-semibold">5. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft ueber Ihre gespeicherten Daten sowie
            auf Berichtigung, Loeschung oder Einschraenkung der Verarbeitung.
            Ausserdem haben Sie das Recht auf Datenuebertragbarkeit.
          </p>
          <p>
            Sie koennen der Verarbeitung Ihrer Daten jederzeit widersprechen,
            sofern diese auf Art. 6 Abs. 1 lit. f DSGVO beruht.
          </p>
          <p>
            Zudem haben Sie das Recht, sich bei einer Aufsichtsbehoerde zu
            beschweren.
          </p>

          <h2 className="text-lg font-semibold">
            6. Keine Verwendung von Tracking-Tools
          </h2>
          <p>
            Diese Website verwendet keine Analyse- oder Tracking-Tools und setzt
            keine zustimmungspflichtigen Cookies ein.
          </p>

          <h2 className="text-lg font-semibold">7. Schriftarten</h2>
          <p>
            Die auf dieser Website verwendeten Schriftarten sind lokal eingebunden.
            Es erfolgt keine Verbindung zu Servern von Drittanbietern (z. B. Google).
          </p>
        </div>
      </div>
    </section>
  )
}
