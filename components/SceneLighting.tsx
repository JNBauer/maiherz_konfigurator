"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"

const DEFAULT_TARGET: [number, number, number] = [0, 0, 0]

type SceneLightingProps = {
  targetPosition?: [number, number, number] | null
}

export default function SceneLighting({ targetPosition }: SceneLightingProps) {
  const { gl, scene } = useThree()
  const lightRef = useRef<THREE.SpotLight | null>(null)
  const targetRef = useRef<THREE.Object3D | null>(null)
  const lightOffset = useRef(new THREE.Vector3(0, 0.65, 0.6))

  useEffect(() => {
    const prevToneMapping = gl.toneMapping
    const prevExposure = gl.toneMappingExposure
    const prevOutputColorSpace = gl.outputColorSpace
    const prevShadowEnabled = gl.shadowMap.enabled
    const prevShadowType = gl.shadowMap.type

    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 0.9
    gl.outputColorSpace = THREE.SRGBColorSpace
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFShadowMap

    return () => {
      gl.toneMapping = prevToneMapping
      gl.toneMappingExposure = prevExposure
      gl.outputColorSpace = prevOutputColorSpace
      gl.shadowMap.enabled = prevShadowEnabled
      gl.shadowMap.type = prevShadowType
    }
  }, [gl])

  useEffect(() => {
    const prevBackground = scene.background
    scene.background = new THREE.Color("#1a1510")
    return () => {
      scene.background = prevBackground
    }
  }, [scene])

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const step = event.shiftKey ? 0.25 : 0.08
      switch (event.key) {
        case "ArrowLeft":
          lightOffset.current.x -= step
          break
        case "ArrowRight":
          lightOffset.current.x += step
          break
        case "ArrowUp":
          lightOffset.current.z -= step
          break
        case "ArrowDown":
          lightOffset.current.z += step
          break
        case "PageUp":
          lightOffset.current.y += step
          break
        case "PageDown":
          lightOffset.current.y = Math.max(0.1, lightOffset.current.y - step)
          break
        case "r":
        case "R":
          lightOffset.current.set(0, 0.65, 0.6)
          break
        default:
          return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useFrame(() => {
    const light = lightRef.current
    const target = targetRef.current
    if (!light || !target) return
    const [tx, ty, tz] = targetPosition ?? DEFAULT_TARGET
    target.position.set(tx, ty, tz)
    light.position.set(
      tx + lightOffset.current.x,
      ty + lightOffset.current.y,
      tz + lightOffset.current.z
    )
    light.target.updateMatrixWorld()
  })

  return (
    <>
      <ambientLight intensity={0.08} color="#2b221b" />
      <object3D ref={targetRef} />
      <spotLight
        ref={lightRef}
        intensity={3.2}
        color="#ffe4c4"
        angle={0.8}
        penumbra={0.8}
        decay={1.8}
        distance={20}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00005}
        shadow-normalBias={0.02}
      />
    </>
  )
}
