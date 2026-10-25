import { PLAN, PLAN_IMAGE } from "@/data/demo"
import type { Plot, PlotStatus } from "@/data/types"
import { cn } from "@/lib/utils"

const FILL: Record<PlotStatus, string> = {
  free: "fill-free/55 stroke-free",
  booked: "fill-booked/60 stroke-booked",
  sold: "fill-sold/55 stroke-sold",
}

export const SWATCH: Record<PlotStatus, string> = {
  free: "bg-free/55 border-free",
  booked: "bg-booked/60 border-booked",
  sold: "bg-sold/55 border-sold",
}

// Подложка генплана и поверх нее контуры участков цветом статуса
export function GenplanView({
  plots,
  className,
  onPlotClick,
}: {
  plots: Plot[]
  className?: string
  onPlotClick?: (plot: Plot) => void
}) {
  return (
    <svg viewBox={`0 0 ${PLAN.width} ${PLAN.height}`} className={cn("block h-auto w-full", className)}>
      <image href={PLAN_IMAGE} width={PLAN.width} height={PLAN.height} />
      {plots.map(
        (p) =>
          p.contour && (
            <polygon
              key={p.id}
              points={p.contour.map((pt) => pt.join(",")).join(" ")}
              className={cn("cursor-pointer stroke-2 transition-[fill-opacity] hover:opacity-80", FILL[p.status])}
              onClick={() => onPlotClick?.(p)}
            />
          ),
      )}
    </svg>
  )
}

export function StatusLegend({ className }: { className?: string }) {
  const items: [PlotStatus, string][] = [
    ["free", "свободен"],
    ["booked", "забронирован"],
    ["sold", "продан"],
  ]
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground", className)}>
      {items.map(([status, label]) => (
        <span key={status} className="inline-flex items-center gap-1.5">
          <span className={cn("size-3 rounded-sm border", SWATCH[status])} />
          {label}
        </span>
      ))}
    </div>
  )
}
