import HeroHeader from "@/components/HeroHeader"

export default function AcknowledgmentPage() {
  return (
    <div className="min-h-screen w-full bg-stone-100 pt-4">
      <HeroHeader />
      <main className="w-full px-3 pb-6 pt-5 md:px-6 md:pt-7">
        <section className="mx-auto w-[90%] max-w-4xl text-stone-900">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-semibold">Acknowledgments</h1>
            <div className="mt-6 space-y-5 text-base leading-7 text-stone-800">
              <p>
                Fonts, textures, and 3D assets used in this configurator are credited
                here. If you notice missing attributions, please get in touch.
              </p>
              <h2 className="text-lg font-semibold">Fonts</h2>
              <p>
                Borel, Cherry Bomb One, Dancing Script, Geist, Geist Mono, Josefin Sans,
                Lobster.
              </p>
              <h2 className="text-lg font-semibold">Textures</h2>
              <p>Birch log header image and HDR environment maps.</p>
              <h2 className="text-lg font-semibold">3D Models</h2>
              <p>Workbench scene model and scene props.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
