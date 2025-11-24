import { NextResponse } from "next/server"

export interface ApiResponsePayload {
  ok: boolean
  data?: unknown
  error?: string
  details?: unknown
  status?: number
}

export function makeApiResponse(payload: ApiResponsePayload, requestId: string) {
  const { ok, data, error, details, status = ok ? 200 : 500 } = payload
  return NextResponse.json(
    {
      ok,
      data,
      error,
      details,
      requestId,
    },
    { status }
  )
}

export function clampText(text: string, max = 2000) {
  if (!text) return ""
  return text.length > max ? text.slice(0, max) + "…" : text
}

export function parseAIResponse(text: string) {
  const jsonStart = text.indexOf("{")
  const arrStart = text.indexOf("[")
  const start =
    jsonStart === -1
      ? arrStart
      : arrStart === -1
      ? jsonStart
      : Math.min(jsonStart, arrStart)

  if (start >= 0) {
    try {
      return JSON.parse(text.slice(start))
    } catch {
      return { text: clampText(text) }
    }
  }

  return { text: clampText(text) }
}

