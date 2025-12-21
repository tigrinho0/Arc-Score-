"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import { useWalletData } from "@/hooks/useWalletData"
import { useWalletTransactions } from "@/hooks/useWalletTransactions"

interface ActivityChartsProps {
  walletAddress: string
}

export function ActivityCharts({ walletAddress }: ActivityChartsProps) {
  const { data: walletData, loading } = useWalletData(walletAddress)
  const { transactions } = useWalletTransactions(walletAddress, 1000, 0)

  // Process real data from wallet overview and transactions
  const weeklyData = useMemo(() => {
    if (!walletData || !transactions || transactions.length === 0) {
      // Return empty data if no transactions
      return Array.from({ length: 12 }, (_, i) => ({
        week: `W${i + 1}`,
        transactions: 0,
        volume: "0.00",
        contracts: 0,
      }))
    }

    // Group transactions by week
    const now = new Date()
    const weeks: { [key: string]: { transactions: number; volume: number; contracts: Set<string> } } = {}
    
    // Initialize last 12 weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      const weekKey = `W${12 - i}`
      weeks[weekKey] = { transactions: 0, volume: 0, contracts: new Set() }
    }

    // Process transactions
    transactions.forEach((tx) => {
      const txDate = new Date(tx.timestamp)
      const weeksAgo = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
      
      if (weeksAgo >= 0 && weeksAgo < 12) {
        const weekKey = `W${12 - weeksAgo}`
        if (weeks[weekKey]) {
          weeks[weekKey].transactions++
          
          // Calculate volume (convert wei to ETH, then to USDC equivalent)
          const valueInEth = parseFloat(tx.value) / 1e18
          weeks[weekKey].volume += valueInEth
          
          // Track unique contracts
          if (tx.to && tx.to !== walletAddress.toLowerCase()) {
            weeks[weekKey].contracts.add(tx.to.toLowerCase())
          }
        }
      }
    })

    // Convert to array format
    return Object.keys(weeks).map((week) => ({
      week,
      transactions: weeks[week].transactions,
      volume: weeks[week].volume.toFixed(2),
      contracts: weeks[week].contracts.size,
    }))
  }, [walletData, transactions, walletAddress])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-2xl">
          <p className="font-bold text-foreground mb-3 text-base">{data.week}</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-8">
              <span className="text-muted-foreground">Transactions:</span>
              <span className="text-foreground font-semibold">{data.transactions}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-muted-foreground">Volume:</span>
              <span className="text-foreground font-semibold">{data.volume} ETH</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-muted-foreground">Contracts:</span>
              <span className="text-foreground font-semibold">{data.contracts}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const hasData = useMemo(() => {
    return weeklyData.some((week) => week.transactions > 0)
  }, [weeklyData])

  if (loading) {
    return (
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
        <div className="p-7 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Weekly Transactions</h3>
          </div>
        </div>
        <div className="p-7 bg-card/30">
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading data...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
        <div className="p-7 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Weekly Transactions</h3>
          </div>
          <p className="text-sm text-muted-foreground ml-16 font-medium">Transaction activity across the last 12 weeks</p>
        </div>
        <div className="p-7 bg-card/30">
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-2">No transactions found</p>
              <p className="text-muted-foreground text-sm">Make transactions on Arc Network Testnet to see your data here</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
      <div className="p-7 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Weekly Transactions</h3>
        </div>
        <p className="text-sm text-muted-foreground ml-16 font-medium">Transaction activity across the last 12 weeks</p>
      </div>

      <div className="p-7 bg-card/30">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyData} style={{ color: 'hsl(var(--foreground))' }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.5} />
            <XAxis
              dataKey="week"
              stroke="#ffffff"
              tick={{ fill: '#ffffff', fontSize: 14, fontWeight: 600 }}
              tickLine={{ stroke: '#ffffff', strokeWidth: 2 }}
              axisLine={{ stroke: '#888888', strokeWidth: 2 }}
            />
            <YAxis 
              stroke="#ffffff"
              tick={{ fill: '#ffffff', fontSize: 14, fontWeight: 600 }}
              tickLine={{ stroke: '#ffffff', strokeWidth: 2 }}
              axisLine={{ stroke: '#888888', strokeWidth: 2 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(26, 92, 255, 0.3)" }} />
            <Bar 
              dataKey="transactions" 
              fill="url(#colorGradient)" 
              radius={[10, 10, 0, 0]} 
              maxBarSize={60}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D1FF" stopOpacity={1} />
                <stop offset="50%" stopColor="#1A5CFF" stopOpacity={1} />
                <stop offset="100%" stopColor="#FCD34D" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
