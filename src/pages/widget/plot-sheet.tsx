import { useState } from "react"
import { CircleCheck, Heart, Send, Share2 } from "lucide-react"

import { CopyButton } from "@/components/common/copy-button"
import { ResponsiveSheet } from "@/components/common/responsive-sheet"
import { SWATCH } from "@/components/genplan/status-colors"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { STATUS_LABEL, type Plot } from "@/data/types"
import { formatM2, formatPrice, formatSotki } from "@/lib/format"
import { plotLink } from "@/lib/links"
import { cn } from "@/lib/utils"
import { useDemo } from "@/store/demo"

type Step = "card" | "form" | "done"

// Карточка участка, форма заявки и сообщение после отправки в одном окне
export function PlotSheet({
  plot,
  onClose,
  onSelect,
}: {
  plot: Plot | null
  onClose: () => void
  onSelect: (id: number) => void
}) {
  const [step, setStep] = useState<Step>("card")
  const priceMode = useDemo((s) => s.settings.priceMode)

  const close = () => {
    onClose()
    setTimeout(() => setStep("card"), 200)
  }

  const title = !plot
    ? ""
    : step === "card"
      ? `Участок № ${plot.number}`
      : step === "form"
        ? `Заявка на участок № ${plot.number}`
        : "Заявка принята"

  return (
    <ResponsiveSheet open={!!plot} onOpenChange={(o) => !o && close()} title={title}>
      {plot && step === "card" && (
        <PlotCard key={plot.id} plot={plot} hidePrice={priceMode === "after_lead"} onLead={() => setStep("form")} onSelect={onSelect} />
      )}
      {plot && step === "form" && <LeadForm plot={plot} onBack={() => setStep("card")} onSent={() => setStep("done")} />}
      {plot && step === "done" && (
        <div className="grid justify-items-center gap-3 py-4 text-center">
          <CircleCheck className="size-12 text-free" />
          <p className="text-sm text-muted-foreground">
            Менеджер скоро перезвонит вам и расскажет про участок № {plot.number}.
          </p>
          <Button className="mt-2 w-full" onClick={close}>
            Готово
          </Button>
        </div>
      )}
    </ResponsiveSheet>
  )
}

// Ф-29: свободные участки, похожие по площади и цене
function similarTo(plot: Plot, plots: Plot[]) {
  return plots
    .filter((p) => p.status === "free" && p.contour && p.id !== plot.id && Math.abs(p.areaM2 - plot.areaM2) <= plot.areaM2 * 0.2)
    .map((p) => ({ p, score: Math.abs(p.areaM2 - plot.areaM2) / plot.areaM2 + Math.abs(p.price - plot.price) / plot.price }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((x) => x.p)
}

function PlotCard({
  plot,
  hidePrice,
  onLead,
  onSelect,
}: {
  plot: Plot
  hidePrice: boolean
  onLead: () => void
  onSelect: (id: number) => void
}) {
  const plots = useDemo((s) => s.plots)
  const liked = useDemo((s) => s.likes.includes(plot.id))
  const toggleLike = useDemo((s) => s.toggleLike)
  const [sharing, setSharing] = useState(false)
  const link = plotLink(plot.number)
  const similar = plot.status === "free" ? [] : similarTo(plot, plots)

  return (
    <div className="grid gap-4">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-0.5 text-sm">
        <span className={cn("size-2.5 rounded-full border", SWATCH[plot.status])} />
        {STATUS_LABEL[plot.status]}
      </span>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
        <dt className="text-muted-foreground">Площадь</dt>
        <dd>
          {formatSotki(plot.areaM2)} <span className="text-muted-foreground">({formatM2(plot.areaM2)})</span>
        </dd>
        <dt className="self-center text-muted-foreground">Цена</dt>
        <dd>
          {hidePrice ? (
            plot.status === "sold" ? (
              "—"
            ) : (
              <Button variant="outline" size="sm" onClick={onLead}>
                Узнать цену
              </Button>
            )
          ) : (
            <span className="font-heading text-base font-semibold">{formatPrice(plot.price)}</span>
          )}
        </dd>
        <dt className="text-muted-foreground">Кадастровый номер</dt>
        <dd className="font-mono text-[13px]">{plot.cadastral}</dd>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setSharing(!sharing)}>
          <Share2 />
          Поделиться
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleLike(plot.id)} aria-pressed={liked}>
          <Heart className={cn(liked && "fill-primary text-primary")} />
          {liked ? "В понравившихся" : "Нравится"}
        </Button>
      </div>
      {sharing && (
        <div className="grid gap-2 rounded-md bg-muted/60 p-3">
          <Input readOnly value={link} className="bg-card font-mono text-xs" onFocus={(e) => e.target.select()} />
          <div className="flex flex-wrap gap-2">
            <CopyButton text={link} message="Ссылка на участок скопирована" />
            {"share" in navigator && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.share({ title: `Участок № ${plot.number}`, url: link }).catch(() => {})}
              >
                <Send />
                Отправить
              </Button>
            )}
          </div>
        </div>
      )}
      {plot.status === "booked" && (
        <p className="rounded-md bg-booked/20 px-3 py-2 text-sm">
          Участок забронирован. Оставьте заявку, и менеджер сообщит, если бронь снимут.
        </p>
      )}
      {similar.length > 0 && (
        <div className="grid gap-1.5">
          <div className="text-sm font-medium">Похожие свободные участки</div>
          {similar.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className="flex items-center gap-3 rounded-md border px-3 py-2 text-left text-sm hover:bg-accent/60"
            >
              <span className={cn("size-2.5 rounded-full border", SWATCH.free)} />
              <span className="font-medium">№ {p.number}</span>
              <span className="text-muted-foreground">{formatSotki(p.areaM2)}</span>
              {!hidePrice && <span className="ml-auto tabular-nums">{formatPrice(p.price)}</span>}
            </button>
          ))}
        </div>
      )}
      {plot.status === "sold" ? (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">Участок продан.</p>
      ) : (
        <Button size="lg" className="w-full" onClick={onLead}>
          Оставить заявку
        </Button>
      )}
    </div>
  )
}

function LeadForm({ plot, onBack, onSent }: { plot: Plot; onBack: () => void; onSent: () => void }) {
  const addLead = useDemo((s) => s.addLead)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [comment, setComment] = useState("")
  const [consent, setConsent] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [tried, setTried] = useState(false)

  const phoneOk = phone.replace(/\D/g, "").length >= 10
  const phoneError = tried && !phoneOk
  const consentError = tried && !consent

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        setTried(true)
        if (!phoneOk || !consent) return
        addLead({ plotId: plot.id, name: name.trim(), phone: phone.trim(), comment: comment.trim() })
        onSent()
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="lead-plot">Участок</Label>
        <Input id="lead-plot" value={`№ ${plot.number}, ${formatSotki(plot.areaM2)}`} disabled />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lead-name">Имя</Label>
        <Input id="lead-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lead-phone">Телефон</Label>
        <Input
          id="lead-phone"
          type="tel"
          inputMode="tel"
          placeholder="+7 900 000-00-00"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={phoneError}
          autoComplete="tel"
        />
        {phoneError && <p className="text-xs text-destructive">Укажите телефон, чтобы менеджер мог перезвонить</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lead-comment">Комментарий</Label>
        <Textarea id="lead-comment" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="lead-consent"
            checked={consent}
            onCheckedChange={(v) => setConsent(v === true)}
            aria-invalid={consentError}
            className="mt-0.5"
          />
          <Label htmlFor="lead-consent" className={cn("block leading-snug font-normal", consentError && "text-destructive")}>
            Согласен на обработку персональных данных{" "}
            <button
              type="button"
              className="text-primary underline underline-offset-2"
              onClick={(e) => {
                e.preventDefault()
                setShowConsent(!showConsent)
              }}
            >
              (текст согласия)
            </button>
          </Label>
        </div>
        {showConsent && (
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Отправляя заявку, я соглашаюсь на обработку моего имени и телефона застройщиком поселка, чтобы со
            мной связались по выбранному участку. Согласие можно отозвать, написав застройщику.
          </p>
        )}
      </div>
      <div className="grid gap-2 pt-1 sm:grid-cols-[1fr_auto]">
        <Button type="submit">Отправить заявку</Button>
        <Button type="button" variant="secondary" onClick={onBack}>
          Назад
        </Button>
      </div>
    </form>
  )
}
