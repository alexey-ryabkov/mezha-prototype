import { useState } from "react"
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react"

import type { Plot } from "@/data/types"
import { formatPrice, formatSotki, plural } from "@/lib/format"
import { cn } from "@/lib/utils"
import { SWATCH } from "@/components/genplan/status-colors"

// Свободные участки из видимой части плана, которые подходят под фильтр
export function PlotList({
  plots,
  withPrice,
  onSelect,
  onHover,
  className,
  title = "На плане",
}: {
  plots: Plot[]
  withPrice: boolean
  onSelect: (p: Plot) => void
  onHover?: (id: number | null) => void
  className?: string
  title?: string
}) {
  const [asc, setAsc] = useState(true)
  const sorted = [...plots].sort((a, b) => (withPrice ? (asc ? a.price - b.price : b.price - a.price) : a.id - b.id))

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5 text-sm">
        <span className="font-medium">
          {title} {plots.length} {plural(plots.length, ["участок", "участка", "участков"])}
        </span>
        {withPrice && plots.length > 1 && (
          <button
            type="button"
            onClick={() => setAsc(!asc)}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            {asc ? <ArrowUpNarrowWide className="size-4" /> : <ArrowDownWideNarrow className="size-4" />}
            {asc ? "дешевле" : "дороже"}
          </button>
        )}
      </div>
      {sorted.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          В этой части плана нет подходящих свободных участков. Отдалите план или измените фильтр.
        </p>
      ) : (
        <ul className="divide-y">
          {sorted.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                onMouseEnter={() => onHover?.(p.id)}
                onMouseLeave={() => onHover?.(null)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-accent/60"
              >
                <span className={cn("size-2.5 shrink-0 rounded-full border", SWATCH[p.status])} />
                <span className="font-medium">№ {p.number}</span>
                <span className="text-muted-foreground">{formatSotki(p.areaM2)}</span>
                {withPrice && <span className="ml-auto font-medium tabular-nums">{formatPrice(p.price)}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
