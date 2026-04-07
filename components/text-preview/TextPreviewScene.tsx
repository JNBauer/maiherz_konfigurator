"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { useEffect } from "react"
import type { ComponentProps } from "react"
import type { Font } from "three/examples/jsm/loaders/FontLoader.js"
import * as THREE from "three"

import SceneCamera from "../SceneCamera"
import type { CameraDebugState } from "../SceneCamera"
import SceneLighting from "../SceneLighting"
import WorkbenchScene from "../WorkbenchScene"
import ConfiguratorPanel from "./ConfiguratorPanel"
import PreviewHeart from "./PreviewHeart"
import PreviewLetters from "./PreviewLetters"
import {
  WIDTH_CM_TO_SCENE_SIZE,
  type AnchorTransform,
  type LaserSafetyResult,
  type MaterialKey,
  type TextMaterialKey,
} from "./helpers"

type ConfiguratorProps = ComponentProps<typeof ConfiguratorPanel>

type TextPreviewSceneProps = {
  sceneImageSrc: string
  anchorTransform: AnchorTransform | null
  onLetterLevel: (obj: THREE.Object3D) => void
  onSceneReady: () => void
  onDebugChange: (state: CameraDebugState | null) => void
  parsedFont: Font | null
  hasText: boolean
  hasHeart: boolean
  nameValue: string
  widthCm: number
  heartWidthCm: number
  heartHeightCm: number
  heartDepth: number
  heartMaterial: MaterialKey
  heartSvg: string | null
  textDepth: number
  engraveDepth: number
  spacing: number
  textMaterial: TextMaterialKey
  textElevation: number
  textOffsetYcm: number
  isEngraved: boolean
  textFitMarkers: Array<[number, number]>
  heartBorderPoints: THREE.Vector3[]
  textBorderPoints: THREE.Vector3[][]
  laserMarker: [number, number] | null
  laserSafety: LaserSafetyResult | null
  showSceneLoading: boolean
  onScreenshotReady: (handler: () => Promise<Blob | null>) => void
  configuratorProps: ConfiguratorProps
}

function ScreenshotBridge({
  onReady,
}: {
  onReady: (handler: () => Promise<Blob | null>) => void
}) {
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    const handler = async () => {
      return await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png")
      })
    }
    onReady(handler)
  }, [gl, onReady])

  return null
}

export default function TextPreviewScene({
  sceneImageSrc,
  anchorTransform,
  onLetterLevel,
  onSceneReady,
  onDebugChange,
  parsedFont,
  hasText,
  hasHeart,
  nameValue,
  widthCm,
  heartWidthCm,
  heartHeightCm,
  heartDepth,
  heartMaterial,
  heartSvg,
  textDepth,
  engraveDepth,
  spacing,
  textMaterial,
  textElevation,
  textOffsetYcm,
  isEngraved,
  textFitMarkers,
  heartBorderPoints,
  textBorderPoints,
  laserMarker,
  laserSafety,
  showSceneLoading,
  onScreenshotReady,
  configuratorProps,
}: TextPreviewSceneProps) {
  return (
    <div className="relative mx-auto w-[90%] md:overflow-hidden">
      <div className="relative h-[42vh] min-h-[480px] w-full overflow-hidden rounded-xl border border-amber-950/80 bg-stone-200 md:h-[82vh] md:min-h-[620px]">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ position: [0, 4, 14], fov: 45 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <SceneLighting targetPosition={anchorTransform?.position ?? null} />

          <WorkbenchScene onLetterLevel={onLetterLevel} onSceneReady={onSceneReady} />

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
                  heartBorderPoints.length > 0 ||
                  textBorderPoints.length > 0 ||
                  (laserMarker && !laserSafety?.isSafe))) && (
                <group>
                  {heartBorderPoints.length > 1 && (
                    <line>
                      <bufferGeometry attach="geometry">
                        <bufferAttribute
                          attach="attributes-position"
                          args={[
                            new Float32Array(
                              heartBorderPoints.flatMap((point) => [
                                point.x,
                                point.y,
                                point.z,
                              ])
                            ),
                            3,
                          ]}
                        />
                      </bufferGeometry>
                      <lineBasicMaterial color="#ffb020" />
                    </line>
                  )}

                  {textBorderPoints.map((polyline, idx) => (
                    <line key={`text-border-${idx}`}>
                      <bufferGeometry attach="geometry">
                        <bufferAttribute
                          attach="attributes-position"
                          args={[
                            new Float32Array(
                              polyline.flatMap((point) => [
                                point.x,
                                point.y,
                                point.z,
                              ])
                            ),
                            3,
                          ]}
                        />
                      </bufferGeometry>
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
            onDebugChange={onDebugChange}
          />

          <ScreenshotBridge onReady={onScreenshotReady} />
        </Canvas>

        {showSceneLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <img
              src={sceneImageSrc}
              alt="3D Szene Vorschau"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-stone-950/30">
              <div className="flex items-center gap-3 rounded-full border border-stone-300/60 bg-stone-900/70 px-4 py-2 text-base text-amber-50 shadow-sm">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200 border-t-transparent" />
                Lade 3D Szene...
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfiguratorPanel {...configuratorProps} />
    </div>
  )
}
