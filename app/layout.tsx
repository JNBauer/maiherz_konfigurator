import type { Metadata } from "next"
import localFont from "next/font/local"
import Script from "next/script"
import SiteFooter from "@/components/SiteFooter"
import { getVersionedPublicAsset } from "@/lib/getVersionedPublicAsset"
import "./globals.css"

const geistSans = localFont({
  src: "../public/fonts/Borel-Regular.ttf",
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = localFont({
  src: "../public/fonts/GeistMono-VariableFont_wght.ttf",
  variable: "--font-geist-mono",
  display: "swap",
})

const SITE_URL = "https://mai-herz.de"
const sceneImageUrl = getVersionedPublicAsset("/maiherz-scene.png")

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Maiherz Konfigurator | Dein persönliches Maiherz",
    template: "%s | mai-herz.de",
  },
  description:
    "Gestalte dein persönliches Maiherz: Wähle Schrift, Größe, Material und Herzform. Vorschau in 3D und direkt Anfrage stellen.",
  applicationName: "Maiherz Konfigurator",
  creator: "Julian Bauer",
  authors: [{ name: "Julian Bauer" }],
  keywords: [
    "Maiherz",
    "Maiherzen",
    "Maiherz Konfigurator",
    "personalisiertes Maiherz",
    "Lasercut",
    "Laserauftrag",
    "Holzherz",
    "Gravur",
    "Schablone",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "/",
    siteName: "mai-herz.de",
    title: "Maiherz Konfigurator",
    description:
      "Gestalte dein persönliches Maiherz mit 3D Vorschau, Materialien und Lasercheck.",
    images: [
      {
        url: sceneImageUrl,
        alt: "3D Vorschau eines personalisierten Maiherzens",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maiherz Konfigurator",
    description:
      "Gestalte dein persönliches Maiherz mit 3D Vorschau, Materialien und Lasercheck.",
    images: [sceneImageUrl],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "mai-herz.de",
              url: "https://mai-herz.de",
              email: "anfrage@mai-herz.de",
            }),
          }}
        />
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="53c491d2-0571-4f31-95ff-78a135446d04"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
