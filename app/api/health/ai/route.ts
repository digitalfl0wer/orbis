import { NextResponse } from "next/server"
import { getApiKey, resolveModel } from "@/lib/server/genai"

export const runtime = "nodejs"
export const dynamic = "force-static"

export async function GET() {
  const model = resolveModel()
  const key = getApiKey()
  if (!key) {
    return NextResponse.json({ ok: false, keyConfigured: false, model }, { status: 503 })
  }
  return NextResponse.json({ ok: true, keyConfigured: true, model })
}

