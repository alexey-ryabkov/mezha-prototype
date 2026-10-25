import { create } from "zustand"
import { persist } from "zustand/middleware"

import { DEMO, TODAY } from "@/data/demo"
import type { Billing, Invoice, JournalEntry, Lead, Plot, Point, Settings } from "@/data/types"
import { USERS, type Role } from "@/data/village"
import { nowStamp } from "@/lib/time"

// Версия берется из демо-данных: после их перегенерации сохраненное в браузере состояние сбросится.
// STATE_SHAPE увеличивается, когда меняется набор полей хранилища.
const STATE_SHAPE = 2
const DATA_VERSION = DEMO.meta.version + STATE_SHAPE

export const EXCEL_ACTOR = "загрузка из excel"

export type ImportResult = {
  updated: number
  added: number
  errors: { row: number; reason: string }[]
}

type DemoData = {
  user: Role | null
  village: { name: string; site: string }
  plots: Plot[]
  leads: Lead[]
  journal: JournalEntry[]
  settings: Settings
  billing: Billing
  // Когда последний раз менялась схема (контуры): такие изменения попадают на сайт после публикации
  schemaChangedAt: string | null
  excelImported: boolean
}

type DemoState = DemoData & {
  login: (role: Role) => void
  logout: () => void
  reset: () => void
  addLead: (lead: Omit<Lead, "id" | "at">) => void
  updatePlot: (id: number, patch: Partial<Plot>) => void
  updatePlots: (ids: number[], patch: (p: Plot) => Partial<Plot>) => void
  assignContour: (id: number, contour: Point[], center: Point) => void
  createPlot: (plot: Omit<Plot, "id">) => number
  deletePlot: (id: number) => void
  importExcel: () => ImportResult
  publish: () => void
  updateSettings: (patch: Partial<Settings>) => void
  updateVillage: (patch: Partial<DemoData["village"]>) => void
  updateBilling: (patch: Partial<Pick<Billing, "company" | "inn">>) => void
  createInvoice: () => Invoice
  payInvoice: (id: string) => void
}

const initialData = (): DemoData =>
  structuredClone({
    user: null,
    village: { name: DEMO.village.name, site: DEMO.village.site },
    plots: DEMO.plots,
    leads: DEMO.leads,
    journal: DEMO.journal,
    settings: DEMO.settings,
    billing: DEMO.billing,
    schemaChangedAt: null,
    excelImported: false,
  })

const nextId = (items: { id: number }[]) => Math.max(0, ...items.map((i) => i.id)) + 1

// Записи журнала об изменении статуса и цены
function changes(plot: Plot, patch: Partial<Plot>, by: string, startId: number): JournalEntry[] {
  const at = nowStamp()
  const out: JournalEntry[] = []
  if (patch.status && patch.status !== plot.status) {
    out.push({ id: startId + out.length, at, plotId: plot.id, field: "status", from: plot.status, to: patch.status, by })
  }
  if (patch.price !== undefined && patch.price !== plot.price) {
    out.push({ id: startId + out.length, at, plotId: plot.id, field: "price", from: plot.price, to: patch.price, by })
  }
  return out
}

// Бронь снимается, когда участок перестает быть забронированным
const withBooking = (plot: Plot, patch: Partial<Plot>): Plot => {
  const next = { ...plot, ...patch }
  if (next.status !== "booked") next.booking = null
  return next
}

const monthAfter = (month: string) => {
  const [y, m] = month.split("-").map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`
}
const lastDay = (month: string) => {
  const [y, m] = month.split("-").map(Number)
  return `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`
}

export const isPaid = (billing: Billing) => billing.paidUntil >= TODAY

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => {
      const actor = () => {
        const user = get().user
        return user ? USERS[user].fullName : "—"
      }

      return {
        ...initialData(),
        login: (user) => set({ user }),
        logout: () => set({ user: null }),
        reset: () => set(initialData()),

        addLead: (lead) => set((s) => ({ leads: [{ ...lead, id: nextId(s.leads), at: nowStamp() }, ...s.leads] })),

        updatePlot: (id, patch) =>
          set((s) => {
            const plot = s.plots.find((p) => p.id === id)
            if (!plot) return {}
            return {
              plots: s.plots.map((p) => (p.id === id ? withBooking(p, patch) : p)),
              journal: [...s.journal, ...changes(plot, patch, actor(), nextId(s.journal))],
            }
          }),

        updatePlots: (ids, patch) =>
          set((s) => {
            const journal = [...s.journal]
            const plots = s.plots.map((p) => {
              if (!ids.includes(p.id)) return p
              const pt = patch(p)
              journal.push(...changes(p, pt, actor(), nextId(journal)))
              return withBooking(p, pt)
            })
            return { plots, journal }
          }),

        assignContour: (id, contour, center) =>
          set((s) => ({
            plots: s.plots.map((p) => (p.id === id ? { ...p, contour, center } : p)),
            schemaChangedAt: nowStamp(),
          })),

        createPlot: (plot) => {
          const id = nextId(get().plots)
          set((s) => ({ plots: [...s.plots, { ...plot, id }], schemaChangedAt: nowStamp() }))
          return id
        },

        deletePlot: (id) => set((s) => ({ plots: s.plots.filter((p) => p.id !== id), schemaChangedAt: nowStamp() })),

        // Файл не разбирается: результат загрузки заготовлен заранее
        importExcel: () => {
          const s = get()
          const errors = [
            { row: 9, reason: "не указан номер участка" },
            { row: 17, reason: "цена не число: «2,1 млн»" },
          ]
          const toUpdate = s.plots
            .filter((p) => p.status === "free" && p.queue === 2 && p.contour && ![58, 59].includes(p.id))
            .slice(0, 5)
          const existing = new Set(s.plots.map((p) => p.number))
          const added: Plot[] = s.excelImported
            ? []
            : DEMO.outlines
                .filter((c) => c.extra && !existing.has(c.number))
                .map((c, i) => ({
                  id: nextId(s.plots) + i,
                  number: c.number,
                  queue: 2,
                  areaM2: c.areaM2,
                  price: Math.round((c.areaM2 / 100) * 205_000 / 10_000) * 10_000,
                  status: "free",
                  cadastral: `50:27:0090417:${400 + Number(c.number)}`,
                  contour: null,
                  center: c.center,
                  booking: null,
                  tags: [],
                }))
          const journal = [...s.journal]
          const plots = s.plots.map((p) => {
            if (!toUpdate.includes(p)) return p
            const price = Math.round((p.price * 1.02) / 10_000) * 10_000
            journal.push(...changes(p, { price }, EXCEL_ACTOR, nextId(journal)))
            return { ...p, price }
          })
          set({ plots: [...plots, ...added], journal, excelImported: true })
          return { updated: toUpdate.length, added: added.length, errors }
        },

        publish: () => set((s) => ({ settings: { ...s.settings, publishedAt: nowStamp() }, schemaChangedAt: null })),

        updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
        updateVillage: (patch) => set((s) => ({ village: { ...s.village, ...patch } })),
        updateBilling: (patch) => set((s) => ({ billing: { ...s.billing, ...patch } })),

        // Если счет уже ждет оплаты, новый не создается
        createInvoice: () => {
          const { billing } = get()
          const pending = billing.invoices.find((i) => i.status === "pending")
          if (pending) return pending
          const month = monthAfter(billing.invoices.at(-1)?.month ?? TODAY.slice(0, 7))
          const invoice: Invoice = { id: month, month, amount: 5000, status: "pending", issuedAt: TODAY, paidAt: null }
          set({ billing: { ...billing, invoices: [...billing.invoices, invoice] } })
          return invoice
        },

        payInvoice: (id) =>
          set((s) => {
            const invoices = s.billing.invoices.map((i) => (i.id === id ? { ...i, status: "paid" as const, paidAt: TODAY } : i))
            const paidMonths = invoices.filter((i) => i.status === "paid").map((i) => i.month)
            const latest = paidMonths.sort().at(-1)
            return { billing: { ...s.billing, invoices, paidUntil: latest ? lastDay(latest) : s.billing.paidUntil } }
          }),
      }
    },
    {
      name: "mezha-demo",
      version: DATA_VERSION,
      migrate: () => initialData() as DemoState,
    },
  ),
)
