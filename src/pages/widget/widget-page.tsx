import { VILLAGE } from "@/data/village"

// Виджет показан так, как он стоит блоком на странице сайта поселка, без самого сайта
export function WidgetPage() {
  return (
    <div className="min-h-svh bg-muted/60 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl overflow-hidden bg-card sm:rounded-xl sm:border sm:shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="text-base font-semibold">Генплан поселка «{VILLAGE.name}»</h2>
        </div>
        <div className="flex aspect-[4/3] items-center justify-center text-sm text-muted-foreground sm:aspect-[16/9]">
          Здесь будет генплан (шаг 3)
        </div>
      </div>
    </div>
  )
}
