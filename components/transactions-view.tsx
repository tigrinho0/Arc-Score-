"use client"

import { ExternalLink, ArrowUpRight, ArrowDownRight, Code, Clock } from "lucide-react"
import { useWalletTransactions } from "@/hooks/useWalletTransactions"

interface TransactionsViewProps {
  walletAddress: string
}

// Helper function to format ETH (18 decimals)
function formatEthAmount(amount: string | number): string {
  try {
    const amountBigInt = BigInt(amount || "0")
    const eth = Number(amountBigInt) / 1e18
    return eth.toFixed(4)
  } catch {
    return "0.0000"
  }
}

export function TransactionsView({ walletAddress }: TransactionsViewProps) {
  const { transactions, loading, error, total } = useWalletTransactions(walletAddress, 100, 0)

  const getTransactionType = (tx: any) => {
    if (tx.isContractCreation) {
      return { type: "contract", label: "Contract Creation", icon: <Code className="h-5 w-5 text-primary" /> }
    }
    if (tx.to && tx.to.toLowerCase() !== walletAddress.toLowerCase()) {
      return { type: "send", label: "Sent", icon: <ArrowUpRight className="h-5 w-5 text-destructive" /> }
    }
    return { type: "receive", label: "Received", icon: <ArrowDownRight className="h-5 w-5 text-success" /> }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  if (loading) {
    return (
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
        <div className="p-7 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Recent Transactions</h3>
          </div>
        </div>
        <div className="p-16 text-center">
          <div className="text-muted-foreground">Loading transactions...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
        <div className="p-7 bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Recent Transactions</h3>
          </div>
        </div>
        <div className="p-16 text-center">
          <div className="text-destructive">Error loading transactions: {error}</div>
        </div>
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
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
        <div className="p-16 text-center">
          <div className="text-muted-foreground text-lg mb-2">No transactions found</div>
          <div className="text-muted-foreground text-sm">Make transactions on Arc Network Testnet to see your data here</div>
        </div>
      </div>
    )
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
        {transactions.map((tx) => {
          const txInfo = getTransactionType(tx)
          const amount = tx.value ? formatEthAmount(tx.value) : "0.0000"
          const explorerUrl = `https://explorer.testnet.arc.network/tx/${tx.hash}`
          
          return (
            <div
              key={tx.hash}
            className="p-6 hover:bg-primary/5 transition-all duration-200 flex items-center justify-between group"
          >
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
                  {txInfo.icon}
              </div>
              <div>
                  <p className="font-semibold text-foreground text-base mb-1">{txInfo.label}</p>
                  <p className="text-sm text-muted-foreground font-mono">{tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                  <p className="font-bold text-foreground text-base mb-1">{amount} ETH</p>
                  <p className="text-sm text-muted-foreground">{formatTimestamp(tx.timestamp)}</p>
                </div>
                <a 
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-xl hover:bg-primary/10 flex items-center justify-center transition-colors group-hover:border group-hover:border-primary/30"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {total > transactions.length && (
        <div className="p-7 border-t border-border text-center bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Showing {transactions.length} of {total} transactions
          </p>
        </div>
      )}
    </div>
  )
}
