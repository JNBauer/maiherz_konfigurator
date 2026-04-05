import HeroHeader from "@/components/HeroHeader"

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen w-full bg-transparent pt-4">
      <HeroHeader />
      <main className="w-full px-3 pb-6 pt-5 md:px-6 md:pt-7">
        <section className="mx-auto w-[90%] max-w-4xl text-stone-900">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-semibold">Nutzungsbedingungen</h1>
            <div className="mt-6 space-y-4 text-sm leading-6 text-stone-700">
              <p>
                This is placeholder content for the Terms of Use page. Replace this
                text with your final legal wording.
              </p>
              <p>
                Section 1: Scope. Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua.
              </p>
              <p>
                Section 2: User obligations. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Ut enim ad minim veniam.
              </p>
              <p>
                Section 3: Liability and final provisions. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Duis aute irure dolor in reprehenderit.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
