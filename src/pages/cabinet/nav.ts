import { ChartColumn, History, Inbox, LandPlot, Map, Settings, type LucideIcon } from "lucide-react"

export type CabinetSection = {
  path: string
  label: string
  icon: LucideIcon
  ownerOnly?: boolean
}

export const CABINET_SECTIONS: CabinetSection[] = [
  { path: "plots", label: "Участки", icon: LandPlot },
  { path: "plan", label: "Генплан", icon: Map },
  { path: "leads", label: "Заявки", icon: Inbox },
  { path: "stats", label: "Статистика", icon: ChartColumn },
  { path: "journal", label: "Журнал", icon: History },
  { path: "profile", label: "Профиль", icon: Settings, ownerOnly: true },
]
