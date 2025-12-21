"use client"

import { useMemo } from "react"
import { WalletOverview } from "@/lib/api"

type ArcScoreHeroProps = {
  data: WalletOverview
}

const TIERS = [
  { name: "Bronze", min: 0, max: 200, color: "text-amber-600", badge: "border-amber-500/50 bg-amber-500/10", ptName: "Bronze" },
  { name: "Prata", min: 200, max: 500, color: "text-slate-300", badge: "border-slate-400/50 bg-slate-400/10", ptName: "Prata" },
  { name: "Ouro", min: 500, max: Infinity, color: "text-amber-400", badge: "border-amber-400/50 bg-amber-400/10", ptName: "Ouro" },
]

export function ArcScoreHero({ data }: ArcScoreHeroProps) {
  // Ensure arcScore is always a number
  const arcScore = typeof data.arcScore === 'number' ? data.arcScore : (parseFloat(String(data.arcScore || 0)) || 0);

  const { tier, nextTier, pointsToNext, progressPercent, reputationText } = useMemo(() => {
    const score = arcScore
    const tier = TIERS.find((t) => score >= t.min && (score < t.max || t.max === Infinity)) ?? TIERS[0]
    const nextTierIndex = TIERS.indexOf(tier) + 1
    const nextTier = TIERS[nextTierIndex] ?? null
    const span = (nextTier ? nextTier.min : (tier.max === Infinity ? 1000 : tier.max)) - tier.min || 1
    const progressWithinTier = Math.min(Math.max((score - tier.min) / span, 0), 1)
    const pointsToNext = nextTier ? Math.max(nextTier.min - score, 0) : 0

    // Determine reputation text based on score and tier
    let reputationText = "Needs improvement"
    if (tier.name === "Ouro" || score >= 500) {
      reputationText = "Excellent reputation"
    } else if (tier.name === "Prata" || score >= 200) {
      reputationText = "Good reputation"
    } else {
      reputationText = "Building reputation"
    }

    return {
      tier,
      nextTier,
      pointsToNext,
      progressPercent: Math.round(progressWithinTier * 100),
      reputationText,
    }
  }, [arcScore])


  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 md:p-10 shadow-xl">
      {/* Subtle animated background gradient */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_20%,rgba(26,92,255,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(0,209,255,0.18),transparent_25%)]" />

      <div className="relative">
        {/* Main Score Section */}
        <div className="space-y-6 max-w-full">
          {/* Title */}
          <div className="text-6xl md:text-7xl font-black tracking-tight text-foreground leading-none -mt-2">
            Score
          </div>

          {/* Score Display */}
          <div className="flex items-end gap-6">
            <div className="text-7xl md:text-8xl font-black tracking-tight text-foreground drop-shadow-sm animate-in fade-in duration-500">
              {Math.round(arcScore)}
            </div>
            <div className="space-y-2 pb-2">
              <div className="text-muted-foreground text-sm font-medium">{reputationText}</div>
              {nextTier && (
                <div className="text-xs text-muted-foreground">
                  Only {Math.round(pointsToNext)} points to reach {nextTier.ptName}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              <span>Progress {tier.ptName}</span>
              <span className="text-foreground font-semibold">
                {Math.round(arcScore)} {nextTier ? `/ ${nextTier.min}` : ""}
              </span>
            </div>
            <div className="h-4 md:h-5 w-full rounded-full bg-white/20 border border-white/25 overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.12)]">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out shadow-[0_0_14px_rgba(138,79,255,0.55)] bg-[linear-gradient(120deg,rgba(26,92,255,0.95),rgba(251,191,36,0.95),rgba(138,79,255,0.95))] bg-[length:240%_100%] animate-[shimmer_3.2s_ease-in-out_infinite]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}




