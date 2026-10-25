import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Phone } from "lucide-react"

import { DataTable, SortHeader } from "@/components/common/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TODAY } from "@/data/demo"
import type { Lead } from "@/data/types"
import { formatDate, formatDateTime } from "@/lib/format"
import { useIsMobile } from "@/hooks/use-mobile"
import { useDemo } from "@/store/demo"
import { BookingDialog } from "./common/booking"
import { PlotEditDialog } from "./common/plot-edit-dialog"

export function LeadsPage() {
  const leads = useDemo((s) => s.leads)
  const plots = useDemo((s) => s.plots)
  const isMobile = useIsMobile()
  const [plotId, setPlotId] = useState<number | null>(null)
  const [booking, setBooking] = useState<Lead | null>(null)
  const numberOf = (id: number) => plots.find((p) => p.id === id)?.number ?? "—"

  // Ф-26: участок из заявки бронируется в один клик, в комментарий подставляется покупатель
  const BookAction = ({ lead }: { lead: Lead }) => {
    const plot = plots.find((p) => p.id === lead.plotId)
    if (!plot) return null
    if (plot.status === "free")
      return (
        <Button variant="outline" size="sm" onClick={() => setBooking(lead)}>
          Забронировать участок
        </Button>
      )
    return (
      <span className="text-xs whitespace-nowrap text-muted-foreground">
        {plot.status === "sold" ? "продан" : `бронь до ${plot.booking ? formatDate(plot.booking.until) : "—"}`}
      </span>
    )
  }

  const PlotLink = ({ id }: { id: number }) => (
    <button
      type="button"
      onClick={() => setPlotId(id)}
      className="font-medium text-primary underline-offset-2 hover:underline"
    >
      № {numberOf(id)}
    </button>
  )

  const columns: ColumnDef<Lead, unknown>[] = [
    {
      id: "at",
      accessorFn: (l) => `${l.at}#${String(l.id).padStart(6, "0")}`,
      header: ({ column }) => <SortHeader column={column} label="Дата и время" />,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-2 whitespace-nowrap tabular-nums">
          {formatDateTime(row.original.at)}
          {row.original.at.startsWith(TODAY) && <Badge>сегодня</Badge>}
        </span>
      ),
    },
    {
      id: "plot",
      accessorFn: (l) => Number(numberOf(l.plotId)) || 0,
      header: ({ column }) => <SortHeader column={column} label="Участок" />,
      cell: ({ row }) => <PlotLink id={row.original.plotId} />,
    },
    { id: "name", header: "Имя", cell: ({ row }) => row.original.name || "—" },
    {
      id: "phone",
      header: "Телефон",
      cell: ({ row }) => (
        <a
          href={`tel:${row.original.phone.replace(/[^\d+]/g, "")}`}
          className="whitespace-nowrap tabular-nums hover:underline"
        >
          {row.original.phone}
        </a>
      ),
    },
    {
      id: "comment",
      header: "Комментарий",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.comment || "—"}</span>,
    },
    { id: "book", header: "", cell: ({ row }) => <BookAction lead={row.original} /> },
  ]

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Заявки с генплана на сайте. Они же приходят на почту, указанную в профиле. По номеру участка открывается его
        карточка.
      </p>

      {!isMobile && (
        <div>
          <DataTable
            columns={columns}
            data={leads}
            getRowId={(l) => String(l.id)}
            initialSorting={[{ id: "at", desc: true }]}
          />
        </div>
      )}

      {isMobile && (
        <ul className="grid gap-2">
          {[...leads]
            .sort((a, b) => b.at.localeCompare(a.at))
            .map((l) => (
              <li key={l.id} className="grid gap-1 rounded-lg border bg-card p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <PlotLink id={l.plotId} />
                  <span className="inline-flex items-center gap-2 text-muted-foreground tabular-nums">
                    {l.at.startsWith(TODAY) && <Badge>сегодня</Badge>}
                    {formatDateTime(l.at)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{l.name || "Без имени"}</span>
                  <a
                    href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center gap-1 text-primary tabular-nums"
                  >
                    <Phone className="size-3.5" />
                    {l.phone}
                  </a>
                </div>
                {l.comment && <p className="text-muted-foreground">{l.comment}</p>}
                <div className="pt-1">
                  <BookAction lead={l} />
                </div>
              </li>
            ))}
        </ul>
      )}

      <PlotEditDialog plotId={plotId} onClose={() => setPlotId(null)} />
      <BookingDialog
        plotId={booking?.plotId ?? null}
        initialComment={
          booking ? `${booking.name || "Покупатель"}, ${booking.phone}, заявка от ${formatDate(booking.at)}` : ""
        }
        onClose={() => setBooking(null)}
      />
    </div>
  )
}
