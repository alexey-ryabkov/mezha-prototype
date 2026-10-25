import { useState } from "react"
import { Pencil } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import type { Plot } from "@/data/types"
import { formatPrice } from "@/lib/format"
import { useDemo } from "@/store/demo"

// Цена правится прямо в ячейке: Enter или уход с поля сохраняют, Esc отменяет
export function PriceCell({ plot }: { plot: Plot }) {
  const updatePlot = useDemo((s) => s.updatePlot)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState("")

  const commit = () => {
    const v = Number(value.replace(/\s/g, ""))
    if (v > 0 && v !== plot.price) {
      updatePlot(plot.id, { price: v })
      toast.success(`Цена участка № ${plot.number}: ${formatPrice(v)}`)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <Input
        autoFocus
        type="number"
        inputMode="numeric"
        step={10000}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit()
          if (e.key === "Escape") setEditing(false)
        }}
        className="h-8 w-36 tabular-nums"
        aria-label={`Цена участка № ${plot.number}`}
      />
    )
  }

  return (
    <button
      type="button"
      title="Изменить цену"
      onClick={() => {
        setValue(String(plot.price))
        setEditing(true)
      }}
      className="group -ml-1.5 inline-flex items-center gap-1.5 rounded px-1.5 py-1 tabular-nums hover:bg-accent"
    >
      {formatPrice(plot.price)}
      <Pencil className="size-3.5 opacity-30 group-hover:opacity-70" />
    </button>
  )
}
