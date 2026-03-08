"use client"

import { Canvas } from "@react-three/fiber"
import { GizmoHelper, GizmoViewport } from "@react-three/drei"
import { useEffect, useMemo, useState } from "react"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import * as THREE from "three"

import SceneCamera from "../components/SceneCamera"
import type { CameraDebugState } from "../components/SceneCamera"
import SceneLighting from "../components/SceneLighting"
import WorkbenchScene from "../components/WorkbenchScene"
import ConfiguratorPanel from "./text-preview/ConfiguratorPanel"
import PreviewLetters from "./text-preview/PreviewLetters"
import {
  MATERIAL_OPTIONS,
  buildLayout,
  getAvailableMaterialStock,
  type AnchorTransform,
  type FontOption,
  type MaterialKey,
  type WorkshopMaterialSheet,
} from "./text-preview/helpers"

const MIN_WIDTH_CM = 10
const MAX_WIDTH_CM = 80
const tabs = ["Grundlagen", "Design", "Vorschau"] as const

type PricingConfig = {
  currency: string
  vatPercent: number
  materialRates: Array<{
    material: MaterialKey
    thicknessMm: number
    pricePerM2: number
  }>
  laserCutting: {
    setupFee: number
    pricePerCm2: number
    pricePerLetter: number
    minimumFee: number
  }
  delivery: {
    freeFromSubtotal: number
    methods: Array<{
      key: string
      label: string
      flatFee: number
    }>
  }
}

export default function TextPreview() {
  const [nameValue, setNameValue] = useState("Julian")
  const [widthCm, setWidthCm] = useState(40)
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialKey>("mdf")
  const [thicknessMm, setThicknessMm] = useState(5)
  const [spacing, setSpacing] = useState(0.02)
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("Grundlagen")

  const [fontOptions, setFontOptions] = useState<FontOption[]>([])
  const [selectedFontFile, setSelectedFontFile] = useState(
    "helvetiker_regular.typeface.json"
  )
  const [workshopSheets, setWorkshopSheets] = useState<WorkshopMaterialSheet[]>([])
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null)
  const [selectedDeliveryKey, setSelectedDeliveryKey] = useState("standard")

  const [parsedFont, setParsedFont] = useState<THREE.Font | null>(null)
  const [anchorTransform, setAnchorTransform] = useState<AnchorTransform | null>(
    null
  )
  const [isSceneReady, setIsSceneReady] = useState(false)
  const [cameraDebug, setCameraDebug] = useState<CameraDebugState | null>(null)
  const hasText = nameValue.trim().length > 0

  const height = useMemo(() => thicknessMm / 1000, [thicknessMm])
  const textMetrics = useMemo(() => {
    if (!parsedFont) return null
    return buildLayout(nameValue, parsedFont, 1, spacing)
  }, [nameValue, parsedFont, spacing])

  const textAspectRatio = useMemo(() => {
    if (!hasText || !textMetrics) return 0.3
    return textMetrics.totalHeight / Math.max(textMetrics.totalWidth, 0.0001)
  }, [hasText, textMetrics])

  const heightCm = useMemo(() => {
    if (!hasText) return 0
    return widthCm * textAspectRatio
  }, [hasText, widthCm, textAspectRatio])

  const minHeightCm = useMemo(() => {
    if (!hasText) return 0
    return MIN_WIDTH_CM * textAspectRatio
  }, [hasText, textAspectRatio])

  const maxHeightCm = useMemo(() => {
    if (!hasText) return 0
    return MAX_WIDTH_CM * textAspectRatio
  }, [hasText, textAspectRatio])

  const requiredAreaCm2 = useMemo(() => {
    if (!hasText) return 0
    return widthCm * heightCm
  }, [hasText, widthCm, heightCm])

  const availableStock = useMemo(() => {
    return getAvailableMaterialStock(workshopSheets, requiredAreaCm2)
  }, [workshopSheets, requiredAreaCm2])

  const materialOptions = useMemo(() => {
    return MATERIAL_OPTIONS.map((option) => ({
      ...option,
      available: (availableStock.get(option.key)?.size ?? 0) > 0,
    }))
  }, [availableStock])

  const allThicknesses = useMemo(() => {
    const values = new Set<number>()
    for (const sheet of workshopSheets) values.add(sheet.thicknessMm)
    return Array.from(values).sort((a, b) => a - b)
  }, [workshopSheets])

  const thicknessOptions = useMemo(() => {
    const availableForMaterial = availableStock.get(selectedMaterial) ?? new Set()
    return allThicknesses.filter((value) => availableForMaterial.has(value))
  }, [allThicknesses, availableStock, selectedMaterial])

  const stockInfoText = useMemo(() => {
    if (!hasText) return "Bitte erst einen Namen eingeben."
    if (workshopSheets.length === 0) return "Kein Werkstattmaterial konfiguriert."
    const availableMaterials = materialOptions.filter((m) => m.available)
    if (availableMaterials.length === 0) {
      return `Keine Platte passt fuer ${widthCm.toFixed(1)} x ${heightCm.toFixed(1)} cm (${requiredAreaCm2.toFixed(0)} cm2).`
    }
    return `Verfuegbarkeit fuer ${widthCm.toFixed(1)} x ${heightCm.toFixed(1)} cm (${requiredAreaCm2.toFixed(0)} cm2).`
  }, [
    hasText,
    heightCm,
    materialOptions,
    requiredAreaCm2,
    widthCm,
    workshopSheets.length,
  ])

  const materialLabel = useMemo(() => {
    return (
      MATERIAL_OPTIONS.find((option) => option.key === selectedMaterial)?.label ??
      selectedMaterial
    )
  }, [selectedMaterial])

  const pricingDetails = useMemo(() => {
    if (!pricingConfig || !hasText) return null

    const areaM2 = requiredAreaCm2 / 10000
    const letterCount = nameValue.replace(/\s/g, "").length
    const materialRate = pricingConfig.materialRates.find(
      (rate) =>
        rate.material === selectedMaterial && rate.thicknessMm === thicknessMm
    )
    const materialCost = areaM2 * (materialRate?.pricePerM2 ?? 0)

    const laserRaw =
      pricingConfig.laserCutting.setupFee +
      requiredAreaCm2 * pricingConfig.laserCutting.pricePerCm2 +
      letterCount * pricingConfig.laserCutting.pricePerLetter
    const laserCost = Math.max(pricingConfig.laserCutting.minimumFee, laserRaw)

    const deliveryMethod =
      pricingConfig.delivery.methods.find(
        (method) => method.key === selectedDeliveryKey
      ) ?? pricingConfig.delivery.methods[0]

    const subtotal = materialCost + laserCost
    const deliveryBase = deliveryMethod?.flatFee ?? 0
    const deliveryCost =
      subtotal >= pricingConfig.delivery.freeFromSubtotal &&
      deliveryMethod?.key !== "pickup"
        ? 0
        : deliveryBase

    const totalNet = subtotal + deliveryCost
    const vatAmount = totalNet * (pricingConfig.vatPercent / 100)
    const totalGross = totalNet + vatAmount

    return {
      areaM2,
      letterCount,
      materialRate: materialRate?.pricePerM2 ?? 0,
      materialCost,
      laserCost,
      deliveryLabel: deliveryMethod?.label ?? "Lieferung",
      deliveryCost,
      subtotal: totalNet,
      vatPercent: pricingConfig.vatPercent,
      vatAmount,
      totalGross,
      hasMaterialRate: !!materialRate,
      currency: pricingConfig.currency,
    }
  }, [
    hasText,
    nameValue,
    pricingConfig,
    requiredAreaCm2,
    selectedDeliveryKey,
    selectedMaterial,
    thicknessMm,
  ])

  const moneyFormatter = useMemo(() => {
    const currency = pricingDetails?.currency ?? pricingConfig?.currency ?? "EUR"
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [pricingConfig?.currency, pricingDetails?.currency])

  function clampWidthCm(next: number) {
    return Math.min(MAX_WIDTH_CM, Math.max(MIN_WIDTH_CM, next))
  }

  function handleWidthChange(next: number) {
    setWidthCm(clampWidthCm(next))
  }

  function handleHeightChange(nextHeightCm: number) {
    if (!hasText) return
    const safeRatio = Math.max(textAspectRatio, 0.0001)
    const nextWidth = nextHeightCm / safeRatio
    setWidthCm(clampWidthCm(nextWidth))
  }

  useEffect(() => {
    const availableMaterialKeys = materialOptions
      .filter((option) => option.available)
      .map((option) => option.key)
    if (availableMaterialKeys.length === 0) return

    if (!availableMaterialKeys.includes(selectedMaterial)) {
      setSelectedMaterial(availableMaterialKeys[0])
    }
  }, [materialOptions, selectedMaterial])

  useEffect(() => {
    if (thicknessOptions.length === 0) return
    if (!thicknessOptions.includes(thicknessMm)) {
      setThicknessMm(thicknessOptions[0])
    }
  }, [thicknessMm, thicknessOptions])

  function handleLetterLevel(obj: THREE.Object3D) {
    obj.updateWorldMatrix(true, true)

    const worldPosition = new THREE.Vector3()
    const worldQuaternion = new THREE.Quaternion()
    const worldScale = new THREE.Vector3()

    obj.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale)

    setAnchorTransform({
      position: [worldPosition.x, worldPosition.y, worldPosition.z],
      quaternion: [
        worldQuaternion.x,
        worldQuaternion.y,
        worldQuaternion.z,
        worldQuaternion.w,
      ],
    })
  }

  useEffect(() => {
    async function loadFontOptions() {
      const res = await fetch("/api/fonts")
      if (!res.ok) {
        throw new Error(`Failed to load fonts: ${res.status}`)
      }

      const data = (await res.json()) as { fonts: FontOption[] }
      const options = data.fonts ?? []

      setFontOptions(options)

      if (options.length === 0) return

      setSelectedFontFile((prev) =>
        options.some((option) => option.file === prev) ? prev : options[0].file
      )
    }

    loadFontOptions().catch((err) => {
      console.error(err)
    })
  }, [])

  useEffect(() => {
    async function loadSelectedFont() {
      const encoded = encodeURIComponent(selectedFontFile)
      const res = await fetch(`/fonts/${encoded}`)
      if (!res.ok) {
        throw new Error(
          `Failed to load font "${selectedFontFile}": ${res.status}`
        )
      }

      const json = await res.json()

      const loader = new FontLoader()
      const font = loader.parse(json)

      setParsedFont(font)
    }

    loadSelectedFont().catch((err) => {
      console.error(err)
    })
  }, [selectedFontFile])

  useEffect(() => {
    async function loadWorkshopMaterials() {
      const res = await fetch("/api/workshop-materials")
      if (!res.ok) {
        throw new Error(`Failed to load workshop materials: ${res.status}`)
      }

      const data = (await res.json()) as { sheets?: WorkshopMaterialSheet[] }
      setWorkshopSheets(Array.isArray(data.sheets) ? data.sheets : [])
    }

    loadWorkshopMaterials().catch((err) => {
      console.error(err)
      setWorkshopSheets([])
    })
  }, [])

  useEffect(() => {
    async function loadPricingConfig() {
      const res = await fetch("/api/pricing")
      if (!res.ok) {
        throw new Error(`Failed to load pricing config: ${res.status}`)
      }

      const data = (await res.json()) as PricingConfig
      setPricingConfig(data)
      if (data.delivery.methods.length > 0) {
        setSelectedDeliveryKey((prev) => {
          return data.delivery.methods.some((method) => method.key === prev)
            ? prev
            : data.delivery.methods[0].key
        })
      }
    }

    loadPricingConfig().catch((err) => {
      console.error(err)
      setPricingConfig(null)
    })
  }, [])

  const showSceneLoading = !isSceneReady || !parsedFont

  return (
    <div className="min-h-screen w-full bg-stone-100">
      <header
        className="relative overflow-hidden bg-cover bg-center px-4 py-10 md:px-8 md:py-12"
        style={{ backgroundImage: "url('/hero-bg.svg')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-semibold tracking-wide text-amber-50 md:text-6xl">
            Maiherz-Konfigurator
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-amber-200 text-amber-950"
                    : "bg-white/25 text-amber-50 hover:bg-white/35"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="w-full px-3 pb-4 pt-5 md:px-6 md:pt-7">
        <h2 className="mb-4 pl-2 text-xl font-semibold text-stone-800 md:mb-5 md:pl-4">
          {"Pers\u00f6nliches Maiherz erstellen"}
        </h2>

        <div className="relative mx-auto h-[72vh] min-h-[500px] w-[90%] overflow-hidden rounded-xl border border-stone-300 bg-stone-200">
          <Canvas shadows camera={{ position: [0, 4, 14], fov: 45 }}>
            <SceneLighting />

            <WorkbenchScene
              onLetterLevel={handleLetterLevel}
              onSceneReady={() => setIsSceneReady(true)}
            />

            {parsedFont && anchorTransform && (
              <group
                position={anchorTransform.position}
                quaternion={anchorTransform.quaternion}
              >
                <PreviewLetters
                  text={nameValue}
                  widthCm={widthCm}
                  height={height}
                  spacing={spacing}
                  parsedFont={parsedFont}
                  material={selectedMaterial}
                />
              </group>
            )}

            <SceneCamera
              targetPosition={anchorTransform?.position ?? null}
              onDebugChange={setCameraDebug}
            />

            <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
              <GizmoViewport
                axisColors={["red", "green", "blue"]}
                labelColor="white"
              />
            </GizmoHelper>
          </Canvas>

          {showSceneLoading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-stone-200/75">
              <div className="flex items-center gap-3 rounded-full border border-stone-300 bg-white/90 px-4 py-2 text-sm text-stone-700 shadow-sm">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
                Lade 3D Szene...
              </div>
            </div>
          )}

          <ConfiguratorPanel
            nameValue={nameValue}
            onNameChange={setNameValue}
            fontOptions={fontOptions}
            selectedFontFile={selectedFontFile}
            onSelectFont={setSelectedFontFile}
            widthCm={widthCm}
            minWidthCm={MIN_WIDTH_CM}
            maxWidthCm={MAX_WIDTH_CM}
            onWidthChange={handleWidthChange}
            heightCm={heightCm}
            minHeightCm={minHeightCm}
            maxHeightCm={maxHeightCm}
            onHeightChange={handleHeightChange}
            materialOptions={materialOptions}
            selectedMaterial={selectedMaterial}
            onMaterialChange={setSelectedMaterial}
            thicknessOptions={thicknessOptions}
            thicknessMm={thicknessMm}
            onThicknessChange={setThicknessMm}
            spacing={spacing}
            onSpacingChange={setSpacing}
            stockInfoText={stockInfoText}
          />

          {cameraDebug && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-30 whitespace-pre rounded-md bg-slate-900/85 px-3 py-2 font-mono text-[11px] leading-[1.35] text-slate-200">
              {`pos:     ${cameraDebug.pos[0]}, ${cameraDebug.pos[1]}, ${cameraDebug.pos[2]}
rotDeg:  ${cameraDebug.rotDeg[0]}, ${cameraDebug.rotDeg[1]}, ${cameraDebug.rotDeg[2]}
target:  ${cameraDebug.target[0]}, ${cameraDebug.target[1]}, ${cameraDebug.target[2]}
polar:   ${cameraDebug.polarDeg} deg
azim:    ${cameraDebug.azimuthDeg} deg
dist:    ${cameraDebug.distance}
fov:     ${cameraDebug.fov}`}
            </div>
          )}
        </div>

        <section className="mx-auto mt-4 w-[90%] rounded-xl border border-stone-300 bg-white p-4 md:mt-5 md:p-5">
          <h3 className="text-lg font-semibold text-stone-800">Kostenvoranschlag</h3>

          {!pricingDetails && (
            <p className="mt-3 text-sm text-stone-600">
              {hasText
                ? "Preisregeln werden geladen..."
                : "Bitte Namen eingeben, um einen Kostenvoranschlag zu berechnen."}
            </p>
          )}

          {pricingDetails && (
            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="space-y-2 text-sm text-stone-700">
                <p>
                  Material: {materialLabel}, {thicknessMm} mm
                </p>
                <p>
                  Flaeche: {widthCm.toFixed(1)} x {heightCm.toFixed(1)} cm (
                  {pricingDetails.areaM2.toFixed(3)} m2)
                </p>
                {!pricingDetails.hasMaterialRate && (
                  <p className="text-amber-700">
                    Kein Materialpreis fuer diese Kombination hinterlegt.
                  </p>
                )}

                {pricingConfig && pricingConfig.delivery.methods.length > 0 && (
                  <label className="mt-2 block">
                    <span className="mb-1 block text-stone-700">Lieferung</span>
                    <select
                      className="rounded border border-stone-300 bg-white px-2 py-1 text-sm"
                      value={selectedDeliveryKey}
                      onChange={(e) => setSelectedDeliveryKey(e.target.value)}
                    >
                      {pricingConfig.delivery.methods.map((method) => (
                        <option key={method.key} value={method.key}>
                          {method.label} ({moneyFormatter.format(method.flatFee)})
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className="min-w-[240px] rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm">
                <div className="flex items-center justify-between py-1">
                  <span>Material</span>
                  <span>{moneyFormatter.format(pricingDetails.materialCost)}</span>
                </div>
                <div className="flex items-center justify-between py-1 text-xs text-stone-500">
                  <span>{moneyFormatter.format(pricingDetails.materialRate)} / m2</span>
                  <span>{pricingDetails.areaM2.toFixed(3)} m2</span>
                </div>

                <div className="mt-1 flex items-center justify-between py-1">
                  <span>Laserschnitt</span>
                  <span>{moneyFormatter.format(pricingDetails.laserCost)}</span>
                </div>
                <div className="flex items-center justify-between py-1 text-xs text-stone-500">
                  <span>inkl. Ruestkosten + Zeichen</span>
                  <span>{pricingDetails.letterCount} Buchstaben</span>
                </div>

                <div className="mt-1 flex items-center justify-between py-1">
                  <span>{pricingDetails.deliveryLabel}</span>
                  <span>{moneyFormatter.format(pricingDetails.deliveryCost)}</span>
                </div>

                <div className="mt-2 border-t border-stone-300 pt-2">
                  <div className="flex items-center justify-between py-1">
                    <span>Zwischensumme (netto)</span>
                    <span>{moneyFormatter.format(pricingDetails.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 text-xs text-stone-500">
                    <span>MwSt. {pricingDetails.vatPercent}%</span>
                    <span>{moneyFormatter.format(pricingDetails.vatAmount)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between py-1 text-base font-semibold text-stone-900">
                    <span>Gesamt</span>
                    <span>{moneyFormatter.format(pricingDetails.totalGross)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mx-auto mt-4 w-[90%] pb-6 md:mt-5 md:pb-8">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-stone-300 bg-white p-4 md:p-5">
              <h3 className="text-lg font-semibold text-stone-800">Bestelluebersicht</h3>
              <div className="mt-4 space-y-2 text-sm text-stone-700">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span>Name</span>
                  <span className="font-medium">{nameValue || "-"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span>Material</span>
                  <span className="font-medium">
                    {materialLabel}, {thicknessMm} mm
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span>Groesse</span>
                  <span className="font-medium">
                    {widthCm.toFixed(1)} x {heightCm.toFixed(1)} cm
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                  <span>Buchstaben</span>
                  <span className="font-medium">
                    {nameValue.replace(/\s/g, "").length}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>Geschaetzter Gesamtpreis</span>
                  <span className="text-base font-semibold text-stone-900">
                    {pricingDetails
                      ? moneyFormatter.format(pricingDetails.totalGross)
                      : "-"}
                  </span>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-stone-300 bg-white p-4 md:p-5">
              <h3 className="text-lg font-semibold text-stone-800">Bestellung absenden</h3>
              <form className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm text-stone-700">
                  Vollstaendiger Name
                  <input
                    type="text"
                    placeholder="Max Mustermann"
                    className="rounded border border-stone-300 px-3 py-2"
                  />
                </label>
                <label className="grid gap-1 text-sm text-stone-700">
                  E-Mail
                  <input
                    type="email"
                    placeholder="name@beispiel.de"
                    className="rounded border border-stone-300 px-3 py-2"
                  />
                </label>
                <label className="grid gap-1 text-sm text-stone-700">
                  Telefonnummer
                  <input
                    type="tel"
                    placeholder="+49 ..."
                    className="rounded border border-stone-300 px-3 py-2"
                  />
                </label>
                <label className="grid gap-1 text-sm text-stone-700">
                  Lieferadresse
                  <textarea
                    rows={3}
                    placeholder="Strasse, Hausnummer, PLZ, Ort"
                    className="rounded border border-stone-300 px-3 py-2"
                  />
                </label>
                <label className="grid gap-1 text-sm text-stone-700">
                  Nachricht (optional)
                  <textarea
                    rows={3}
                    placeholder="Hinweise zur Bestellung"
                    className="rounded border border-stone-300 px-3 py-2"
                  />
                </label>
                <label className="mt-1 flex items-start gap-2 text-xs text-stone-600">
                  <input type="checkbox" className="mt-0.5" />
                  <span>
                    Ich bestaetige, dass die Angaben korrekt sind und akzeptiere die
                    AGB.
                  </span>
                </label>
                <button
                  type="button"
                  className="mt-2 rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
                >
                  Bestellung verbindlich absenden
                </button>
              </form>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}
