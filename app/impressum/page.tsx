export default function ImpressumPage() {
  return (
    <section className="mx-auto w-[90%] max-w-4xl py-10">
      <h1 className="text-3xl font-semibold text-stone-900">Impressum</h1>
      <div className="mt-6 space-y-4 text-sm leading-6 text-stone-700">
        <p>
          Dies ist ein Platzhaltertext fuer das Impressum. Ersetzen Sie alle
          Inhalte mit den rechtlich erforderlichen Angaben.
        </p>
        <p>
          Anbieter: Musterfirma GmbH
          <br />
          Musterstrasse 12
          <br />
          12345 Musterstadt
          <br />
          Deutschland
        </p>
        <p>
          Vertreten durch: Max Mustermann
          <br />
          E-Mail: kontakt@beispiel.de
          <br />
          Telefon: +49 0000 000000
        </p>
        <p>
          Registereintrag und USt-IdNr.: Lorem ipsum dolor sit amet, consectetur
          adipiscing elit.
        </p>
      </div>
    </section>
  )
}
