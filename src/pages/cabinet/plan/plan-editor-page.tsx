import { useState } from "react"
import { ImageUp, PenLine, Send, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { GenplanView } from "@/components/genplan/genplan-view"
import { PlanCanvas } from "@/components/genplan/plan-canvas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DEMO } from "@/data/demo"
import type { Outline, Plot } from "@/data/types"
import { formatDateTime, formatSotki } from "@/lib/format"
import { cn } from "@/lib/utils"
import { isPaid, useDemo } from "@/store/demo"
import { PlotEditDialog } from "../common/plot-edit-dialog"
import { PublishDialog } from "./publish-dialog"

type Mode = "view" | "outline" | "delete"

const contourKey = (c: Plot["contour"]) => (c ? c[0].join() : "")
const byNumber = (a: Plot, b: Plot) => (Number(a.number) || 0) - (Number(b.number) || 0)

export function PlanEditorPage() {
  const plots = useDemo((s) => s.plots)
  const publishedAt = useDemo((s) => s.settings.publishedAt)
  const schemaChangedAt = useDemo((s) => s.schemaChangedAt)
  const paid = useDemo((s) => isPaid(s.billing))
  const { assignContour, createPlot, deletePlot, publish } = useDemo.getState()

  const [mode, setMode] = useState<Mode>("view")
  const [pickId, setPickId] = useState<number | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [replaceOpen, setReplaceOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)

  const noContour = plots.filter((p) => !p.contour).sort(byNumber)
  const used = new Set(plots.map((p) => contourKey(p.contour)))
  const freeOutlines = DEMO.outlines.filter((o) => !used.has(o.contour[0].join()))
  const picked = plots.find((p) => p.id === pickId)
  const toDelete = plots.find((p) => p.id === deleteId)

  const stop = () => {
    setMode("view")
    setPickId(null)
  }

  // Упрощенная обводка: участку присваивается контур, уже нарисованный на подложке
  const onOutline = (o: Outline) => {
    let id = pickId ?? plots.find((p) => !p.contour && p.number === o.number)?.id
    if (id) {
      assignContour(id, o.contour, o.center)
    } else {
      id = createPlot({
        number: o.number,
        queue: 2,
        areaM2: o.areaM2,
        price: 0,
        status: "free",
        cadastral: "",
        contour: o.contour,
        center: o.center,
        booking: null,
        tags: [],
      })
    }
    stop()
    setEditId(id)
    toast.success("Контур сохранен, проверьте карточку участка")
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => setReplaceOpen(true)}>
          <ImageUp />
          Заменить подложку
        </Button>
        <Button variant={mode === "outline" ? "default" : "outline"} onClick={() => (mode === "outline" ? stop() : setMode("outline"))}>
          <PenLine />
          Обвести участок
        </Button>
        <Button variant={mode === "delete" ? "destructive" : "outline"} onClick={() => (mode === "delete" ? stop() : setMode("delete"))}>
          <Trash2 />
          Удалить участок
        </Button>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Опубликовано {formatDateTime(publishedAt)}</span>
          {schemaChangedAt && <Badge variant="outline" className="border-booked bg-booked/20">есть неопубликованные изменения</Badge>}
          <Button
            onClick={() => {
              if (paid) publish()
              setPublishOpen(true)
            }}
          >
            <Send />
            Опубликовать
          </Button>
        </div>
      </div>

      {mode !== "view" && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm",
            mode === "outline" ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/5",
          )}
        >
          <span className="flex-1">
            {mode === "delete"
              ? "Нажмите на участок, который нужно удалить."
              : picked
                ? `Нажмите на контур участка № ${picked.number} на плане.`
                : "Выберите участок без контура в списке справа или нажмите на свободный контур на плане, чтобы создать новый участок."}
          </span>
          <Button variant="ghost" size="sm" onClick={stop}>
            <X />
            Отмена
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="overflow-hidden rounded-lg border">
          <PlanCanvas>
            <GenplanView
              plots={plots}
              selectedId={editId}
              onPlotClick={mode === "outline" ? undefined : (p) => (mode === "delete" ? setDeleteId(p.id) : setEditId(p.id))}
              outlines={mode === "outline" ? freeOutlines : undefined}
              onOutlineClick={onOutline}
            />
          </PlanCanvas>
        </div>

        <div className="grid content-start gap-3 rounded-lg border bg-card p-4">
          <div className="font-heading text-sm font-semibold">Без контура: {noContour.length}</div>
          <p className="text-xs text-muted-foreground">
            Эти участки не видны на сайте. Выберите участок и нажмите на его контур на плане.
          </p>
          {noContour.length ? (
            <ul className="grid gap-1.5">
              {noContour.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setPickId(p.id)
                      setMode("outline")
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm hover:bg-accent/60",
                      p.id === pickId && "border-primary bg-primary/5",
                    )}
                  >
                    <span className="font-medium">№ {p.number}</span>
                    <span className="text-muted-foreground">{formatSotki(p.areaM2)}</span>
                    <PenLine className="size-3.5 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Все участки обведены</p>
          )}
        </div>
      </div>

      <PlotEditDialog plotId={editId} onClose={() => setEditId(null)} />
      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} />

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Удалить участок № {toDelete?.number}?</DialogTitle>
            <DialogDescription>Участок пропадет с генплана и из таблицы. Его контур можно будет обвести заново.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (toDelete) {
                  deletePlot(toDelete.id)
                  toast.success(`Участок № ${toDelete.number} удален`)
                }
                setDeleteId(null)
                stop()
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Заменить подложку</DialogTitle>
            <DialogDescription>Картинка генплана в jpg, png или pdf. Контуры участков сохранятся.</DialogDescription>
          </DialogHeader>
          <Input type="file" accept="image/*,.pdf" />
          <DialogFooter>
            <Button
              onClick={() => {
                setReplaceOpen(false)
                toast.success("Подложка заменена")
              }}
            >
              Заменить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
