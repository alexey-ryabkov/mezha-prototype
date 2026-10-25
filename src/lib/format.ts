const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 })
const sotki = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const mln = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 })

export const formatPrice = (v: number) => `${money.format(v)} ₽`
export const formatMln = (v: number) => `${mln.format(v / 1_000_000)} млн ₽`
export const formatSotki = (areaM2: number) => `${sotki.format(areaM2 / 100)} сот.`
export const formatM2 = (areaM2: number) => `${money.format(areaM2)} м²`

// plural(5, ["участок", "участка", "участков"]) -> "участков"
export function plural(n: number, forms: [string, string, string]) {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return forms[0]
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1]
  return forms[2]
}

const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"]
const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]

// "2026-08-27" -> "27.08.2026"
export const formatDate = (s: string) => s.slice(0, 10).split("-").reverse().join(".")
// "2026-08-27T09:14" -> "27.08.2026, 09:14"
export const formatDateTime = (s: string) => `${formatDate(s)}, ${s.slice(11, 16)}`
// "2026-08-25" -> "25 августа 2026"
export const formatDateLong = (s: string) => `${Number(s.slice(8, 10))} ${MONTHS_GEN[Number(s.slice(5, 7)) - 1]} ${s.slice(0, 4)}`
// "2026-08" -> "август 2026"
export const formatMonth = (s: string) => `${MONTHS[Number(s.slice(5, 7)) - 1]} ${s.slice(0, 4)}`
