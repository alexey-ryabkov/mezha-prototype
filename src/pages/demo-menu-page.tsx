import { Link } from "react-router"
import { ArrowRight, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { Logo } from "@/components/brand/logo"
import { DEMO_LINKS } from "@/components/demo/demo-links"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VILLAGE } from "@/data/village"
import { useDemo } from "@/store/demo"

export function DemoMenuPage() {
  const reset = useDemo((s) => s.reset)

  return (
    <div className="mx-auto flex min-h-svh max-w-4xl flex-col px-4 py-8 sm:py-14">
      <Logo markClassName="size-9" className="[&>span]:text-2xl" />
      <h1 className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl">
        Интерактивный генплан для загородного поселка
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Прототип сервиса. Демо-поселок «{VILLAGE.name}» на 75 участков: покупатель выбирает участок на
        сайте поселка, а девелопер ведет генплан, участки и заявки в своем кабинете.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {DEMO_LINKS.map((item) => (
          <Link key={item.to} to={item.to} className="group">
            <Card className="h-full transition group-hover:border-primary/50 group-hover:shadow-md">
              <CardHeader>
                <item.icon className="mb-2 size-6 text-primary" />
                <CardTitle className="flex items-center justify-between gap-2 font-heading text-[15px]">
                  {item.label}
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                </CardTitle>
                <CardDescription>{item.hint}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-col-reverse items-start gap-6 border-t pt-6 sm:flex-row sm:items-center">
        <img
          src={`${import.meta.env.BASE_URL}demo-nav-corner.png`}
          alt="Меню демонстрации в правом нижнем углу экрана"
          className="w-full shrink-0 rounded-md border sm:w-80"
        />
        <p className="text-base text-muted-foreground">
          Демонстрацией можно управлять через меню в правом нижнем углу экрана: переходить
          между виджетом и кабинетом и сбрасывать демо-данные.
        </p>
      </div>

      <div className="mt-auto pt-10 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => {
            reset()
            toast.success("Демо-данные сброшены")
          }}
        >
          <RotateCcw />
          Сбросить демо
        </Button>
        <span className="block sm:ml-1 sm:inline">Изменения сохраняются в этом браузере, сброс вернет исходные данные.</span>
      </div>
    </div>
  )
}
