import { useState } from "react"
import { useNavigate } from "react-router"
import { Download, FileSpreadsheet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { plural } from "@/lib/format"
import { useDemo, type ImportResult } from "@/store/demo"

// Шаблон отдается как csv: excel его открывает, а для прототипа этого достаточно
function downloadTemplate() {
  const csv = "﻿Номер;Площадь, м²;Цена, ₽;Статус;Кадастровый номер\n47;767;1990000;свободен;50:27:0090417:447\n"
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "shablon-uchastkov.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export function ExcelDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const importExcel = useDemo((s) => s.importExcel)
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const close = (o: boolean) => {
    onOpenChange(o)
    if (!o)
      setTimeout(() => {
        setFile(null)
        setResult(null)
      }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Загрузить из excel</DialogTitle>
          <DialogDescription>
            Участки ищутся по номеру: найденные обновятся, новые добавятся без контура, их можно обвести в редакторе
            генплана.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="grid gap-4">
            <Button variant="link" className="h-auto w-fit p-0" onClick={downloadTemplate}>
              <Download />
              Скачать шаблон
            </Button>
            <label className="grid cursor-pointer justify-items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center text-sm hover:bg-accent/40">
              <FileSpreadsheet className="size-8 text-muted-foreground" />
              {file ? <span className="font-medium">{file.name}</span> : <span>Выберите файл xlsx или csv</span>}
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <DialogFooter>
              <Button disabled={!file} onClick={() => setResult(importExcel())}>
                Загрузить
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="grid gap-4 text-sm">
            <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 rounded-lg bg-muted/60 p-4">
              <dt>Обновлено участков</dt>
              <dd className="font-semibold tabular-nums">{result.updated}</dd>
              <dt>Добавлено участков</dt>
              <dd className="font-semibold tabular-nums">{result.added}</dd>
              <dt>Строки с ошибками</dt>
              <dd className="font-semibold tabular-nums text-destructive">{result.errors.length}</dd>
            </dl>
            <ul className="grid gap-1 text-muted-foreground">
              {result.errors.map((e) => (
                <li key={e.row}>
                  Строка {e.row}: {e.reason}
                </li>
              ))}
            </ul>
            {result.added > 0 && (
              <p>
                {result.added} {plural(result.added, ["новый участок", "новых участка", "новых участков"])} без контура.
                Обведите их на генплане, чтобы они появились на сайте.
              </p>
            )}
            <DialogFooter>
              <Button variant="secondary" onClick={() => close(false)}>
                Закрыть
              </Button>
              {result.added > 0 && (
                <Button
                  onClick={() => {
                    close(false)
                    navigate("/cabinet/plan")
                  }}
                >
                  Открыть генплан
                </Button>
              )}
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
