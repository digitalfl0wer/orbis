"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Shuffle, List, User, ExternalLink, FileText, ArrowRight, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"
import { extractProblem } from "@/lib/aiClient"
import { putProblems } from "@/lib/db"
import type { NeetCodeProblem } from "@/lib/neetcode"

interface SourceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SourceModal({ isOpen, onClose }: SourceModalProps) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [customUrl, setCustomUrl] = useState("")
  const [customText, setCustomText] = useState("")
  const [neetCodeIndex, setNeetCodeIndex] = useState(0)
  const [neetCodeTotal, setNeetCodeTotal] = useState(0)
  const [neetCodePreview, setNeetCodePreview] = useState<NeetCodeProblem | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [neetCodeLevel, setNeetCodeLevel] = useState<NeetCodeProblem["difficulty"]>("beginner")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sources = [
    {
      id: "ai-random",
      title: "AI Random",
      description: "Get a curated problem based on your skill level and recent patterns",
      icon: Shuffle,
      color: "violet",
      features: ["Adaptive difficulty", "Pattern-aware selection", "Weakness targeting", "Fresh challenges"],
    },
    {
      id: "neetcode",
      title: "NeetCode (In-Order)",
      description: "Follow the structured NeetCode 150 curriculum for systematic learning",
      icon: List,
      color: "lime",
      features: ["Proven curriculum", "Progressive difficulty", "Pattern building", "Interview focused"],
      currentIndex: neetCodeIndex + 1,
      totalProblems: neetCodeTotal || 150,
    },
    {
      id: "my-problem",
      title: "My Problem",
      description: "Practice with your own problem from URL or paste the problem text",
      icon: User,
      color: "orange",
      features: ["Custom problems", "URL import", "Text paste", "Personal practice"],
    },
  ]

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSource(sourceId)
  }

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")

  const loadNeetCodePreview = useCallback(async () => {
    setPreviewLoading(true)
    setPreviewError(null)
    try {
      const res = await fetch(`/api/neetcode?index=${neetCodeIndex}&level=${neetCodeLevel}`)
      if (!res.ok) throw new Error("Preview unavailable")
      const payload = await res.json()
      setNeetCodeTotal(payload?.data?.total ?? 0)
      setNeetCodePreview(payload?.data?.problem ?? null)
    } catch (error: any) {
      setPreviewError(error?.message || "Unable to load preview")
    } finally {
      setPreviewLoading(false)
    }
  }, [neetCodeIndex, neetCodeLevel])

  useEffect(() => {
    if (selectedSource === "neetcode") {
      loadNeetCodePreview()
    }
  }, [selectedSource, loadNeetCodePreview])

  const handleSkip = () => {
    if (!neetCodeTotal) return
    setNeetCodeIndex((prev) => (prev + 1) % neetCodeTotal)
  }

  const handleStart = async () => {
    if (!selectedSource) return onClose()
    try {
      setIsSubmitting(true)
      if (selectedSource === "my-problem") {
        const input = customText?.trim() || customUrl?.trim()
        if (!input) {
          setIsSubmitting(false)
          return onClose()
        }
        const extracted = await extractProblem(input)
        const title = extracted?.title || "Custom Problem"
        const id = `${slugify(title)}-${Date.now()}`
        await putProblems([
          {
            id,
            title,
            prompt: extracted?.prompt || input,
            constraints: extracted?.constraints,
            examples: extracted?.examples,
            tags: extracted?.tags || ["Custom"],
            source: customUrl ? "url" : "paste",
            createdAt: Date.now(),
          },
        ])
        try {
          localStorage.setItem("today-current-problem-id", id)
        } catch {}
      }
      if (selectedSource === "neetcode") {
        const res = await fetch(`/api/neetcode?index=${neetCodeIndex}&level=${neetCodeLevel}`)
        if (!res.ok) throw new Error("Failed to load NeetCode problem")
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
        if (payload?.data?.total) {
          setNeetCodeTotal(payload.data.total)
          setNeetCodeIndex((prev) => (prev + 1) % payload.data.total)
        }
      }
    } finally {
      setIsSubmitting(false)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-500" />
            Choose Problem Source
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sources.map((source) => {
              const Icon = source.icon
              const isSelected = selectedSource === source.id

              return (
                <Card
                  key={source.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    isSelected && ["ring-2 ring-violet-500/50", "bg-gradient-to-br from-violet-500/5 to-lime-400/5"]
                  )}
                  onClick={() => handleSourceSelect(source.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          source.color === "violet" && "bg-violet-500/10 text-violet-500",
                          source.color === "lime" && "bg-lime-400/10 text-lime-400",
                          source.color === "orange" && "bg-orange-500/10 text-orange-500"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{source.title}</CardTitle>
                        {source.id === "neetcode" && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {(source.currentIndex ?? 0)}/{(source.totalProblems ?? 0)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{source.description}</p>

                    {source.id === "neetcode" && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {neetCodeTotal ? Math.round((((neetCodeIndex + 1) / neetCodeTotal) * 100)) : 0}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-lime-400 transition-all"
                            style={{
                              width: `${neetCodeTotal ? Math.round((((neetCodeIndex + 1) / neetCodeTotal) * 100)) : 0}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Skipping once won’t break order</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {source.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              source.color === "violet" && "bg-violet-500",
                              source.color === "lime" && "bg-lime-400",
                              source.color === "orange" && "bg-orange-500"
                            )}
                          />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Custom Problem Input */}
          {selectedSource === "my-problem" && (
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  Custom Problem Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Problem URL</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://leetcode.com/problems/..."
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" className="px-3 bg-transparent">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <Separator className="flex-1" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Paste Problem Text</label>
                  <Textarea
                    placeholder="Paste the problem description here..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* NeetCode Skip Option */}
          {selectedSource === "neetcode" && (
            <Card className="border-lime-400/20 bg-lime-400/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Current Problem</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {previewLoading
                        ? "Loading…"
                        : previewError
                          ? "Preview unavailable"
                          : neetCodePreview?.title ?? "NeetCode challenge"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {neetCodeIndex + 1}/{neetCodeTotal || 150}
                    </span>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleSkip}>
                      <SkipForward className="h-4 w-4" />
                      Skip Once
                    </Button>
                  </div>
                </div>
                {previewError && <p className="text-xs text-red-400">{previewError}</p>}
                {!previewLoading && !previewError && (
                  <p className="text-xs text-muted-foreground">{neetCodePreview?.prompt?.split("\n")[0]}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className={cn(
                "flex-1 gap-2",
                selectedSource && "bg-gradient-to-r from-violet-500 to-lime-400 hover:from-violet-600 hover:to-lime-500"
              )}
              disabled={!selectedSource || isSubmitting}
              onClick={handleStart}
            >
              {isSubmitting ? "Working..." : "Start Problem"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

