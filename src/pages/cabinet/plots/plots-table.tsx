import { useMemo } from "react"
import type { ColumnDef, OnChangeFn, RowSelectionState } from "@tanstack/react-table"
import { toast } from "sonner"

import { DataTable, SortHeader } from "@/components/common/data-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { STATUS_LABEL, type Plot } from "@/data/types"
import { formatSotki } from "@/lib/format"
import { useDemo } from "@/store/demo"
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
              updatePlot(row.original.id, { status })
              toast.success(`Участок № ${row.original.number}: ${STATUS_LABEL[status]}`)
            }}
          />
        ),
      },
      {
        id: "contour",
        header: "",
        cell: ({ row }) =>
          !row.original.contour && (
            <Badge variant="outline" className="text-muted-foreground">
              без контура
            </Badge>
          ),
      },
    ],
    [updatePlot],
  )

  return (
    <DataTable
      columns={columns}
      data={plots}
      getRowId={(p) => String(p.id)}
      initialSorting={[{ id: "number", desc: false }]}
      rowSelection={selection}
      onRowSelectionChange={onSelectionChange}
      empty="Участок с таким номером не найден"
    />
  )
}
