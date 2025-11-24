import { NextRequest } from "next/server"
import { randomUUID } from "crypto"
import { getClientAndModel } from "@/lib/server/genai"
import { guardrails } from "@/lib/server/guardrails"
import { z } from "zod"
import { makeApiResponse, parseAIResponse } from "@/lib/server/apiResponse"
import { generateGeminiCompletion } from "@/lib/server/gemini"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(3000),
      })
    )
    .min(1)
    .max(20),
  problemContext: z.string().max(4000).optional(),
  assistanceLevel: z.enum(['Review', 'Guidance', 'Total Help']).default('Guidance'),
  code: z.string().max(4000).optional(),
})

interface ChatRequestBody extends z.infer<typeof chatRequestSchema> {}

function buildPrompt(body: ChatRequestBody) {
  const { messages, problemContext, assistanceLevel, code } = body
  const system = [
    'You are a helpful coding mentor.',
    guardrails(assistanceLevel),
    'If information is missing, be explicit about assumptions.',
    'Keep responses succinct.',
    problemContext ? `Context:\n${problemContext}` : '',
    assistanceLevel !== 'Review' && code ? `User code (optional):\n${code}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  const userTurns = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')

  return `${system}\n\nCHAT:\n${userTurns}`
}

export async function POST(req: NextRequest) {
  const requestId = randomUUID()
  try {
    const parseResult = chatRequestSchema.safeParse(await req.json())
    if (!parseResult.success) {
      const details = parseResult.error.flatten()
      return makeApiResponse(
        {
          ok: false,
          error: 'Invalid chat payload',
          details,
          status: 400,
        },
        requestId
      )
    }

    const body = parseResult.data
    const { client, modelName } = getClientAndModel()
    if (!client || !modelName) {
      return makeApiResponse(
        {
          ok: false,
          error: 'AI disabled: missing GOOGLE_API_KEY/GEMINI_API_KEY',
          status: 503,
        },
        requestId
      )
    }

    const prompt = buildPrompt(body)

    try {
      const text = await generateGeminiCompletion(client, modelName, prompt)
      const data = parseAIResponse(text)

      return makeApiResponse(
        {
          ok: true,
          data,
        },
        requestId
      )
    } catch (err: any) {
      const isProd = process.env.NODE_ENV === 'production'
      console.error(`[${requestId}] /api/gemini/chat model call failed:`, err)
      const details = isProd
        ? undefined
        : { name: err?.name, message: err?.message, stack: err?.stack?.slice(0, 2000) }
      return makeApiResponse(
        {
          ok: false,
          error: err?.message || 'Model call failed',
          details,
          status: 502,
        },
        requestId
      )
    }
  } catch (err: any) {
    const isProd = process.env.NODE_ENV === 'production'
    console.error(`[${requestId}] /api/gemini/chat error:`, err)
    const details = isProd
      ? undefined
      : { name: err?.name, message: err?.message, stack: err?.stack?.slice(0, 2000) }
    return makeApiResponse(
      {
        ok: false,
        error: err?.message || 'Chat error',
        details,
        status: 500,
      },
      requestId
    )
  }
}
