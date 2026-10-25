import { useMemo, useState } from "react"
import type { ColumnDef, OnChangeFn, RowSelectionState } from "@tanstack/react-table"
import { Link2 } from "lucide-react"
import { toast } from "sonner"

import { copyText } from "@/components/common/copy-button"
import { DataTable, SortHeader } from "@/components/common/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { STATUS_LABEL, type Plot } from "@/data/types"
import { formatSotki } from "@/lib/format"
import { plotLink } from "@/lib/links"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo"
import { BookingBadge, BookingDialog, bookingState } from "../common/booking"
import { StatusSelect } from "../common/status"
import { PriceCell } from "./price-cell"

const STATUS_ORDER = { free: 0, booked: 1, sold: 2 }

export function PlotsTable({
  plots,
  selection,
  onSelectionChange,
}: {
  plots: Plot[]
  selection: RowSelectionState
  onSelectionChange: OnChangeFn<RowSelectionState>
}) {
  const updatePlot = useDemo((s) => s.updatePlot)
  const [bookingId, setBookingId] = useState<number | null>(null)

  const columns = useMemo<ColumnDef<Plot, unknown>[]>(
    () => [
      {
        id: "select",
        size: 40,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected() || (table.getIsSomeRowsSelected() && "indeterminate")}
            onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
            aria-label="Отметить все"
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Отметить участок" />
        ),
      },
      {
        id: "number",
        accessorFn: (p) => Number(p.number) || 0,
        header: ({ column }) => <SortHeader column={column} label="Номер" />,
        cell: ({ row }) => <span className="font-medium">№ {row.original.number}</span>,
      },
      {
        id: "queue",
        accessorFn: (p) => p.queue,
        header: ({ column }) => <SortHeader column={column} label="Очередь" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.queue}</span>,
      },
      {
        id: "area",
        accessorFn: (p) => p.areaM2,
        header: ({ column }) => <SortHeader column={column} label="Площадь" />,
        cell: ({ row }) => formatSotki(row.original.areaM2),
      },
      {
        id: "price",
        accessorFn: (p) => p.price,
        header: ({ column }) => <SortHeader column={column} label="Цена" />,
        cell: ({ row }) => <PriceCell plot={row.original} />,
      },
      {
        id: "status",
        accessorFn: (p) => STATUS_ORDER[p.status],
        header: ({ column }) => <SortHeader column={column} label="Статус" />,
        cell: ({ row }) => (
          <StatusSelect
            value={row.original.status}
            onChange={(status) => {
              if (status === "booked") return setBookingId(row.original.id)
              updatePlot(row.original.id, { status })
              toast.success(`Участок № ${row.original.number}: ${STATUS_LABEL[status]}`)
            }}
          />
        ),
      },
      {
        id: "booking",
        accessorFn: (p) => (p.status === "booked" ? (p.booking?.until ?? "") : ""),
        header: ({ column }) => <SortHeader column={column} label="Бронь до" />,
        cell: ({ row }) => (
          <span title={row.original.booking?.comment || undefined}>
            <BookingBadge plot={row.original} />
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {!row.original.contour && (
              <Badge variant="outline" className="text-muted-foreground">
                без контура
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              title="Скопировать ссылку на участок"
              aria-label={`Скопировать ссылку на участок № ${row.original.number}`}
              onClick={() => copyText(plotLink(row.original.number), `Ссылка на участок № ${row.original.number} скопирована`)}
            >
              <Link2 />
            </Button>
          </div>
        ),
      },
    ],
    [updatePlot],
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={plots}
        getRowId={(p) => String(p.id)}
        initialSorting={[{ id: "number", desc: false }]}
        rowSelection={selection}
        onRowSelectionChange={onSelectionChange}
        rowClassName={(p) => cn(bookingState(p) === "tomorrow" && "bg-booked/15")}
        empty="Участок с таким номером не найден"
      />
      <BookingDialog plotId={bookingId} onClose={() => setBookingId(null)} />
    </>
  )
}
