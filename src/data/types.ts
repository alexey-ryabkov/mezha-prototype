export type PlotStatus = "free" | "booked" | "sold"

export type Point = [number, number]

export type Plot = {
  id: number
  number: string
  queue: number
  areaM2: number
  price: number
  status: PlotStatus
  cadastral: string
  // Контур в координатах подложки; null — участок еще не обведен
  contour: Point[] | null
  center: Point
  booking: { until: string; comment: string } | null
  tags: string[]
}

export type ExtraContour = {
  number: string
  contour: Point[]
  center: Point
  areaM2: number
}

export type Lead = {
  id: number
  at: string
  plotId: number
  name: string
  phone: string
  comment: string
}

export type JournalEntry = {
  id: number
  at: string
  plotId: number
  field: "status" | "price"
  from: PlotStatus | number
  to: PlotStatus | number
  by: string
}

export type Settings = {
  priceMode: "all" | "after_lead"
  leadEmails: string[]
  crm: { amocrm: boolean; bitrix24: boolean }
  publishedAt: string
}

export type Invoice = {
  id: string
  month: string
  amount: number
  status: "paid" | "pending"
  issuedAt: string
  paidAt: string | null
}

export type Billing = {
  company: string
  inn: string
  paidUntil: string
  invoices: Invoice[]
}

export type DemoJson = {
  meta: { today: string; periodStart: string; seed: number; version: number }
  village: { name: string; site: string; plan: { width: number; height: number; image: string } }
  plots: Plot[]
  extraContours: ExtraContour[]
  leads: Lead[]
  journal: JournalEntry[]
  stats: { planShows: number[]; plotViews: Record<string, number[]> }
  settings: Settings
  billing: Billing
}

export const STATUS_LABEL: Record<PlotStatus, string> = {
  free: "свободен",
  booked: "забронирован",
  sold: "продан",
}
