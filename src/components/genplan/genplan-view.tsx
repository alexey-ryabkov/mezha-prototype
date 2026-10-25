import { useRef, type MouseEvent } from "react"

import { PLAN, PLAN_IMAGE } from "@/data/demo"
import type { Outline, Plot, PlotStatus } from "@/data/types"
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
  outlines,
  onOutlineClick,
}: {
  plots: Plot[]
  className?: string
  dimmed?: (plot: Plot) => boolean
  selectedId?: number | null
  hoveredId?: number | null
  onPlotClick?: (plot: Plot) => void
  // Свободные контуры подложки, по которым в редакторе обводят участки
  outlines?: Outline[]
  onOutlineClick?: (outline: Outline) => void
}) {
  // Клик после сдвига плана не открывает участок
  const down = useRef<{ x: number; y: number } | null>(null)
  const isClick = (e: MouseEvent) => {
    const d = down.current
    return !d || Math.hypot(e.clientX - d.x, e.clientY - d.y) <= 6
  }

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
                "stroke-2 transition-opacity",
                onPlotClick && "cursor-pointer",
                FILL[p.status],
                dimmed?.(p) && "opacity-25",
                (p.id === selectedId || p.id === hoveredId) && "stroke-foreground stroke-[5] opacity-100",
              )}
              onClick={(e) => isClick(e) && onPlotClick?.(p)}
            />
          ),
      )}
      {outlines?.map((o) => (
        <polygon
          key={o.number + o.contour[0].join()}
          points={o.contour.map((pt) => pt.join(",")).join(" ")}
          className="cursor-pointer fill-primary/10 stroke-primary stroke-[3] [stroke-dasharray:10_6] hover:fill-primary/35"
          onClick={(e) => isClick(e) && onOutlineClick?.(o)}
        />
      ))}
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
