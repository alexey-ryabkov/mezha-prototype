import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Compass, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useDemo } from "@/store/demo"
import { DEMO_LINKS, DEMO_MENU } from "./demo-links"

// Навигация демонстрации спрятана в плавающую кнопку, чтобы не смешиваться с интерфейсом «Межи»
export function DemoNav() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const reset = useDemo((s) => s.reset)

  const items = [DEMO_MENU, ...DEMO_LINKS]

  return (
    <div className="fixed right-3 bottom-3 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Навигация демонстрации"
            className="flex size-8 items-center justify-center rounded-full bg-neutral-800/60 text-white opacity-40 shadow-md backdrop-blur transition hover:opacity-100 data-[state=open]:opacity-100"
          >
            <Compass className="size-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-[22rem] max-w-[calc(100vw-1.5rem)] gap-0 p-1.5">
          <div className="px-2 pt-1 pb-1.5 text-xs text-muted-foreground">Демонстрация прототипа</div>
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
            >
              <item.icon className="size-4 text-muted-foreground" />
              {item.label}
            </Link>
          ))}
          <Separator className="my-1" />
          <button
            type="button"
            onClick={() => {
              reset()
              setOpen(false)
              navigate("/")
              toast.success("Демо-данные сброшены")
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
          >
            <RotateCcw className="size-4 text-muted-foreground" />
            Сбросить демо
          </button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
