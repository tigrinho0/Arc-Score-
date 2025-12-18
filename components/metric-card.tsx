import { type LucideIcon, ArrowUp, ArrowDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  trend: string | null
  trendUp: boolean | null
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, trendUp }: MetricCardProps) {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-7 space-y-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg ${
              trendUp ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
            }`}
          >
            {trendUp ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
      </div>
    </div>
  )
}
