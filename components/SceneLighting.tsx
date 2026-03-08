"use client"

import { Environment } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useEffect } from "react"
import * as THREE from "three"

export default function SceneLighting() {
  const { gl } = useThree()

  useEffect(() => {
    const prevToneMapping = gl.toneMapping
    const prevExposure = gl.toneMappingExposure
    const prevOutputColorSpace = gl.outputColorSpace
    const prevShadowEnabled = gl.shadowMap.enabled
    const prevShadowType = gl.shadowMap.type

    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 0.85
    gl.outputColorSpace = THREE.SRGBColorSpace
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap

    return () => {
      gl.toneMapping = prevToneMapping
      gl.toneMappingExposure = prevExposure
      gl.outputColorSpace = prevOutputColorSpace
      gl.shadowMap.enabled = prevShadowEnabled
      gl.shadowMap.type = prevShadowType
    }
  }, [gl])

  return (
    <>
      <Environment preset="warehouse" environmentIntensity={0.45} />

      <ambientLight intensity={0.08} color="#F5EBD8" />
      <hemisphereLight args={["#FFE7C2", "#6E6254", 0.22]} />

      <directionalLight
        position={[4.5, 6.5, 5]}
        intensity={0.62}
        color="#FFD9A8"
        castShadow
        shadow-mapSize-width={3072}
        shadow-mapSize-height={3072}
        shadow-bias={-0.00008}
      />

      <directionalLight
        position={[-4, 3.5, -3]}
        intensity={0.2}
        color="#BFD3FF"
      />

      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={0.6}
        intensity={0.12}
        color="#FFE3B8"
      />
    </>
  )
}
