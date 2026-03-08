"use client"

import {
  Borel,
  Cherry_Bomb_One,
  Dancing_Script,
  Josefin_Sans,
  Lobster,
} from "next/font/google"
import { useEffect, useMemo, useRef, useState } from "react"

import {
  sanitizeNameInput,
  toTitleCase,
  type FontOption,
  type MaterialKey,
} from "./helpers"

const borel = Borel({ weight: "400", subsets: ["latin"] })
const cherryBombOne = Cherry_Bomb_One({ weight: "400", subsets: ["latin"] })
const dancingScript = Dancing_Script({ weight: "400", subsets: ["latin"] })
const josefinSans = Josefin_Sans({ weight: "400", subsets: ["latin"] })
const lobster = Lobster({ weight: "400", subsets: ["latin"] })

type ConfiguratorPanelProps = {
  nameValue: string
  onNameChange: (value: string) => void
  fontOptions: FontOption[]
  selectedFontFile: string
  onSelectFont: (file: string) => void
  widthCm: number
  minWidthCm: number
  maxWidthCm: number
  onWidthChange: (value: number) => void
  heightCm: number
  minHeightCm: number
  maxHeightCm: number
  onHeightChange: (value: number) => void
  materialOptions: Array<{
    key: MaterialKey
    label: string
    available: boolean
  }>
  selectedMaterial: MaterialKey
  onMaterialChange: (value: MaterialKey) => void
  thicknessOptions: number[]
  thicknessMm: number
  onThicknessChange: (value: number) => void
  spacing: number
  onSpacingChange: (value: number) => void
  stockInfoText: string | null
}

function getFontPreviewClass(fontLabel: string) {
  const normalized = fontLabel.toLowerCase()

  if (normalized.includes("borel")) return borel.className
  if (normalized.includes("cherry bomb one")) return cherryBombOne.className
  if (normalized.includes("dancing script")) return dancingScript.className
  if (normalized.includes("josefin sans")) return josefinSans.className
  if (normalized.includes("lobster")) return lobster.className

  return ""
}

export default function ConfiguratorPanel({
  nameValue,
  onNameChange,
  fontOptions,
  selectedFontFile,
  onSelectFont,
  widthCm,
  minWidthCm,
  maxWidthCm,
  onWidthChange,
  heightCm,
  minHeightCm,
  maxHeightCm,
  onHeightChange,
  materialOptions,
  selectedMaterial,
  onMaterialChange,
  thicknessOptions,
  thicknessMm,
  onThicknessChange,
  spacing,
  onSpacingChange,
  stockInfoText,
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

  return (
    <div className="absolute right-14 top-1/2 z-20 w-[clamp(17rem,28vw,22rem)] max-w-[calc(100%-2.5rem)] -translate-y-1/2">
      <div className="flex max-h-[calc(100%-1.5rem)] flex-col gap-4 overflow-y-auto rounded-xl bg-stone-950/20 p-4 text-amber-50 backdrop-blur-sm">
        <label className="flex flex-col gap-1 text-sm">
          Name
          <div className="relative">
            <input
              value={nameValue}
              onChange={(e) => onNameChange(sanitizeNameInput(e.target.value))}
              className="w-full rounded border border-white/35 bg-white/85 p-2 pr-44 text-stone-900"
              placeholder="Name"
              maxLength={20}
            />

            <div className="absolute inset-y-1 right-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNameChange(toTitleCase(nameValue))}
                className="rounded bg-stone-800/80 px-2 py-1 text-[10px] text-stone-100 hover:bg-stone-800"
              >
                Title Case
              </button>

              <button
                type="button"
                onClick={() => onNameChange(nameValue.toUpperCase())}
                className="rounded bg-stone-800/80 px-2 py-1 text-[10px] text-stone-100 hover:bg-stone-800"
              >
                CAPITALIZED
              </button>
            </div>
          </div>
        </label>

        <div ref={fontMenuRef} className="relative">
          <div className="mb-1 text-sm">Font type</div>
          <button
            type="button"
            onClick={() => setFontMenuOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded border border-white/35 bg-white/85 px-3 py-2 text-left text-stone-900"
          >
            <span className={getFontPreviewClass(activeFontOption?.label ?? "")}>
              {activeFontOption?.label ?? "Font waehlen"}
            </span>
            <span className="ml-3 text-xs text-stone-600">v</span>
          </button>

          {fontMenuOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 max-h-52 overflow-y-auto rounded border border-stone-300 bg-white shadow-lg">
              {fontOptions.map((option) => (
                <button
                  key={option.file}
                  type="button"
                  onClick={() => {
                    onSelectFont(option.file)
                    setFontMenuOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-stone-900 hover:bg-stone-100 ${getFontPreviewClass(option.label)}`}
                >
                  <span>{option.label}</span>
                  {option.file === selectedFontFile && (
                    <span className="text-xs text-stone-500">ok</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Breite ({widthCm.toFixed(1)} cm)
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={minWidthCm}
              max={maxWidthCm}
              step="0.1"
              value={widthCm}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              min={minWidthCm}
              max={maxWidthCm}
              step={0.1}
              value={Number(widthCm.toFixed(1))}
              onChange={(e) => {
                const next = Number(e.target.value)
                if (Number.isNaN(next)) return
                onWidthChange(next)
              }}
              className="w-16 rounded border border-white/35 bg-white/85 px-2 py-1 text-xs text-stone-900"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          {"H\u00f6he"} ({heightCm.toFixed(1)} cm)
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={minHeightCm}
              max={maxHeightCm}
              step="0.1"
              value={heightCm}
              onChange={(e) => onHeightChange(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              min={Number(minHeightCm.toFixed(1))}
              max={Number(maxHeightCm.toFixed(1))}
              step={0.1}
              value={Number(heightCm.toFixed(1))}
              onChange={(e) => {
                const next = Number(e.target.value)
                if (Number.isNaN(next)) return
                onHeightChange(next)
              }}
              className="w-16 rounded border border-white/35 bg-white/85 px-2 py-1 text-xs text-stone-900"
            />
          </div>
        </label>

        <div className="flex flex-col gap-1 text-sm">
          Material
          <div className="flex flex-wrap gap-2">
            {materialOptions.map((option) => {
              const active = selectedMaterial === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onMaterialChange(option.key)}
                  disabled={!option.available}
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

        <div className="flex flex-col gap-1 text-sm">
          Dicke ({thicknessMm} mm)
          <div className="flex flex-wrap gap-2">
            {thicknessOptions.map((option) => {
              const active = thicknessMm === option
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onThicknessChange(option)}
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

        {stockInfoText && <p className="text-xs text-amber-100/90">{stockInfoText}</p>}

        <label className="flex flex-col gap-1 text-sm">
          Spacing {spacing.toFixed(3)}
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.005"
            value={spacing}
            onChange={(e) => onSpacingChange(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  )
}
