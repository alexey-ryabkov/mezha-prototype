import { useState } from "react"
import { toast } from "sonner"

import { ResponsiveSheet } from "@/components/common/responsive-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TODAY } from "@/data/demo"
import type { Plot } from "@/data/types"
import { formatSotki } from "@/lib/format"
import { addDays } from "@/lib/time"
import { useDemo } from "@/store/demo"
import { BookingFields, DEFAULT_BOOKING_DAYS } from "./booking"
import { StatusSelect } from "./status"

// Карточка участка в кабинете: номер, площадь, цена, статус, кадастровый номер
export function PlotEditDialog({ plotId, onClose }: { plotId: number | null; onClose: () => void }) {
  const plot = useDemo((s) => s.plots.find((p) => p.id === plotId) ?? null)
  return (
    <ResponsiveSheet open={!!plot} onOpenChange={(o) => !o && onClose()} title={plot ? `Участок № ${plot.number}` : ""}>
      {plot && <PlotForm key={plot.id} plot={plot} onSaved={onClose} />}
    </ResponsiveSheet>
  )
}

function PlotForm({ plot, onSaved }: { plot: Plot; onSaved: () => void }) {
  const updatePlot = useDemo((s) => s.updatePlot)
  const queues = useDemo((s) => s.queues)
  const [number, setNumber] = useState(plot.number)
  const [queue, setQueue] = useState(String(plot.queue))
  const [until, setUntil] = useState(plot.booking?.until ?? addDays(TODAY, DEFAULT_BOOKING_DAYS))
  const [bookingComment, setBookingComment] = useState(plot.booking?.comment ?? "")
  const [area, setArea] = useState(String(plot.areaM2 || ""))
  const [price, setPrice] = useState(String(plot.price || ""))
  const [status, setStatus] = useState(plot.status)
  const [cadastral, setCadastral] = useState(plot.cadastral)
  const [tried, setTried] = useState(false)

  const areaNum = Number(area)
  const priceNum = Number(price)
  const numberOk = number.trim() !== ""
  const areaOk = areaNum > 0
  const priceOk = priceNum > 0

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setTried(true)
        if (!numberOk || !areaOk || !priceOk) return
        updatePlot(plot.id, {
          number: number.trim(),
          queue: Number(queue),
          areaM2: areaNum,
          price: priceNum,
          status,
          cadastral: cadastral.trim(),
          booking: status === "booked" ? { until, comment: bookingComment.trim() } : null,
        })
        toast.success(`Участок № ${number.trim()} сохранен`)
        onSaved()
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="plot-number">Номер</Label>
          <Input id="plot-number" value={number} onChange={(e) => setNumber(e.target.value)} aria-invalid={tried && !numberOk} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="plot-status">Статус</Label>
          <StatusSelect value={status} onChange={setStatus} size="default" className="w-full" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="plot-area">Площадь, м²</Label>
          <Input
            id="plot-area"
            type="number"
            inputMode="numeric"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            aria-invalid={tried && !areaOk}
          />
          {areaOk && <span className="text-xs text-muted-foreground">{formatSotki(areaNum)}</span>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="plot-price">Цена, ₽</Label>
          <Input
            id="plot-price"
            type="number"
            inputMode="numeric"
            step={10000}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-invalid={tried && !priceOk}
          />
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <div className="grid gap-2">
          <Label htmlFor="plot-cadastral">Кадастровый номер</Label>
          <Input id="plot-cadastral" value={cadastral} onChange={(e) => setCadastral(e.target.value)} className="font-mono" />
        </div>
        <div className="grid gap-2">
          <Label>Очередь</Label>
          <Select value={queue} onValueChange={setQueue}>
            <SelectTrigger className="w-28" aria-label="Очередь">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {queues.map((q) => (
                <SelectItem key={q} value={String(q)}>
                  {q} очередь
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {status === "booked" && (
        <div className="rounded-lg border border-booked/60 bg-booked/10 p-3">
          <BookingFields until={until} onUntil={setUntil} comment={bookingComment} onComment={setBookingComment} />
        </div>
      )}
      {tried && (!numberOk || !areaOk || !priceOk) && (
        <p className="text-xs text-destructive">Заполните номер, площадь и цену</p>
      )}
      <Button type="submit" className="w-full">
        Сохранить
      </Button>
    </form>
  )
}
