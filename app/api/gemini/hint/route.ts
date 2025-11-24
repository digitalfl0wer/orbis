import { NextRequest } from "next/server"
import { randomUUID } from "crypto"
import { z } from "zod"
import { getClientAndModel } from "@/lib/server/genai"
import { guardrails } from "@/lib/server/guardrails"
import { makeApiResponse, parseAIResponse } from "@/lib/server/apiResponse"
import { generateGeminiCompletion } from "@/lib/server/gemini"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const hintRequestSchema = z.object({
  problemPrompt: z.string().min(1).max(4000),
  context: z.string().max(2000).optional(),
  code: z.string().max(4000).optional(),
})

export async function POST(req: NextRequest) {
  const requestId = randomUUID()
  const parseResult = hintRequestSchema.safeParse(await req.json())
  if (!parseResult.success) {
    return makeApiResponse(
      {
        ok: false,
        error: "Invalid hint payload",
        details: parseResult.error.flatten(),
        status: 400,
      },
      requestId
    )
  }

  const { problemPrompt, context, code } = parseResult.data
  const { client, modelName } = getClientAndModel()
  if (!client || !modelName) {
    return makeApiResponse(
      {
        ok: false,
        error: "AI disabled: missing GOOGLE_API_KEY/GEMINI_API_KEY",
        status: 503,
      },
      requestId
    )
  }

  const system = [
    "You are a helpful coding mentor.",
    guardrails("Guidance"),
    "Generate a 3-step hint ladder as JSON with keys {nudge, strategy, specific}. Keep it concise and do not reveal full solutions.",
  ]
    .filter(Boolean)
    .join("\n\n")

  const userParts = [
    `Problem:\n${problemPrompt}`,
    context ? `Context:\n${context}` : "",
    code ? `User code (optional):\n${code}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")

  const prompt = `${system}\n\n${userParts}`

  try {
    const text = await generateGeminiCompletion(client, modelName, prompt)
    const data = parseAIResponse(text)
    return makeApiResponse({ ok: true, data }, requestId)
  } catch (err: any) {
    const isProd = process.env.NODE_ENV === "production"
    console.error(
      `[${requestId}] /api/gemini/hint model call failed:`,
      err
    )
    const details = isProd
      ? undefined
      : {
          name: err?.name,
          message: err?.message,
          stack: err?.stack?.slice(0, 2000),
        }
    return makeApiResponse(
      {
        ok: false,
        error: err?.message || "Hint request failed",
        details,
        status: 502,
      },
      requestId
    )
  }
}

