import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DEMO, TODAY } from "@/data/demo"
import { USERS } from "@/data/village"
import { formatMonth, plural } from "@/lib/format"
import { useDemo } from "@/store/demo"

const sum = (a: number[]) => a.reduce((s, v) => s + v, 0)
const dayIndex = (day: string) =>
  Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${DEMO.meta.periodStart}T00:00:00Z`)) / 86400000)

// Прошлый месяц относительно «сегодня» прототипа: отчет собирается в начале месяца
function lastMonth() {
  const [y, m] = TODAY.split("-").map(Number)
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`
}

// Ф-17: отчет, который собственник получает раз в месяц
export function ReportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const plots = useDemo((s) => s.plots)
  const leads = useDemo((s) => s.leads)
  const journal = useDemo((s) => s.journal)

  const month = lastMonth()
  const [y, m] = month.split("-").map(Number)
  const from = Math.max(0, dayIndex(`${month}-01`))
  const to = dayIndex(`${month}-${new Date(Date.UTC(y, m, 0)).getUTCDate()}`) + 1
  const inMonth = (at: string) => at.startsWith(month)

  const shows = sum(DEMO.stats.planShows.slice(from, to))
  const monthLeads = leads.filter((l) => inMonth(l.at))
  const rows = plots
    .filter((p) => p.contour)
    .map((p) => ({
      number: p.number,
      views: sum((DEMO.stats.plotViews[p.id] ?? []).slice(from, to)),
      leads: monthLeads.filter((l) => l.plotId === p.id).length,
    }))
  const views = sum(rows.map((r) => r.views))
  const top = [...rows].sort((a, b) => b.views - a.views).slice(0, 5)
  const changes = journal.filter((e) => inMonth(e.at))
  const statusChanges = changes.filter((e) => e.field === "status").length
  const priceChanges = changes.length - statusChanges

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Отчет за {formatMonth(month)}</DialogTitle>
          <DialogDescription>
            Приходит в начале месяца на {USERS.owner.email} и хранится в кабинете
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-3 gap-3 text-center">
          {[
            ["показы генплана", shows.toLocaleString("ru-RU")],
            ["заявки", String(monthLeads.length)],
            ["просмотров с заявкой", `${((monthLeads.length / (views || 1)) * 100).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-muted/60 px-2 py-3">
              <dd className="font-heading text-xl font-semibold tabular-nums">{value}</dd>
              <dt className="text-xs text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>
        <div className="grid gap-2 text-sm">
          <div className="font-medium">Чаще всего смотрели</div>
          <ol className="grid gap-1">
            {top.map((r, i) => (
              <li key={r.number} className="flex justify-between gap-2 tabular-nums">
                <span>
                  {i + 1}. Участок № {r.number}
                </span>
                <span className="text-muted-foreground">
                  {r.views} {plural(r.views, ["просмотр", "просмотра", "просмотров"])}, {r.leads}{" "}
                  {plural(r.leads, ["заявка", "заявки", "заявок"])}
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-sm">
          Статусы менялись {statusChanges} {plural(statusChanges, ["раз", "раза", "раз"])}, цены {priceChanges}{" "}
          {plural(priceChanges, ["раз", "раза", "раз"])}.{" "}
          {changes.length ? "Генплан на сайте живой." : "Изменений не было: проверьте, что статусы на сайте актуальны."}
        </p>
      </DialogContent>
    </Dialog>
  )
}
