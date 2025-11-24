"use client"

import { FeatureGrid } from "@/components/landing/feature-grid"
import { HeroSection } from "@/components/landing/hero-section"
import { LearnerStorySection } from "@/components/landing/learner-story"
import { LandingFooter } from "@/components/landing/landing-footer"
import { SessionTimeline } from "@/components/landing/session-timeline"

export function LandingPage() {
  return (
    <div className="bg-background text-white">
      <HeroSection />
      <FeatureGrid />
      <SessionTimeline />
      <LearnerStorySection />
      <LandingFooter />
    </div>
  )
}

