import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Search } from "lucide-react"

import { DataTable, SortHeader } from "@/components/common/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { JournalEntry, PlotStatus } from "@/data/types"
import { formatDateLong, formatDateTime, formatPrice, plural } from "@/lib/format"
import { useDemo } from "@/store/demo"
import { StatusLabel } from "./common/status"
import { PERIODS, periodStart, type Period } from "./period"

const Value = ({ e, v }: { e: JournalEntry; v: JournalEntry["from"] }) =>
  e.field === "status" ? <StatusLabel status={v as PlotStatus} /> : <span className="tabular-nums">{formatPrice(v as number)}</span>

export function JournalPage() {
  const journal = useDemo((s) => s.journal)
  const plots = useDemo((s) => s.plots)
  const [q, setQ] = useState("")
  const [period, setPeriod] = useState<Period>("all")

  const numberOf = (id: number) => plots.find((p) => p.id === id)?.number ?? String(id)
  const from = periodStart(period)
  const rows = journal.filter((e) => e.at.slice(0, 10) >= from && (!q.trim() || numberOf(e.plotId) === q.trim()))

  const last = [...journal].sort((a, b) => b.at.localeCompare(a.at))[0]
  const last30 = journal.filter((e) => e.at.slice(0, 10) >= periodStart("30")).length

  const columns: ColumnDef<JournalEntry, unknown>[] = [
    {
      id: "at",
      accessorFn: (e) => `${e.at}#${String(e.id).padStart(6, "0")}`,
      header: ({ column }) => <SortHeader column={column} label="Дата и время" />,
      cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{formatDateTime(row.original.at)}</span>,
    },
    {
      id: "plot",
      accessorFn: (e) => Number(numberOf(e.plotId)) || 0,
      header: ({ column }) => <SortHeader column={column} label="Участок" />,
      cell: ({ row }) => <span className="font-medium">№ {numberOf(row.original.plotId)}</span>,
    },
    { id: "field", header: "Что изменилось", cell: ({ row }) => (row.original.field === "status" ? "Статус" : "Цена") },
    { id: "from", header: "Было", cell: ({ row }) => <Value e={row.original} v={row.original.from} /> },
    { id: "to", header: "Стало", cell: ({ row }) => <Value e={row.original} v={row.original.to} /> },
    { id: "by", header: "Кто изменил", cell: ({ row }) => <span className="text-muted-foreground">{row.original.by}</span> },
  ]

  return (
    <div className="grid gap-5">
      {last && (
        <Card className="py-4">
          <CardContent className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
            <span>
              Последнее изменение статуса или цены:{" "}
              <span className="font-semibold">
                {formatDateLong(last.at)}, {last.at.slice(11, 16)}
              </span>
              <span className="text-muted-foreground"> ({last.by})</span>
            </span>
            <span className="text-muted-foreground">
              За последние 30 дней {last30} {plural(last30, ["изменение", "изменения", "изменений"])}
            </span>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-48">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            inputMode="numeric"
            placeholder="Номер участка"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-52" aria-label="Период">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {rows.length} {plural(rows.length, ["запись", "записи", "записей"])}
        </span>
      </div>

      <DataTable columns={columns} data={rows} getRowId={(e) => String(e.id)} initialSorting={[{ id: "at", desc: true }]} empty="Записей нет" />
    </div>
  )
}
