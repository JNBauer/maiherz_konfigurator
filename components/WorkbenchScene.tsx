"use client"

import { useGLTF } from "@react-three/drei"
import { useEffect } from "react"
import * as THREE from "three"

type WorkbenchSceneProps = {
  onLetterLevel?: (obj: THREE.Object3D) => void
  onSceneReady?: () => void
}

export default function WorkbenchScene({
  onLetterLevel,
  onSceneReady,
}: WorkbenchSceneProps) {
  const { scene } = useGLTF("/models/workbench_scene5.glb")

  useEffect(() => {
    const letterAnchor = scene.getObjectByName("letter_level")

    if (letterAnchor && onLetterLevel) {
      onLetterLevel(letterAnchor)
    }
    onSceneReady?.()
  }, [scene, onLetterLevel, onSceneReady])

  return <primitive object={scene} />
}
