"use client"

import { Activity, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DashboardHeaderProps {
  walletAddress: string | null
  activeView: "overview" | "transactions" | "missions" | "history"
  onViewChange: (view: "overview" | "transactions" | "missions" | "history") => void
  onDisconnect?: () => void
}

export function DashboardHeader({ walletAddress, activeView, onViewChange, onDisconnect }: DashboardHeaderProps) {
  const views = [
    { id: "overview", label: "Overview" },
    { id: "transactions", label: "Transactions" },
    { id: "missions", label: "Missions" },
    { id: "history", label: "History" },
  ] as const

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              ARC Score Analytics
            </h1>
            <p className="text-muted-foreground mt-1 text-base">
              Track your on-chain activity and reputation on Arc Network
            </p>
          </div>
        </div>

        {walletAddress && (
          <div className="hidden lg:flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border rounded-xl px-5 py-3 cursor-pointer hover:bg-card/70 transition-colors">
                    <Activity className="h-4 w-4 text-primary" />
                    <div className="text-sm">
                      <div className="font-mono text-xs text-muted-foreground">Connected</div>
                      <div className="font-medium text-foreground font-mono">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="font-mono text-sm bg-card border border-border shadow-xl">
                  <p>{walletAddress}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {onDisconnect && (
              <button
                onClick={onDisconnect}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-card/50 border border-border rounded-xl transition-all"
              >
                Disconnect
              </button>
            )}
          </div>
        )}
      </div>

      {walletAddress && (
        <nav className="flex gap-2 bg-card/30 backdrop-blur-sm border border-border rounded-xl p-1.5">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`px-6 py-3 text-sm font-semibold transition-all rounded-lg liquid-btn relative overflow-hidden ${
                activeView === view.id
                  ? "bg-[#FBBF24] text-foreground shadow-lg shadow-yellow-500/60 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              {view.label}
              {activeView === view.id && (
                <>
                  <span className="liquid-blob"></span>
                  <span className="liquid-blob-secondary"></span>
                </>
              )}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
