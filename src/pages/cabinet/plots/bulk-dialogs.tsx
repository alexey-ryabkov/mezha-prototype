import { useState } from "react"
import { toast } from "sonner"

import { CopyButton } from "@/components/common/copy-button"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TODAY } from "@/data/demo"
import { STATUS_LABEL, type PlotStatus } from "@/data/types"
import { plural } from "@/lib/format"
import { selectionLink } from "@/lib/links"
import { addDays } from "@/lib/time"
import { useDemo } from "@/store/demo"
import { DEFAULT_BOOKING_DAYS } from "../common/booking"
import { StatusSelect } from "../common/status"

const plotsWord = (n: number) => `${n} ${plural(n, ["участка", "участков", "участков"])}`

export function BulkPriceDialog({ ids, open, onDone }: { ids: number[]; open: boolean; onDone: (applied: boolean) => void }) {
  const updatePlots = useDemo((s) => s.updatePlots)
  const [pct, setPct] = useState("")
  const value = Number(pct.replace(",", "."))
  const ok = pct !== "" && value !== 0 && value > -100

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDone(false)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Изменить цену на %</DialogTitle>
          <DialogDescription>Для {plotsWord(ids.length)}. Новые цены округляются до 10 000 ₽.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="bulk-pct">Процент</Label>
          <Input id="bulk-pct" inputMode="decimal" placeholder="5 или −3" value={pct} onChange={(e) => setPct(e.target.value)} />
          <p className="text-xs text-muted-foreground">Положительное число поднимает цену, отрицательное снижает</p>
        </div>
        <DialogFooter>
          <Button
            disabled={!ok}
            onClick={() => {
              updatePlots(ids, (p) => ({ price: Math.round((p.price * (1 + value / 100)) / 10_000) * 10_000 }))
              toast.success(`Цены ${plotsWord(ids.length)} изменены на ${value > 0 ? "+" : ""}${value}%`)
              setPct("")
              onDone(true)
            }}
          >
            Изменить цены
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function BulkStatusDialog({ ids, open, onDone }: { ids: number[]; open: boolean; onDone: (applied: boolean) => void }) {
  const updatePlots = useDemo((s) => s.updatePlots)
  const [status, setStatus] = useState<PlotStatus>("booked")

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDone(false)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading">Сменить статус</DialogTitle>
          <DialogDescription>Для {plotsWord(ids.length)}</DialogDescription>
        </DialogHeader>
        <StatusSelect value={status} onChange={setStatus} size="default" className="w-full" />
        <DialogFooter>
          <Button
            onClick={() => {
              // Массовая бронь ставится на стандартный срок
              updatePlots(ids, () =>
                status === "booked" ? { status, booking: { until: addDays(TODAY, DEFAULT_BOOKING_DAYS), comment: "" } } : { status },
              )
              toast.success(`Статус ${plotsWord(ids.length)}: ${STATUS_LABEL[status]}`)
              onDone(true)
            }}
          >
            Сменить статус
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Ф-27: ссылка на подборку отмеченных участков
export function SelectionDialog({ numbers, open, onDone }: { numbers: string[]; open: boolean; onDone: () => void }) {
  const link = selectionLink(numbers)
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDone()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Подборка участков</DialogTitle>
          <DialogDescription>
            По ссылке откроется генплан, где выделены участки {numbers.map((n) => `№ ${n}`).join(", ")}. Ее можно отправить
            покупателю в мессенджер.
          </DialogDescription>
        </DialogHeader>
        <Input readOnly value={link} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
        <DialogFooter>
          <CopyButton text={link} message="Ссылка на подборку скопирована" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
