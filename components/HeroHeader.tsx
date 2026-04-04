"use client"

export default function HeroHeader() {
  return (
    <div className="w-full px-3 md:px-6">
      <header
        className="relative mx-auto w-[90%] overflow-hidden rounded-xl bg-stone-950 bg-center bg-cover px-4 py-8 md:px-8 md:py-10"
        style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-amber-950/40 to-stone-900" />
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(1200px_circle_at_20%_0%,rgba(251,191,36,0.12),transparent_55%),radial-gradient(900px_circle_at_80%_20%,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="relative grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="hidden md:block" />

          <div className="flex items-center justify-center md:col-start-2">
            <img
              src="/hero_text_maiherz.svg"
              alt="Kreiere dein persoenliches Maiherz"
              className="h-28 w-auto md:h-44"
            />
          </div>

          <div className="flex flex-col items-center md:col-start-3 md:items-end">
            <div className="flex min-w-[12rem] flex-col items-stretch gap-2">
              <a
                href="/ueber-mich"
                className="rounded-full bg-amber-900/60 px-5 py-2 text-center text-sm font-medium text-amber-50 transition hover:bg-amber-900/70"
              >
                Ãœber mich
              </a>

              <a
                href="/"
                className="rounded-full bg-amber-900/60 px-5 py-2 text-center text-sm font-medium text-amber-50 transition hover:bg-amber-900/70"
              >
                Konfigurator
              </a>

              <a
                href="/acknowledgment"
                className="rounded-full bg-amber-900/60 px-5 py-2 text-center text-sm font-medium text-amber-50 transition hover:bg-amber-900/70"
              >
                Acknowledgments
              </a>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
