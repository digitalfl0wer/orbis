"use client"

import { Badge } from "@/components/ui/badge"
import { Star, Clock, Target } from "lucide-react"

const timeline = [
  {
    title: "Set your vibe",
    icon: Star,
    description:
      "Take a Two-Minute Start, pick how much help you want today, and check in with how you’re feeling.",
  },
  {
    title: "Solve & get coached",
    icon: Target,
    description:
      "Read the prompt, write your solution, run tests. Use the hint ladder or Panic Token when you’re stuck instead of doom-scrolling.",
  },
  {
    title: "Reflect & move on",
    icon: Clock,
    description:
      "Log how it felt — “crushed it”, “got there with help”, “still fuzzy”, “full gremlin mode” — and let Orbis quietly track your patterns.",
  },
]

export function SessionTimeline() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">One focused session</p>
          <h2 className="text-3xl text-white font-semibold">One focused session. Start to finish.</h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {timeline.map((step) => {
            const Icon = step.icon
            return (
              <article key={step.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-card/30 p-6">
                <Badge variant="secondary" className="self-start text-xs">
                  <Icon className="h-3 w-3" />
                </Badge>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

