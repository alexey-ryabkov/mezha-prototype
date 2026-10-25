import { useState } from "react"
import { Link2 } from "lucide-react"
import { toast } from "sonner"

import { copyText } from "@/components/common/copy-button"
import { Button } from "@/components/ui/button"
import { STATUS_LABEL, type Plot } from "@/data/types"
import { formatSotki } from "@/lib/format"
import { plotLink } from "@/lib/links"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo"
import { BookingBadge, BookingDialog, bookingState } from "../common/booking"
import { StatusSelect } from "../common/status"
import { PriceCell } from "./price-cell"

// Вид для телефона: менеджер на показе находит участок по номеру и меняет статус и цену
export function PlotCards({ plots }: { plots: Plot[] }) {
  const updatePlot = useDemo((s) => s.updatePlot)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const sorted = [...plots].sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0))

  if (!sorted.length) return <p className="py-8 text-center text-sm text-muted-foreground">Участок с таким номером не найден</p>

  return (
    <>
      <ul className="grid gap-2">
        {sorted.map((p) => (
          <li key={p.id} className={cn("rounded-lg border bg-card p-3", bookingState(p) === "tomorrow" && "border-booked bg-booked/10")}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-heading font-semibold">№ {p.number}</span>
              <PriceCell plot={p} />
            </div>
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                {formatSotki(p.areaM2)} · {p.queue} очередь
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Скопировать ссылку на участок № ${p.number}`}
                onClick={() => copyText(plotLink(p.number), `Ссылка на участок № ${p.number} скопирована`)}
              >
                <Link2 />
              </Button>
            </div>
            <StatusSelect
              value={p.status}
              size="default"
              className="mt-2 w-full"
              onChange={(status) => {
                if (status === "booked") return setBookingId(p.id)
                updatePlot(p.id, { status })
                toast.success(`Участок № ${p.number}: ${STATUS_LABEL[status]}`)
              }}
            />
            {p.status === "booked" && p.booking && (
              <div className="mt-2 grid gap-0.5 text-sm">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground">Бронь до</span>
                  <BookingBadge plot={p} />
                </span>
                {p.booking.comment && <span className="text-muted-foreground">{p.booking.comment}</span>}
              </div>
            )}
          </li>
        ))}
      </ul>
      <BookingDialog plotId={bookingId} onClose={() => setBookingId(null)} />
    </>
  )
}
