import type { PlotStatus } from "@/data/types"

// Классы перечислены целиком, чтобы Tailwind их нашел
export const FILL: Record<PlotStatus, string> = {
  free: "fill-free/55 stroke-free",
  booked: "fill-booked/60 stroke-booked",
  sold: "fill-sold/45 stroke-sold",
}

export const SWATCH: Record<PlotStatus, string> = {
  free: "bg-free/55 border-free",
  booked: "bg-booked/60 border-booked",
  sold: "bg-sold/45 border-sold",
}
