import { GoogleGenAI } from "@google/genai"
export async function generateGeminiCompletion(
  client: GoogleGenAI,
  modelName: string,
  prompt: string,
  maxOutputTokens = 512,
  temperature = 0.3
) {
  const response = await client.models.generateContent({
    model: modelName,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens, temperature },
  })

  const raw = (response as any).text ?? (response as any).output_text ?? ""
  return raw
}

