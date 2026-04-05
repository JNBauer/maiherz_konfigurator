import HeroHeader from "@/components/HeroHeader"

export default function UeberMichPage() {
  return (
    <div className="min-h-screen w-full bg-stone-100 pt-4">
      <HeroHeader />
      <main className="w-full px-3 pb-6 pt-5 md:px-6 md:pt-7">
        <section className="mx-auto w-[90%] max-w-4xl text-stone-900">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-semibold">Über mich</h1>

            <div className="mt-6 space-y-5 text-base leading-7 text-stone-800">
              <p>
                Ich mag die Tradition der Maiherzen total, vor allem auch das
                Handwerk dahinter. Man kann dabei immer ein Stück Persönlichkeit
                mit einbringen.
              </p>

              <p>
                Am besten ist es natürlich, wenn jede und jeder sein Herz
                selbst aussägt und gestaltet. Aber ich weiß auch, dass dafür
                nicht immer Zeit bleibt.
              </p>

              <p>
                Deshalb biete ich an, individuell gestaltete Herzen für dich
                auszusägen, sodass du sie anschließend nur noch selbst bemalen
                musst. So bleibt es persönlich, aber ein Teil der Arbeit ist
                schon erledigt.
              </p>

              <p>
                Wenn du Ideen, Verbesserungsvorschläge oder Feedback hast,
                freue ich mich immer darüber.
              </p>

              <p>
                Danke fürs Vorbeischauen und viele Grüße<br />
                Julian
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}