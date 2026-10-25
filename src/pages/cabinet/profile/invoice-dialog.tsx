import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Billing, Invoice } from "@/data/types"
import { formatDate, formatMonth, formatPrice } from "@/lib/format"

// Превью счета вместо pdf
export function InvoiceDialog({
  invoice,
  billing,
  village,
  onClose,
}: {
  invoice: Invoice | null
  billing: Billing
  village: string
  onClose: () => void
}) {
  return (
    <Dialog open={!!invoice} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {invoice && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading">
                Счет № {invoice.id} от {formatDate(invoice.issuedAt)}
              </DialogTitle>
              <DialogDescription>Подписка на интерактивный генплан</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Поставщик</dt>
              <dd>сервис «Межа»</dd>
              <dt className="text-muted-foreground">Плательщик</dt>
              <dd>
                {billing.company}, ИНН {billing.inn}
              </dd>
            </dl>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 font-normal">Услуга</th>
                  <th className="py-2 text-right font-normal">Сумма</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4">
                    Интерактивный генплан, поселок «{village}», {formatMonth(invoice.month)}
                  </td>
                  <td className="py-2 text-right tabular-nums">{formatPrice(invoice.amount)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-semibold">Итого</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{formatPrice(invoice.amount)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground">
              {invoice.status === "paid" ? `Оплачен ${formatDate(invoice.paidAt ?? invoice.issuedAt)}` : "Ожидает оплаты"}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
