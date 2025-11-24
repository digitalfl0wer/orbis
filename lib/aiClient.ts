import { generateHintLadder, generateTotalHelp, extractProblemFields } from "@/lib/ai"

type GeminiResponse<T> = {
  ok: boolean
  data?: T
  error?: string
  details?: unknown
}

async function callGemini<T>(url: string, payload: object): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const data: GeminiResponse<T> = await res.json()
  if (!res.ok || !data?.ok || !data.data) {
    throw new Error(data?.error || "Gemini request failed")
  }
  return data.data
}

export async function getHints(problemPrompt: string) {
  try {
    return await callGemini<{ nudge: string; strategy: string; specific: string }>(
      "/api/gemini/hint",
      { problemPrompt }
    )
  } catch {
    return generateHintLadder(problemPrompt)
  }
}

export async function getTotalHelp(problemPrompt: string) {
  try {
    return await callGemini<{
      eli5: string
      practical: string
      technical: string
      edgeCases: string[]
      minimalTests: { input: any[]; expected: any; note?: string }[]
    }>("/api/gemini/explain", { problemPrompt })
  } catch {
    return generateTotalHelp(problemPrompt)
  }
}

export async function extractProblem(input: string) {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "extract", prompt: input }),
    })
    const data = await res.json()
    if (res.ok && data?.data) return data.data
  } catch {}
  return extractProblemFields(input)
}

export async function chat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  problemContext: string,
  assistanceLevel: 'Review' | 'Guidance' | 'Total Help',
  code?: string,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, problemContext, assistanceLevel, code }),
    signal,
  })
  const data = await res.json()
  if (res.ok && data?.data?.text) return String(data.data.text)
  throw new Error(data?.error || "Chat failed")
}
