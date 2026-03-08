"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"

import {
  WIDTH_CM_TO_SCENE_SIZE,
  buildLayout,
  getMaterialPreset,
  type MaterialKey,
  repairGlyphShapes,
} from "./helpers"

function LetterMesh({
  char,
  size,
  height,
  parsedFont,
  material,
}: {
  char: string
  size: number
  height: number
  parsedFont: THREE.Font
  material: MaterialKey
}) {
  const materialPreset = useMemo(() => getMaterialPreset(material), [material])

  const geometry = useMemo(() => {
    const rawShapes = parsedFont.generateShapes(char, size)
    const repairedShapes = repairGlyphShapes(rawShapes, 12)
    return new THREE.ExtrudeGeometry(repairedShapes, {
      depth: height,
      curveSegments: 12,
      bevelEnabled: false,
    })
  }, [char, height, parsedFont, size])

  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  return (
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
      />
    </mesh>
  )
}

export default function PreviewLetters({
  text,
  widthCm,
  height,
  spacing,
  parsedFont,
  material,
}: {
  text: string
  widthCm: number
  height: number
  spacing: number
  parsedFont: THREE.Font
  material: MaterialKey
}) {
  const baseSize = 1
  const layout = useMemo(() => {
    return buildLayout(text, parsedFont, baseSize, spacing)
  }, [text, parsedFont, spacing])

  const widthScene = widthCm * WIDTH_CM_TO_SCENE_SIZE
  const safeWidth = Math.max(layout.totalWidth, 0.0001)
  const uniformScale = widthScene / safeWidth

  return (
    <group
      position={[-(layout.totalWidth * uniformScale) / 2, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[uniformScale, uniformScale, 1]}
    >
      {layout.letters.map((l, i) => {
        if (l.char === " ") return null

        return (
          <group key={i} position={[l.x, 0, 0]}>
            <LetterMesh
              char={l.char}
              size={baseSize}
              height={height}
              parsedFont={parsedFont}
              material={material}
            />
          </group>
        )
      })}
    </group>
  )
}
