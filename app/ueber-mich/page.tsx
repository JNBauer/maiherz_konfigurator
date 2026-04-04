import HeroHeader from "@/components/HeroHeader"

export default function UeberMichPage() {
  return (
    <div className="min-h-screen w-full bg-stone-100 pt-4">
      <HeroHeader />
      <main className="w-full px-3 pb-6 pt-5 md:px-6 md:pt-7">
        <section className="mx-auto w-[90%] max-w-4xl text-stone-900">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-semibold">??ber mich</h1>
            <div className="mt-6 space-y-5 text-base leading-7 text-stone-800">
              <p>
                Hier entsteht eine kurze Vorstellung. Erzaehle, warum du Maiherzen
                machst, wie du arbeitest und was dir bei der Gestaltung wichtig ist.
              </p>
              <p>
                Fuege hier gerne ein paar persoenliche Zeilen oder ein Foto ein.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
