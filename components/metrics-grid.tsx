"use client"

import { Activity, Calendar, Wallet, Code } from "lucide-react"
import { MetricCard } from "./metric-card"
import { useWalletData } from "@/hooks/useWalletData"

interface MetricsGridProps {
  walletAddress: string
}

// Helper function to format wei to USDC
function formatWeiToEth(wei: string | number): string {
  try {
    const weiBigInt = BigInt(wei || "0")
    const usdc = Number(weiBigInt) / 1e18
    return usdc.toFixed(4)
  } catch {
    return "0.0000"
  }
}

export function MetricsGrid({ walletAddress }: MetricsGridProps) {
  const { data, loading, error } = useWalletData(walletAddress)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">
          {error || "No data available for this wallet"}
        </p>
      </div>
    )
  }

  // Calculate wallet age
  const walletAge = data.firstSeenAt
    ? Math.floor((new Date().getTime() - new Date(data.firstSeenAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Format balance (assuming 0 for now, can be updated when backend provides it)
  const balanceDisplay = "0.0000" // formatWeiToEth(data.balance?.native || "0")

  const metrics = [
    {
      title: "Total Transactions",
      value: (data.totalTransactions || 0).toLocaleString(),
      subtitle: "Since account creation",
      icon: Activity,
      trend: null,
      trendUp: null,
    },
    {
      title: "Active Days",
      value: `${data.activeDays || 0} days`,
      subtitle: walletAge > 0 ? `Out of ${walletAge} total days` : "Account activity",
      icon: Calendar,
      trend: null,
      trendUp: null,
    },
    {
      title: "Wallet Balance",
      value: `${balanceDisplay} USDC`,
      subtitle: "Native balance on Arc Network",
      icon: Wallet,
      trend: null,
      trendUp: null,
    },
    {
      title: "Contract Interactions",
      value: "0", // Will be updated when backend provides contractInteractions
      subtitle: "Unique contracts interacted on Arc Testnet",
      icon: Code,
      trend: null,
      trendUp: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}
