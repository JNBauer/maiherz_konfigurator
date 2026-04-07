"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import type { Font } from "three/examples/jsm/loaders/FontLoader.js"
import * as THREE from "three"

import type { CameraDebugState } from "../components/SceneCamera"
import HeroHeader from "../components/HeroHeader"
import TextPreviewScene from "./text-preview/TextPreviewScene"
import TextPreviewPanels from "./text-preview/TextPreviewPanels"
import {
  MATERIAL_OPTIONS,
  MATERIAL_THICKNESS_OPTIONS_MM,
  MATERIAL_THICKNESS_PRICE_EUR_PER_M2,
  buildLayout,
  evaluateLaserCutSafety,
  evaluateTextWithinHeartMargin,
  type TextHeartContainmentResult,
  WIDTH_CM_TO_SCENE_SIZE,
  type AnchorTransform,
  type FontOption,
  type LaserSafetyResult,
  type MaterialKey,
  type ThicknessMm,
  type TextMaterialKey,
} from "./text-preview/helpers"

type TextPreviewProps = {
  sceneImageSrc: string
}

const MIN_TEXT_HEIGHT_CM = 5
const MAX_TEXT_HEIGHT_CM = 22
const DEFAULT_TEXT_HEIGHT_CM = 7.5
const DEFAULT_TEXT_ASPECT_RATIO = 0.3
const MIN_HEART_WIDTH_CM = 10
const MAX_HEART_WIDTH_CM = 70
const MIN_HEART_HEIGHT_CM = 10
const MAX_HEART_HEIGHT_CM = 50
const FALLBACK_PRICE_PER_M2_EUR = 40
const BASE_PRICE_EUR = 7
const HEART_TEXT_MARGIN_MM = 10
const LASER_TEST_THRESHOLD_MM = 4
const ENGRAVE_DEPTH_MM = 0.3
const HEART_VARIANTS = Array.from({ length: 8 }, (_, index) => {
  return `/hearts/Herzvariante_${index + 1}.svg`
})
const tabs = ["Design", "Vorschau"] as const

export default function TextPreview({ sceneImageSrc }: TextPreviewProps) {
  const [nameValue, setNameValue] = useState("Name")
  const [textHeightCm, setTextHeightCm] = useState(DEFAULT_TEXT_HEIGHT_CM)
  const [includeHeart, setIncludeHeart] = useState(true)
  const [heartWidthCm, setHeartWidthCm] = useState(40)
  const [heartHeightCm, setHeartHeightCm] = useState(35)
  const [textMaterial, setTextMaterial] = useState<TextMaterialKey>("multiplex")
  const [heartMaterial, setHeartMaterial] = useState<MaterialKey>("mdf")
  const [heartVariant, setHeartVariant] = useState(HEART_VARIANTS[0])
  const [heartSvg, setHeartSvg] = useState<string | null>(null)
  const [textThicknessMm, setTextThicknessMm] = useState<ThicknessMm>(5)
  const [heartThicknessMm, setHeartThicknessMm] = useState<ThicknessMm>(5)
  const [spacing, setSpacing] = useState(0.02)
  const [textOffsetYcm, setTextOffsetYcm] = useState(2)
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("Design")
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
  const [, setCameraDebug] = useState<CameraDebugState | null>(null)
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
  const [canScreenshot, setCanScreenshot] = useState(false)
  const screenshotHandlerRef = useRef<null | (() => Promise<Blob | null>)>(null)
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
  const canRunLaserTest = Boolean(parsedFont && hasText)
  const didInitTextHeight = useRef(false)

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
    if (!hasText || !textMetrics) return DEFAULT_TEXT_ASPECT_RATIO
    return textMetrics.totalHeight / Math.max(textMetrics.totalWidth, 0.0001)
  }, [hasText, textMetrics])
  const safeTextAspectRatio =
    textAspectRatio > 0 ? textAspectRatio : DEFAULT_TEXT_ASPECT_RATIO
  const heightCm = textHeightCm
  const widthCm = useMemo(() => {
    return heightCm / safeTextAspectRatio
  }, [heightCm, safeTextAspectRatio])
  const minTextHeightCm = MIN_TEXT_HEIGHT_CM
  const maxTextHeightCm = MAX_TEXT_HEIGHT_CM

  useEffect(() => {
    if (didInitTextHeight.current) return
    if (!parsedFont || !hasText) return
    const initialHeight = DEFAULT_TEXT_HEIGHT_CM
    setTextHeightCm(
      Math.min(MAX_TEXT_HEIGHT_CM, Math.max(MIN_TEXT_HEIGHT_CM, initialHeight))
    )
    didInitTextHeight.current = true
  }, [hasText, parsedFont, safeTextAspectRatio])

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
  const hasRunLaserTest =
    Boolean(laserSafety) && (!hasHeart || Boolean(textFitResult))
  const isLaserSafe = Boolean(laserSafety?.isSafe)
  const isTextFitSafe = !hasHeart || Boolean(textFitResult?.result.isSafe)
  const canSubmitRequest =
    hasRunLaserTest && isLaserSafe && isTextFitSafe && requestStatus !== "sending"
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

  const textAreaCm2 = useMemo(() => {
    return hasText && !isEngraved ? widthCm * heightCm : 0
  }, [hasText, heightCm, isEngraved, widthCm])

  const heartAreaCm2 = useMemo(() => {
    return hasHeart ? heartWidthCm * heartHeightCm : 0
  }, [hasHeart, heartHeightCm, heartWidthCm])

  const roughAreaCm2 = useMemo(() => {
    return textAreaCm2 + heartAreaCm2
  }, [heartAreaCm2, textAreaCm2])

  const roughAreaM2 = useMemo(() => {
    return roughAreaCm2 / 10000
  }, [roughAreaCm2])

  const textPricePerM2 = useMemo(() => {
    if (textMaterial === "engraving") return 0
    return (
      MATERIAL_THICKNESS_PRICE_EUR_PER_M2[textMaterial]?.[textThicknessMm] ??
      FALLBACK_PRICE_PER_M2_EUR
    )
  }, [textMaterial, textThicknessMm])

  const heartPricePerM2 = useMemo(() => {
    return (
      MATERIAL_THICKNESS_PRICE_EUR_PER_M2[heartMaterial]?.[heartThicknessMm] ??
      FALLBACK_PRICE_PER_M2_EUR
    )
  }, [heartMaterial, heartThicknessMm])

  const roughPriceEur = useMemo(() => {
    const textAreaM2 = textAreaCm2 / 10000
    const heartAreaM2 = heartAreaCm2 / 10000
    const textRuestFactor =
      textMaterial !== "engraving" &&
      (textMaterial === "mdf" || textMaterial === "multiplex")
        ? 1.3
        : 1
    const heartRuestFactor =
      heartMaterial === "mdf" || heartMaterial === "multiplex" ? 1.3 : 1
    const subtotal =
      textAreaM2 * textPricePerM2 * textRuestFactor +
      heartAreaM2 * heartPricePerM2 * heartRuestFactor +
      BASE_PRICE_EUR
    return Math.ceil(subtotal * 2) / 2
  }, [
    heartAreaCm2,
    heartMaterial,
    heartPricePerM2,
    textAreaCm2,
    textMaterial,
    textPricePerM2,
  ])

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

  const textThicknessOptions = useMemo(() => {
    const materialKey =
      textMaterial === "engraving" ? "mdf" : (textMaterial as MaterialKey)
    return MATERIAL_THICKNESS_OPTIONS_MM[materialKey]
  }, [textMaterial])

  const heartThicknessOptions = useMemo(() => {
    return MATERIAL_THICKNESS_OPTIONS_MM[heartMaterial]
  }, [heartMaterial])

  function clampTextHeightCm(next: number) {
    return Math.min(maxTextHeightCm, Math.max(minTextHeightCm, next))
  }

  function handleTextHeightChange(next: number) {
    const clampedHeight = clampTextHeightCm(next)
    didInitTextHeight.current = true
    setTextHeightCm(clampedHeight)
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
          roughPriceEur,
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

  async function handleDownloadScreenshot() {
    if (!screenshotHandlerRef.current) return
    const blob = await screenshotHandlerRef.current()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "maiherz-scene.png"
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
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
    if (!heartKeys.includes(heartMaterial as (typeof heartKeys)[number])) {
      setHeartMaterial(heartKeys[0] ?? "mdf")
    }
  }, [heartMaterial, heartMaterialOptions])

  useEffect(() => {
    if (textThicknessOptions.length === 0) return
    if (!textThicknessOptions.includes(textThicknessMm)) {
      setTextThicknessMm(textThicknessOptions[0])
    }
  }, [textThicknessMm, textThicknessOptions])

  useEffect(() => {
    if (heartThicknessOptions.length === 0) return
    if (!heartThicknessOptions.includes(heartThicknessMm)) {
      setHeartThicknessMm(heartThicknessOptions[0])
    }
  }, [heartThicknessMm, heartThicknessOptions])

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
    <div className="min-h-screen w-full bg-transparent">
      <main className="w-full px-3 pb-4 pt-5 md:px-6 md:pt-7">
        <TextPreviewScene
          sceneImageSrc={sceneImageSrc}
          anchorTransform={anchorTransform}
          onLetterLevel={handleLetterLevel}
          onSceneReady={() => setIsSceneReady(true)}
          onDebugChange={setCameraDebug}
          parsedFont={parsedFont}
          hasText={hasText}
          hasHeart={hasHeart}
          nameValue={nameValue}
          widthCm={widthCm}
          heartWidthCm={heartWidthCm}
          heartHeightCm={heartHeightCm}
          heartDepth={heartDepth}
          heartMaterial={heartMaterial}
          heartSvg={heartSvg}
          textDepth={textDepth}
          engraveDepth={engraveDepth}
          spacing={spacing}
          textMaterial={textMaterial}
          textElevation={textElevation}
          textOffsetYcm={textOffsetYcm}
          isEngraved={isEngraved}
          textFitMarkers={textFitMarkers}
          heartBorderPoints={heartBorderPoints}
          textBorderPoints={textBorderPoints}
          laserMarker={laserMarker}
          laserSafety={laserSafety}
          showSceneLoading={showSceneLoading}
          onScreenshotReady={(handler) => {
            screenshotHandlerRef.current = handler
            setCanScreenshot(true)
          }}
          configuratorProps={{
            nameValue,
            onNameChange: setNameValue,
            includeHeart,
            onIncludeHeartChange: setIncludeHeart,
            fontOptions,
            selectedFontFile,
            onSelectFont: setSelectedFontFile,
            widthCm,
            heightCm,
            minTextHeightCm,
            maxTextHeightCm,
            onTextHeightChange: handleTextHeightChange,
            heartWidthCm,
            minHeartWidthCm: MIN_HEART_WIDTH_CM,
            maxHeartWidthCm: MAX_HEART_WIDTH_CM,
            onHeartWidthChange: handleHeartWidthChange,
            heartHeightCm,
            minHeartHeightCm: MIN_HEART_HEIGHT_CM,
            maxHeartHeightCm: MAX_HEART_HEIGHT_CM,
            onHeartHeightChange: handleHeartHeightChange,
            heartVariants: HEART_VARIANTS,
            selectedHeartVariant: heartVariant,
            onSelectHeartVariant: setHeartVariant,
            materialOptions,
            heartMaterialOptions,
            textMaterialOptions,
            textMaterial,
            onTextMaterialChange: setTextMaterial,
            heartMaterial,
            onHeartMaterialChange: setHeartMaterial,
            textThicknessOptions,
            heartThicknessOptions,
            textThicknessMm,
            onTextThicknessChange: setTextThicknessMm,
            heartThicknessMm,
            onHeartThicknessChange: setHeartThicknessMm,
            spacing,
            onSpacingChange: setSpacing,
            textOffsetYcm: textOffsetDisplayCm,
            onTextOffsetYChange: (value) => setTextOffsetYcm(value + 2),
            engravingMode: isEngraved,
            laserSafety,
            textFitResult,
            canRunLaserTest,
            onRunLaserTest: handleRunLaserTest,
          }}
        />

        <TextPreviewPanels
          printPaperSize={printPaperSize}
          setPrintPaperSize={setPrintPaperSize}
          printOverlapMm={printOverlapMm}
          setPrintOverlapMm={setPrintOverlapMm}
          onDownloadPdf={handleDownloadPdf}
          printStatus={printStatus}
          printError={printError}
          onDownloadScreenshot={handleDownloadScreenshot}
          canScreenshot={canScreenshot}
          widthCm={widthCm}
          heightCm={heightCm}
          hasHeart={hasHeart}
          heartWidthCm={heartWidthCm}
          heartHeightCm={heartHeightCm}
          laserSafety={laserSafety}
          textFitResult={textFitResult}
          roughAreaM2={roughAreaM2}
          roughPriceEur={roughPriceEur}
          priceFormatter={priceFormatter}
          hasRunLaserTest={hasRunLaserTest}
          canRunLaserTest={canRunLaserTest}
          onRunLaserTest={handleRunLaserTest}
          contactName={contactName}
          setContactName={setContactName}
          contactEmail={contactEmail}
          setContactEmail={setContactEmail}
          contactPhone={contactPhone}
          setContactPhone={setContactPhone}
          contactMessage={contactMessage}
          setContactMessage={setContactMessage}
          onSendRequest={handleSendRequest}
          canSubmitRequest={canSubmitRequest}
          requestStatus={requestStatus}
          requestError={requestError}
        />
      </main>
    </div>
  )
}
