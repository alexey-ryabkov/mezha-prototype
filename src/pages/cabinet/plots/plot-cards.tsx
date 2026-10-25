import { toast } from "sonner"

import { STATUS_LABEL, type Plot } from "@/data/types"
import { formatPrice, formatSotki } from "@/lib/format"
import { useDemo } from "@/store/demo"
import { StatusSelect } from "../common/status"

// Вид для телефона: менеджер на показе находит участок по номеру и меняет статус
export function PlotCards({ plots }: { plots: Plot[] }) {
  const updatePlot = useDemo((s) => s.updatePlot)
  const sorted = [...plots].sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0))

  if (!sorted.length) return <p className="py-8 text-center text-sm text-muted-foreground">Участок с таким номером не найден</p>

  return (
    <ul className="grid gap-2">
      {sorted.map((p) => (
        <li key={p.id} className="rounded-lg border bg-card p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-heading font-semibold">№ {p.number}</span>
            <span className="tabular-nums">{formatPrice(p.price)}</span>
          </div>
          <div className="text-sm text-muted-foreground">{formatSotki(p.areaM2)}</div>
          <StatusSelect
            value={p.status}
            size="default"
            className="mt-2 w-full"
            onChange={(status) => {
              updatePlot(p.id, { status })
              toast.success(`Участок № ${p.number}: ${STATUS_LABEL[status]}`)
            }}
          />
        </li>
      ))}
    </ul>
  )
}
