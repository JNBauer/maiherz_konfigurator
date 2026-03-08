"use client"

import { OrbitControls } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useCallback, useEffect, useRef } from "react"
import * as THREE from "three"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"

type SceneCameraProps = {
  targetPosition: [number, number, number] | null
  onDebugChange?: (state: CameraDebugState) => void
}

// Fine-tune camera behavior here.
const CAMERA_SETTINGS = {
  minDistance: 0.5,
  maxDistance: 1.5,
  minPolarAngle: 0,
  maxPolarAngle: THREE.MathUtils.degToRad(70),
  minAzimuthAngle: THREE.MathUtils.degToRad(-30),
  maxAzimuthAngle: THREE.MathUtils.degToRad(30),
  dampingFactor: 0.08,
}

// Offset orbit target relative to letter_level.
const TARGET_OFFSET: [number, number, number] = [0.0, 0, -0.1]
const INITIAL_AZIMUTH = 0
const INITIAL_POLAR = 0.0001
const INITIAL_DISTANCE = 1.2

export type CameraDebugState = {
  pos: [number, number, number]
  rotDeg: [number, number, number]
  target: [number, number, number]
  polarDeg: number
  azimuthDeg: number
  distance: number
  fov: number
}

export default function SceneCamera({
  targetPosition,
  onDebugChange,
}: SceneCameraProps) {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const didSetInitialAngles = useRef(false)

  function round(value: number) {
    return Number(value.toFixed(2))
  }

  function toDeg(rad: number) {
    return THREE.MathUtils.radToDeg(rad)
  }

  const updateDebugState = useCallback(() => {
    const controls = controlsRef.current
    if (!controls) return

    const target = controls.target
    const euler = camera.rotation

    onDebugChange?.({
      pos: [
        round(camera.position.x),
        round(camera.position.y),
        round(camera.position.z),
      ],
      rotDeg: [round(toDeg(euler.x)), round(toDeg(euler.y)), round(toDeg(euler.z))],
      target: [round(target.x), round(target.y), round(target.z)],
      polarDeg: round(toDeg(controls.getPolarAngle())),
      azimuthDeg: round(toDeg(controls.getAzimuthalAngle())),
      distance: round(camera.position.distanceTo(target)),
      fov: round((camera as THREE.PerspectiveCamera).fov ?? 0),
    })
  }, [camera, onDebugChange])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || !targetPosition) return

    controls.target.set(
      targetPosition[0] + TARGET_OFFSET[0],
      targetPosition[1] + TARGET_OFFSET[1],
      targetPosition[2] + TARGET_OFFSET[2]
    )

    if (!didSetInitialAngles.current) {
      const target = controls.target
      camera.position.set(target.x, target.y + INITIAL_DISTANCE, target.z + 0.0001)
      camera.lookAt(target)
      controls.setAzimuthalAngle(INITIAL_AZIMUTH)
      controls.setPolarAngle(INITIAL_POLAR)
      controls.update()
      didSetInitialAngles.current = true
    }

    controls.update()
    updateDebugState()
  }, [targetPosition, updateDebugState])

  useEffect(() => {
    updateDebugState()
  }, [updateDebugState])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      enablePan={false}
      dampingFactor={CAMERA_SETTINGS.dampingFactor}
      minDistance={CAMERA_SETTINGS.minDistance}
      maxDistance={CAMERA_SETTINGS.maxDistance}
      minPolarAngle={CAMERA_SETTINGS.minPolarAngle}
      maxPolarAngle={CAMERA_SETTINGS.maxPolarAngle}
      minAzimuthAngle={CAMERA_SETTINGS.minAzimuthAngle}
      maxAzimuthAngle={CAMERA_SETTINGS.maxAzimuthAngle}
      onChange={updateDebugState}
    />
  )
}
