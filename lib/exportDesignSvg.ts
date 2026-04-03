import { readFile } from "node:fs/promises"
import { join, basename } from "node:path"
import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"

import { buildLayout, repairGlyphShapes } from "@/components/text-preview/helpers"

type ExportInput = {
  text: string
  textWidthCm: number
  textHeightCm: number
  spacing: number
  textOffsetYcm: number
  textMaterial: string
  heartWidthCm: number
  heartHeightCm: number
  heartVariant: string
  includeHeart: boolean
  selectedFontFile: string
}

type Polyline = Array<[number, number]>

type DesignPolylines = {
  heartPolylines: Polyline[]
  textPolylines: Polyline[]
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
}

async function ensureDomParser() {
  if (typeof globalThis.DOMParser !== "undefined") return
  try {
    const mod = await import("@xmldom/xmldom")
    globalThis.DOMParser = mod.DOMParser as unknown as typeof DOMParser
  } catch (error) {
    throw new Error(
      "DOMParser is not available. Install @xmldom/xmldom to enable SVG parsing."
    )
  }
}

function ensureClosedShape(shape: THREE.Shape) {
  const first = shape.getPoint(0)
  const last = shape.getPoint(1)
  if (first.distanceToSquared(last) > 1e-6) {
    shape.curves.push(new THREE.LineCurve(last.clone(), first.clone()))
    shape.currentPoint.copy(first)
  }
  for (const hole of shape.holes) {
    const holeFirst = hole.getPoint(0)
    const holeLast = hole.getPoint(1)
    if (holeFirst.distanceToSquared(holeLast) > 1e-6) {
      hole.curves.push(new THREE.LineCurve(holeLast.clone(), holeFirst.clone()))
      hole.currentPoint.copy(holeFirst)
    }
  }
  return shape
}

function polylineToPath(points: Polyline) {
  if (points.length === 0) return ""
  const [startX, startY] = points[0]
  let d = `M ${startX.toFixed(3)} ${startY.toFixed(3)}`
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i]
    d += ` L ${x.toFixed(3)} ${y.toFixed(3)}`
  }
  d += " Z"
  return d
}

function collectBounds(polylines: Polyline[]) {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const poly of polylines) {
    for (const [x, y] of poly) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  if (!Number.isFinite(minX)) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }

  return { minX, minY, maxX, maxY }
}

export async function getDesignPolylines(
  input: ExportInput,
  paddingMm = 2
): Promise<DesignPolylines> {
  await ensureDomParser()
  const textPolylines: Polyline[] = []
  const heartPolylines: Polyline[] = []

  if (input.includeHeart) {
    const heartFile = basename(input.heartVariant)
    const heartPath = join(process.cwd(), "public", "hearts", heartFile)
    const heartSvg = await readFile(heartPath, "utf8")

    const svgLoader = new SVGLoader()
    const svgData = svgLoader.parse(heartSvg)
    const heartShapes = svgData.paths
      .flatMap((path) => SVGLoader.createShapes(path))
      .map((shape) => ensureClosedShape(shape))

    const heartPoints: THREE.Vector2[] = []
    for (const shape of heartShapes) {
      const points = shape.getPoints(300)
      if (points.length > 1) {
        heartPoints.push(...points)
        const poly = points.map((p) => [p.x, p.y] as [number, number])
        heartPolylines.push(poly)
      }
      for (const hole of shape.holes) {
        const holePoints = hole.getPoints(300)
        if (holePoints.length > 1) {
          const poly = holePoints.map((p) => [p.x, p.y] as [number, number])
          heartPolylines.push(poly)
        }
      }
    }

    const heartBounds = collectBounds(heartPolylines)
    const heartWidth = Math.max(heartBounds.maxX - heartBounds.minX, 0.0001)
    const heartHeight = Math.max(heartBounds.maxY - heartBounds.minY, 0.0001)
    const heartCenterX = (heartBounds.minX + heartBounds.maxX) / 2
    const heartCenterY = (heartBounds.minY + heartBounds.maxY) / 2
    const heartWidthMm = input.heartWidthCm * 10
    const heartHeightMm = input.heartHeightCm * 10
    const scaleX = heartWidthMm / heartWidth
    const scaleY = heartHeightMm / heartHeight

    for (let i = 0; i < heartPolylines.length; i++) {
      heartPolylines[i] = heartPolylines[i].map(([x, y]) => {
        const nx = (heartCenterX - x) * scaleX
        const ny = (y - heartCenterY) * scaleY
        return [nx, ny] as [number, number]
      })
    }
  }

  if (input.text.trim().length > 0) {
    const fontPath = join(process.cwd(), "public", "fonts", input.selectedFontFile)
    const raw = await readFile(fontPath, "utf8")
    const fontJson = JSON.parse(raw)
    const font = new FontLoader().parse(fontJson)

    const layout = buildLayout(input.text, font, 1, input.spacing)
    const safeWidth = Math.max(layout.totalWidth, 0.0001)
    const mmPerUnit = (input.textWidthCm * 10) / safeWidth
    const offsetX = layout.totalWidth / 2
    const offsetYmm = input.textOffsetYcm * 10

    for (const letter of layout.letters) {
      if (letter.char === " ") continue
      const rawShapes = font.generateShapes(letter.char, 1)
      const repairedShapes = repairGlyphShapes(rawShapes, 16)

      for (const shape of repairedShapes) {
        const outer = shape.getPoints(64)
        if (outer.length > 1) {
          textPolylines.push(
            outer.map((point) => [
              (point.x + letter.x - offsetX) * mmPerUnit,
              -point.y * mmPerUnit + offsetYmm,
            ])
          )
        }

        for (const hole of shape.holes) {
          const holePoints = hole.getPoints(64)
          if (holePoints.length > 1) {
            textPolylines.push(
              holePoints.map((point) => [
                (point.x + letter.x - offsetX) * mmPerUnit,
                -point.y * mmPerUnit + offsetYmm,
              ])
            )
          }
        }
      }
    }
  }

  const allPolylines = [...heartPolylines, ...textPolylines]
  const bounds = collectBounds(allPolylines)
  const minX = bounds.minX - paddingMm
  const minY = bounds.minY - paddingMm
  const maxX = bounds.maxX + paddingMm
  const maxY = bounds.maxY + paddingMm

  return {
    heartPolylines,
    textPolylines,
    bounds: { minX, minY, maxX, maxY },
  }
}

export async function exportDesignSvg(input: ExportInput) {
  const { heartPolylines, textPolylines, bounds } =
    await getDesignPolylines(input, 2)

  const minX = bounds.minX
  const minY = bounds.minY
  const maxX = bounds.maxX
  const maxY = bounds.maxY
  const width = Math.max(maxX - minX, 1)
  const height = Math.max(maxY - minY, 1)

  const heartPaths = heartPolylines.map((poly) =>
    polylineToPath(poly.map(([x, y]) => [x - minX, y - minY]))
  )
  const textPaths = textPolylines.map((poly) =>
    polylineToPath(poly.map(([x, y]) => [x - minX, y - minY]))
  )

  const textStroke = input.textMaterial === "engraving" ? "#1d4ed8" : "#111827"

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width.toFixed(
    2
  )}mm" height="${height.toFixed(
    2
  )}mm" viewBox="0 0 ${width.toFixed(2)} ${height.toFixed(
    2
  )}" fill="none">
  <g id="heart" stroke="#000000" stroke-width="0.2">
    ${heartPaths.map((d) => `<path d="${d}"/>`).join("\n    ")}
  </g>
  <g id="text" stroke="${textStroke}" stroke-width="0.2">
    ${textPaths.map((d) => `<path d="${d}"/>`).join("\n    ")}
  </g>
</svg>`
}
