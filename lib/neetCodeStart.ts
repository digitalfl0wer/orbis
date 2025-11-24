import { NeetCodeProblem, neetCodeProblems } from "@/lib/neetcode"
import { putProblems } from "@/lib/db"

export async function startNeetCodeChallenge(level: NeetCodeProblem["difficulty"], index = 0) {
  try {
    const res = await fetch(`/api/neetcode?index=${index}&level=${level}`)
    if (!res.ok) {
      throw new Error("Failed to load NeetCode problem")
    }
    const payload = await res.json()
    const problem: NeetCodeProblem = payload?.data?.problem
    const id = `${problem.id}-${Date.now()}`
    await putProblems([
      {
        id,
        title: problem.title,
        prompt: problem.prompt,
        constraints: problem.constraints,
        examples: problem.examples,
        tags: problem.tags,
        source: "neetcode",
        createdAt: Date.now(),
      },
    ])
    try {
      localStorage.setItem("today-current-problem-id", id)
    } catch {}
    return { id, total: payload?.data?.total ?? 0, fallback: false }
  } catch (error) {
    console.warn("Falling back to cached NeetCode seed", error)
    const fallback =
      neetCodeProblems.find((p) => p.difficulty === level) ?? neetCodeProblems[0]
    const id = `${fallback.id}-fallback-${Date.now()}`
    await putProblems([
      {
        id,
        title: fallback.title,
        prompt: fallback.prompt,
        constraints: fallback.constraints,
        examples: fallback.examples,
        tags: fallback.tags,
        source: "neetCode-fallback",
        createdAt: Date.now(),
      },
    ])
    try {
      localStorage.setItem("today-current-problem-id", id)
    } catch {}
    return { id, total: neetCodeProblems.length, fallback: true }
  }
}

