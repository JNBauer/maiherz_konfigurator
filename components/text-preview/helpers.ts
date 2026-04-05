import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"
import type { Font } from "three/examples/jsm/loaders/FontLoader.js"

// Calibration: tuned to match the cutting-mat cm scale in the scene.
export const WIDTH_CM_TO_SCENE_SIZE = 0.0099
export const MIN_LASER_CUT_LINE_DISTANCE_MM = 4

export const MATERIAL_OPTIONS = [
  { key: "mdf", label: "MDF" },
  { key: "multiplex", label: "Multiplex" },
  { key: "acryl", label: "Acryl" },
] as const

export const THICKNESS_OPTIONS_MM = [3, 4, 5, 9, 10] as const

export type LayoutLetter = {
  char: string
  x: number
}

export type FontOption = {
  file: string
  label: string
}

export type MaterialKey = (typeof MATERIAL_OPTIONS)[number]["key"]
export type TextMaterialKey = MaterialKey | "engraving"
export type ThicknessMm = (typeof THICKNESS_OPTIONS_MM)[number]

export const MATERIAL_THICKNESS_OPTIONS_MM: Record<
  MaterialKey,
  readonly ThicknessMm[]
> = {
  mdf: [3, 5, 10],
  multiplex: [4, 9],
  acryl: [5],
} as const

export const MATERIAL_THICKNESS_PRICE_EUR_PER_M2: Record<
  MaterialKey,
  Partial<Record<ThicknessMm, number>>
> = {
  mdf: {
    3: 10,
    5: 10,
    10: 17,
  },
  multiplex: {
    4: 40,
    9: 50,
  },
  acryl: {
    5: 40,
  },
} as const

export type WorkshopMaterialSheet = {
  id: string
  material: MaterialKey
  thicknessMm: number
  widthCm: number
  heightCm: number
  quantity: number
  note?: string
}

export type LaserSafetyResult = {
  isSafe: boolean
  minimumDistanceMm: number | null
  thresholdMm: number
  debugPointMm?: [number, number]
}

export type TextHeartContainmentResult = {
  isSafe: boolean
  marginMm: number
  debugPointsMm?: Array<[number, number]>
  heartPolygonMm?: Array<[number, number]>
  textPolylinesMm?: Array<Array<[number, number]>>
}

export type AnchorTransform = {
  position: [number, number, number]
  quaternion: [number, number, number, number]
}

export function buildHeartShape() {
  const points: THREE.Vector2[] = []
  const steps = 160

  for (let i = 0; i <= steps; i++) {
    const t = (Math.PI * 2 * i) / steps
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    points.push(new THREE.Vector2(x, y))
  }

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const p of points) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }

  const width = Math.max(maxX - minX, 0.0001)
  const height = Math.max(maxY - minY, 0.0001)
  const scale = 1 / Math.max(width, height)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  const normalized = points.map(
    (p) =>
      new THREE.Vector2(
        (p.x - centerX) * scale,
        (p.y - centerY) * scale
      )
  )

  return new THREE.Shape(normalized)
}

export function getSheetAreaCm2(sheet: WorkshopMaterialSheet) {
  return sheet.widthCm * sheet.heightCm
}

export function getAvailableMaterialStock(
  sheets: WorkshopMaterialSheet[],
  requiredAreaCm2: number
) {
  const combinations = new Map<MaterialKey, Set<number>>()

  for (const sheet of sheets) {
    if (sheet.quantity <= 0) continue
    if (getSheetAreaCm2(sheet) < requiredAreaCm2) continue

    const thicknesses = combinations.get(sheet.material) ?? new Set<number>()
    thicknesses.add(sheet.thicknessMm)
    combinations.set(sheet.material, thicknesses)
  }

  return combinations
}

function measureCharBounds(font: Font, char: string, size: number) {
  if (char === " ") {
    return {
      width: size * 0.4,
      minY: 0,
      maxY: 0,
      hasGeometry: false,
    }
  }

  const shapes = font.generateShapes(char, size)
  const geometry = new THREE.ShapeGeometry(shapes)
  geometry.computeBoundingBox()

  const box = geometry.boundingBox
  if (!box) {
    geometry.dispose()
    return {
      width: size * 0.4,
      minY: 0,
      maxY: size,
      hasGeometry: false,
    }
  }

  const width = box.max.x - box.min.x
  const minY = box.min.y
  const maxY = box.max.y
  geometry.dispose()

  return {
    width,
    minY,
    maxY,
    hasGeometry: true,
  }
}

export function buildLayout(
  text: string,
  font: Font,
  size: number,
  spacing: number
) {
  let cursor = 0
  const letters: LayoutLetter[] = []
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  let hasGeometry = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const bounds = measureCharBounds(font, char, size)
    const width = bounds.width

    letters.push({
      char,
      x: cursor,
    })

    if (bounds.hasGeometry) {
      hasGeometry = true
      minY = Math.min(minY, bounds.minY)
      maxY = Math.max(maxY, bounds.maxY)
    }

    cursor += width

    if (i < text.length - 1) {
      cursor += spacing
    }
  }

  return {
    letters,
    totalWidth: cursor,
    minY: hasGeometry ? minY : 0,
    maxY: hasGeometry ? maxY : size,
    totalHeight: hasGeometry ? maxY - minY : size,
  }
}

export function evaluateLaserCutSafety(
  text: string,
  font: Font,
  widthCm: number,
  spacing: number,
  thresholdMm = MIN_LASER_CUT_LINE_DISTANCE_MM
): LaserSafetyResult {
  const normalizedText = text.trim()
  if (!normalizedText) {
    return {
      isSafe: true,
      minimumDistanceMm: null,
      thresholdMm,
    }
  }

  const layout = buildLayout(normalizedText, font, 1, spacing)
  const safeTotalWidth = Math.max(layout.totalWidth, Number.EPSILON)
  const mmPerLayoutUnit = (widthCm * 10) / safeTotalWidth
  const curveSegments = 16

  type Region = { outer: THREE.Vector2[]; holes: THREE.Vector2[][] }
  const regions: Region[] = []

  for (let i = 0; i < layout.letters.length; i++) {
    const letter = layout.letters[i]
    if (letter.char === " ") continue

    const rawShapes = font.generateShapes(letter.char, 1)
    const repairedShapes = repairGlyphShapes(rawShapes, curveSegments)

    for (const shape of repairedShapes) {
      const outer = shape
        .getPoints(curveSegments)
        .map(
          (point) =>
            new THREE.Vector2(
              (point.x + letter.x) * mmPerLayoutUnit,
              point.y * mmPerLayoutUnit
            )
        )
      if (outer.length < 3) continue

      const holes = shape.holes
        .map((hole) =>
          hole
            .getPoints(curveSegments)
            .map(
              (point) =>
                new THREE.Vector2(
                  (point.x + letter.x) * mmPerLayoutUnit,
                  point.y * mmPerLayoutUnit
                )
            )
        )
        .filter((hole) => hole.length >= 3)

      regions.push({ outer, holes })
    }
  }

  if (regions.length === 0) {
    return {
      isSafe: true,
      minimumDistanceMm: null,
      thresholdMm,
    }
  }

  const boundarySegments: Array<{
    a: THREE.Vector2
    b: THREE.Vector2
    dir: THREE.Vector2
    mid: THREE.Vector2
    length: number
  }> = []

  function addSegments(points: THREE.Vector2[]) {
    if (points.length < 2) return
    const isClosed =
      points[0].distanceToSquared(points[points.length - 1]) < 1e-8
    const count = isClosed ? points.length - 1 : points.length

    for (let i = 0; i < count; i++) {
      const a = points[i]
      const b = points[(i + 1) % points.length]
      const length = a.distanceTo(b)
      if (length < 0.25) continue
      const dir = new THREE.Vector2((b.x - a.x) / length, (b.y - a.y) / length)
      const mid = new THREE.Vector2((a.x + b.x) / 2, (a.y + b.y) / 2)
      boundarySegments.push({ a, b, dir, mid, length })
    }
  }

  for (const region of regions) {
    addSegments(region.outer)
    for (const hole of region.holes) {
      addSegments(hole)
    }
  }

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const region of regions) {
    for (const point of region.outer) {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    }
    for (const hole of region.holes) {
      for (const point of hole) {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      }
    }
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return {
      isSafe: true,
      minimumDistanceMm: null,
      thresholdMm,
    }
  }

  const widthMm = Math.max(maxX - minX, 0.1)
  const heightMm = Math.max(maxY - minY, 0.1)

  let cellMm = Math.min(1, thresholdMm / 8)
  const maxPixels = 180_000
  const estimatedPixels = (widthMm / cellMm) * (heightMm / cellMm)
  if (estimatedPixels > maxPixels) {
    cellMm = Math.sqrt((widthMm * heightMm) / maxPixels)
  }

  const cols = Math.max(1, Math.ceil(widthMm / cellMm))
  const rows = Math.max(1, Math.ceil(heightMm / cellMm))
  const size = cols * rows
  const inside = new Uint8Array(size)

  function indexOf(x: number, y: number) {
    return y * cols + x
  }

  function isInsideText(px: number, py: number) {
    const point = new THREE.Vector2(px, py)
    for (const region of regions) {
      if (!isPointInsidePolygon(point, region.outer)) continue

      let inHole = false
      for (const hole of region.holes) {
        if (isPointInsidePolygon(point, hole)) {
          inHole = true
          break
        }
      }

      if (!inHole) return true
    }
    return false
  }

  for (let y = 0; y < rows; y++) {
    const py = minY + (y + 0.5) * cellMm
    for (let x = 0; x < cols; x++) {
      const px = minX + (x + 0.5) * cellMm
      inside[indexOf(x, y)] = isInsideText(px, py) ? 1 : 0
    }
  }

  const dist = new Float64Array(size)
  dist.fill(Number.POSITIVE_INFINITY)
  const boundary: number[] = []

  const neighborOffsets = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ] as const

  function isBoundaryPixel(x: number, y: number) {
    if (inside[indexOf(x, y)] === 0) return false
    for (const [dx, dy] of neighborOffsets) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return true
      if (inside[indexOf(nx, ny)] === 0) return true
    }
    return false
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = indexOf(x, y)
      if (!isBoundaryPixel(x, y)) continue
      dist[idx] = 0
      boundary.push(idx)
    }
  }

  if (boundary.length === 0) {
    return {
      isSafe: true,
      minimumDistanceMm: null,
      thresholdMm,
    }
  }

  type HeapNode = { idx: number; distance: number }
  const heap: HeapNode[] = []

  function heapPush(node: HeapNode) {
    heap.push(node)
    let i = heap.length - 1
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (heap[p].distance <= heap[i].distance) break
      const tmp = heap[p]
      heap[p] = heap[i]
      heap[i] = tmp
      i = p
    }
  }

  function heapPop() {
    if (heap.length === 0) return null
    const root = heap[0]
    const last = heap.pop()!
    if (heap.length > 0) {
      heap[0] = last
      let i = 0
      while (true) {
        const l = i * 2 + 1
        const r = l + 1
        let smallest = i
        if (l < heap.length && heap[l].distance < heap[smallest].distance) {
          smallest = l
        }
        if (r < heap.length && heap[r].distance < heap[smallest].distance) {
          smallest = r
        }
        if (smallest === i) break
        const tmp = heap[i]
        heap[i] = heap[smallest]
        heap[smallest] = tmp
        i = smallest
      }
    }
    return root
  }

  for (const idx of boundary) {
    heapPush({ idx, distance: 0 })
  }

  const weightedNeighbors = [
    [-1, 0, 1],
    [1, 0, 1],
    [0, -1, 1],
    [0, 1, 1],
    [-1, -1, Math.SQRT2],
    [1, -1, Math.SQRT2],
    [-1, 1, Math.SQRT2],
    [1, 1, Math.SQRT2],
  ] as const

  while (heap.length > 0) {
    const node = heapPop()
    if (!node) break
    if (node.distance > dist[node.idx]) continue

    const x = node.idx % cols
    const y = (node.idx - x) / cols

    for (const [dx, dy, weight] of weightedNeighbors) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue

      const nIdx = indexOf(nx, ny)
      if (inside[nIdx] === 0) continue

      const nextDistance = node.distance + weight * cellMm
      if (nextDistance >= dist[nIdx]) continue
      dist[nIdx] = nextDistance
      heapPush({ idx: nIdx, distance: nextDistance })
    }
  }

  const skeletonValues: number[] = []
  const acceptedSkeletonValues: number[] = []
  let minSkeletonValue = Number.POSITIVE_INFINITY
  let minSkeletonPoint: [number, number] | null = null
  let minAcceptedValue = Number.POSITIVE_INFINITY
  let minAcceptedPoint: [number, number] | null = null

  function isOpposingParallelOutlines(point: THREE.Vector2) {
    if (boundarySegments.length < 2) return false
    const maxNeighbors = Math.min(8, boundarySegments.length)
    const nearest: Array<{ segment: (typeof boundarySegments)[number]; dist: number }> = []

    for (const seg of boundarySegments) {
      const dist = distancePointToSegment(point, seg.a, seg.b)
      if (nearest.length < maxNeighbors) {
        nearest.push({ segment: seg, dist })
        nearest.sort((a, b) => a.dist - b.dist)
      } else if (dist < nearest[nearest.length - 1].dist) {
        nearest[nearest.length - 1] = { segment: seg, dist }
        nearest.sort((a, b) => a.dist - b.dist)
      }
    }

    if (nearest.length < 2) return false

    const parallelDot = 0.92
    const opposingDot = -0.88

    for (let i = 0; i < nearest.length; i++) {
      const segA = nearest[i].segment
      const v1x = segA.mid.x - point.x
      const v1y = segA.mid.y - point.y
      const v1Len = Math.hypot(v1x, v1y)
      if (v1Len <= Number.EPSILON) continue

      for (let j = i + 1; j < nearest.length; j++) {
        const segB = nearest[j].segment
        const dirDot = Math.abs(segA.dir.dot(segB.dir))
        if (dirDot < parallelDot) continue

        const v2x = segB.mid.x - point.x
        const v2y = segB.mid.y - point.y
        const v2Len = Math.hypot(v2x, v2y)
        if (v2Len <= Number.EPSILON) continue

        const vDot = (v1x * v2x + v1y * v2y) / (v1Len * v2Len)
        if (vDot > opposingDot) continue

        return true
      }
    }

    return false
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = indexOf(x, y)
      if (inside[idx] === 0 || !Number.isFinite(dist[idx])) continue
      if (dist[idx] < cellMm * 0.75) continue

      let isLocalMaximum = true
      for (const [dx, dy] of neighborOffsets) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue
        const nIdx = indexOf(nx, ny)
        if (inside[nIdx] === 0) continue
        if (dist[nIdx] > dist[idx]) {
          isLocalMaximum = false
          break
        }
      }

      if (isLocalMaximum) {
        const value = dist[idx] * 2
        skeletonValues.push(value)
        if (value < minSkeletonValue) {
          minSkeletonValue = value
          const px = minX + (x + 0.5) * cellMm
          const py = minY + (y + 0.5) * cellMm
          minSkeletonPoint = [px, py]
        }

        const px = minX + (x + 0.5) * cellMm
        const py = minY + (y + 0.5) * cellMm
        if (isOpposingParallelOutlines(new THREE.Vector2(px, py))) {
          acceptedSkeletonValues.push(value)
          if (value < minAcceptedValue) {
            minAcceptedValue = value
            minAcceptedPoint = [px, py]
          }
        }
      }
    }
  }

  const minimumDistanceMm =
    acceptedSkeletonValues.length > 0
      ? Math.min(...acceptedSkeletonValues)
      : skeletonValues.length > 0
        ? Math.min(...skeletonValues)
        : null

  if (minimumDistanceMm === null) {
    return {
      isSafe: true,
      minimumDistanceMm: null,
      thresholdMm,
    }
  }

  return {
    isSafe: minimumDistanceMm >= thresholdMm,
    minimumDistanceMm,
    thresholdMm,
    debugPointMm: minAcceptedPoint ?? minSkeletonPoint ?? undefined,
  }
}

export function evaluateTextWithinHeartMargin({
  text,
  font,
  widthCm,
  spacing,
  textOffsetYcm,
  heartWidthCm,
  heartHeightCm,
  marginMm,
  heartSvg,
  heartPoints = 420,
  textCurveSegments = 48,
}: {
  text: string
  font: Font
  widthCm: number
  spacing: number
  textOffsetYcm: number
  heartWidthCm: number
  heartHeightCm: number
  marginMm: number
  heartSvg: string | null
  heartPoints?: number
  textCurveSegments?: number
}): TextHeartContainmentResult {
  const safeMarginMm = Math.max(0, marginMm)
  const normalizedText = text.trim()
  const debugPoints: Array<[number, number]> = []
  const maxDebugPoints = 24
  const debugTextPolylines: Array<Array<[number, number]>> = []

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

  function recordPoint(point: THREE.Vector2) {
    if (debugPoints.length >= maxDebugPoints) return
    debugPoints.push([point.x, point.y])
  }

  if (!normalizedText) {
    return { isSafe: true, marginMm: safeMarginMm }
  }
  if (heartWidthCm <= 0 || heartHeightCm <= 0 || widthCm <= 0) {
    return { isSafe: true, marginMm: safeMarginMm }
  }

  let rawHeartPoints: THREE.Vector2[] = []

  if (heartSvg) {
    const loader = new SVGLoader()
    const data = loader.parse(heartSvg)
    const svgShapes = data.paths
      .flatMap((path) => SVGLoader.createShapes(path))
      .map((shape) => ensureClosedShape(shape))

    let bestArea = 0
    let bestPoints: THREE.Vector2[] | null = null

    for (const shape of svgShapes) {
      const points = shape.getPoints(heartPoints)
      if (points.length < 3) continue
      const area = Math.abs(signedArea(points))
      if (area > bestArea) {
        bestArea = area
        bestPoints = points
      }
    }

    if (bestPoints) {
      rawHeartPoints = bestPoints
    }
  }

  if (!heartSvg) {
    return { isSafe: false, marginMm: safeMarginMm, debugPointsMm: debugPoints }
  }

  if (rawHeartPoints.length === 0) {
    return { isSafe: false, marginMm: safeMarginMm, debugPointsMm: debugPoints }
  }

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const p of rawHeartPoints) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }

  const heartWidth = Math.max(maxX - minX, Number.EPSILON)
  const heartHeight = Math.max(maxY - minY, Number.EPSILON)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  const heartWidthMm = heartWidthCm * 10
  const heartHeightMm = heartHeightCm * 10
  const scaleX = heartWidthMm / heartWidth
  const scaleY = heartHeightMm / heartHeight

  // Match PreviewHeart orientation: SVG Y-down becomes +Z after the mesh flip+rotation.
  const heartPolygon = rawHeartPoints.map(
    (p) =>
      new THREE.Vector2(
        (centerX - p.x) * scaleX,
        (p.y - centerY) * scaleY
      )
  )
  if (heartPolygon.length < 3) {
    return { isSafe: true, marginMm: safeMarginMm }
  }
  const heartPolygonMm = heartPolygon.map((p) => [p.x, p.y] as [number, number])

  const heartEdges: Array<[THREE.Vector2, THREE.Vector2]> = []
  for (let i = 0; i < heartPolygon.length; i++) {
    heartEdges.push([heartPolygon[i], heartPolygon[(i + 1) % heartPolygon.length]])
  }

  function isPointSafe(point: THREE.Vector2) {
    if (!isPointInsidePolygon(point, heartPolygon)) return false
    if (safeMarginMm <= 0) return true
    return distanceToPolygonEdges(point, heartPolygon) >= safeMarginMm
  }

  function checkPolyline(points: THREE.Vector2[]) {
    if (points.length < 2) return true
    const stepMm = Math.max(0.5, safeMarginMm / 2)

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]
      const b = points[i + 1]

      if (!isPointSafe(a)) {
        recordPoint(a)
        return false
      }
      if (!isPointSafe(b)) {
        recordPoint(b)
        return false
      }

      for (const [c, d] of heartEdges) {
        if (segmentsIntersect(a, b, c, d)) {
          recordPoint(new THREE.Vector2((a.x + b.x) / 2, (a.y + b.y) / 2))
          return false
        }
      }

      const dx = b.x - a.x
      const dy = b.y - a.y
      const len = Math.hypot(dx, dy)
      if (len <= Number.EPSILON) continue

      const steps = Math.ceil(len / stepMm)
      for (let s = 1; s < steps; s++) {
        const t = s / steps
        const sample = new THREE.Vector2(a.x + dx * t, a.y + dy * t)
        if (!isPointSafe(sample)) {
          recordPoint(sample)
          return false
        }
      }
    }

    return true
  }

  const layout = buildLayout(normalizedText, font, 1, spacing)
  const safeWidth = Math.max(layout.totalWidth, Number.EPSILON)
  const mmPerUnit = (widthCm * 10) / safeWidth
  const offsetX = layout.totalWidth / 2
  const offsetYmm = textOffsetYcm * 10

  for (const letter of layout.letters) {
    if (letter.char === " ") continue

    const rawShapes = font.generateShapes(letter.char, 1)
    const repairedShapes = repairGlyphShapes(rawShapes, textCurveSegments)

    for (const shape of repairedShapes) {
      const outer = shape.getPoints(textCurveSegments)
      if (outer.length > 0) outer.push(outer[0])
      const outerPoints = outer.map(
        (point) =>
          new THREE.Vector2(
            (point.x + letter.x - offsetX) * mmPerUnit,
            -point.y * mmPerUnit + offsetYmm
          )
      )
      if (outerPoints.length > 1) {
        debugTextPolylines.push(
          outerPoints.map((p) => [p.x, p.y] as [number, number])
        )
      }

        if (!checkPolyline(outerPoints)) {
          return {
            isSafe: false,
            marginMm: safeMarginMm,
            debugPointsMm: debugPoints,
            heartPolygonMm,
            textPolylinesMm: debugTextPolylines,
          }
        }

      for (const hole of shape.holes) {
        const holePoints = hole.getPoints(textCurveSegments)
        if (holePoints.length > 0) holePoints.push(holePoints[0])
        const holePolyline = holePoints.map(
          (point) =>
            new THREE.Vector2(
              (point.x + letter.x - offsetX) * mmPerUnit,
              -point.y * mmPerUnit + offsetYmm
            )
        )
        if (holePolyline.length > 1) {
          debugTextPolylines.push(
            holePolyline.map((p) => [p.x, p.y] as [number, number])
          )
        }
        if (!checkPolyline(holePolyline)) {
          return {
            isSafe: false,
            marginMm: safeMarginMm,
            debugPointsMm: debugPoints,
            heartPolygonMm,
            textPolylinesMm: debugTextPolylines,
          }
        }
      }
    }
  }

  return {
    isSafe: true,
    marginMm: safeMarginMm,
    heartPolygonMm,
    textPolylinesMm: debugTextPolylines,
  }
}

export function sanitizeNameInput(value: string) {
  return value.replace(/[^a-z]/gi, "")
}

export function toTitleCase(value: string) {
  return sanitizeNameInput(value)
    .toLowerCase()
    .replace(/\b[a-z]/g, (match) => match.toUpperCase())
}

export function getMaterialPreset(material: MaterialKey | "engraving") {
  if (material === "engraving") {
    material = "mdf"
  }
  if (material === "mdf") {
    return {
      color: "#B6895F",
      roughness: 0.82,
      metalness: 0.02,
      clearcoat: 0.04,
      clearcoatRoughness: 0.9,
      envMapIntensity: 0.55,
      transmission: 0,
      transparent: false,
      opacity: 1,
    }
  }

  if (material === "multiplex") {
    return {
      color: "#D1A876",
      roughness: 0.62,
      metalness: 0.03,
      clearcoat: 0.1,
      clearcoatRoughness: 0.7,
      envMapIntensity: 0.7,
      transmission: 0,
      transparent: false,
      opacity: 1,
    }
  }

  return {
    color: "#F0F5FF",
    roughness: 0.14,
    metalness: 0,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.05,
    transmission: 0.55,
    transparent: true,
    opacity: 0.82,
  }
}

function signedArea(points: THREE.Vector2[]) {
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].y - points[j].x * points[i].y
  }
  return area * 0.5
}

function isPointInsidePolygon(point: THREE.Vector2, polygon: THREE.Vector2[]) {
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + Number.EPSILON) + xi

    if (intersects) inside = !inside
  }

  return inside
}

function distanceToPolygonEdges(point: THREE.Vector2, polygon: THREE.Vector2[]) {
  let min = Number.POSITIVE_INFINITY
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % polygon.length]
    const dist = distancePointToSegment(point, a, b)
    if (dist < min) min = dist
  }
  return min
}

function distancePointToSegment(
  point: THREE.Vector2,
  a: THREE.Vector2,
  b: THREE.Vector2
) {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const apx = point.x - a.x
  const apy = point.y - a.y
  const abLenSq = abx * abx + aby * aby
  if (abLenSq <= Number.EPSILON) {
    return Math.hypot(apx, apy)
  }
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq))
  const closestX = a.x + abx * t
  const closestY = a.y + aby * t
  return Math.hypot(point.x - closestX, point.y - closestY)
}

function orientation(a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
}

function onSegment(a: THREE.Vector2, b: THREE.Vector2, c: THREE.Vector2) {
  const minX = Math.min(a.x, b.x) - Number.EPSILON
  const maxX = Math.max(a.x, b.x) + Number.EPSILON
  const minY = Math.min(a.y, b.y) - Number.EPSILON
  const maxY = Math.max(a.y, b.y) + Number.EPSILON
  return c.x >= minX && c.x <= maxX && c.y >= minY && c.y <= maxY
}

function segmentsIntersect(
  a: THREE.Vector2,
  b: THREE.Vector2,
  c: THREE.Vector2,
  d: THREE.Vector2
) {
  const o1 = orientation(a, b, c)
  const o2 = orientation(a, b, d)
  const o3 = orientation(c, d, a)
  const o4 = orientation(c, d, b)

  if (o1 === 0 && onSegment(a, b, c)) return true
  if (o2 === 0 && onSegment(a, b, d)) return true
  if (o3 === 0 && onSegment(c, d, a)) return true
  if (o4 === 0 && onSegment(c, d, b)) return true

  return (o1 > 0 && o2 < 0 && o3 > 0 && o4 < 0) ||
    (o1 < 0 && o2 > 0 && o3 < 0 && o4 > 0)
}

function clonePath(path: THREE.Path) {
  const cloned = new THREE.Path()
  cloned.autoClose = path.autoClose
  cloned.currentPoint.copy(path.currentPoint)
  cloned.curves = path.curves.map((curve) => curve.clone())
  return cloned
}

function cloneShapeFromPath(path: THREE.Path) {
  const shape = new THREE.Shape()
  shape.autoClose = path.autoClose
  shape.currentPoint.copy(path.currentPoint)
  shape.curves = path.curves.map((curve) => curve.clone())
  return shape
}

export function repairGlyphShapes(shapes: THREE.Shape[], curveSegments: number) {
  const contours: THREE.Path[] = []

  for (const shape of shapes) {
    contours.push(shape)
    for (const hole of shape.holes) {
      contours.push(hole)
    }
  }

  if (contours.length <= 1) return shapes

  const nodes = contours.map((path) => {
    const points = path.getPoints(curveSegments)
    const area = Math.abs(signedArea(points))
    const a = points[0] ?? new THREE.Vector2()
    const b = points[Math.floor(points.length / 3)] ?? a
    const c = points[Math.floor((2 * points.length) / 3)] ?? a
    const probe = new THREE.Vector2(
      (a.x + b.x + c.x) / 3,
      (a.y + b.y + c.y) / 3
    )

    return {
      path,
      points,
      area,
      probe,
      parent: null as number | null,
      depth: 0,
    }
  })

  for (let i = 0; i < nodes.length; i++) {
    let bestParent: number | null = null
    let bestParentArea = Number.POSITIVE_INFINITY

    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue
      if (nodes[j].area <= nodes[i].area) continue
      if (!isPointInsidePolygon(nodes[i].probe, nodes[j].points)) continue
      if (nodes[j].area < bestParentArea) {
        bestParent = j
        bestParentArea = nodes[j].area
      }
    }

    nodes[i].parent = bestParent
  }

  for (let i = 0; i < nodes.length; i++) {
    let depth = 0
    let parent = nodes[i].parent
    const visited = new Set<number>()

    while (parent !== null && !visited.has(parent)) {
      visited.add(parent)
      depth += 1
      parent = nodes[parent].parent
    }

    nodes[i].depth = depth
  }

  const childrenByParent = new Map<number, number[]>()

  for (let i = 0; i < nodes.length; i++) {
    const parent = nodes[i].parent
    if (parent === null) continue
    const children = childrenByParent.get(parent) ?? []
    children.push(i)
    childrenByParent.set(parent, children)
  }

  const repaired: THREE.Shape[] = []

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].depth % 2 !== 0) continue

    const shape = cloneShapeFromPath(nodes[i].path)
    const children = childrenByParent.get(i) ?? []

    for (const childIdx of children) {
      if (nodes[childIdx].depth % 2 === 1) {
        shape.holes.push(clonePath(nodes[childIdx].path))
      }
    }

    repaired.push(shape)
  }

  return repaired.length > 0 ? repaired : shapes
}
