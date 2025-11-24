"use client"

import { useEffect, useState } from "react"
import type { NeetCodeProblem } from "@/lib/neetcode"

const STORAGE_KEY = "neetcode-level"

export function useNeetCodeLevel(defaultLevel: NeetCodeProblem["difficulty"] = "beginner") {
  const [level, setLevel] = useState<NeetCodeProblem["difficulty"]>(defaultLevel)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as NeetCodeProblem["difficulty"] | null
      if (stored) {
        setLevel(stored)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, level)
    } catch {}
  }, [level])

  return [level, setLevel] as const
}

