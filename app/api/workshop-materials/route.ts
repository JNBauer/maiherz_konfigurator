import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { NextResponse } from "next/server"

type MaterialKey = "mdf" | "multiplex" | "acryl"

type WorkshopMaterialSheet = {
  id: string
  material: MaterialKey
  thicknessMm: number
  widthCm: number
  heightCm: number
  quantity: number
  note?: string
}

type RawInventory = {
  sheets?: unknown
}

const MATERIAL_KEYS = new Set<MaterialKey>(["mdf", "multiplex", "acryl"])

function isValidSheet(value: unknown): value is WorkshopMaterialSheet {
  if (!value || typeof value !== "object") return false

  const sheet = value as Partial<WorkshopMaterialSheet>
  return (
    typeof sheet.id === "string" &&
    MATERIAL_KEYS.has(sheet.material as MaterialKey) &&
    typeof sheet.thicknessMm === "number" &&
    typeof sheet.widthCm === "number" &&
    typeof sheet.heightCm === "number" &&
    typeof sheet.quantity === "number"
  )
}

export async function GET() {
  const inventoryPath = join(process.cwd(), "data", "workshop-materials.json")
  const raw = await readFile(inventoryPath, "utf8")
  const parsed = JSON.parse(raw) as RawInventory

  const sheets = Array.isArray(parsed.sheets)
    ? parsed.sheets.filter(isValidSheet)
    : []

  return NextResponse.json({ sheets })
}
