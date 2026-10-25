import { useEffect, useState, type ReactNode } from "react"
import { useLocation } from "react-router"
import { FileText, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { CopyButton } from "@/components/common/copy-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FEEDS } from "@/data/embed"
import type { Invoice } from "@/data/types"
import { SUPPORT_EMAIL } from "@/data/village"
import { formatDate, formatMonth, formatPrice } from "@/lib/format"
import { isPaid, useDemo } from "@/store/demo"
import { EmbedCode } from "../plan/publish-dialog"
import { InvoiceDialog } from "./invoice-dialog"

function Section({ title, description, children, id }: { title: string; description?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <Card id={id} className="scroll-mt-4 gap-4">
      <CardHeader>
        <CardTitle className="font-heading text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  )
}

const saved = () => toast.success("Сохранено")

export function ProfilePage() {
  const { hash } = useLocation()
  useEffect(() => {
    if (hash === "#billing") document.getElementById("billing")?.scrollIntoView({ behavior: "smooth" })
  }, [hash])

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[1fr_440px]">
      <div className="grid gap-5">
        <VillageSection />
        <PricesSection />
        <LeadEmailsSection />
        <CrmSection />
        <FeedsSection />
        <Section title="Сотрудники">
          <p className="text-sm">
            Вход для менеджера дает поддержка «Межи». Напишите на{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline-offset-2 hover:underline">
              {SUPPORT_EMAIL}
            </a>{" "}
            и укажите почту сотрудника. Если сотрудник уволился, напишите туда же, и его вход отключат.
          </p>
        </Section>
        <EmbedSection />
      </div>
      <div className="xl:sticky xl:top-4">
        <BillingSection />
      </div>
    </div>
  )
}

function VillageSection() {
  const village = useDemo((s) => s.village)
  const updateVillage = useDemo((s) => s.updateVillage)
  const [name, setName] = useState(village.name)
  const [site, setSite] = useState(village.site)
  return (
    <Section title="Поселок">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="v-name">Название поселка</Label>
          <Input
            id="v-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && name !== village.name && (updateVillage({ name: name.trim() }), saved())}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="v-site">Адрес сайта</Label>
          <Input
            id="v-site"
            value={site}
            onChange={(e) => setSite(e.target.value)}
            onBlur={() => site.trim() && site !== village.site && (updateVillage({ site: site.trim() }), saved())}
          />
        </div>
      </div>
    </Section>
  )
}

function PricesSection() {
  const priceMode = useDemo((s) => s.settings.priceMode)
  const updateSettings = useDemo((s) => s.updateSettings)
  return (
    <Section title="Показ цен на сайте">
      <RadioGroup
        value={priceMode}
        onValueChange={(v) => {
          updateSettings({ priceMode: v as "all" | "after_lead" })
          saved()
        }}
        className="gap-3"
      >
        <Label className="flex items-start gap-3 font-normal">
          <RadioGroupItem value="all" className="mt-0.5" />
          <span>
            <span className="font-medium">Всем</span>
            <span className="block text-muted-foreground">Цены видны на генплане, в карточке и в фильтре</span>
          </span>
        </Label>
        <Label className="flex items-start gap-3 font-normal">
          <RadioGroupItem value="after_lead" className="mt-0.5" />
          <span>
            <span className="font-medium">После заявки</span>
            <span className="block text-muted-foreground">
              Вместо цены кнопка «Узнать цену», она открывает заявку. Цену покупателю сообщает менеджер.
            </span>
          </span>
        </Label>
      </RadioGroup>
    </Section>
  )
}

function LeadEmailsSection() {
  const emails = useDemo((s) => s.settings.leadEmails)
  const updateSettings = useDemo((s) => s.updateSettings)
  const [value, setValue] = useState("")
  const ok = /.+@.+\..+/.test(value.trim())
  return (
    <Section title="Почта для заявок" description="Каждая заявка с генплана приходит письмом на эти адреса">
      <ul className="grid gap-1.5">
        {emails.map((e) => (
          <li key={e} className="flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-sm">
            {e}
            <button
              type="button"
              aria-label={`Удалить ${e}`}
              onClick={() => {
                updateSettings({ leadEmails: emails.filter((x) => x !== e) })
                saved()
              }}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!ok || emails.includes(value.trim())) return
          updateSettings({ leadEmails: [...emails, value.trim()] })
          setValue("")
          saved()
        }}
      >
        <Input type="email" placeholder="почта@пример.рф" value={value} onChange={(e) => setValue(e.target.value)} />
        <Button type="submit" variant="outline" disabled={!ok}>
          <Plus />
          Добавить
        </Button>
      </form>
    </Section>
  )
}

function CrmSection() {
  const crm = useDemo((s) => s.settings.crm)
  const updateSettings = useDemo((s) => s.updateSettings)
  const items: { key: keyof typeof crm; name: string }[] = [
    { key: "amocrm", name: "amoCRM" },
    { key: "bitrix24", name: "Битрикс24" },
  ]
  return (
    <Section title="CRM" description="Заявка с генплана создает сделку с контактом покупателя и номером участка">
      {items.map(({ key, name }) => (
        <div key={key} className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            {name}
            {crm[key] ? <Badge className="bg-free text-white">подключено</Badge> : <Badge variant="outline">не подключено</Badge>}
          </span>
          <Button
            variant={crm[key] ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              updateSettings({ crm: { ...crm, [key]: !crm[key] } })
              toast.success(crm[key] ? `${name} отключена` : `${name} подключена: заявки будут создавать сделки`)
            }}
          >
            {crm[key] ? "Отключить" : `Подключить ${name}`}
          </Button>
        </div>
      ))}
    </Section>
  )
}

function FeedsSection() {
  const feeds = [
    { name: "Авито", url: FEEDS.avito },
    { name: "Циан", url: FEEDS.cian },
  ]
  return (
    <Section
      title="Площадки"
      description="Вставьте ссылку в настройках автозагрузки на площадке. Площадка сама будет забирать свободные участки, а проданные снимет с публикации."
    >
      {feeds.map((f) => (
        <div key={f.name} className="grid gap-1.5">
          <Label>{f.name}</Label>
          <div className="flex gap-2">
            <Input readOnly value={f.url} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
            <CopyButton text={f.url} message={`Ссылка для ${f.name} скопирована`} />
          </div>
        </div>
      ))}
    </Section>
  )
}

function EmbedSection() {
  const paid = useDemo((s) => isPaid(s.billing))
  return (
    <Section title="Код для вставки на сайт" description="Вставьте код в html-блок на странице, где должен стоять генплан">
      {paid ? <EmbedCode /> : <p className="text-sm text-muted-foreground">Код появится после оплаты подписки.</p>}
    </Section>
  )
}

function BillingSection() {
  const billing = useDemo((s) => s.billing)
  const village = useDemo((s) => s.village.name)
  const { updateBilling, createInvoice, payInvoice } = useDemo.getState()
  const paid = isPaid(billing)
  const [company, setCompany] = useState(billing.company)
  const [inn, setInn] = useState(billing.inn)
  const [open, setOpen] = useState<Invoice | null>(null)

  return (
    <Section id="billing" title="Оплата" description="Подписка 5 000 ₽ в месяц за поселок, оплата по счету">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        Подписка:
        {paid ? (
          <Badge className="bg-free text-white">активна до {formatDate(billing.paidUntil)}</Badge>
        ) : (
          <Badge variant="destructive">не оплачена</Badge>
        )}
      </div>
      {!paid && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm">
          Подписка закончилась {formatDate(billing.paidUntil)}. Оплатите счет, чтобы публиковать генплан.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <div className="grid gap-2">
          <Label htmlFor="b-company">Название компании</Label>
          <Input id="b-company" value={company} onChange={(e) => setCompany(e.target.value)} onBlur={() => updateBilling({ company })} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="b-inn">ИНН</Label>
          <Input id="b-inn" inputMode="numeric" value={inn} onChange={(e) => setInn(e.target.value)} onBlur={() => updateBilling({ inn })} />
        </div>
      </div>
      <Button
        variant="outline"
        className="w-fit"
        onClick={() => {
          updateBilling({ company, inn })
          setOpen(createInvoice())
        }}
      >
        <FileText />
        Сформировать счет
      </Button>

      <ul className="divide-y border-y text-sm">
        {[...billing.invoices].reverse().map((i) => (
          <li key={i.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
            <button type="button" onClick={() => setOpen(i)} className="w-28 text-left text-primary underline-offset-2 hover:underline">
              {formatMonth(i.month)}
            </button>
            <span className="whitespace-nowrap tabular-nums">{formatPrice(i.amount)}</span>
            {i.status === "paid" ? (
              <span className="text-muted-foreground">оплачен</span>
            ) : (
              <span className="font-medium whitespace-nowrap text-destructive">ожидает оплаты</span>
            )}
            {i.status === "pending" && (
              <Button
                size="sm"
                className="ml-auto"
                onClick={() => {
                  payInvoice(i.id)
                  toast.success(`Оплата получена, подписка активна до ${formatDate(useDemo.getState().billing.paidUntil)}`)
                }}
              >
                Оплатить
              </Button>
            )}
          </li>
        ))}
      </ul>

      <InvoiceDialog invoice={open} billing={billing} village={village} onClose={() => setOpen(null)} />
    </Section>
  )
}
