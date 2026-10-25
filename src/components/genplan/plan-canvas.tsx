import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch"
import { Loader2, Maximize, Minus, Plus } from "lucide-react"

import { isPlanLoaded, PLAN, planReady } from "@/data/demo"
import { cn } from "@/lib/utils"

// Видимая часть плана в координатах подложки
export type Viewport = { x0: number; y0: number; x1: number; y1: number }

// План с приближением и сдвигом (на телефоне жестами) и кнопками масштаба.
// По текущему сдвигу и масштабу считает видимую область для списка участков.
export function PlanCanvas({
  children,
  className,
  onViewportChange,
}: {
  children: ReactNode
  className?: string
  onViewportChange?: (v: Viewport) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const state = useRef({ scale: 1, positionX: 0, positionY: 0 })
  const [ready, setReady] = useState(isPlanLoaded)

  useEffect(() => {
    let alive = true
    planReady.then(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

  const onChange = useRef(onViewportChange)
  useEffect(() => {
    onChange.current = onViewportChange
  })

  const report = useCallback(() => {
    const el = box.current
    if (!el || !onChange.current) return
    const { scale, positionX, positionY } = state.current
    const k = el.clientWidth / PLAN.width // пикселей экрана на единицу подложки при масштабе 1
    onChange.current({
      x0: -positionX / scale / k,
      y0: -positionY / scale / k,
      x1: (el.clientWidth - positionX) / scale / k,
      y1: (el.clientHeight - positionY) / scale / k,
    })
  }, [])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(report)
    ro.observe(el)
    return () => ro.disconnect()
  }, [report])

  return (
    <div
      ref={box}
      className={cn("relative overflow-hidden bg-[#EEF1E0]", className)}
      style={{ aspectRatio: `${PLAN.width} / ${PLAN.height}` }}
    >
      <TransformWrapper
        minScale={1}
        maxScale={6}
        limitToBounds
        doubleClick={{ disabled: true }}
        onTransform={(_, s) => {
          state.current = s
          report()
        }}
      >
        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%" }}>
          {children}
        </TransformComponent>
        <ZoomButtons />
      </TransformWrapper>
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#EEF1E0] text-sm text-muted-foreground">
          <Loader2 className="size-7 animate-spin text-primary" />
          Загружаем генплан
        </div>
      )}
    </div>
  )
}

function ZoomButtons() {
  const { zoomIn, zoomOut, resetTransform } = useControls()
  const btn = "flex size-8 items-center justify-center bg-card/90 text-foreground hover:bg-card"
  return (
    <div className="absolute top-2 right-2 flex flex-col overflow-hidden rounded-md border shadow-sm">
      <button type="button" aria-label="Приблизить" className={btn} onClick={() => zoomIn()}>
        <Plus className="size-4" />
      </button>
      <button type="button" aria-label="Отдалить" className={cn(btn, "border-t")} onClick={() => zoomOut()}>
        <Minus className="size-4" />
      </button>
      <button type="button" aria-label="Весь план" className={cn(btn, "border-t")} onClick={() => resetTransform()}>
        <Maximize className="size-3.5" />
      </button>
    </div>
  )
}
