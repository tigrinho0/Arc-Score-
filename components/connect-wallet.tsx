"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, AlertCircle } from "lucide-react"

interface ConnectWalletProps {
  onConnect: (address: string) => void
}

type WalletProvider = "metamask" | "coinbase" | "walletconnect" | "trust" | "rainbow"

interface WalletOption {
  id: WalletProvider
  name: string
  icon: React.ReactNode
  detectFunction: () => boolean
  connectFunction: () => Promise<string[]>
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<WalletProvider | null>(null)
  const [showWallets, setShowWallets] = useState(false)

  const wallets: WalletOption[] = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <path
            d="M35.5 6L22 16.5L24.5 10.5L35.5 6Z"
            fill="#E17726"
            stroke="#E17726"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 6L17.8 16.6L15.5 10.5L4.5 6Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M30.5 27.5L27 33L34.8 35L36.9 27.6L30.5 27.5Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.1 27.6L5.2 35L13 33L9.5 27.5L3.1 27.6Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 18L10.5 21L18.2 21.4L17.9 13L12.5 18Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27.5 18L22 12.9L21.8 21.4L29.5 21L27.5 18Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 33L17.5 30.8L13.6 27.6L13 33Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22.5 30.8L27 33L26.4 27.6L22.5 30.8Z"
            fill="#E27625"
            stroke="#E27625"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      detectFunction: () => typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask,
      connectFunction: async () => {
        return await window.ethereum.request({ method: "eth_requestAccounts" })
      },
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <rect width="40" height="40" rx="20" fill="#0052FF" />
          <path
            d="M20 28C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12C15.5817 12 12 15.5817 12 20C12 24.4183 15.5817 28 20 28Z"
            fill="white"
          />
          <path d="M17.5 18.5H22.5V23.5H17.5V18.5Z" fill="#0052FF" stroke="#0052FF" strokeWidth="0.5" />
        </svg>
      ),
      detectFunction: () => typeof window.ethereum !== "undefined" && window.ethereum.isCoinbaseWallet,
      connectFunction: async () => {
        return await window.ethereum.request({ method: "eth_requestAccounts" })
      },
    },
    {
      id: "trust",
      name: "Trust Wallet",
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <rect width="40" height="40" rx="10" fill="#3375BB" />
          <path d="M20 8L10 13V20C10 26 14 31 20 32C26 31 30 26 30 20V13L20 8Z" fill="white" />
          <path d="M18 24L14 20L15.4 18.6L18 21.2L24.6 14.6L26 16L18 24Z" fill="#3375BB" />
        </svg>
      ),
      detectFunction: () => typeof window.ethereum !== "undefined" && window.ethereum.isTrust,
      connectFunction: async () => {
        return await window.ethereum.request({ method: "eth_requestAccounts" })
      },
    },
    {
      id: "rainbow",
      name: "Rainbow",
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <rect width="40" height="40" rx="20" fill="url(#rainbow-gradient)" />
          <path
            d="M20 12C15.5817 12 12 15.5817 12 20H14C14 16.6863 16.6863 14 20 14C23.3137 14 26 16.6863 26 20H28C28 15.5817 24.4183 12 20 12Z"
            fill="white"
          />
          <path d="M20 18C17.7909 18 16 19.7909 16 22H24C24 19.7909 22.2091 18 20 18Z" fill="white" />
          <defs>
            <linearGradient id="rainbow-gradient" x1="0" y1="0" x2="40" y2="40">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="33%" stopColor="#FFD93D" />
              <stop offset="66%" stopColor="#6BCF7F" />
              <stop offset="100%" stopColor="#4D96FF" />
            </linearGradient>
          </defs>
        </svg>
      ),
      detectFunction: () => typeof window.ethereum !== "undefined" && window.ethereum.isRainbow,
      connectFunction: async () => {
        return await window.ethereum.request({ method: "eth_requestAccounts" })
      },
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <rect width="40" height="40" rx="10" fill="#3B99FC" />
          <path
            d="M12.5 16.5C16.866 12.134 23.866 12.134 28.232 16.5L28.732 17L26 19.732L25.5 19.232C22.866 16.598 18.866 16.598 16.232 19.232L15.732 19.732L13 17L13.5 16.5H12.5ZM20.5 23.5C21.328 23.5 22 22.828 22 22C22 21.172 21.328 20.5 20.5 20.5C19.672 20.5 19 21.172 19 22C19 22.828 19.672 23.5 20.5 23.5Z"
            fill="white"
          />
        </svg>
      ),
      detectFunction: () => true,
      connectFunction: async () => {
        if (typeof window.ethereum !== "undefined") {
          return await window.ethereum.request({ method: "eth_requestAccounts" })
        }
        throw new Error("Please use WalletConnect compatible wallet")
      },
    },
  ]

  const switchToArcNetwork = async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("No wallet detected")
    }

    const chainId = "0x4CF50A2" // 5042002 in hex
    const rpcUrl = "https://rpc.testnet.arc.network"
    const chainName = "Arc Network Testnet"

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Add the network
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId,
                chainName,
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [rpcUrl],
                blockExplorerUrls: ["https://explorer.testnet.arc.network"],
              },
            ],
          })
        } catch (addError) {
          throw new Error("Failed to add Arc Network Testnet to wallet")
        }
      } else {
        throw switchError
      }
    }
  }

  const handleConnect = async (wallet: WalletOption) => {
    setIsConnecting(true)
    setError(null)
    setSelectedWallet(wallet.id)

    try {
      // First request accounts
      const accounts = await wallet.connectFunction()

      if (accounts && accounts.length > 0) {
        // Then switch to Arc Network Testnet
        try {
          await switchToArcNetwork()
        } catch (networkError: any) {
          console.warn("Network switch failed:", networkError)
          // Continue with connection even if network switch fails
        }
        onConnect(accounts[0])
      }
    } catch (err: any) {
      console.error("[v0] Error connecting wallet:", err)

      if (err.code === 4001) {
        setError("Connection request was rejected. Please try again.")
      } else if (err.message?.includes("origin")) {
        setError(
          "Origin mismatch detected. This is normal in preview mode - the app will work correctly when deployed.",
        )
      } else {
        setError(err.message || "Failed to connect wallet. Please try again.")
      }
    } finally {
      setIsConnecting(false)
      setSelectedWallet(null)
    }
  }

  const handleDemoMode = () => {
    const demoAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    onConnect(demoAddress)
  }

  if (!showWallets) {
    return (
      <div className="mt-16 max-w-md mx-auto">
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-6">
          <div className="h-20 w-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-10 w-10 text-primary" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Connect Your Wallet</h2>
            <p className="text-muted-foreground leading-relaxed">
              Connect your wallet to view your Arc Network activity, reputation score, and on-chain metrics
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Button
              onClick={() => setShowWallets(true)}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Connect Wallet
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button onClick={handleDemoMode} variant="outline" size="lg" className="w-full bg-transparent">
              View Demo Dashboard
            </Button>

            <p className="text-xs text-muted-foreground pt-2">Demo mode shows sample data for preview purposes</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-16 max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-6">
        <div className="h-20 w-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
          <Wallet className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">Choose Your Wallet</h2>
          <p className="text-muted-foreground leading-relaxed">
            Select your preferred wallet to connect to Arc Network
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 text-left">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
        )}

        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {wallets.map((wallet) => {
              const isDetected = wallet.detectFunction()
              const isCurrentlyConnecting = isConnecting && selectedWallet === wallet.id

              return (
                <Button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet)}
                  disabled={isConnecting}
                  variant="outline"
                  size="lg"
                  className="h-auto py-6 px-4 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all hover:shadow-lg disabled:opacity-50"
                >
                  <div className="flex items-center justify-center">{wallet.icon}</div>
                  <span className="text-sm font-semibold">{isCurrentlyConnecting ? "Connecting..." : wallet.name}</span>
                  {!isDetected && wallet.id !== "walletconnect" && (
                    <span className="text-xs text-muted-foreground">(Not detected)</span>
                  )}
                </Button>
              )
            })}
          </div>

          <Button
            onClick={() => setShowWallets(false)}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Back
          </Button>

          <p className="text-xs text-muted-foreground">Make sure you're connected to Arc Network</p>
        </div>
      </div>
    </div>
  )
}
