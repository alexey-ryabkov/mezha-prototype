import { GenplanView, StatusLegend } from "@/components/genplan/genplan-view"
import { VILLAGE } from "@/data/village"
import { useDemo } from "@/store/demo"

// Виджет показан так, как он стоит блоком на странице сайта поселка, без самого сайта
export function WidgetPage() {
  const plots = useDemo((s) => s.plots)

  return (
    <div className="min-h-svh bg-muted/60 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl overflow-hidden bg-card sm:rounded-xl sm:border sm:shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="text-base font-semibold">Генплан поселка «{VILLAGE.name}»</h2>
          <StatusLegend />
        </div>
        <GenplanView plots={plots} />
      </div>
    </div>
  )
}
