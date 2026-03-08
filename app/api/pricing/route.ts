import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { NextResponse } from "next/server"

type MaterialKey = "mdf" | "multiplex" | "acryl"

type PricingConfig = {
  currency: string
  vatPercent: number
  materialRates: Array<{
    material: MaterialKey
    thicknessMm: number
    pricePerM2: number
  }>
  laserCutting: {
    setupFee: number
    pricePerCm2: number
    pricePerLetter: number
    minimumFee: number
  }
  delivery: {
    freeFromSubtotal: number
    methods: Array<{
      key: string
      label: string
      flatFee: number
    }>
  }
}

function isMaterialKey(value: unknown): value is MaterialKey {
  return value === "mdf" || value === "multiplex" || value === "acryl"
}

export async function GET() {
  const configPath = join(process.cwd(), "data", "pricing-config.json")
  const raw = await readFile(configPath, "utf8")
  const parsed = JSON.parse(raw) as Partial<PricingConfig>

  const materialRates = Array.isArray(parsed.materialRates)
    ? parsed.materialRates.filter(
        (item): item is PricingConfig["materialRates"][number] =>
          !!item &&
          isMaterialKey(item.material) &&
          typeof item.thicknessMm === "number" &&
          typeof item.pricePerM2 === "number"
      )
    : []

  const methods = Array.isArray(parsed.delivery?.methods)
    ? parsed.delivery.methods.filter(
        (method): method is PricingConfig["delivery"]["methods"][number] =>
          !!method &&
          typeof method.key === "string" &&
          typeof method.label === "string" &&
          typeof method.flatFee === "number"
      )
    : []

  const safe: PricingConfig = {
    currency: typeof parsed.currency === "string" ? parsed.currency : "EUR",
    vatPercent: typeof parsed.vatPercent === "number" ? parsed.vatPercent : 19,
    materialRates,
    laserCutting: {
      setupFee:
        typeof parsed.laserCutting?.setupFee === "number"
          ? parsed.laserCutting.setupFee
          : 0,
      pricePerCm2:
        typeof parsed.laserCutting?.pricePerCm2 === "number"
          ? parsed.laserCutting.pricePerCm2
          : 0,
      pricePerLetter:
        typeof parsed.laserCutting?.pricePerLetter === "number"
          ? parsed.laserCutting.pricePerLetter
          : 0,
      minimumFee:
        typeof parsed.laserCutting?.minimumFee === "number"
          ? parsed.laserCutting.minimumFee
          : 0,
    },
    delivery: {
      freeFromSubtotal:
        typeof parsed.delivery?.freeFromSubtotal === "number"
          ? parsed.delivery.freeFromSubtotal
          : Number.POSITIVE_INFINITY,
      methods,
    },
  }

  return NextResponse.json(safe)
}
