import { useState } from "react"
import { ru } from "react-day-picker/locale"
import { CalendarDays } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { TODAY } from "@/data/demo"
import type { Plot } from "@/data/types"
import { formatDate } from "@/lib/format"
import { addDays, fromDay, toDay } from "@/lib/time"
import { useDemo } from "@/store/demo"

export const DEFAULT_BOOKING_DAYS = 7

// Бронь, которая кончается завтра, отмечается: менеджеру пора продлить ее или снять
export function bookingState(plot: Plot) {
  if (plot.status !== "booked" || !plot.booking) return null
  if (plot.booking.until < TODAY) return "expired"
  if (plot.booking.until === addDays(TODAY, 1)) return "tomorrow"
  return "active"
}

export function BookingBadge({ plot }: { plot: Plot }) {
  const state = bookingState(plot)
  if (!state || !plot.booking) return null
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 whitespace-nowrap tabular-nums">
      {formatDate(plot.booking.until)}
      {state === "tomorrow" && <Badge className="bg-booked text-foreground">кончается завтра</Badge>}
      {state === "expired" && <Badge variant="destructive">истекла</Badge>}
    </span>
  )
}

export function BookingFields({
  until,
  onUntil,
  comment,
  onComment,
}: {
  until: string
  onUntil: (d: string) => void
  comment: string
  onComment: (c: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Бронь до</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-48 justify-start font-normal tabular-nums">
              <CalendarDays />
              {formatDate(until)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={ru}
              selected={fromDay(until)}
              defaultMonth={fromDay(until)}
              disabled={{ before: fromDay(TODAY) }}
              onSelect={(d) => {
                if (d) onUntil(toDay(d))
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="booking-comment">Комментарий</Label>
        <Textarea
          id="booking-comment"
          rows={2}
          placeholder="Например, имя покупателя"
          value={comment}
          onChange={(e) => onComment(e.target.value)}
        />
      </div>
    </div>
  )
}

// Окно брони: срок и комментарий. Открывается при выборе статуса «забронирован» и из заявки.
export function BookingDialog({
  plotId,
  initialComment = "",
  onClose,
}: {
  plotId: number | null
  initialComment?: string
  onClose: () => void
}) {
  const plot = useDemo((s) => s.plots.find((p) => p.id === plotId) ?? null)
  return (
    <Dialog open={!!plot} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {plot && <BookingForm key={plot.id} plot={plot} initialComment={initialComment} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function BookingForm({ plot, initialComment, onClose }: { plot: Plot; initialComment: string; onClose: () => void }) {
  const updatePlot = useDemo((s) => s.updatePlot)
  const [until, setUntil] = useState(plot.booking?.until ?? addDays(TODAY, DEFAULT_BOOKING_DAYS))
  const [comment, setComment] = useState(plot.booking?.comment ?? initialComment)
  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-heading">Бронь участка № {plot.number}</DialogTitle>
        <DialogDescription>За день до конца брони придет напоминание</DialogDescription>
      </DialogHeader>
      <BookingFields until={until} onUntil={setUntil} comment={comment} onComment={setComment} />
      <DialogFooter>
        <Button
          onClick={() => {
            updatePlot(plot.id, { status: "booked", booking: { until, comment: comment.trim() } })
            toast.success(`Участок № ${plot.number} забронирован до ${formatDate(until)}`)
            onClose()
          }}
        >
          Забронировать
        </Button>
      </DialogFooter>
    </>
  )
}
