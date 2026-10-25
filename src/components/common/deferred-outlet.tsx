import { useEffect, useState } from "react"
import { Outlet } from "react-router"
import { Loader2 } from "lucide-react"

export function PageLoader() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="size-7 animate-spin text-primary" />
      Загружаем данные
    </div>
  )
}

// Страница раздела рисуется после того, как браузер успел показать прелоадер.
// Иначе на время отрисовки тяжелой страницы (таблица участков) рабочая область остается пустой.
export function DeferredOutlet() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let timer = 0
    const frame = requestAnimationFrame(() => {
      timer = window.setTimeout(() => setReady(true))
    })
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [])
  return ready ? <Outlet /> : <PageLoader />
}
