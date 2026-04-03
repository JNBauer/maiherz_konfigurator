export default function ImpressumPage() {
  return (
    <section className="mx-auto w-[90%] max-w-4xl py-10">
      <h1 className="text-3xl font-semibold text-stone-900">
        Impressum
      </h1>

      <div className="mt-6 space-y-4 text-sm leading-6 text-stone-700">
        <p>Angaben gemäß § 5 DDG</p>

        <p>
          Julian Bauer<br />
          [Provinzialstraße 26]<br />
          [53850]<br />
          Deutschland
        </p>

        <p>
          Kontakt:<br />
          E-Mail:{" "}
          <a href="mailto:deine-email@example.com">
            deine-email@example.com
          </a>
          <br />
          Telefon:{" "}
          <a href="tel:+49123456789">
            +49 123 456789
          </a>
        </p>

        <p>
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br />
          Julian Bauer<br />
          [Straße Hausnummer]<br />
          [PLZ Ort]<br />
          Deutschland
        </p>
      </div>
    </section>
  );
}