import { DEMO, TODAY } from "@/data/demo"

export type Period = "7" | "30" | "all"

export const PERIODS: { value: Period; label: string }[] = [
  { value: "7", label: "Последние 7 дней" },
  { value: "30", label: "Последние 30 дней" },
  { value: "all", label: "С 1 июня" },
]

const dayMs = 86400000

// Первый день периода в формате "2026-08-21"
export function periodStart(period: Period) {
  if (period === "all") return DEMO.meta.periodStart
  const d = new Date(`${TODAY}T00:00:00Z`).getTime() - (Number(period) - 1) * dayMs
  return new Date(d).toISOString().slice(0, 10)
}

// Сколько последних дней статистики попадает в период
export function periodDays(period: Period) {
  return period === "all" ? DEMO.stats.planShows.length : Number(period)
}
