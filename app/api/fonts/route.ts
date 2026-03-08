import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { NextResponse } from "next/server"

type FontItem = {
  file: string
  label: string
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (match) => match.toUpperCase())
}

function toLabel(fileName: string) {
  const base = fileName.replace(/\.json$/i, "")
  const cleaned = base
    .replace(/\.typeface$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+regular$/i, "")
    .trim()

  return toTitleCase(cleaned)
}

export async function GET() {
  const fontsDir = join(process.cwd(), "public", "fonts")
  const entries = await readdir(fontsDir, { withFileTypes: true })

  const fonts: FontItem[] = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .filter((name) => !name.toLowerCase().includes("zone.identifier"))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => ({
      file,
      label: toLabel(file),
    }))

  return NextResponse.json({ fonts })
}
