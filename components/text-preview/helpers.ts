import * as THREE from "three"

// Calibration: 0.360 scene-size should be ~40 cm wide in UI scale.
export const WIDTH_CM_TO_SCENE_SIZE = 0.009

export const MATERIAL_OPTIONS = [
  { key: "mdf", label: "MDF" },
  { key: "multiplex", label: "Multiplex" },
  { key: "acryl", label: "Acryl" },
] as const

export const THICKNESS_OPTIONS_MM = [3, 5, 8] as const

export type LayoutLetter = {
  char: string
  x: number
}

export type FontOption = {
  file: string
  label: string
}

export type MaterialKey = (typeof MATERIAL_OPTIONS)[number]["key"]

export type WorkshopMaterialSheet = {
  id: string
  material: MaterialKey
  thicknessMm: number
  widthCm: number
  heightCm: number
  quantity: number
  note?: string
}

export type AnchorTransform = {
  position: [number, number, number]
  quaternion: [number, number, number, number]
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

function measureCharBounds(font: THREE.Font, char: string, size: number) {
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
  font: THREE.Font,
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

export function sanitizeNameInput(value: string) {
  return value.replace(/[^a-z]/gi, "")
}

export function toTitleCase(value: string) {
  return sanitizeNameInput(value)
    .toLowerCase()
    .replace(/\b[a-z]/g, (match) => match.toUpperCase())
}

export function getMaterialPreset(material: MaterialKey) {
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
