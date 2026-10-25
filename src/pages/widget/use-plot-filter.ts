import { useMemo, useState } from "react"

import type { Plot } from "@/data/types"

export type Range = [number, number]

const floorTo = (v: number, step: number) => Math.floor(v / step) * step
const ceilTo = (v: number, step: number) => Math.ceil(v / step) * step

export const PRICE_STEP = 50_000
export const AREA_STEP = 50 // м², полсотки

// Фильтр по цене и площади. Подходящими считаются только свободные участки с контуром.
export function usePlotFilter(plots: Plot[], withPrice: boolean) {
  const bounds = useMemo(() => {
    const onPlan = plots.filter((p) => p.contour)
    return {
      price: [floorTo(Math.min(...onPlan.map((p) => p.price)), PRICE_STEP), ceilTo(Math.max(...onPlan.map((p) => p.price)), PRICE_STEP)] as Range,
      area: [floorTo(Math.min(...onPlan.map((p) => p.areaM2)), AREA_STEP), ceilTo(Math.max(...onPlan.map((p) => p.areaM2)), AREA_STEP)] as Range,
    }
  }, [plots])

  const [price, setPrice] = useState<Range | null>(null)
  const [area, setArea] = useState<Range | null>(null)
  const priceRange = withPrice ? (price ?? bounds.price) : bounds.price
  const areaRange = area ?? bounds.area

  const active = (withPrice && price !== null) || area !== null

  const matches = (p: Plot) =>
    p.status === "free" &&
    !!p.contour &&
    p.areaM2 >= areaRange[0] &&
    p.areaM2 <= areaRange[1] &&
    (!withPrice || (p.price >= priceRange[0] && p.price <= priceRange[1]))

  const matching = plots.filter(matches)

  return {
    bounds,
    priceRange,
    areaRange,
    setPrice,
    setArea,
    active,
    matches,
    matching,
    reset: () => {
      setPrice(null)
      setArea(null)
    },
  }
}

export type PlotFilter = ReturnType<typeof usePlotFilter>
