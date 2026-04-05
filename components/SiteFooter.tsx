export default function SiteFooter() {
  return (
    <footer className="relative z-30 border-t border-amber-200/30 bg-stone-950/60 backdrop-blur">
      <div className="mx-auto flex w-[90%] flex-col gap-3 py-5 text-sm text-amber-100/80 md:flex-row md:items-center md:justify-between">
        
        <p>
          © {new Date().getFullYear()} Julian Bauer · mai-herz.de
        </p>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href="/impressum" className="hover:text-amber-50 hover:underline">
            Impressum
          </a>
          <a href="/nutzungsbedingungen" className="hover:text-amber-50 hover:underline">
            Nutzungsbedingungen
          </a>
          <a href="/datenschutz" className="hover:text-amber-50 hover:underline">
            Datenschutz
          </a>
        </nav>

      </div>
    </footer>
  )
}
