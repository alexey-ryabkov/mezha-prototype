import { Headset, LayoutGrid, MapPinned, UserRound, type LucideIcon } from "lucide-react"

export type DemoLink = {
  to: string
  label: string
  hint: string
  icon: LucideIcon
}

export const DEMO_MENU: DemoLink = {
  to: "/",
  label: "Меню демонстрации",
  hint: "",
  icon: LayoutGrid,
}

export const DEMO_LINKS: DemoLink[] = [
  {
    to: "/widget",
    label: "Виджет на сайте поселка",
    hint: "Генплан глазами покупателя: фильтры, карточка участка, заявка",
    icon: MapPinned,
  },
  {
    to: "/login/owner",
    label: "Кабинет собственника",
    hint: "Андрей: редактор генплана, публикация, статистика, оплата",
    icon: UserRound,
  },
  {
    to: "/login/manager",
    label: "Кабинет менеджера",
    hint: "Ольга: участки, брони, заявки покупателей",
    icon: Headset,
  },
]
