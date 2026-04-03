"use client"

import { Canvas } from "@react-three/fiber"
import { GizmoHelper, GizmoViewport } from "@react-three/drei"
import { useEffect, useMemo, useState } from "react"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import type { Font } from "three/examples/jsm/loaders/FontLoader.js"
import * as THREE from "three"

import SceneCamera from "../components/SceneCamera"
import type { CameraDebugState } from "../components/SceneCamera"
import SceneLighting from "../components/SceneLighting"
import WorkbenchScene from "../components/WorkbenchScene"
import ConfiguratorPanel from "./text-preview/ConfiguratorPanel"
import PreviewHeart from "./text-preview/PreviewHeart"
import PreviewLetters from "./text-preview/PreviewLetters"
import {
  MATERIAL_OPTIONS,
  buildLayout,
  evaluateLaserCutSafety,
  evaluateTextWithinHeartMargin,
  MIN_LASER_CUT_LINE_DISTANCE_MM,
  type TextHeartContainmentResult,
  WIDTH_CM_TO_SCENE_SIZE,
  THICKNESS_OPTIONS_MM,
  type AnchorTransform,
  type FontOption,
  type LaserSafetyResult,
  type MaterialKey,
  type TextMaterialKey,
} from "./text-preview/helpers"

const MIN_WIDTH_CM = 10
const MAX_WIDTH_CM = 80
const MIN_HEART_WIDTH_CM = 10
const MAX_HEART_WIDTH_CM = 70
const MIN_HEART_HEIGHT_CM = 10
const MAX_HEART_HEIGHT_CM = 50
const PRICE_PER_M2_EUR = 40
const HEART_TEXT_MARGIN_MM = 10
const LASER_TEST_THRESHOLD_MM = 4
const ENGRAVE_DEPTH_MM = 0.3
const HEART_VARIANTS = Array.from({ length: 8 }, (_, index) => {
  return `/hearts/Herzvariante_${index + 1}.svg`
})
const tabs = ["Grundlagen", "Design", "Vorschau"] as const

export default function TextPreview() {
  const [nameValue, setNameValue] = useState("Name")
  const [widthCm, setWidthCm] = useState(25)
  const [includeHeart, setIncludeHeart] = useState(true)
  const [heartWidthCm, setHeartWidthCm] = useState(40)
  const [heartHeightCm, setHeartHeightCm] = useState(40)
  const [textMaterial, setTextMaterial] = useState<TextMaterialKey>("mdf")
  const [heartMaterial, setHeartMaterial] = useState<MaterialKey>("mdf")
  const [heartVariant, setHeartVariant] = useState(HEART_VARIANTS[0])
  const [heartSvg, setHeartSvg] = useState<string | null>(null)
  const [textThicknessMm, setTextThicknessMm] = useState<
    (typeof THICKNESS_OPTIONS_MM)[number]
  >(5)
  const [heartThicknessMm, setHeartThicknessMm] = useState<
    (typeof THICKNESS_OPTIONS_MM)[number]
  >(5)
  const [spacing, setSpacing] = useState(0.02)
  const [textOffsetYcm, setTextOffsetYcm] = useState(2)
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("Grundlagen")
  const textOffsetDisplayCm = useMemo(() => textOffsetYcm - 2, [textOffsetYcm])

  const [fontOptions, setFontOptions] = useState<FontOption[]>([])
  const [selectedFontFile, setSelectedFontFile] = useState(
    "helvetiker_regular.typeface.json"
  )
  const [parsedFont, setParsedFont] = useState<Font | null>(null)
  const [anchorTransform, setAnchorTransform] = useState<AnchorTransform | null>(
    null
  )
  const [isSceneReady, setIsSceneReady] = useState(false)
  const [cameraDebug, setCameraDebug] = useState<CameraDebugState | null>(null)
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactMessage, setContactMessage] = useState("")
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle")
  const [requestError, setRequestError] = useState<string | null>(null)
  const [printPaperSize, setPrintPaperSize] = useState<"A4" | "A3">("A4")
  const [printOverlapMm, setPrintOverlapMm] = useState(10)
  const [printStatus, setPrintStatus] = useState<
    "idle" | "loading" | "error"
  >("idle")
  const [printError, setPrintError] = useState<string | null>(null)
  const [laserSafetyCheck, setLaserSafetyCheck] = useState<{
    key: string
    result: LaserSafetyResult
  } | null>(null)
  const [textFitCheck, setTextFitCheck] = useState<{
    key: string
    result: TextHeartContainmentResult
  } | null>(null)
  const hasText = nameValue.trim().length > 0
  const hasHeart = includeHeart
  const isEngraved = hasHeart && textMaterial === "engraving"

  const textDepth = useMemo(() => textThicknessMm / 1000, [textThicknessMm])
  const heartDepth = useMemo(() => heartThicknessMm / 1000, [heartThicknessMm])
  const engraveDepth = useMemo(() => ENGRAVE_DEPTH_MM / 1000, [])
  const textElevation = useMemo(() => {
    if (!hasHeart) return 0
    return isEngraved ? heartDepth + 0.0005 : heartDepth + 0.001
  }, [hasHeart, heartDepth, isEngraved])
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

  const laserSafetyKey = useMemo(
    () =>
      `${nameValue}|${widthCm.toFixed(3)}|${spacing.toFixed(4)}|${selectedFontFile}`,
    [nameValue, selectedFontFile, spacing, widthCm]
  )
  const textFitKey = useMemo(
    () =>
      `${nameValue}|${widthCm.toFixed(3)}|${heightCm.toFixed(3)}|${textOffsetYcm.toFixed(3)}|${heartWidthCm.toFixed(3)}|${heartHeightCm.toFixed(3)}|${includeHeart}|${heartVariant}`,
    [
      heartHeightCm,
      heartWidthCm,
      heightCm,
      includeHeart,
      heartVariant,
      nameValue,
      textOffsetYcm,
      widthCm,
    ]
  )
  const laserSafety =
    laserSafetyCheck?.key === laserSafetyKey ? laserSafetyCheck.result : null
  const textFitResult = textFitCheck?.key === textFitKey ? textFitCheck : null
  const textFitMarkers = textFitResult?.result.debugPointsMm ?? []
  const heartBorder = textFitResult?.result.heartPolygonMm ?? []
  const textBorders = textFitResult?.result.textPolylinesMm ?? []
  const laserMarker = laserSafety?.debugPointMm ?? null
  const borderUnit = WIDTH_CM_TO_SCENE_SIZE / 10
  const heartBorderPoints = useMemo(() => {
    return heartBorder.map(
      ([xMm, yMm]) =>
        new THREE.Vector3(xMm * borderUnit, heartDepth + 0.0025, yMm * borderUnit)
    )
  }, [borderUnit, heartBorder, heartDepth])
  const textBorderPoints = useMemo(() => {
    return textBorders.map((polyline) =>
      polyline.map(
        ([xMm, yMm]) =>
          new THREE.Vector3(xMm * borderUnit, heartDepth + 0.0035, yMm * borderUnit)
      )
    )
  }, [borderUnit, heartDepth, textBorders])

  const roughAreaCm2 = useMemo(() => {
    const textArea = hasText && !isEngraved ? widthCm * heightCm : 0
    const heartArea = hasHeart ? heartWidthCm * heartHeightCm : 0
    return textArea + heartArea
  }, [
    hasHeart,
    hasText,
    heartHeightCm,
    heartWidthCm,
    heightCm,
    isEngraved,
    widthCm,
  ])

  const roughAreaM2 = useMemo(() => {
    return roughAreaCm2 / 10000
  }, [roughAreaCm2])

  const roughPriceEur = useMemo(() => {
    return roughAreaM2 * PRICE_PER_M2_EUR
  }, [roughAreaM2])

  const priceFormatter = useMemo(() => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }, [])

  const materialOptions = useMemo(() => {
    return MATERIAL_OPTIONS.map((option) => ({
      ...option,
      available: true,
    }))
  }, [])
  const heartMaterialOptions = useMemo(
    () =>
      MATERIAL_OPTIONS.filter((option) => option.key !== "acryl").map(
        (option) => ({
          ...option,
          available: true,
        })
      ),
    []
  )
  const textMaterialOptions = useMemo(
    () => [
      ...MATERIAL_OPTIONS.map((option) => ({
        ...option,
        available: true,
      })),
      { key: "engraving" as const, label: "Gravur", available: true },
    ],
    []
  )

  const thicknessOptions = useMemo(() => {
    return [...THICKNESS_OPTIONS_MM]
  }, [])

  function clampWidthCm(next: number) {
    return Math.min(MAX_WIDTH_CM, Math.max(MIN_WIDTH_CM, next))
  }

  function handleWidthChange(next: number) {
    setWidthCm(clampWidthCm(next))
  }

  function clampHeartWidthCm(next: number) {
    return Math.min(MAX_HEART_WIDTH_CM, Math.max(MIN_HEART_WIDTH_CM, next))
  }

  function clampHeartHeightCm(next: number) {
    return Math.min(MAX_HEART_HEIGHT_CM, Math.max(MIN_HEART_HEIGHT_CM, next))
  }

  function handleHeartWidthChange(next: number) {
    setHeartWidthCm(clampHeartWidthCm(next))
  }

  function handleHeartHeightChange(next: number) {
    setHeartHeightCm(clampHeartHeightCm(next))
  }

  function handleRunLaserTest() {
    if (!parsedFont || !hasText) {
      setLaserSafetyCheck(null)
      setTextFitCheck(null)
      return
    }

    setLaserSafetyCheck({
      key: `${nameValue}|${widthCm.toFixed(3)}|${spacing.toFixed(4)}|${selectedFontFile}`,
      result: evaluateLaserCutSafety(
        nameValue,
        parsedFont,
        widthCm,
        spacing,
        LASER_TEST_THRESHOLD_MM
      ),
    })

    if (hasHeart) {
      const fitResult = evaluateTextWithinHeartMargin({
        text: nameValue,
        font: parsedFont,
        widthCm,
        spacing,
        textOffsetYcm,
        heartWidthCm,
        heartHeightCm,
        marginMm: HEART_TEXT_MARGIN_MM,
        heartSvg,
      })
      setTextFitCheck({
        key: `${nameValue}|${widthCm.toFixed(3)}|${heightCm.toFixed(3)}|${textOffsetYcm.toFixed(3)}|${heartWidthCm.toFixed(3)}|${heartHeightCm.toFixed(3)}|${includeHeart}|${heartVariant}`,
        result: fitResult,
      })
    } else {
      setTextFitCheck(null)
    }
  }

  async function handleSendRequest() {
    if (!contactName.trim() || !contactEmail.trim()) {
      setRequestError("Bitte Name und E-Mail angeben.")
      setRequestStatus("error")
      return
    }

    setRequestStatus("sending")
    setRequestError(null)

    try {
      const res = await fetch("/api/order-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: contactName.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
          message: contactMessage.trim(),
          includeHeart,
          heartVariant,
          heartWidthCm,
          heartHeightCm,
          heartMaterial,
          heartThicknessMm,
          text: nameValue,
          textWidthCm: widthCm,
          textHeightCm: heightCm,
          textOffsetYcm,
          textMaterial,
          textThicknessMm,
          spacing,
          selectedFontFile,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? "Senden fehlgeschlagen.")
      }

      setRequestStatus("success")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Senden fehlgeschlagen."
      setRequestStatus("error")
      setRequestError(message)
    }
  }

  async function handleDownloadPdf() {
    setPrintStatus("loading")
    setPrintError(null)

    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          includeHeart,
          heartVariant,
          heartWidthCm,
          heartHeightCm,
          text: nameValue,
          textWidthCm: widthCm,
          textHeightCm: heightCm,
          textOffsetYcm,
          textMaterial,
          spacing,
          selectedFontFile,
          paperSize: printPaperSize,
          overlapMm: printOverlapMm,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? "PDF-Export fehlgeschlagen.")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "maiherz-blueprint.pdf"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setPrintStatus("idle")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "PDF-Export fehlgeschlagen."
      setPrintStatus("error")
      setPrintError(message)
    }
  }

  useEffect(() => {
    const availableMaterialKeys = materialOptions
      .filter((option) => option.available)
      .map((option) => option.key)
    if (availableMaterialKeys.length === 0) return

    if (
      textMaterial !== "engraving" &&
      !availableMaterialKeys.includes(textMaterial as MaterialKey)
    ) {
      setTextMaterial(availableMaterialKeys[0])
    }
    if (!hasHeart && textMaterial === "engraving") {
      setTextMaterial(availableMaterialKeys[0])
    }
    if (!availableMaterialKeys.includes(heartMaterial)) {
      setHeartMaterial(availableMaterialKeys[0])
    }
  }, [hasHeart, heartMaterial, materialOptions, textMaterial])

  useEffect(() => {
    const heartKeys = heartMaterialOptions.map((option) => option.key)
    if (!heartKeys.includes(heartMaterial)) {
      setHeartMaterial(heartKeys[0] ?? "mdf")
    }
  }, [heartMaterial, heartMaterialOptions])

  useEffect(() => {
    if (thicknessOptions.length === 0) return
    if (!thicknessOptions.includes(textThicknessMm)) {
      setTextThicknessMm(thicknessOptions[0])
    }
    if (!thicknessOptions.includes(heartThicknessMm)) {
      setHeartThicknessMm(thicknessOptions[0])
    }
  }, [heartThicknessMm, textThicknessMm, thicknessOptions])

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
    let isActive = true

    async function loadHeartSvg() {
      try {
        const res = await fetch(heartVariant)
        if (!res.ok) {
          throw new Error(`Failed to load heart SVG: ${res.status}`)
        }
        const svgText = await res.text()
        if (isActive) {
          setHeartSvg(svgText)
        }
      } catch (err) {
        console.error(err)
        if (isActive) {
          setHeartSvg(null)
        }
      }
    }

    loadHeartSvg()

    return () => {
      isActive = false
    }
  }, [heartVariant])

  const showSceneLoading = !isSceneReady || (hasText && !parsedFont)

  return (
    <div className="min-h-screen w-full bg-stone-100">
      <header
        className="relative overflow-hidden bg-cover bg-center px-4 py-10 md:px-8 md:py-12"
        style={{ backgroundImage: "url('/birkenstamm.png')" }}
      >
        <div className="absolute inset-0 bg-white/45" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h1 className="text-4xl font-semibold tracking-wide text-red-700 md:text-6xl">
            Maiherz-Konfigurator
          </h1>

          <div className="flex flex-wrap items-center gap-3">
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
        <div className="relative mx-auto h-[82vh] min-h-[620px] w-[90%] overflow-hidden rounded-xl border border-stone-300 bg-stone-200">
          <Canvas
            shadows={{ type: THREE.PCFShadowMap }}
            camera={{ position: [0, 4, 14], fov: 45 }}
          >
            <SceneLighting targetPosition={anchorTransform?.position ?? null} />

            <WorkbenchScene
              onLetterLevel={handleLetterLevel}
              onSceneReady={() => setIsSceneReady(true)}
            />

            {anchorTransform && (
              <group
                position={anchorTransform.position}
                quaternion={anchorTransform.quaternion}
              >
                {hasHeart && (
                  <PreviewHeart
                    widthCm={heartWidthCm}
                    heightCm={heartHeightCm}
                    height={heartDepth}
                    material={heartMaterial}
                    svgText={heartSvg}
                  />
                )}
                {parsedFont && hasText && (
                  <PreviewLetters
                    text={nameValue}
                    widthCm={widthCm}
                    height={isEngraved ? engraveDepth : textDepth}
                    spacing={spacing}
                    parsedFont={parsedFont}
                    material={textMaterial}
                    elevation={textElevation}
                    offsetYcm={textOffsetYcm}
                    renderMode={isEngraved ? "engraved" : "raised"}
                  />
                )}
                {(hasHeart &&
                  (textFitMarkers.length > 0 ||
                    heartBorder.length > 0 ||
                    textBorders.length > 0 ||
                    (laserMarker && !laserSafety?.isSafe))) && (
                  <group>
                    {heartBorderPoints.length > 1 && (
                      <line
                        geometry={new THREE.BufferGeometry().setFromPoints(
                          heartBorderPoints
                        )}
                      >
                        <lineBasicMaterial color="#ffb020" />
                      </line>
                    )}

                    {textBorderPoints.map((polyline, idx) => (
                      <line
                        key={`text-border-${idx}`}
                        geometry={new THREE.BufferGeometry().setFromPoints(polyline)}
                      >
                        <lineBasicMaterial color="#6ee7ff" />
                      </line>
                    ))}

                    {textFitMarkers.map(([xMm, yMm], index) => {
                      const unit = WIDTH_CM_TO_SCENE_SIZE / 10
                      const x = xMm * unit
                      const z = yMm * unit
                      return (
                        <group
                          key={`${index}-${xMm}-${yMm}`}
                          position={[x, heartDepth + 0.004, z]}
                        >
                          <mesh>
                            <sphereGeometry args={[0.004, 10, 10]} />
                            <meshBasicMaterial color="#ff3b3b" />
                          </mesh>
                          <mesh position={[0, 0.01, 0]}>
                            <coneGeometry args={[0.004, 0.012, 10]} />
                            <meshBasicMaterial color="#ff3b3b" />
                          </mesh>
                        </group>
                      )
                    })}

                    {laserMarker && !laserSafety?.isSafe && (
                      (() => {
                        const unit = WIDTH_CM_TO_SCENE_SIZE / 10
                        const widthMm = widthCm * 10
                        const offsetYmm = textOffsetYcm * 10
                        const [xMm, yMm] = laserMarker
                        const x = (xMm - widthMm / 2) * unit
                        const z = (-yMm + offsetYmm) * unit
                        const y =
                          textElevation +
                          (isEngraved ? engraveDepth : textDepth) +
                          0.003
                        return (
                          <group position={[x, y, z]}>
                            <mesh>
                              <sphereGeometry args={[0.005, 10, 10]} />
                              <meshBasicMaterial color="#ff7a18" />
                            </mesh>
                            <mesh position={[0, 0.012, 0]}>
                              <coneGeometry args={[0.005, 0.014, 10]} />
                              <meshBasicMaterial color="#ff7a18" />
                            </mesh>
                          </group>
                        )
                      })()
                    )}
                  </group>
                )}
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
            includeHeart={includeHeart}
            onIncludeHeartChange={setIncludeHeart}
            fontOptions={fontOptions}
            selectedFontFile={selectedFontFile}
            onSelectFont={setSelectedFontFile}
            widthCm={widthCm}
            minWidthCm={MIN_WIDTH_CM}
            maxWidthCm={MAX_WIDTH_CM}
            onWidthChange={handleWidthChange}
            heightCm={heightCm}
            heartWidthCm={heartWidthCm}
            minHeartWidthCm={MIN_HEART_WIDTH_CM}
            maxHeartWidthCm={MAX_HEART_WIDTH_CM}
            onHeartWidthChange={handleHeartWidthChange}
            heartHeightCm={heartHeightCm}
            minHeartHeightCm={MIN_HEART_HEIGHT_CM}
            maxHeartHeightCm={MAX_HEART_HEIGHT_CM}
            onHeartHeightChange={handleHeartHeightChange}
            heartVariants={HEART_VARIANTS}
            selectedHeartVariant={heartVariant}
            onSelectHeartVariant={setHeartVariant}
            materialOptions={materialOptions}
            heartMaterialOptions={heartMaterialOptions}
            textMaterialOptions={textMaterialOptions}
            textMaterial={textMaterial}
            onTextMaterialChange={setTextMaterial}
            heartMaterial={heartMaterial}
            onHeartMaterialChange={setHeartMaterial}
            thicknessOptions={thicknessOptions}
            textThicknessMm={textThicknessMm}
            onTextThicknessChange={setTextThicknessMm}
            heartThicknessMm={heartThicknessMm}
            onHeartThicknessChange={setHeartThicknessMm}
            spacing={spacing}
            onSpacingChange={setSpacing}
            textOffsetYcm={textOffsetDisplayCm}
            onTextOffsetYChange={(value) => setTextOffsetYcm(value + 2)}
            engravingMode={isEngraved}
            laserSafety={laserSafety}
            textFitResult={textFitResult}
            canRunLaserTest={Boolean(parsedFont && hasText)}
            onRunLaserTest={handleRunLaserTest}
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
          <h3 className="text-lg font-semibold text-stone-800">
            Richtpreis (grob)
          </h3>
          <div className="mt-3 text-sm text-stone-700">
            <div>Flaeche gesamt: {roughAreaM2.toFixed(3)} m2</div>
            <div className="mt-1 text-base font-semibold text-stone-900">
              {priceFormatter.format(roughPriceEur)}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-4 w-[90%] pb-6 md:mt-5 md:pb-8">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-stone-300 bg-white p-4 md:p-5">
              <h3 className="text-lg font-semibold text-stone-800">
                Download &amp; Print
              </h3>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm text-stone-700">
                  Papierformat
                  <select
                    className="rounded border border-stone-300 px-3 py-2"
                    value={printPaperSize}
                    onChange={(e) =>
                      setPrintPaperSize(e.target.value as "A4" | "A3")
                    }
                  >
                    <option value="A4">A4 (Standard)</option>
                    <option value="A3">A3</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm text-stone-700">
                  Ueberlappung zum Zusammenkleben (mm)
                  <input
                    type="number"
                    min={0}
                    max={30}
                    step={1}
                    className="rounded border border-stone-300 px-3 py-2"
                    value={Number(printOverlapMm.toFixed(0))}
                    onChange={(e) => {
                      const next = Number(e.target.value)
                      if (Number.isNaN(next)) return
                      setPrintOverlapMm(Math.max(0, Math.min(30, next)))
                    }}
                  />
                </label>
                <p className="text-xs leading-5 text-stone-600">
                  Das PDF ist massstabgetreu. Grosse Designs werden automatisch
                  auf mehrere Seiten verteilt und mit Ueberlappungen markiert,
                  damit Sie sie einfach zusammenkleben koennen.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={printStatus === "loading"}
                  className="mt-2 rounded border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-50 disabled:cursor-not-allowed disabled:bg-stone-100"
                >
                  {printStatus === "loading"
                    ? "PDF wird erstellt..."
                    : "PDF herunterladen"}
                </button>
                {printStatus === "error" && printError && (
                  <p className="text-sm text-rose-700">{printError}</p>
                )}
              </div>
            </article>

            <article className="rounded-xl border border-stone-300 bg-white p-4 md:p-5">
              <h3 className="text-lg font-semibold text-stone-800">Kontakt</h3>
              <form className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm text-stone-700">
                  Vollstaendiger Name
                  <input
                    type="text"
                    placeholder="Max Mustermann"
                    className="rounded border border-stone-300 px-3 py-2"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </label>
                <label className="grid gap-1 text-sm text-stone-700">
                  E-Mail
                  <input
                    type="email"
                    placeholder="name@beispiel.de"
                    className="rounded border border-stone-300 px-3 py-2"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </label>
                <label className="grid gap-1 text-sm text-stone-700">
                  Telefonnummer (optional)
                  <input
                    type="tel"
                    placeholder="+49 ..."
                    className="rounded border border-stone-300 px-3 py-2"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </label>
                <label className="grid gap-1 text-sm text-stone-700">
                  Nachricht
                  <textarea
                    rows={3}
                    placeholder="Hinweise zum Design oder Wunschlieferzeit"
                    className="rounded border border-stone-300 px-3 py-2"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </label>
                <p className="text-xs leading-5 text-stone-600">
                  Mit dem Absenden des Formulars erklaeren Sie sich damit
                  einverstanden, dass Ihre Angaben zur Bearbeitung Ihrer Anfrage
                  verarbeitet werden. Weitere Informationen finden Sie in unserer
                  Datenschutzerklaerung.
                </p>
                <p className="text-xs leading-5 text-stone-600">
                  Die ueber den Konfigurator uebermittelten Anfragen stellen kein
                  verbindliches Angebot dar.
                </p>
                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={requestStatus === "sending"}
                  className="mt-2 rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-500"
                >
                  {requestStatus === "sending"
                    ? "Wird gesendet..."
                    : "Auftragsanfrage abschicken"}
                </button>
                {requestStatus === "success" && (
                  <p className="text-sm text-emerald-700">
                    Anfrage wurde gesendet. Danke!
                  </p>
                )}
                {requestStatus === "error" && requestError && (
                  <p className="text-sm text-rose-700">{requestError}</p>
                )}
              </form>
            </article>
          </div>
        </section>

      </main>
    </div>
  )
}
