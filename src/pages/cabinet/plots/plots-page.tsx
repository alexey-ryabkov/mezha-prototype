import { useState } from "react"
import { useSearchParams } from "react-router"
import type { RowSelectionState } from "@tanstack/react-table"
import { ChevronDown, Search, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDemo } from "@/store/demo"
import { BulkPriceDialog, BulkStatusDialog, SelectionDialog } from "./bulk-dialogs"
import { ExcelDialog } from "./excel-dialog"
import { PlotCards } from "./plot-cards"
import { PlotsTable } from "./plots-table"

export function PlotsPage() {
  const plots = useDemo((s) => s.plots)
  const isMobile = useIsMobile()
  const [params, setParams] = useSearchParams()
  const q = (params.get("q") ?? "").trim()
  const filtered = plots.filter((p) => p.number.includes(q))

  const [selection, setSelection] = useState<RowSelectionState>({})
  const visibleIds = new Set(filtered.map((p) => p.id))
  const selectedIds = Object.keys(selection)
    .filter((k) => selection[k])
    .map(Number)
    .filter((id) => visibleIds.has(id))

  const [bulk, setBulk] = useState<"price" | "status" | "share" | null>(null)
  const [excelOpen, setExcelOpen] = useState(false)

  const done = (applied: boolean) => {
    setBulk(null)
    if (applied) setSelection({})
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-60">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            inputMode="numeric"
            placeholder="Поиск по номеру"
            value={params.get("q") ?? ""}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
            className="pl-8"
          />
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!selectedIds.length}>
                Действия{selectedIds.length ? ` (${selectedIds.length})` : ""}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => setBulk("price")}>Изменить цену на %</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setBulk("status")}>Сменить статус</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setBulk("share")}>Поделиться подборкой</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-sm text-muted-foreground">
            {selectedIds.length ? "отмечено галочками" : "отметьте участки галочками, чтобы изменить несколько сразу"}
          </span>
        </div>
        <Button variant="outline" className="ml-auto hidden md:inline-flex" onClick={() => setExcelOpen(true)}>
          <Upload />
          Загрузить из excel
        </Button>
      </div>

      {isMobile ? (
        <PlotCards plots={filtered} />
      ) : (
        <PlotsTable plots={filtered} selection={selection} onSelectionChange={setSelection} />
      )}

      <BulkPriceDialog ids={selectedIds} open={bulk === "price"} onDone={done} />
      <BulkStatusDialog ids={selectedIds} open={bulk === "status"} onDone={done} />
      <SelectionDialog
        numbers={plots.filter((p) => selectedIds.includes(p.id)).map((p) => p.number)}
        open={bulk === "share"}
        onDone={() => setBulk(null)}
      />
      <ExcelDialog open={excelOpen} onOpenChange={setExcelOpen} />
    </div>
  )
}
