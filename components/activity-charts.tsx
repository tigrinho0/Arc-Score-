"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

interface ActivityChartsProps {
  walletAddress: string
}

export function ActivityCharts({ walletAddress }: ActivityChartsProps) {
  const weeklyData = Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    transactions: Math.floor(Math.random() * 200) + 50,
    volume: (Math.random() * 10000 + 1000).toFixed(2),
    contracts: Math.floor(Math.random() * 15) + 3,
  }))

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
              <span className="text-foreground font-semibold">${data.volume} USDC</span>
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
