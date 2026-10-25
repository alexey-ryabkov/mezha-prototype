import { Slider } from "@/components/ui/slider"
import { formatMln } from "@/lib/format"
import { AREA_STEP, PRICE_STEP, type PlotFilter } from "./use-plot-filter"

const sot = (m2: number) => (m2 / 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })

export function FilterControls({ filter, withPrice, className }: { filter: PlotFilter; withPrice: boolean; className?: string }) {
  const { bounds, priceRange, areaRange } = filter
  return (
    <div className={className}>
      {withPrice && (
        <div className="grid min-w-52 flex-1 gap-2.5">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">Цена</span>
            <span className="text-muted-foreground tabular-nums">
              {formatMln(priceRange[0])} – {formatMln(priceRange[1])}
            </span>
          </div>
          <Slider
            min={bounds.price[0]}
            max={bounds.price[1]}
            step={PRICE_STEP}
            minStepsBetweenThumbs={1}
            value={priceRange}
            onValueChange={(v) => filter.setPrice([v[0], v[1]])}
            aria-label="Цена"
          />
        </div>
      )}
      <div className="grid min-w-52 flex-1 gap-2.5">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="font-medium">Площадь</span>
          <span className="text-muted-foreground tabular-nums">
            {sot(areaRange[0])} – {sot(areaRange[1])} сот.
          </span>
        </div>
        <Slider
          min={bounds.area[0]}
          max={bounds.area[1]}
          step={AREA_STEP}
          minStepsBetweenThumbs={1}
          value={areaRange}
          onValueChange={(v) => filter.setArea([v[0], v[1]])}
          aria-label="Площадь"
        />
      </div>
    </div>
  )
}
