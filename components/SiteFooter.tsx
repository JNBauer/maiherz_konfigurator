import Link from "next/link"

export default function SiteFooter() {
  return (
    <footer className="relative z-30 border-t border-stone-300 bg-stone-100">
      <div className="mx-auto flex w-[90%] flex-col gap-3 py-4 text-sm text-stone-700 md:flex-row md:items-center md:justify-between">
        <p>(c) {new Date().getFullYear()} Maiherz-Konfigurator</p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/impressum" className="hover:underline">
            Impressum
          </Link>
          <Link href="/terms-of-use" className="hover:underline">
            Terms of Use
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  )
}
