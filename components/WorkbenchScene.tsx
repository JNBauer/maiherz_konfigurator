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
  const { scene } = useGLTF("/models/workbench_scene_red_14.glb")

  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow = true
        mesh.receiveShadow = true

        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]
        for (const material of materials) {
          if (!material) continue
          if ("side" in material) {
            material.side = THREE.DoubleSide
          }
          const anyMaterial = material as THREE.MeshStandardMaterial
          if (anyMaterial.map) {
            anyMaterial.map.colorSpace = THREE.SRGBColorSpace
          }
          material.needsUpdate = true
        }
      }
    })

    const letterAnchor = scene.getObjectByName("letter_level")

    if (letterAnchor && onLetterLevel) {
      onLetterLevel(letterAnchor)
    }
    onSceneReady?.()
  }, [scene, onLetterLevel, onSceneReady])

  return <primitive object={scene} />
}
