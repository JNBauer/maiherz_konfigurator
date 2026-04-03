import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

import { exportDesignSvg } from "@/lib/exportDesignSvg"

export const runtime = "nodejs"

type RequestBody = {
  fullName: string
  email: string
  phone?: string
  message?: string
  includeHeart: boolean
  heartVariant: string
  heartWidthCm: number
  heartHeightCm: number
  heartMaterial: string
  heartThicknessMm: number
  text: string
  textWidthCm: number
  textHeightCm: number
  textOffsetYcm: number
  textMaterial: string
  textThicknessMm: number
  spacing: number
  selectedFontFile: string
}

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name} environment variable`)
  }
  return value
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody

    if (!body.fullName || !body.email) {
      return NextResponse.json(
        { error: "Bitte Name und E-Mail angeben." },
        { status: 400 }
      )
    }

    const svg = await exportDesignSvg({
      text: body.text,
      textWidthCm: body.textWidthCm,
      textHeightCm: body.textHeightCm,
      spacing: body.spacing,
      textOffsetYcm: body.textOffsetYcm,
      textMaterial: body.textMaterial,
      heartWidthCm: body.heartWidthCm,
      heartHeightCm: body.heartHeightCm,
      heartVariant: body.heartVariant,
      includeHeart: body.includeHeart,
      selectedFontFile: body.selectedFontFile,
    })

    const host = requireEnv("SMTP_HOST")
    const port = Number(requireEnv("SMTP_PORT"))
    const user = requireEnv("SMTP_USER")
    const pass = requireEnv("SMTP_PASS")
    const from = process.env.SMTP_FROM ?? user

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    const summary = [
      `Name: ${body.fullName}`,
      `E-Mail: ${body.email}`,
      body.phone ? `Telefon: ${body.phone}` : null,
      body.message ? `Nachricht: ${body.message}` : null,
      "",
      "Design:",
      `Herz aktiv: ${body.includeHeart ? "Ja" : "Nein"}`,
      `Herz Variante: ${body.heartVariant}`,
      `Herz Material: ${body.heartMaterial}`,
      `Herz Groesse: ${body.heartWidthCm} x ${body.heartHeightCm} cm`,
      `Herz Dicke: ${body.heartThicknessMm} mm`,
      `Text: ${body.text}`,
      `Text Breite: ${body.textWidthCm} cm`,
      `Text Hoehe: ${body.textHeightCm} cm`,
      `Text Offset Y: ${body.textOffsetYcm} cm`,
      `Text Material: ${body.textMaterial}`,
      `Text Dicke: ${body.textThicknessMm} mm`,
      `Spacing: ${body.spacing}`,
      `Font: ${body.selectedFontFile}`,
    ]
      .filter(Boolean)
      .join("\n")

    await transporter.sendMail({
      from,
      to: "julian.bauer28@gmail.com",
      subject: "Neue Auftragsanfrage",
      text: summary,
      attachments: [
        {
          filename: "maiherz-design.svg",
          content: svg,
          contentType: "image/svg+xml",
        },
      ],
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Senden fehlgeschlagen. Bitte SMTP-Konfiguration pruefen." },
      { status: 500 }
    )
  }
}
