export default function ImpressumPage() {
  return (
    <section className="mx-auto w-[90%] max-w-4xl py-10 text-stone-900">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Impressum</h1>

        <div className="mt-6 space-y-5 text-base leading-7 text-stone-800">
          <p>Angaben gemaess § 5 DDG</p>

          <p>
            Julian Bauer<br />
            [Provinzialstrasse 26]<br />
            [53850]<br />
            Deutschland
          </p>

          <p>
            Kontakt:<br />
            E-Mail:{" "}
            <a href="mailto:deine-email@example.com" className="underline">
              deine-email@example.com
            </a>
            <br />
            Telefon:{" "}
            <a href="tel:+49123456789" className="underline">
              +49 123 456789
            </a>
          </p>

          <p>
            Verantwortlich fuer den Inhalt nach § 18 Abs. 2 MStV:<br />
            Julian Bauer<br />
            [Strasse Hausnummer]<br />
            [PLZ Ort]<br />
            Deutschland
          </p>
        </div>
      </div>
    </section>
  )
}
