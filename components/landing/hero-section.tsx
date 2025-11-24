"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center py-20 text-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.35),_transparent_45%)] opacity-70" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/70 via-black/80 to-black" />

      <div className="relative z-10 max-w-4xl px-4">
        <div className="flex justify-center gap-2 mb-6 text-sm uppercase tracking-[0.35em] text-lime-300">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span>Focused practice</span>
          <Sparkles className="h-4 w-4 text-lime-300" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight">
          <span className="inline-block text-5xl md:text-6xl lg:text-8xl font-extrabold text-violet-300 drop-shadow-[0_0_12px_rgba(123,97,255,0.6)] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(123,97,255,0.8)]">
            Orbis
          </span>
          , your daily coding mentor (without the chaos)
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          For bootcamp grads, self-taught devs, and anyone who’s ever opened LeetCode, sighed dramatically, and gone
          back to TikTok instead.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="w-full sm:w-auto text-base px-8 py-3 bg-gradient-to-r from-violet-500 to-lime-400 shadow-lg"
          >
            <Link href="/app">Start today’s challenge</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto text-base px-8 py-3 border-white/70">
            <Link href="https://github.com/digitalfl0wer/orbis" target="_blank" rel="noreferrer">
              View the code on GitHub
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          No login. No streak shaming. Just one focused problem and a coach in the sidebar.
        </p>
      </div>
      <div className="pointer-events-none absolute inset-0 animate-pulse opacity-20">
        <div className="absolute top-12 left-12 h-12 w-12 rounded-full bg-purple-500 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-16 w-16 rounded-full bg-lime-400 blur-3xl" />
      </div>
    </section>
  )
}

