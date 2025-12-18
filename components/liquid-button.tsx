"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes } from "react"

type LiquidButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
}

/**
 * LiquidButton
 * - Dark base
 * - Inner animated "gosma" gradient layer (loops)
 * - Hover: slightly faster wave + lift
 * - Active: subtle press
 *
 * Usage:
 * <LiquidButton label="Launch" onClick={...} />
 */
export function LiquidButton({ label, className, ...props }: LiquidButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "liquid-btn relative inline-flex items-center justify-center px-6 py-3 rounded-xl",
        "font-semibold text-white overflow-hidden",
        "bg-[#0b0b0f] shadow-lg shadow-primary/20",
        "transition-transform duration-150 active:scale-[0.98]",
        className,
      )}
    >
      <span className="relative z-10">{label}</span>
      <span aria-hidden className="liquid-blob" />
      <span aria-hidden className="liquid-blob-secondary" />
    </button>
  )
}
