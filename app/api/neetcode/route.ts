import { NextResponse } from "next/server"
import { neetCodeProblems, NeetCodeProblem } from "@/lib/neetcode"

export const runtime = "nodejs"
export const dynamic = "force-static"

const DIFFICULTY_LEVELS: Array<NeetCodeProblem["difficulty"]> = ["beginner", "intermediate", "advanced"]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const level = searchParams.get("level")
  const filtered = level && DIFFICULTY_LEVELS.includes(level as NeetCodeProblem["difficulty"])
    ? neetCodeProblems.filter((p) => p.difficulty === level)
    : neetCodeProblems

  const raw = searchParams.get("index")
  let index = raw ? parseInt(raw, 10) : 0
  const total = filtered.length
  if (Number.isNaN(index) || index < 0) index = 0
  if (index >= total) {
    index = total - 1
  }

  const problem = filtered[index]
  return NextResponse.json({
    ok: true,
    data: {
      problem,
      index,
      total,
      level: level && DIFFICULTY_LEVELS.includes(level as NeetCodeProblem["difficulty"]) ? level : "mixed",
    },
  })
}

