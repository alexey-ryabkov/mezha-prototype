import { useRef } from "react"

import { PLAN, PLAN_IMAGE } from "@/data/demo"
import type { Plot, PlotStatus } from "@/data/types"
import { cn } from "@/lib/utils"
import { FILL, SWATCH } from "./status-colors"

// Подложка генплана и поверх нее контуры участков цветом статуса
export function GenplanView({
  plots,
  className,
  dimmed,
  selectedId,
  hoveredId,
  onPlotClick,
}: {
  plots: Plot[]
  className?: string
  dimmed?: (plot: Plot) => boolean
  selectedId?: number | null
  hoveredId?: number | null
  onPlotClick?: (plot: Plot) => void
}) {
  // Клик после сдвига плана не открывает участок
  const down = useRef<{ x: number; y: number } | null>(null)

  return (
    <svg
      viewBox={`0 0 ${PLAN.width} ${PLAN.height}`}
      className={cn("block h-auto w-full select-none", className)}
      onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY })}
    >
      <image href={PLAN_IMAGE} width={PLAN.width} height={PLAN.height} />
      {plots.map(
        (p) =>
          p.contour && (
            <polygon
              key={p.id}
              data-plot={p.id}
              points={p.contour.map((pt) => pt.join(",")).join(" ")}
              className={cn(
                "cursor-pointer stroke-2 transition-opacity",
                FILL[p.status],
                dimmed?.(p) && "opacity-25",
                (p.id === selectedId || p.id === hoveredId) && "stroke-foreground stroke-[5] opacity-100",
              )}
              onClick={(e) => {
                const d = down.current
                if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return
                onPlotClick?.(p)
              }}
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
