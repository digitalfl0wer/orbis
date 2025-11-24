"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

const links = [
  { label: "Demo", href: "/app" },
  { label: "GitHub", href: "https://github.com/digitalflower/orbis" },
  { label: "About / README", href: "https://github.com/digitalflower/orbis#readme" },
]

export function LandingFooter() {
  return (
    <footer className="bg-background border-t border-border py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="text-center text-md text-muted-foreground">
          Designed & built by{" "}
          <Link
            href="https://www.digitalflower.tech/"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-500 to-lime-300 bg-clip-text transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.65)]"
          >
            Digital Flower 🌸
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {links.map((link) => (
            <Button key={link.label} asChild variant="ghost" className="text-xs px-3 py-2">
              <Link
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {link.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </footer>
  )
}

