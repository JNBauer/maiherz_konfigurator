"use client"

import localFont from "next/font/local"
import { useEffect, useMemo, useRef, useState } from "react"

import {
  MIN_LASER_CUT_LINE_DISTANCE_MM,
  THICKNESS_OPTIONS_MM,
  sanitizeNameInput,
  toTitleCase,
  type FontOption,
  type LaserSafetyResult,
  type TextHeartContainmentResult,
  type MaterialKey,
  type TextMaterialKey,
} from "./helpers"

const borel = localFont({
  src: "../../public/fonts/Borel-Regular.ttf",
  variable: "--font-borel",
  display: "swap",
})
const cherryBombOne = localFont({
  src: "../../public/fonts/CherryBombOne-Regular.ttf",
  variable: "--font-cherry",
  display: "swap",
})
const dancingScript = localFont({
  src: "../../public/fonts/DancingScript-VariableFont_wght.ttf",
  variable: "--font-dancing",
  display: "swap",
})
const lobster = localFont({
  src: "../../public/fonts/Lobster-Regular.ttf",
  variable: "--font-lobster",
  display: "swap",
})
const geistMono = localFont({
  src: "../../public/fonts/GeistMono-VariableFont_wght.ttf",
  variable: "--font-geist-mono",
  display: "swap",
})

type ConfiguratorPanelProps = {
  nameValue: string
  onNameChange: (value: string) => void
  includeHeart: boolean
  onIncludeHeartChange: (value: boolean) => void
  fontOptions: FontOption[]
  selectedFontFile: string
  onSelectFont: (file: string) => void
  widthCm: number
  heightCm: number
  minTextHeightCm: number
  maxTextHeightCm: number
  onTextHeightChange: (value: number) => void
  heartWidthCm: number
  minHeartWidthCm: number
  maxHeartWidthCm: number
  onHeartWidthChange: (value: number) => void
  heartHeightCm: number
  minHeartHeightCm: number
  maxHeartHeightCm: number
  onHeartHeightChange: (value: number) => void
  heartVariants: string[]
  selectedHeartVariant: string
  onSelectHeartVariant: (value: string) => void
  materialOptions: Array<{
    key: MaterialKey
    label: string
    available: boolean
  }>
  heartMaterialOptions: Array<{
    key: MaterialKey
    label: string
    available: boolean
  }>
  textMaterialOptions: Array<{
    key: TextMaterialKey
    label: string
    available: boolean
  }>
  textMaterial: TextMaterialKey
  onTextMaterialChange: (value: TextMaterialKey) => void
  heartMaterial: MaterialKey
  onHeartMaterialChange: (value: MaterialKey) => void
  thicknessOptions: number[]
  textThicknessMm: (typeof THICKNESS_OPTIONS_MM)[number]
  onTextThicknessChange: (value: (typeof THICKNESS_OPTIONS_MM)[number]) => void
  heartThicknessMm: (typeof THICKNESS_OPTIONS_MM)[number]
  onHeartThicknessChange: (value: (typeof THICKNESS_OPTIONS_MM)[number]) => void
  spacing: number
  onSpacingChange: (value: number) => void
  textOffsetYcm: number
  onTextOffsetYChange: (value: number) => void
  engravingMode: boolean
  laserSafety: LaserSafetyResult | null
  textFitResult: {
    result: TextHeartContainmentResult
  } | null
  canRunLaserTest: boolean
  onRunLaserTest: () => void
}

function getFontPreviewClass(fontLabel: string) {
  const normalized = fontLabel.toLowerCase()

  if (normalized.includes("borel")) return borel.className
  if (normalized.includes("cherry bomb one")) return cherryBombOne.className
  if (normalized.includes("dancing script")) return dancingScript.className
  if (normalized.includes("lobster")) return lobster.className
  if (normalized.includes("geist") || normalized.includes("mono")) {
    return geistMono.className
  }

  return ""
}

export default function ConfiguratorPanel({
  nameValue,
  onNameChange,
  includeHeart,
  onIncludeHeartChange,
  fontOptions,
  selectedFontFile,
  onSelectFont,
  widthCm,
  heightCm,
  minTextHeightCm,
  maxTextHeightCm,
  onTextHeightChange,
  heartWidthCm,
  minHeartWidthCm,
  maxHeartWidthCm,
  onHeartWidthChange,
  heartHeightCm,
  minHeartHeightCm,
  maxHeartHeightCm,
  onHeartHeightChange,
  heartVariants,
  selectedHeartVariant,
  onSelectHeartVariant,
  materialOptions,
  heartMaterialOptions,
  textMaterialOptions,
  textMaterial,
  onTextMaterialChange,
  heartMaterial,
  onHeartMaterialChange,
  thicknessOptions,
  textThicknessMm,
  onTextThicknessChange,
  heartThicknessMm,
  onHeartThicknessChange,
  spacing,
  onSpacingChange,
  textOffsetYcm,
  onTextOffsetYChange,
  engravingMode,
  laserSafety,
  textFitResult,
  canRunLaserTest,
  onRunLaserTest,
}: ConfiguratorPanelProps) {
  const [fontMenuOpen, setFontMenuOpen] = useState(false)
  const fontMenuRef = useRef<HTMLDivElement | null>(null)
  const activeFontOption = useMemo(() => {
    return fontOptions.find((option) => option.file === selectedFontFile) ?? null
  }, [fontOptions, selectedFontFile])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (fontMenuRef.current && !fontMenuRef.current.contains(target)) {
        setFontMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const inputBase =
    "w-full rounded-lg border border-amber-200/30 bg-stone-900/80 px-3 py-2 text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] placeholder:text-amber-100/50 transition-colors focus:border-amber-200/70 focus:outline-none focus:ring-2 focus:ring-amber-200/25 hover:border-amber-200/50"
  const numberInputBase =
    "w-16 rounded-md border border-amber-200/30 bg-stone-900/80 px-2 py-1 text-xs text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors focus:border-amber-200/70 focus:outline-none focus:ring-2 focus:ring-amber-200/25 hover:border-amber-200/50"
  const selectButtonBase =
    "flex w-full items-center justify-between rounded-lg border border-amber-200/30 bg-stone-900/80 px-3 py-2 text-left text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors hover:border-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-200/25"

  const textSection = (
    <section className="rounded-xl bg-stone-950/20 p-4 text-amber-50 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-amber-100/80">
        Text-Design
      </h3>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <div className="relative">
            <input
              value={nameValue}
              onChange={(e) => onNameChange(sanitizeNameInput(e.target.value))}
              className={`${inputBase} pr-44`}
              placeholder="Name"
              maxLength={20}
            />

            <div className="absolute inset-y-1 right-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNameChange(toTitleCase(nameValue))}
                className="rounded bg-amber-200/20 px-2 py-1 text-[10px] text-amber-50 hover:bg-amber-200/30"
              >
                Title Case
              </button>

              <button
                type="button"
                onClick={() => onNameChange(nameValue.toUpperCase())}
                className="rounded bg-amber-200/20 px-2 py-1 text-[10px] text-amber-50 hover:bg-amber-200/30"
              >
                CAPITALIZED
              </button>
            </div>
          </div>
        </label>

        <div ref={fontMenuRef} className="relative">
          <div className="mb-1 text-sm">Schriftart</div>
          <button
            type="button"
            onClick={() => setFontMenuOpen((open) => !open)}
            className={selectButtonBase}
          >
            <span className={getFontPreviewClass(activeFontOption?.label ?? "")}>
              {activeFontOption?.label ?? "Font waehlen"}
            </span>
            <span className="ml-3 text-xs text-amber-100/70">v</span>
          </button>

          {fontMenuOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-52 overflow-y-auto rounded-lg border border-amber-200/30 bg-stone-950/95 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
              {fontOptions.map((option) => (
                <button
                  key={option.file}
                  type="button"
                  onClick={() => {
                    onSelectFont(option.file)
                    setFontMenuOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-amber-50 hover:bg-amber-200/10 ${
                    option.file === selectedFontFile ? "bg-amber-200/15" : ""
                  } ${getFontPreviewClass(option.label)}`}
                >
                  <span>{option.label}</span>
                  {option.file === selectedFontFile && (
                    <span className="text-xs text-amber-100/80">ok</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Größe ({widthCm.toFixed(1)} x {heightCm.toFixed(1)} cm)
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={minTextHeightCm}
              max={maxTextHeightCm}
              step="0.1"
              value={heightCm}
              onChange={(e) => onTextHeightChange(Number(e.target.value))}
              className="w-full accent-amber-300"
            />
            <input
              type="number"
              min={minTextHeightCm}
              max={maxTextHeightCm}
              step={0.1}
              value={Number(heightCm.toFixed(1))}
              onChange={(e) => {
                const next = Number(e.target.value)
                if (Number.isNaN(next)) return
                onTextHeightChange(next)
              }}
              className={`${numberInputBase} number-input text-right`}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Spacing {spacing.toFixed(3)}
          <input
            type="range"
            min="-0.2"
            max="0.3"
            step="0.005"
            value={spacing}
            onChange={(e) => onSpacingChange(Number(e.target.value))}
            className="accent-amber-300"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1 text-sm">
          Vertikale Position ( {textOffsetYcm.toFixed(1)} cm )
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={-10}
              max={10}
              step={0.1}
              value={textOffsetYcm}
              onChange={(e) => onTextOffsetYChange(Number(e.target.value))}
              className="w-full accent-amber-300"
            />
            <input
              type="number"
              min={-10}
              max={10}
              step={0.1}
              value={Number(textOffsetYcm.toFixed(1))}
              onChange={(e) => {
                const next = Number(e.target.value)
                if (Number.isNaN(next)) return
                onTextOffsetYChange(next)
              }}
              className={`${numberInputBase} number-input text-right`}
            />
          </div>
        </label>

        <div className="mt-3 flex flex-col gap-1 text-sm">
          Material
          <div className="flex flex-wrap gap-2">
            {textMaterialOptions.map((option) => {
              const active = textMaterial === option.key
              const engravingLocked = option.key === "engraving" && !includeHeart
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onTextMaterialChange(option.key)}
                  disabled={!option.available || engravingLocked}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    active
                      ? "border-amber-200 bg-amber-100/25 text-amber-100"
                    : option.available
                        ? "border-white/35 bg-white/15 text-amber-50"
                        : "cursor-not-allowed border-white/20 bg-white/10 text-amber-50/50"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      active
                        ? "bg-amber-200"
                        : option.available
                          ? "bg-transparent ring-1 ring-amber-100"
                          : "bg-transparent ring-1 ring-amber-100/40"
                    }`}
                  />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className={`mt-3 flex flex-col gap-1 text-sm ${engravingMode ? "opacity-60" : ""}`}>
          Dicke ({textThicknessMm} mm)
          <div className="flex flex-wrap gap-2">
            {thicknessOptions.map((option) => {
              const active = textThicknessMm === option
              return (
                <button
                  key={`text-${option}`}
                  type="button"
                  onClick={() =>
                    onTextThicknessChange(
                      option as (typeof THICKNESS_OPTIONS_MM)[number]
                    )
                  }
                  disabled={engravingMode}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    active
                      ? "border-amber-200 bg-amber-100/25 text-amber-100"
                      : "border-white/35 bg-white/15 text-amber-50"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      active
                        ? "bg-amber-200"
                        : "bg-transparent ring-1 ring-amber-100"
                    }`}
                  />
                  {option} mm
                </button>
              )
            })}
          </div>
        </div>
      </section>
  )

  const heartSection = (
    <section className="rounded-xl bg-stone-950/20 p-4 text-amber-50 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold tracking-wide text-amber-100/80">
            Herz-Design
          </h3>
          <label className="flex items-center gap-3 text-xs font-semibold text-amber-100/90">
            Herz aktiv
            <span className="relative inline-flex h-6 w-11 items-center">
              <input
                type="checkbox"
                checked={includeHeart}
                onChange={(e) => onIncludeHeartChange(e.target.checked)}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full border border-white/30 bg-white/10 transition peer-checked:border-amber-200/80 peer-checked:bg-amber-200/50" />
              <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
            </span>
          </label>
        </div>

        <div className={includeHeart ? "" : "opacity-60"}>
          <div className="mb-3">
            <div className="mb-2 text-xs tracking-wide text-amber-100/80">
              Herz Varianten
            </div>
            <div className="grid grid-cols-4 gap-2">
              {heartVariants.map((variant) => {
                const active = selectedHeartVariant === variant
                return (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => onSelectHeartVariant(variant)}
                    disabled={!includeHeart}
                    className={`flex h-12 items-center justify-center rounded border ${
                      active
                        ? "border-amber-200 bg-amber-100/20"
                        : "border-white/20 bg-white/10 hover:bg-white/15"
                    }`}
                  >
                    <img
                      src={variant}
                      alt="Herzvariante"
                      className="h-9 w-9 object-contain"
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Breite ({heartWidthCm.toFixed(1)} cm)
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={minHeartWidthCm}
                max={maxHeartWidthCm}
                step="0.1"
                value={heartWidthCm}
                onChange={(e) => onHeartWidthChange(Number(e.target.value))}
                className="w-full accent-amber-300"
                disabled={!includeHeart}
              />
              <input
                type="number"
                min={minHeartWidthCm}
                max={maxHeartWidthCm}
                step={0.1}
                value={Number(heartWidthCm.toFixed(1))}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  if (Number.isNaN(next)) return
                  onHeartWidthChange(next)
                }}
                className={`${numberInputBase} number-input text-right`}
                disabled={!includeHeart}
              />
            </div>
          </label>

          <label className="mt-3 flex flex-col gap-1 text-sm">
            Höhe ({heartHeightCm.toFixed(1)} cm)
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={minHeartHeightCm}
                max={maxHeartHeightCm}
                step="0.1"
                value={heartHeightCm}
                onChange={(e) => onHeartHeightChange(Number(e.target.value))}
                className="w-full accent-amber-300"
                disabled={!includeHeart}
              />
              <input
                type="number"
                min={minHeartHeightCm}
                max={maxHeartHeightCm}
                step={0.1}
                value={Number(heartHeightCm.toFixed(1))}
                onChange={(e) => {
                  const next = Number(e.target.value)
                  if (Number.isNaN(next)) return
                  onHeartHeightChange(next)
                }}
                className={`${numberInputBase} number-input text-right`}
                disabled={!includeHeart}
              />
            </div>
          </label>
        </div>

        <div className={`mt-3 flex flex-col gap-1 text-sm ${includeHeart ? "" : "opacity-60"}`}>
          Material
          <div className="flex flex-wrap gap-2">
            {heartMaterialOptions.map((option) => {
              const active = heartMaterial === option.key
              return (
                <button
                  key={`heart-${option.key}`}
                  type="button"
                  onClick={() => onHeartMaterialChange(option.key)}
                  disabled={!option.available || !includeHeart}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    active
                      ? "border-amber-200 bg-amber-100/25 text-amber-100"
                      : option.available
                        ? "border-white/35 bg-white/15 text-amber-50"
                        : "cursor-not-allowed border-white/20 bg-white/10 text-amber-50/50"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      active
                        ? "bg-amber-200"
                        : option.available
                          ? "bg-transparent ring-1 ring-amber-100"
                          : "bg-transparent ring-1 ring-amber-100/40"
                    }`}
                  />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className={`mt-3 flex flex-col gap-1 text-sm ${includeHeart ? "" : "opacity-60"}`}>
          Materialdicke ({heartThicknessMm} mm)
          <div className="flex flex-wrap gap-2">
            {thicknessOptions.map((option) => {
              const active = heartThicknessMm === option
              return (
                <button
                  key={`heart-thickness-${option}`}
                  type="button"
                  onClick={() =>
                    onHeartThicknessChange(
                      option as (typeof THICKNESS_OPTIONS_MM)[number]
                    )
                  }
                  disabled={!includeHeart}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                    active
                      ? "border-amber-200 bg-amber-100/25 text-amber-100"
                      : "border-white/35 bg-white/15 text-amber-50"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      active
                        ? "bg-amber-200"
                        : "bg-transparent ring-1 ring-amber-100"
                    }`}
                  />
                  {option} mm
                </button>
              )
            })}
          </div>
        </div>
      </section>
  )

  const laserSection = (
    <section className="rounded-xl bg-stone-950/20 p-4 text-amber-50 backdrop-blur-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-100/80">
          Laser
        </h3>
        <button
          type="button"
          onClick={onRunLaserTest}
          disabled={!canRunLaserTest}
          className="mt-3 rounded border border-white/35 bg-white/15 px-3 py-2 text-xs text-amber-50 hover:bg-white/25 disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-white/10 disabled:text-amber-50/50"
        >
          Lasertest ausfuehren
        </button>

        {laserSafety && (
          <p
            className={`mt-2 text-xs ${
              laserSafety.isSafe ? "text-emerald-200" : "text-rose-200"
            }`}
          >
            {laserSafety.isSafe
              ? `Lasertest bestanden: duennste Stelle ${laserSafety.minimumDistanceMm?.toFixed(1)} mm (>= ${MIN_LASER_CUT_LINE_DISTANCE_MM} mm).`
              : `Lasertest nicht bestanden: duennste Stelle ${laserSafety.minimumDistanceMm?.toFixed(1)} mm (< ${MIN_LASER_CUT_LINE_DISTANCE_MM} mm).`}
          </p>
        )}

        {textFitResult && (
          <p
            className={`mt-2 text-xs ${
              textFitResult.result.isSafe ? "text-emerald-200" : "text-rose-200"
            }`}
          >
            {textFitResult.result.isSafe
              ? `Text im Herz: Abstand >= ${textFitResult.result.marginMm} mm.`
              : `Text ausserhalb des Herzens (Sicherheitsabstand ${textFitResult.result.marginMm} mm).`}
          </p>
        )}
      </section>
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center px-6">
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-[22rem] lg:w-[clamp(17rem,28vw,22rem)]">
          <div className="pointer-events-auto">{heartSection}</div>
        </div>
        <div className="flex w-full max-w-[22rem] flex-col gap-4 lg:w-[clamp(17rem,28vw,22rem)]">
          <div className="pointer-events-auto">{textSection}</div>
          <div className="pointer-events-auto">{laserSection}</div>
        </div>
      </div>
    </div>
  )
}
