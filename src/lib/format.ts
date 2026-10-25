const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 })
const sotki = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 })

export const formatPrice = (v: number) => `${money.format(v)} ₽`
export const formatSotki = (areaM2: number) => `${sotki.format(areaM2 / 100)} сот.`
