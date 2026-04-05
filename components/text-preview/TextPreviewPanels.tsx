"use client"

import type { TextHeartContainmentResult, LaserSafetyResult } from "./helpers"

type TextPreviewPanelsProps = {
  printPaperSize: "A4" | "A3"
  setPrintPaperSize: (value: "A4" | "A3") => void
  printOverlapMm: number
  setPrintOverlapMm: (value: number) => void
  onDownloadPdf: () => void
  printStatus: "idle" | "loading" | "error"
  printError: string | null
  onDownloadScreenshot: () => void
  canScreenshot: boolean
  widthCm: number
  heightCm: number
  hasHeart: boolean
  heartWidthCm: number
  heartHeightCm: number
  laserSafety: LaserSafetyResult | null
  textFitResult: { result: TextHeartContainmentResult } | null
  roughAreaM2: number
  roughPriceEur: number
  priceFormatter: Intl.NumberFormat
  hasRunLaserTest: boolean
  canRunLaserTest: boolean
  onRunLaserTest: () => void
  contactName: string
  setContactName: (value: string) => void
  contactEmail: string
  setContactEmail: (value: string) => void
  contactPhone: string
  setContactPhone: (value: string) => void
  contactMessage: string
  setContactMessage: (value: string) => void
  onSendRequest: () => void
  canSubmitRequest: boolean
  requestStatus: "idle" | "sending" | "success" | "error"
  requestError: string | null
}

export default function TextPreviewPanels({
  printPaperSize,
  setPrintPaperSize,
  printOverlapMm,
  setPrintOverlapMm,
  onDownloadPdf,
  printStatus,
  printError,
  onDownloadScreenshot,
  canScreenshot,
  widthCm,
  heightCm,
  hasHeart,
  heartWidthCm,
  heartHeightCm,
  laserSafety,
  textFitResult,
  roughAreaM2,
  roughPriceEur,
  priceFormatter,
  hasRunLaserTest,
  canRunLaserTest,
  onRunLaserTest,
  contactName,
  setContactName,
  contactEmail,
  setContactEmail,
  contactPhone,
  setContactPhone,
  contactMessage,
  setContactMessage,
  onSendRequest,
  canSubmitRequest,
  requestStatus,
  requestError,
}: TextPreviewPanelsProps) {
  const successIcon = (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3">
        <path
          fill="currentColor"
          d="M7.6 13.2 4.7 10.3l1.4-1.4 1.5 1.5 6.1-6.1 1.4 1.4z"
        />
      </svg>
    </span>
  )

  return (
    <section className="mx-auto mt-4 w-[90%] pb-6 md:mt-5 md:pb-8">
      <div className="grid gap-6 md:grid-cols-2">
        <article
          className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-4 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)] md:p-5"
          style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
        >
          <h3 className="text-lg font-semibold text-amber-100">
            Download &amp; Print
          </h3>
          <div className="mt-4 grid gap-3 text-amber-100/80">
            <label className="grid gap-1 text-sm">
              Papierformat
              <select
                className="rounded border border-amber-200/25 bg-stone-900/80 px-3 py-2 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                value={printPaperSize}
                onChange={(e) => setPrintPaperSize(e.target.value as "A4" | "A3")}
              >
                <option value="A4">A4 (Standard)</option>
                <option value="A3">A3</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Üerlappung zum Zusammenkleben (mm)
              <input
                type="number"
                min={0}
                max={30}
                step={1}
                className="rounded border border-amber-200/25 bg-stone-900/80 px-3 py-2 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                value={Number(printOverlapMm.toFixed(0))}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  if (Number.isNaN(next)) return
                  setPrintOverlapMm(Math.max(0, Math.min(30, next)))
                }}
              />
            </label>
            <p className="text-xs leading-5 text-amber-100/70">
              Das PDF ist massstabgetreu. Grosse Designs werden automatisch
              auf mehrere Seiten verteilt und mit Überlappungen markiert,
              damit du sie einfach zusammenkleben kannst.
            </p>
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={printStatus === "loading"}
              className="mt-2 rounded border border-amber-200/30 bg-amber-100/15 px-4 py-2 text-sm font-medium text-amber-50 transition hover:bg-amber-100/25 disabled:cursor-not-allowed disabled:border-amber-200/10 disabled:bg-stone-900/60 disabled:text-amber-100/50"
            >
              {printStatus === "loading"
                ? "PDF wird erstellt..."
                : "PDF herunterladen"}
            </button>
            <button
              type="button"
              onClick={onDownloadScreenshot}
              disabled={!canScreenshot}
              className="rounded border border-amber-200/30 bg-amber-100/10 px-4 py-2 text-sm font-medium text-amber-50 transition hover:bg-amber-100/20 disabled:cursor-not-allowed disabled:border-amber-200/10 disabled:bg-stone-900/60 disabled:text-amber-100/50"
            >
              Screenshot herunterladen
            </button>
            {printStatus === "error" && printError && (
              <p className="text-sm text-rose-200">{printError}</p>
            )}
          </div>
        </article>

        <div className="flex flex-col gap-4">
          <article
            className="relative overflow-hidden rounded-xl border border-amber-200/20 bg-stone-950/30 bg-center bg-cover bg-blend-multiply p-4 text-amber-50 shadow-[0_18px_45px_rgba(0,0,0,0.35)] md:p-5"
            style={{ backgroundImage: "url('/plywood_diff_1k_darkened.jpg')" }}
          >
            <h3 className="text-lg font-semibold text-amber-100">
              Laserauftrag
            </h3>
            <div className="mt-4 grid gap-4">
              <div className="rounded-lg border border-amber-200/20 bg-stone-900/70 p-3">
                <h4 className="text-sm font-semibold text-amber-100">
                  Objekte &amp; Lasertest
                </h4>
                <div className="mt-2 grid gap-3 text-sm text-amber-100/80">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-sm text-amber-50">
                      <span className="text-xs uppercase tracking-wide text-amber-100/60">
                        Text
                      </span>
                      : {widthCm.toFixed(1)} x {heightCm.toFixed(1)} cm
                    </div>
                    <div className="text-sm text-amber-50">
                      <span className="text-xs uppercase tracking-wide text-amber-100/60">
                        Herz
                      </span>
                      :{" "}
                      {hasHeart
                        ? `${heartWidthCm.toFixed(1)} x ${heartHeightCm.toFixed(1)} cm`
                        : "deaktiviert"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-50">
                      <span className="text-xs uppercase tracking-wide text-amber-100/60">
                        Linienabstand
                      </span>
                      {laserSafety ? (
                        laserSafety.isSafe ? (
                          successIcon
                        ) : (
                          <span className="text-rose-200">
                            nicht bestanden
                          </span>
                        )
                      ) : (
                        <span className="text-amber-200">nicht getestet</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-50">
                      <span className="text-xs uppercase tracking-wide text-amber-100/60">
                        Text im Herz
                      </span>
                      {!hasHeart ? (
                        <span className="text-amber-100/60">-</span>
                      ) : textFitResult ? (
                          textFitResult.result.isSafe ? (
                            successIcon
                          ) : (
                            <span className="text-rose-200">
                              nicht bestanden
                            </span>
                          )
                        ) : (
                          <span className="text-amber-200">nicht getestet</span>
                        )}
                    </div>
                  </div>
                  <div className="pt-1 text-amber-100/70">
                    Fläche gesamt: {roughAreaM2.toFixed(3)} m2
                  </div>
                  <div className="text-base font-semibold text-amber-50">
                    {priceFormatter.format(roughPriceEur)}
                  </div>
                </div>
                {!hasRunLaserTest && (
                  <div className="mt-3 rounded border border-amber-200/30 bg-amber-100/15 px-3 py-2 text-xs text-amber-100">
                    Bitte Lasertest ausführen, um die Anfrage freizuschalten.
                  </div>
                )}
                <button
                  type="button"
                  onClick={onRunLaserTest}
                  disabled={!canRunLaserTest}
                  className="mt-3 rounded border border-amber-200/30 bg-amber-100/15 px-3 py-2 text-xs font-medium text-amber-50 transition hover:bg-amber-100/25 disabled:cursor-not-allowed disabled:border-amber-200/10 disabled:bg-stone-900/60 disabled:text-amber-100/50"
                >
                  Lasertest ausfÜhren
                </button>
              </div>

              <div className="rounded-lg border border-amber-200/20 bg-stone-900/70 p-3">
                <h4 className="text-sm font-semibold text-amber-100">
                  Kontakt
                </h4>
                <form className="mt-3 grid gap-3 text-amber-100/80">
                  <label className="grid gap-1 text-sm">
                    Vollständiger Name
                    <input
                      type="text"
                      placeholder="Max Mustermann"
                      className="rounded border border-amber-200/25 bg-stone-900/80 px-3 py-2 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    E-Mail
                    <input
                      type="email"
                      placeholder="name@beispiel.de"
                      className="rounded border border-amber-200/25 bg-stone-900/80 px-3 py-2 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Telefonnummer (optional)
                    <input
                      type="tel"
                      placeholder="+49 ..."
                      className="rounded border border-amber-200/25 bg-stone-900/80 px-3 py-2 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Nachricht
                    <textarea
                      rows={3}
                      placeholder="Hinweise zum Design oder Wunschlieferzeit"
                      className="rounded border border-amber-200/25 bg-stone-900/80 px-3 py-2 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                    />
                  </label>
                  <p className="text-xs leading-5 text-amber-100/70">
                    Mit dem Absenden des Formulars erklaerst du dich damit
                    einverstanden, dass deine Angaben zur Bearbeitung deiner Anfrage
                    verarbeitet werden. Weitere Informationen findest du in unserer
                    Datenschutzerklärung.
                  </p>
                  <p className="text-xs leading-5 text-amber-100/70">
                    Die über den Konfigurator übermittelten Anfragen stellen kein
                    verbindliches Angebot dar.
                  </p>
                  <button
                    type="button"
                    onClick={onSendRequest}
                    disabled={!canSubmitRequest}
                    className="mt-2 rounded bg-amber-200/20 px-4 py-2 text-sm font-medium text-amber-50 transition hover:bg-amber-200/30 disabled:cursor-not-allowed disabled:bg-stone-900/60 disabled:text-amber-100/50"
                  >
                    {requestStatus === "sending"
                      ? "Wird gesendet..."
                      : "Auftragsanfrage abschicken"}
                  </button>
                  {!hasRunLaserTest && (
                    <p className="text-xs text-amber-200">
                      Lasertest erforderlich, bevor du die Anfrage absenden kannst.
                    </p>
                  )}
                  {requestStatus === "success" && (
                    <p className="text-sm text-emerald-200">
                      Anfrage wurde gesendet. Danke!
                    </p>
                  )}
                  {requestStatus === "error" && requestError && (
                    <p className="text-sm text-rose-200">{requestError}</p>
                  )}
                </form>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
