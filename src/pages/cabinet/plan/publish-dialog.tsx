import { useNavigate } from "react-router"
import { CreditCard } from "lucide-react"

import { CopyButton } from "@/components/common/copy-button"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EMBED_CODE } from "@/data/embed"
import { isPaid, useDemo } from "@/store/demo"

const GUIDES: { id: string; label: string; steps: string[] }[] = [
  {
    id: "tilda",
    label: "Tilda",
    steps: [
      "Откройте страницу с генпланом в редакторе Тильды.",
      "Добавьте блок T123 «HTML-код» из раздела «Другое».",
      "Нажмите «Контент», вставьте код и сохраните.",
      "Опубликуйте страницу.",
    ],
  },
  {
    id: "wordpress",
    label: "WordPress",
    steps: [
      "Откройте страницу с генпланом в редакторе.",
      "Добавьте блок «Произвольный HTML».",
      "Вставьте код в блок.",
      "Нажмите «Обновить».",
    ],
  },
  {
    id: "bitrix",
    label: "1С-Битрикс",
    steps: [
      "Включите режим правки на странице с генпланом.",
      "Откройте редактирование области, где должен стоять генплан.",
      "Переключите визуальный редактор в режим кода и вставьте код.",
      "Сохраните изменения.",
    ],
  },
]

export function EmbedCode() {
  return (
    <div className="grid gap-2">
      <pre className="rounded-md bg-foreground/90 px-3 py-2.5 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-background">
        {EMBED_CODE}
      </pre>
      <div>
        <CopyButton text={EMBED_CODE} message="Код скопирован" />
      </div>
    </div>
  )
}

export function PublishDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const paid = useDemo((s) => isPaid(s.billing))
  const user = useDemo((s) => s.user)
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {paid ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading">Генплан опубликован</DialogTitle>
              <DialogDescription>
                Изменения схемы уже на сайте. Если генплан еще не стоит на сайте, вставьте этот код в html-блок
                страницы.
              </DialogDescription>
            </DialogHeader>
            <EmbedCode />
            <Tabs defaultValue="tilda" className="mt-2">
              <TabsList>
                {GUIDES.map((g) => (
                  <TabsTrigger key={g.id} value={g.id}>
                    {g.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {GUIDES.map((g) => (
                <TabsContent key={g.id} value={g.id}>
                  <ol className="list-decimal space-y-1 pt-2 pl-5 text-sm">
                    {g.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </TabsContent>
              ))}
            </Tabs>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading">Подписка не оплачена</DialogTitle>
              <DialogDescription>
                Размечать генплан можно без оплаты, а опубликовать на сайте только с оплаченной подпиской.
              </DialogDescription>
            </DialogHeader>
            {user === "owner" ? (
              <Button
                className="w-fit"
                onClick={() => {
                  onOpenChange(false)
                  navigate("/cabinet/profile#billing")
                }}
              >
                <CreditCard />
                Перейти к оплате
              </Button>
            ) : (
              <p className="rounded-md bg-muted px-3 py-2 text-sm">
                Подписку оплачивает собственник поселка. Попросите его оплатить счет в профиле, после этого генплан
                можно будет опубликовать.
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
