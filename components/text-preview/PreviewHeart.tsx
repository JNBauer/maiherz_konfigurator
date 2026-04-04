"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"

import {
  WIDTH_CM_TO_SCENE_SIZE,
  buildHeartShape,
  getMaterialPreset,
  type MaterialKey,
} from "./helpers"

export default function PreviewHeart({
  widthCm,
  heightCm,
  height,
  material,
  svgText,
}: {
  widthCm: number
  heightCm: number
  height: number
  material: MaterialKey
  svgText: string | null
}) {
  const materialPreset = useMemo(() => getMaterialPreset(material), [material])
  const closeShape = useMemo(() => {
    return (shape: THREE.Shape) => {
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
  }, [])
  const shapes = useMemo(() => {
    if (!svgText) return [closeShape(buildHeartShape())]
    const loader = new SVGLoader()
    const data = loader.parse(svgText)
    const svgShapes = data.paths.flatMap((path) => SVGLoader.createShapes(path))
    const closed = svgShapes.map((shape) => closeShape(shape))
    return closed.length > 0 ? closed : [closeShape(buildHeartShape())]
  }, [closeShape, svgText])

  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: height,
      curveSegments: 24,
      bevelEnabled: false,
    })
    // Rotate 180deg in-plane to align SVG orientation without mirroring normals.
    geo.rotateZ(Math.PI)
    geo.computeBoundingBox()
    const box = geo.boundingBox
    if (box) {
      const offsetX = -(box.max.x + box.min.x) / 2
      const offsetY = -(box.max.y + box.min.y) / 2
      const offsetZ = -box.min.z
      geo.translate(offsetX, offsetY, offsetZ)
    }
    geo.computeVertexNormals()
    return geo
  }, [height, shapes])

  const bounds = useMemo(() => {
    geometry.computeBoundingBox()
    const box = geometry.boundingBox
    if (!box) return { width: 1, height: 1 }
    return {
      width: Math.max(box.max.x - box.min.x, 0.0001),
      height: Math.max(box.max.y - box.min.y, 0.0001),
    }
  }, [geometry])

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  const widthScene = widthCm * WIDTH_CM_TO_SCENE_SIZE
  const heightScene = heightCm * WIDTH_CM_TO_SCENE_SIZE
  const scaleX = widthScene / bounds.width
  const scaleY = heightScene / bounds.height

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} scale={[scaleX, scaleY, 1]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={materialPreset.color}
          roughness={materialPreset.roughness}
          metalness={materialPreset.metalness}
          clearcoat={materialPreset.clearcoat}
          clearcoatRoughness={materialPreset.clearcoatRoughness}
          envMapIntensity={materialPreset.envMapIntensity}
          transmission={materialPreset.transmission}
          transparent={materialPreset.transparent}
          opacity={materialPreset.opacity}
          thickness={0.22}
          ior={1.47}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
