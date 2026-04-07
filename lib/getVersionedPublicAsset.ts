import { statSync } from "fs"
import path from "path"

export function getVersionedPublicAsset(assetPath: string) {
  if (!assetPath.startsWith("/")) {
    throw new Error(`Expected an absolute public asset path, got: ${assetPath}`)
  }

  const fullPath = path.join(process.cwd(), "public", assetPath.slice(1))

  try {
    const version = statSync(fullPath).mtimeMs.toFixed(0)
    return `${assetPath}?v=${version}`
  } catch {
    return assetPath
  }
}
