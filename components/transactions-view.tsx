"use client"

import { ExternalLink, ArrowUpRight, ArrowDownRight, Code, Clock } from "lucide-react"

interface TransactionsViewProps {
  walletAddress: string
}

export function TransactionsView({ walletAddress }: TransactionsViewProps) {
  // Mock data - In production, fetch from Arc Network
  const transactions = Array.from({ length: 10 }, (_, i) => ({
    hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
    type: i % 3 === 0 ? "contract" : i % 2 === 0 ? "send" : "receive",
    amount: (Math.random() * 1000).toFixed(2),
    timestamp: new Date(Date.now() - i * 3600000).toLocaleString(),
    status: "success",
  }))

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="h-5 w-5 text-destructive" />
      case "receive":
        return <ArrowDownRight className="h-5 w-5 text-success" />
      case "contract":
        return <Code className="h-5 w-5 text-primary" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "send":
        return "Sent"
      case "receive":
        return "Received"
      case "contract":
        return "Contract Call"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
      <div className="p-7 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Recent Transactions</h3>
        </div>
        <p className="text-sm text-muted-foreground ml-13">Your latest on-chain activity on Arc Network</p>
      </div>

      <div className="divide-y divide-border">
        {transactions.map((tx, index) => (
          <div
            key={index}
            className="p-6 hover:bg-primary/5 transition-all duration-200 flex items-center justify-between group"
          >
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
                {getTypeIcon(tx.type)}
              </div>
              <div>
                <p className="font-semibold text-foreground text-base mb-1">{getTypeLabel(tx.type)}</p>
                <p className="text-sm text-muted-foreground font-mono">{tx.hash}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="font-bold text-foreground text-base mb-1">{tx.amount} USDC</p>
                <p className="text-sm text-muted-foreground">{tx.timestamp}</p>
              </div>
              <button className="h-10 w-10 rounded-xl hover:bg-primary/10 flex items-center justify-center transition-colors group-hover:border group-hover:border-primary/30">
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-7 border-t border-border text-center bg-muted/20">
        <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          View all transactions →
        </button>
      </div>
    </div>
  )
}
