"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { ConnectWallet } from "@/components/connect-wallet"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricsGrid } from "@/components/metrics-grid"
import { ActivityCharts } from "@/components/activity-charts"
import { TransactionsView } from "@/components/transactions-view"
import { ArcScoreHero } from "@/components/arc-score-hero"
import { useWalletData } from "@/hooks/useWalletData"

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"overview" | "transactions" | "missions" | "history">("overview")
  const { data: walletData, loading: walletLoading, error: walletError } = useWalletData(walletAddress)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        <DashboardHeader 
          walletAddress={walletAddress} 
          activeView={activeView} 
          onViewChange={setActiveView}
          onDisconnect={() => setWalletAddress(null)}
        />

        {!walletAddress ? (
          <ConnectWallet onConnect={setWalletAddress} />
        ) : (
          <div className="space-y-8 mt-8">
            {activeView === "overview" && (
              <>
                {/* ARC Score Hero - Main Focus */}
                {walletLoading && (
                  <div className="rounded-3xl border border-border bg-card/50 p-8 animate-pulse h-64" />
                )}
                {walletError && (
                  <div className="rounded-3xl border border-destructive/40 bg-destructive/10 text-destructive p-6">
                    <p className="font-semibold mb-2">Erro ao carregar dados da carteira</p>
                    <p className="text-sm">{walletError}</p>
                    <p className="text-xs mt-2 text-muted-foreground">Verifique se o backend está rodando em http://localhost:3001</p>
                  </div>
                )}
                {!walletLoading && !walletError && walletData && <ArcScoreHero data={walletData} />}
                {!walletLoading && !walletError && !walletData && (
                  <div className="rounded-3xl border border-border bg-card/50 p-8 text-center">
                    <p className="text-muted-foreground">Nenhum dado disponível para esta carteira</p>
                  </div>
                )}

                {/* Supporting Metrics - Secondary */}
                <MetricsGrid walletAddress={walletAddress} />
                <ActivityCharts walletAddress={walletAddress} />

                {/* Twitter Link */}
                <div className="flex justify-start mt-6">
                  <a
                    href="https://x.com/arc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3 rounded-xl hover:bg-card/50 border border-border hover:border-primary/30 transition-all"
                    aria-label="Follow Arc Network on X (Twitter)"
                  >
                    <X className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                </div>
              </>
            )}
            {activeView === "transactions" && <TransactionsView walletAddress={walletAddress} />}
            {activeView === "missions" && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-16 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-foreground mb-3">Missions Coming Soon</h3>
                  <p className="text-muted-foreground text-lg">Track your completed missions and reputation progress</p>
                </div>
              </div>
            )}
            {activeView === "history" && (
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-16 text-center">
                <div className="max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-foreground mb-3">Reputation History</h3>
                  <p className="text-muted-foreground text-lg">View your reputation changes over time</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
