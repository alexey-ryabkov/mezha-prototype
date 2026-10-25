import { SWATCH } from "@/components/genplan/status-colors"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { STATUS_LABEL, type PlotStatus } from "@/data/types"
import { cn } from "@/lib/utils"

const STATUSES: PlotStatus[] = ["free", "booked", "sold"]

export function StatusDot({ status, className }: { status: PlotStatus; className?: string }) {
  return <span className={cn("inline-block size-2.5 shrink-0 rounded-full border", SWATCH[status], className)} />
}

export function StatusLabel({ status }: { status: PlotStatus }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusDot status={status} />
      {STATUS_LABEL[status]}
    </span>
  )
}

export function StatusSelect({
  value,
  onChange,
  className,
  size = "sm",
}: {
  value: PlotStatus
  onChange: (s: PlotStatus) => void
  className?: string
  size?: "sm" | "default"
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PlotStatus)}>
      <SelectTrigger size={size} className={cn("w-40", className)} aria-label="Статус">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <StatusLabel status={s} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
