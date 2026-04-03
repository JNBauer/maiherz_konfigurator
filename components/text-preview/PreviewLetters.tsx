"use client"

import { useEffect, useMemo } from "react"
import * as THREE from "three"
import type { Font } from "three/examples/jsm/loaders/FontLoader.js"

import {
  WIDTH_CM_TO_SCENE_SIZE,
  buildLayout,
  getMaterialPreset,
  type TextMaterialKey,
  repairGlyphShapes,
} from "./helpers"

function LetterMesh({
  char,
  size,
  height,
  parsedFont,
  material,
  renderMode,
}: {
  char: string
  size: number
  height: number
  parsedFont: Font
  material: TextMaterialKey
  renderMode: "raised" | "engraved"
}) {
  const materialPreset = useMemo(() => getMaterialPreset(material), [material])
  const isEngraved = renderMode === "engraved"

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
        color={isEngraved ? "#4a2e1e" : materialPreset.color}
        roughness={isEngraved ? 0.9 : materialPreset.roughness}
        metalness={isEngraved ? 0 : materialPreset.metalness}
        clearcoat={isEngraved ? 0 : materialPreset.clearcoat}
        clearcoatRoughness={
          isEngraved ? 1 : materialPreset.clearcoatRoughness
        }
        envMapIntensity={isEngraved ? 0.1 : materialPreset.envMapIntensity}
        transmission={isEngraved ? 0 : materialPreset.transmission}
        transparent={isEngraved ? false : materialPreset.transparent}
        opacity={isEngraved ? 1 : materialPreset.opacity}
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
  elevation = 0,
  offsetYcm = 0,
  renderMode = "raised",
}: {
  text: string
  widthCm: number
  height: number
  spacing: number
  parsedFont: Font
  material: TextMaterialKey
  elevation?: number
  offsetYcm?: number
  renderMode?: "raised" | "engraved"
}) {
  const baseSize = 1
  const layout = useMemo(() => {
    return buildLayout(text, parsedFont, baseSize, spacing)
  }, [text, parsedFont, spacing])

  const widthScene = widthCm * WIDTH_CM_TO_SCENE_SIZE
  const offsetScene = offsetYcm * WIDTH_CM_TO_SCENE_SIZE
  const safeWidth = Math.max(layout.totalWidth, 0.0001)
  const uniformScale = widthScene / safeWidth

  return (
    <group
      position={[-(layout.totalWidth * uniformScale) / 2, elevation, offsetScene]}
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
              renderMode={renderMode}
            />
          </group>
        )
      })}
    </group>
  )
}
