import { create } from "zustand"
import { persist } from "zustand/middleware"

import { DEMO } from "@/data/demo"
import type { Billing, Lead, JournalEntry, Plot, Settings } from "@/data/types"
import type { Role } from "@/data/village"

// Версия берется из демо-данных: после их перегенерации сохраненное в браузере состояние сбросится
const DATA_VERSION = DEMO.meta.version

type DemoData = {
  user: Role | null
  plots: Plot[]
  leads: Lead[]
  journal: JournalEntry[]
  settings: Settings
  billing: Billing
}

type DemoState = DemoData & {
  login: (role: Role) => void
  logout: () => void
  reset: () => void
}

const initialData = (): DemoData =>
  structuredClone({
    user: null,
    plots: DEMO.plots,
    leads: DEMO.leads,
    journal: DEMO.journal,
    settings: DEMO.settings,
    billing: DEMO.billing,
  })

export const useDemo = create<DemoState>()(
  persist(
    (set) => ({
      ...initialData(),
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      reset: () => set(initialData()),
    }),
    {
      name: "mezha-demo",
      version: DATA_VERSION,
      migrate: () => initialData() as DemoState,
    },
  ),
)
