"use client"

import { cn } from "@/lib/utils"
import { Sparkles, Lightbulb, Clock, AlertTriangle, Activity } from "lucide-react"

const features = [
  {
    title: "One problem, once a day",
    description:
      "No more scrolling through 300 problems. Orbis surfaces a single realistic challenge so you can actually focus on solving, not choosing.",
    icon: Activity,
  },
  {
    title: "Hint ladder, not spoilers",
    description:
      "Start with gentle nudges, then strategy, then a deeper breakdown, only when you ask for it. You’re always in control of how much help you get.",
    icon: Lightbulb,
  },
  {
    title: "Two-Minute Start",
    description: "A tiny ritual before you touch the keyboard. Ground yourself before the chaos and remember why you’re practicing.",
    icon: Clock,
  },
  {
    title: "Panic Token (1 per day)",
    description:
      "Your “phone an adult” button. When your brain fully blue-screens, hit it and let the coach stop being cute and tell you what’s actually going on.",
    icon: AlertTriangle,
  },
  {
    title: "Coach rail & progress",
    description:
      "A sidebar that talks to you like a mentor: patterns you’re hitting, where you tend to get stuck, and how your sessions feel over time.",
    icon: Sparkles,
  },
]

export function FeatureGrid() {
  return (
    <section className="py-16 bg-card/50">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-lime-400">How Orbis helps you practice</p>
        <h2 className="mt-4 text-3xl text-white font-semibold">Orbis is a tiny, opinionated practice space</h2>
        <p className="mt-2 text-muted-foreground max-w-3xl">
          One realistic problem, a real editor, and just enough help when you need it.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className={cn(
                  "rounded-3xl border border-border bg-background/60 p-6 space-y-3 shadow-2xl transition-transform hover:-translate-y-1"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500/20 to-lime-400/20">
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

