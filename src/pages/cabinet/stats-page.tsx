import { useMemo, useState } from "react"
import { useNavigate } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, FileText } from "lucide-react"

import { DataTable, SortHeader } from "@/components/common/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DEMO } from "@/data/demo"
import type { PlotStatus } from "@/data/types"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDemo } from "@/store/demo"
import { StatusLabel } from "./common/status"
import { PERIODS, periodDays, periodStart, type Period } from "./period"
import { ReportDialog } from "./report-dialog"

type Row = { id: number; number: string; status: PlotStatus; views: number; leads: number; share: number; hot: boolean }

const pct = (v: number) => `${(v * 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`
const sum = (a: number[]) => a.reduce((s, v) => s + v, 0)

export function StatsPage() {
  const plots = useDemo((s) => s.plots)
  const leads = useDemo((s) => s.leads)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [period, setPeriod] = useState<Period>("30")
  const [reportOpen, setReportOpen] = useState(false)

  const { shows, totalLeads, totalViews, rows } = useMemo(() => {
    const days = periodDays(period)
    const from = periodStart(period)
    const inPeriod = leads.filter((l) => l.at.slice(0, 10) >= from)
    const rows: Row[] = plots
      .filter((p) => p.contour)
      .map((p) => {
        // Новые заявки из виджета тоже открывали карточку участка
        const extra = inPeriod.filter((l) => l.plotId === p.id && l.id > DEMO.leads.length).length
        const views = sum((DEMO.stats.plotViews[p.id] ?? []).slice(-days)) + extra
        const n = inPeriod.filter((l) => l.plotId === p.id).length
        return {
          id: p.id,
          number: p.number,
          status: p.status,
          views,
          leads: n,
          share: views ? n / views : 0,
          hot: false,
        }
      })
    // Часто смотрят: в 1,6 раза больше медианы просмотров непроданных участков
    const sorted = rows
      .filter((r) => r.status !== "sold")
      .map((r) => r.views)
      .sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0
    for (const r of rows) r.hot = r.status !== "sold" && r.leads === 0 && r.views >= Math.max(10, median * 1.6)
    return {
      shows: sum(DEMO.stats.planShows.slice(-days)),
      totalLeads: inPeriod.length,
      totalViews: sum(rows.map((r) => r.views)),
      rows,
    }
  }, [plots, leads, period])

  const columns = useMemo<ColumnDef<Row, unknown>[]>(
    () => [
      {
        id: "number",
        accessorFn: (r) => Number(r.number) || 0,
        header: ({ column }) => <SortHeader column={column} label="Участок" />,
        cell: ({ row }) => (
          <span className="inline-flex flex-wrap items-center gap-2">
            <button
              type="button"
              title="Открыть в таблице участков"
              onClick={() => navigate(`/cabinet/plots?q=${row.original.number}`)}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              № {row.original.number}
            </button>
            {row.original.hot && (
              <Badge variant="outline" className="border-booked bg-booked/20 text-foreground">
                <Eye />
                смотрят без заявок
              </Badge>
            )}
          </span>
        ),
      },
      { id: "status", header: "Статус", cell: ({ row }) => <StatusLabel status={row.original.status} /> },
      {
        id: "views",
        accessorFn: (r) => r.views,
        header: ({ column }) => <SortHeader column={column} label="Просмотры карточки" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.views}</span>,
      },
      {
        id: "leads",
        accessorFn: (r) => r.leads,
        header: ({ column }) => <SortHeader column={column} label="Заявки" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.leads}</span>,
      },
      {
        id: "share",
        accessorFn: (r) => r.share,
        header: ({ column }) => <SortHeader column={column} label="Доля" />,
        cell: ({ row }) => <span className="tabular-nums">{pct(row.original.share)}</span>,
      },
    ],
    [navigate],
  )

  const tiles = [
    { label: "Показы генплана", value: shows.toLocaleString("ru-RU"), hint: "сколько раз открыли генплан на сайте" },
    { label: "Заявки", value: String(totalLeads), hint: "заявки на участки с генплана" },
    {
      label: "Доля просмотров с заявкой",
      value: pct(totalViews ? totalLeads / totalViews : 0),
      hint: `заявки к ${totalViews.toLocaleString("ru-RU")} просмотрам карточек`,
    },
  ]

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-56" aria-label="Период">
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
        <Button variant="outline" onClick={() => setReportOpen(true)}>
          <FileText />
          Отчет за месяц
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.label} className="gap-1">
            <CardHeader>
              <CardDescription>{t.label}</CardDescription>
              <CardTitle className="font-heading text-3xl tabular-nums">{t.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">{t.hint}</CardContent>
          </Card>
        ))}
      </div>

      {!isMobile && (
        <div>
          <DataTable
            columns={columns}
            data={rows}
            getRowId={(r) => String(r.id)}
            initialSorting={[{ id: "views", desc: true }]}
            rowClassName={(r) => cn(r.hot && "bg-booked/10")}
          />
        </div>
      )}

      {isMobile && (
        <ul className="grid gap-2">
          {[...rows]
            .sort((a, b) => b.views - a.views)
            .map((r) => (
              <li
                key={r.id}
                className={cn(
                  "grid gap-1.5 rounded-lg border bg-card p-3 text-sm",
                  r.hot && "border-booked bg-booked/10",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/cabinet/plots?q=${r.number}`)}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    № {r.number}
                  </button>
                  <StatusLabel status={r.status} />
                </div>
                {r.hot && (
                  <Badge variant="outline" className="border-booked bg-booked/20 text-foreground">
                    <Eye />
                    смотрят без заявок
                  </Badge>
                )}
                <div className="flex gap-4 text-muted-foreground tabular-nums">
                  <span>просмотры: {r.views}</span>
                  <span>заявки: {r.leads}</span>
                  <span>доля: {pct(r.share)}</span>
                </div>
              </li>
            ))}
        </ul>
      )}

      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  )
}
