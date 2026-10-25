import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Role } from "@/data/village"

// При изменении демо-данных увеличить: сохраненное в браузере состояние сбросится
const DATA_VERSION = 1

type DemoData = {
  user: Role | null
}

type DemoState = DemoData & {
  login: (role: Role) => void
  logout: () => void
  reset: () => void
}

const initialData = (): DemoData => ({
  user: null,
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
