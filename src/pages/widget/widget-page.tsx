import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"

import { GenplanView, StatusLegend } from "@/components/genplan/genplan-view"
import { PlanCanvas, type Viewport } from "@/components/genplan/plan-canvas"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import type { Plot } from "@/data/types"
import { plural } from "@/lib/format"
import { useDemo } from "@/store/demo"
import { FilterControls } from "./filter-controls"
import { PlotList } from "./plot-list"
import { PlotSheet } from "./plot-sheet"
import { usePlotFilter } from "./use-plot-filter"

const inside = (p: Plot, v: Viewport) => p.center[0] >= v.x0 && p.center[0] <= v.x1 && p.center[1] >= v.y0 && p.center[1] <= v.y1

function fitsText(n: number) {
  const verb = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? "подходят" : "подходит"
  return `${verb} ${n} ${plural(n, ["участок", "участка", "участков"])}`
}

// Виджет показан так, как он стоит блоком на странице сайта поселка, без самого сайта
export function WidgetPage() {
  const plots = useDemo((s) => s.plots)
  const withPrice = useDemo((s) => s.settings.priceMode) === "all"
  const filter = usePlotFilter(plots, withPrice)

  const [viewport, setViewport] = useState<Viewport | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const visible = filter.matching.filter((p) => !viewport || inside(p, viewport))
  const selected = plots.find((p) => p.id === selectedId) ?? null
  const fits = fitsText(filter.matching.length)

  return (
    <div className="min-h-svh bg-muted/60 pb-16 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl overflow-hidden bg-card sm:rounded-xl sm:border sm:shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-4 py-3">
          <h2 className="text-base font-semibold">Генплан поселка</h2>
          <StatusLegend className="hidden lg:flex" />
        </div>

        {/* Фильтры на компьютере */}
        <div className="hidden items-end gap-8 border-b px-4 py-4 lg:flex">
          <FilterControls filter={filter} withPrice={withPrice} className="flex flex-1 gap-8" />
          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
            <span className="font-medium">{fits}</span>
            <Button variant="ghost" size="sm" disabled={!filter.active} onClick={filter.reset}>
              Сбросить
            </Button>
          </div>
        </div>

        {/* Фильтры на телефоне */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-2 lg:hidden">
          <Button variant="outline" size="sm" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal />
            Фильтры
            {filter.active && <span className="size-1.5 rounded-full bg-primary" />}
          </Button>
          <span className="text-sm whitespace-nowrap text-muted-foreground">{fits}</span>
          {filter.active && (
            <Button variant="ghost" size="sm" className="ml-auto px-2" onClick={filter.reset}>
              Сбросить
            </Button>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_320px]">
          <PlanCanvas onViewportChange={setViewport}>
            <GenplanView
              plots={plots}
              dimmed={filter.active ? (p) => !filter.matches(p) : undefined}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onPlotClick={(p) => setSelectedId(p.id)}
            />
          </PlanCanvas>
          <StatusLegend className="border-t px-4 py-2 lg:hidden" />
          <div className="relative border-t lg:border-t-0 lg:border-l">
            <div className="lg:absolute lg:inset-0 lg:overflow-y-auto">
              <PlotList plots={visible} withPrice={withPrice} onSelect={(p) => setSelectedId(p.id)} onHover={setHoveredId} />
            </div>
          </div>
        </div>
      </div>

      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-heading">Фильтры</DrawerTitle>
            <DrawerDescription className="sr-only">Цена и площадь участка</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-6 px-4 pb-6">
            <FilterControls filter={filter} withPrice={withPrice} className="grid gap-6" />
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <Button variant="ghost" disabled={!filter.active} onClick={filter.reset}>
                Сбросить
              </Button>
              <Button onClick={() => setFiltersOpen(false)}>Показать: {fits.replace(/^подход\S+ /, "")}</Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <PlotSheet plot={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
