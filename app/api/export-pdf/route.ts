import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import { getDesignPolylines } from "@/lib/exportDesignSvg"

export const runtime = "nodejs"

const MM_TO_PT = 72 / 25.4
const DEFAULT_OVERLAP_MM = 10
const DEFAULT_PAPER = "A4"
const PAPER_SIZES_MM = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
} as const

type PaperSize = keyof typeof PAPER_SIZES_MM

type ExportPdfRequest = {
  text: string
  textWidthCm: number
  textHeightCm: number
  spacing: number
  textOffsetYcm: number
  textMaterial: string
  heartWidthCm: number
  heartHeightCm: number
  heartVariant: string
  includeHeart: boolean
  selectedFontFile: string
  paperSize?: PaperSize
  overlapMm?: number
}

function mmToPt(value: number) {
  return value * MM_TO_PT
}

function collectPageTiling(
  widthMm: number,
  heightMm: number,
  pageWidthMm: number,
  pageHeightMm: number,
  overlapMm: number
) {
  const safeOverlap = Math.min(
    Math.max(overlapMm, 0),
    Math.min(pageWidthMm, pageHeightMm) - 10
  )
  const stepX = pageWidthMm - safeOverlap
  const stepY = pageHeightMm - safeOverlap
  const cols = Math.max(1, Math.ceil(widthMm / stepX))
  const rows = Math.max(1, Math.ceil(heightMm / stepY))

  return { cols, rows, stepX, stepY, safeOverlap }
}

function chooseOrientation(
  widthMm: number,
  heightMm: number,
  paper: PaperSize,
  overlapMm: number
) {
  const size = PAPER_SIZES_MM[paper]

  const portrait = collectPageTiling(
    widthMm,
    heightMm,
    size.width,
    size.height,
    overlapMm
  )
  const landscape = collectPageTiling(
    widthMm,
    heightMm,
    size.height,
    size.width,
    overlapMm
  )

  const portraitPages = portrait.cols * portrait.rows
  const landscapePages = landscape.cols * landscape.rows

  if (portraitPages < landscapePages) {
    return {
      ...portrait,
      pageWidthMm: size.width,
      pageHeightMm: size.height,
    }
  }

  if (landscapePages < portraitPages) {
    return {
      ...landscape,
      pageWidthMm: size.height,
      pageHeightMm: size.width,
    }
  }

  const portraitMax = Math.max(portrait.cols, portrait.rows)
  const landscapeMax = Math.max(landscape.cols, landscape.rows)

  if (portraitMax <= landscapeMax) {
    return {
      ...portrait,
      pageWidthMm: size.width,
      pageHeightMm: size.height,
    }
  }

  return {
    ...landscape,
    pageWidthMm: size.height,
    pageHeightMm: size.width,
  }
}

function drawPolylines(
  page: ReturnType<PDFDocument["addPage"]>,
  polylines: Array<Array<[number, number]>>,
  offsetX: number,
  offsetY: number,
  pageHeightMm: number,
  strokeWidthMm: number,
  color: ReturnType<typeof rgb>
) {
  const thickness = mmToPt(strokeWidthMm)
  for (const poly of polylines) {
    for (let i = 0; i < poly.length - 1; i++) {
      const [x1Raw, y1Raw] = poly[i]
      const [x2Raw, y2Raw] = poly[i + 1]
      const x1 = mmToPt(x1Raw - offsetX)
      const x2 = mmToPt(x2Raw - offsetX)
      const y1 = mmToPt(pageHeightMm - (y1Raw - offsetY))
      const y2 = mmToPt(pageHeightMm - (y2Raw - offsetY))

      page.drawLine({
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 },
        thickness,
        color,
      })
    }
  }
}

function drawDashedLine(
  page: ReturnType<PDFDocument["addPage"]>,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dashMm = 5,
  gapMm = 3
) {
  page.drawLine({
    start: { x: mmToPt(x1), y: mmToPt(y1) },
    end: { x: mmToPt(x2), y: mmToPt(y2) },
    thickness: mmToPt(0.6),
    color: rgb(0.5, 0.5, 0.5),
    dashArray: [mmToPt(dashMm), mmToPt(gapMm)],
  })
}

export async function POST(req: Request) {
  const body = (await req.json()) as ExportPdfRequest
  const paperSize = body.paperSize ?? DEFAULT_PAPER
  const overlapMm =
    typeof body.overlapMm === "number" ? body.overlapMm : DEFAULT_OVERLAP_MM

  if (!PAPER_SIZES_MM[paperSize]) {
    return NextResponse.json({ error: "Unsupported paper size." }, { status: 400 })
  }

  const { heartPolylines, textPolylines, bounds } = await getDesignPolylines(
    body,
    2
  )

  const designWidthMm = Math.max(bounds.maxX - bounds.minX, 1)
  const designHeightMm = Math.max(bounds.maxY - bounds.minY, 1)

  const tiling = chooseOrientation(
    designWidthMm,
    designHeightMm,
    paperSize,
    overlapMm
  )

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const totalPages = tiling.cols * tiling.rows

  for (let row = 0; row < tiling.rows; row++) {
    for (let col = 0; col < tiling.cols; col++) {
      const offsetX = bounds.minX + col * tiling.stepX
      const offsetY = bounds.minY + row * tiling.stepY
      const page = pdfDoc.addPage([
        mmToPt(tiling.pageWidthMm),
        mmToPt(tiling.pageHeightMm),
      ])

      drawPolylines(
        page,
        heartPolylines,
        offsetX,
        offsetY,
        tiling.pageHeightMm,
        0.2,
        rgb(0, 0, 0)
      )

      const textColor =
        body.textMaterial === "engraving"
          ? rgb(0.11, 0.26, 0.81)
          : rgb(0.07, 0.07, 0.09)

      drawPolylines(
        page,
        textPolylines,
        offsetX,
        offsetY,
        tiling.pageHeightMm,
        0.2,
        textColor
      )

      if (tiling.safeOverlap > 0) {
        if (col > 0) {
          drawDashedLine(
            page,
            tiling.safeOverlap,
            0,
            tiling.safeOverlap,
            tiling.pageHeightMm
          )
        }
        if (col < tiling.cols - 1) {
          drawDashedLine(
            page,
            tiling.pageWidthMm - tiling.safeOverlap,
            0,
            tiling.pageWidthMm - tiling.safeOverlap,
            tiling.pageHeightMm
          )
        }
        if (row > 0) {
          drawDashedLine(
            page,
            0,
            tiling.safeOverlap,
            tiling.pageWidthMm,
            tiling.safeOverlap
          )
        }
        if (row < tiling.rows - 1) {
          drawDashedLine(
            page,
            0,
            tiling.pageHeightMm - tiling.safeOverlap,
            tiling.pageWidthMm,
            tiling.pageHeightMm - tiling.safeOverlap
          )
        }
      }

      const index = row * tiling.cols + col + 1
      page.drawText(
        `Seite ${index}/${totalPages} (Reihe ${row + 1} / Spalte ${col + 1})`,
        {
          x: mmToPt(8),
          y: mmToPt(tiling.pageHeightMm - 10),
          size: 9,
          font,
          color: rgb(0, 0, 0),
        }
      )
      if (tiling.safeOverlap > 0) {
        page.drawText(
          `Ueberlappung: ${tiling.safeOverlap.toFixed(0)} mm`,
          {
            x: mmToPt(8),
            y: mmToPt(tiling.pageHeightMm - 16),
            size: 8,
            font,
            color: rgb(0, 0, 0),
          }
        )
      }
    }
  }

  const pdfBuffer = await pdfDoc.save()

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="maiherz-blueprint.pdf"',
      "Cache-Control": "no-store",
    },
  })
}
