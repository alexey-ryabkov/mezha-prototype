import { useState } from "react"
import { useSearchParams } from "react-router"
import { Heart, LocateFixed, RotateCcw, SlidersHorizontal } from "lucide-react"

import { ResponsiveSheet } from "@/components/common/responsive-sheet"
import { GenplanView, StatusLegend } from "@/components/genplan/genplan-view"
import { PlanCanvas, type Viewport } from "@/components/genplan/plan-canvas"
import { SWATCH } from "@/components/genplan/status-colors"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HERE } from "@/data/demo"
import { STATUS_LABEL, type Plot } from "@/data/types"
import { formatPrice, formatSotki, plural } from "@/lib/format"
import { cn } from "@/lib/utils"
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
  const likes = useDemo((s) => s.likes)
  const withPrice = useDemo((s) => s.settings.priceMode) === "all"
  const [params, setParams] = useSearchParams()

  // Ф-25: очереди, у которых есть участки на плане
  const queues = [...new Set(plots.filter((p) => p.contour).map((p) => p.queue))].sort()
  const [queue, setQueue] = useState<number | "all">("all")
  const inQueue = (p: Plot) => queue === "all" || p.queue === queue

  const filter = usePlotFilter(plots, withPrice)
  const matches = (p: Plot) => inQueue(p) && filter.matches(p)
  const matching = plots.filter(matches)

  // Ф-27: подборка по ссылке ?set=12,15,33
  const setNumbers = params.get("set")?.split(",").filter(Boolean)
  const selection = setNumbers ? plots.filter((p) => p.contour && setNumbers.includes(p.number)) : null

  // Ф-22: ссылка ?plot=47 сразу открывает карточку участка
  const [selectedId, setSelectedId] = useState<number | null>(
    () => plots.find((p) => p.number === params.get("plot"))?.id ?? null,
  )
  const [viewport, setViewport] = useState<Viewport | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [likesOpen, setLikesOpen] = useState(false)
  const [here, setHere] = useState(false)

  const listed = (selection ?? matching).filter((p) => !viewport || inside(p, viewport))
  const selected = plots.find((p) => p.id === selectedId) ?? null
  const liked = plots.filter((p) => likes.includes(p.id))
  const fits = fitsText(matching.length)

  const dimmed = selection
    ? (p: Plot) => !selection.includes(p)
    : filter.active || queue !== "all"
      ? (p: Plot) => !inQueue(p) || (filter.active && !filter.matches(p))
      : undefined

  const closeCard = () => {
    setSelectedId(null)
    if (params.has("plot")) {
      params.delete("plot")
      setParams(params, { replace: true })
    }
  }

  return (
    <div className="min-h-svh bg-muted/60 pb-16 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl overflow-hidden bg-card sm:rounded-xl sm:border sm:shadow-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-4 py-3">
          <h2 className="mr-auto text-base font-semibold">Генплан поселка</h2>
          <StatusLegend className="hidden lg:flex" />
          <Button variant="outline" size="sm" onClick={() => setLikesOpen(true)}>
            <Heart className={cn(liked.length && "fill-primary text-primary")} />
            Понравившиеся
            {liked.length > 0 && <span className="tabular-nums">{liked.length}</span>}
          </Button>
        </div>

        {selection ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-primary/5 px-4 py-3 text-sm">
            <span>
              <span className="font-medium">Подборка участков:</span> {selection.map((p) => `№ ${p.number}`).join(", ")}
            </span>
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => setParams({}, { replace: true })}>
              Показать все участки
            </Button>
          </div>
        ) : (
          <>
            {queues.length > 1 && (
              <div className="border-b px-4 py-2">
                <Tabs value={String(queue)} onValueChange={(v) => setQueue(v === "all" ? "all" : Number(v))}>
                  <TabsList>
                    <TabsTrigger value="all">Все очереди</TabsTrigger>
                    {queues.map((q) => (
                      <TabsTrigger key={q} value={String(q)}>
                        {q} очередь
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

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
            <div className="flex items-center gap-3 border-b px-4 py-2 lg:hidden">
              <Button variant="outline" size="sm" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal />
                Фильтры
                {filter.active && <span className="size-1.5 rounded-full bg-primary" />}
              </Button>
              <span className="text-sm whitespace-nowrap text-muted-foreground">{fits}</span>
              {filter.active && (
                <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Сбросить" title="Сбросить" onClick={filter.reset}>
                  <RotateCcw />
                </Button>
              )}
            </div>
          </>
        )}

        <div className="lg:grid lg:grid-cols-[1fr_320px]">
          <PlanCanvas
            onViewportChange={setViewport}
            controls={
              <Button
                variant={here ? "default" : "outline"}
                size="icon-sm"
                className={cn("shadow-sm", !here && "bg-card/90")}
                title="Где я"
                aria-label="Где я"
                aria-pressed={here}
                onClick={() => setHere(!here)}
              >
                <LocateFixed />
              </Button>
            }
          >
            <GenplanView
              plots={plots}
              dimmed={dimmed}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onPlotClick={(p) => setSelectedId(p.id)}
              marker={here ? HERE : null}
            />
          </PlanCanvas>
          <StatusLegend className="border-t px-4 py-2 lg:hidden" />
          <div className="relative border-t lg:border-t-0 lg:border-l">
            <div className="lg:absolute lg:inset-0 lg:overflow-y-auto">
              <PlotList
                plots={listed}
                withPrice={withPrice}
                onSelect={(p) => setSelectedId(p.id)}
                onHover={setHoveredId}
                title={selection ? "В подборке на плане" : undefined}
              />
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

      {/* Ф-28: понравившиеся участки хранятся в браузере покупателя */}
      <ResponsiveSheet
        open={likesOpen}
        onOpenChange={setLikesOpen}
        title="Понравившиеся"
        description="Участки, отмеченные сердечком. Они сохраняются в этом браузере, регистрироваться не нужно."
      >
        {liked.length ? (
          <ul className="grid gap-1.5">
            {liked.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setLikesOpen(false)
                    setSelectedId(p.id)
                  }}
                  className="flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm hover:bg-accent/60"
                >
                  <span className={cn("size-2.5 shrink-0 rounded-full border", SWATCH[p.status])} />
                  <span className="font-medium">№ {p.number}</span>
                  <span className="text-muted-foreground">{formatSotki(p.areaM2)}</span>
                  <span className="ml-auto text-right tabular-nums">
                    {p.status === "free" ? (withPrice ? formatPrice(p.price) : "") : STATUS_LABEL[p.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">Пока пусто. Отметьте участок кнопкой «Нравится» в его карточке.</p>
        )}
      </ResponsiveSheet>

      <PlotSheet plot={selected} onClose={closeCard} onSelect={setSelectedId} />
    </div>
  )
}
