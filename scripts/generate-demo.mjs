// Генерация демо-данных и подложки генплана вымышленного поселка «Ольховый ручей».
// Запуск: npm run gen. Результат: src/data/demo.json и public/genplan.svg.
// Seed фиксированный, поэтому при каждом запуске получаются одни и те же данные.
import { writeFileSync } from "node:fs"

const SEED = 20260827
const TODAY = "2026-08-27" // «сегодня» в прототипе, четверг
const PERIOD_START = "2026-06-01"
const SCALE = 3 // пикселей подложки на метр
const W = 470 // размеры поселка в метрах
const H = 345

// ---------- случайные числа с seed ----------

function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(SEED)
const between = (a, b) => a + (b - a) * rnd()
const int = (a, b) => Math.floor(between(a, b + 1))
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
function poisson(lambda) {
  const l = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rnd()
  } while (p > l)
  return k - 1
}

// ---------- даты ----------

const dayMs = 86400000
const toDate = (s) => new Date(`${s}T00:00:00Z`)
const fmtDate = (d) => d.toISOString().slice(0, 10)
const addDays = (s, n) => fmtDate(new Date(toDate(s).getTime() + n * dayMs))
const DAYS = Math.round((toDate(TODAY) - toDate(PERIOD_START)) / dayMs) + 1 // включая сегодня
const dayIndex = (s) => Math.round((toDate(s) - toDate(PERIOD_START)) / dayMs)
const time = (h1 = 9, h2 = 20) => `${String(int(h1, h2)).padStart(2, "0")}:${String(int(0, 59)).padStart(2, "0")}`
const isWeekend = (i) => [6, 0].includes(new Date(toDate(PERIOD_START).getTime() + i * dayMs).getUTCDay())

// ---------- планировка в метрах ----------

const streets = [
  { name: "ул. Лесная", x1: 40, y1: 40, x2: 440, y2: 50 },
  { name: "ул. Ольховая", x1: 40, y1: 120, x2: 430, y2: 130 },
  { name: "ул. Ручейная", x1: 40, y1: 200, x2: 430, y2: 210 },
  { name: "ул. Южная", x1: 40, y1: 280, x2: 430, y2: 290 },
  { name: "ул. Центральная", x1: 250, y1: 40, x2: 260, y2: H, vertical: true },
  { name: "Лесной проезд", x1: 40, y1: 40, x2: 50, y2: 290, vertical: true },
]

// Задняя граница между рядами, стоящими спиной друг к другу, слегка волнистая
const backLine = (base, phase) => (x) => base + 1.2 * Math.sin(x / 55 + phase)

// Полуряды участков: x-границы, передняя линия (улица), задняя линия, число участков, очередь
const halfRows = [
  { id: "r1W", x1: 50, x2: 250, front: 50, back: backLine(85, 0), n: 7, queue: 1 },
  { id: "r1E", x1: 260, x2: 430, front: 50, back: backLine(85, 0), n: 6, queue: 1 },
  { id: "r2W", x1: 50, x2: 250, front: 120, back: backLine(85, 0), n: 7, queue: 1 },
  { id: "r2E", x1: 260, x2: 430, front: 120, back: backLine(85, 0), n: 6, queue: 1 },
  { id: "r3W", x1: 50, x2: 220, front: 130, back: backLine(165, 1), n: 6, queue: 1 },
  { id: "r3E", x1: 260, x2: 430, front: 130, back: backLine(165, 1), n: 6, queue: 1 },
  { id: "r4W", x1: 50, x2: 220, front: 200, back: backLine(165, 1), n: 6, queue: 1 },
  { id: "r4E", x1: 260, x2: 430, front: 200, back: backLine(165, 1), n: 6, queue: 1 },
  { id: "r5W", x1: 50, x2: 250, front: 210, back: backLine(245, 2), n: 7, queue: 2 },
  { id: "r5E", x1: 260, x2: 340, front: 210, back: backLine(245, 2), n: 3, queue: 2 },
  { id: "r6W", x1: 50, x2: 250, front: 280, back: backLine(245, 2), n: 7, queue: 2 },
  { id: "r6E", x1: 260, x2: 340, front: 280, back: backLine(245, 2), n: 3, queue: 2 },
  { id: "r7W", x1: 50, x2: 200, front: 290, back: () => 325, n: 5, queue: 2 },
  // Нарисованы на подложке, но в данных их нет: их добавляет загрузка из excel
  { id: "r7E", x1: 260, x2: 340, front: 290, back: () => 325, n: 3, queue: 2, extra: true },
]

const pond = { cx: 388, cy: 246, rx: 40, ry: 30 }
const playground = { x: 220, y: 130, w: 30, h: 70 }
const gate = { x: 205, y: 300, w: 14, h: 10 }
const parking = { x: 205, y: 314, w: 40, h: 22 }

function shoelace(pts) {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    s += x1 * y2 - x2 * y1
  }
  return Math.abs(s) / 2
}
const centroid = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]

const shapes = [] // все нарисованные участки, в метрах
let number = 1
function layoutRow(row) {
  // Ширины случайные, затем растягиваются ровно на длину полуряда
  const raw = Array.from({ length: row.n }, () => between(19, 33))
  const k = (row.x2 - row.x1) / raw.reduce((a, b) => a + b, 0)
  const front = [row.x1]
  for (const w of raw) front.push(front.at(-1) + w * k)
  // Боковые границы немного косые, крайние прямые
  const back = front.map((x, i) => (i === 0 || i === row.n ? x : x + between(-2.2, 2.2)))
  return Array.from({ length: row.n }, (_, i) => [
    [front[i], row.front],
    [front[i + 1], row.front],
    [back[i + 1], row.back(back[i + 1])],
    [back[i], row.back(back[i])],
  ])
}
for (const row of halfRows) {
  // Перебрасываем ширины, пока все участки полуряда не попадут в 7-12 соток
  let polys
  do polys = layoutRow(row)
  while (polys.some((pts) => shoelace(pts) < 700 || shoelace(pts) > 1200))
  for (const pts of polys) {
    shapes.push({ number: number++, row: row.id, queue: row.queue, extra: !!row.extra, pts, area: Math.round(shoelace(pts)) })
  }
}

// ---------- участки ----------

const px = (v) => Math.round(v * SCALE * 10) / 10
const toPx = (pts) => pts.map(([x, y]) => [px(x), px(y)])

const NO_CONTOUR = [73, 74, 75] // загружены из excel, еще не обведены
const PATH4 = 59 // у пруда: смотрят часто, заявок нет
const plots = []
for (const s of shapes.filter((s) => !s.extra)) {
  const [cx, cy] = centroid(s.pts)
  const nearForest = cy < 90 || cx < 85
  const nearPond = ["r5E", "r6E"].includes(s.row) || (s.row === "r4E" && cx > 330)
  const nearBrook = cx > 395 && cy < 205
  const nearGate = s.row === "r7W" || (s.row === "r6W" && cx > 200)
  let perSotka = 220 + (nearForest ? 28 : 0) + (nearPond ? 38 : 0) + (nearBrook ? 18 : 0) - (nearGate ? 22 : 0) + between(-12, 12)
  perSotka = Math.min(280, Math.max(190, perSotka))
  const sotki = s.area / 100
  const price = Math.round((sotki * perSotka * 1000) / 10000) * 10000
  plots.push({
    id: s.number,
    number: String(s.number),
    queue: s.queue,
    areaM2: s.area,
    price,
    status: "free",
    cadastral: `50:27:0090417:${400 + s.number}`,
    contour: NO_CONTOUR.includes(s.number) ? null : toPx(s.pts),
    center: toPx([[cx, cy]])[0],
    tags: [nearForest && "forest", nearPond && "pond", nearBrook && "brook", nearGate && "gate"].filter(Boolean),
  })
}
const plotById = Object.fromEntries(plots.map((p) => [p.id, p]))

// Все контуры, нарисованные на подложке. В редакторе по ним «обводят» участки без контура,
// а участки 76-78 из них «загружает» excel.
const outlines = shapes.map((s) => ({
  number: String(s.number),
  contour: toPx(s.pts),
  center: toPx([centroid(s.pts)])[0],
  areaM2: s.area,
  extra: s.extra,
}))

// ---------- статусы ----------
// Около половины продано, привлекательные участки продавались раньше. Несколько броней.

const protectedFree = new Set([47, PATH4, 58, ...NO_CONTOUR, 71, 72])
const candidates = plots.filter((p) => !protectedFree.has(p.id))
const weight = (p) => 1 + (p.tags.includes("forest") ? 1.2 : 0) + (p.tags.includes("brook") ? 0.6 : 0) + (p.queue === 1 ? 1 : 0)
function weightedTake(list, count) {
  const pool = [...list]
  const out = []
  while (out.length < count && pool.length) {
    const total = pool.reduce((s, p) => s + weight(p), 0)
    let r = rnd() * total
    const i = pool.findIndex((p) => (r -= weight(p)) <= 0)
    out.push(pool.splice(i === -1 ? pool.length - 1 : i, 1)[0])
  }
  return out
}
const sold = weightedTake(candidates, 38)
sold.forEach((p) => (p.status = "sold"))
const freeLeft = plots.filter((p) => p.status === "free" && !protectedFree.has(p.id))
const booked = [72, ...weightedTake(freeLeft, 4).map((p) => p.id)]
booked.forEach((id) => (plotById[id].status = "booked"))

// ---------- журнал ----------

const OWNER = "Андрей Соколов"
const MANAGER = "Ольга Миронова"
const EXCEL = "загрузка из excel"
const journal = []
const STATUS = { free: "free", booked: "booked", sold: "sold" }
const log = (date, t, plotId, field, from, to, by) => journal.push({ at: `${date}T${t}`, plotId, field, from, to, by })

// Брони, которые действуют сейчас; одна кончается завтра
const bookingNotes = ["Покупатель Игорь, показ был в субботу", "Семья Кравцовых, ждут одобрения ипотеки", "Сергей, вносит задаток на следующей неделе", "Анна Викторовна, просила подержать участок", "Покупатель Денис, думает до выходных"]
const bookings = {}
booked.forEach((id, i) => {
  const daysAgo = i === 0 ? 6 : int(1, 9)
  const date = addDays(TODAY, -daysAgo)
  const until = i === 0 ? addDays(TODAY, 1) : addDays(date, 7 + int(0, 7))
  bookings[id] = { until, comment: bookingNotes[i] }
  log(date, time(), id, "status", STATUS.free, STATUS.booked, i === 3 ? OWNER : MANAGER)
})

// Продажи за лето: бронь, через 5-12 дней продажа
const soldInPeriod = sold.slice(0, 9)
soldInPeriod.forEach((p) => {
  const bookDate = addDays(PERIOD_START, int(2, DAYS - 16))
  const sellDate = addDays(bookDate, int(5, 12))
  log(bookDate, time(), p.id, "status", STATUS.free, STATUS.booked, MANAGER)
  log(sellDate, time(), p.id, "status", STATUS.booked, STATUS.sold, MANAGER)
})

// Отмененная бронь
{
  const p = plots.find((p) => p.status === "free" && p.id === 33) ?? plots.find((p) => p.status === "free" && !protectedFree.has(p.id))
  const d = addDays(PERIOD_START, 40)
  log(d, time(), p.id, "status", STATUS.free, STATUS.booked, MANAGER)
  log(addDays(d, 8), time(), p.id, "status", STATUS.booked, STATUS.free, MANAGER)
}

// Изменения цен: ручные и загрузка из excel. Старая цена выводится из текущей.
const fmtPrice = (v) => v
const priceChanges = [
  { date: "2026-06-15", by: OWNER, pct: 0.05, count: 3 },
  { date: "2026-07-01", by: EXCEL, pct: 0.04, count: 4 },
  { date: "2026-08-10", by: OWNER, pct: -0.03, count: 2 },
]
for (const ch of priceChanges) {
  const pool = plots.filter((p) => p.status !== "sold" && p.id !== PATH4 && !NO_CONTOUR.includes(p.id))
  for (let i = 0; i < ch.count; i++) {
    const p = pool.splice(int(0, pool.length - 1), 1)[0]
    const old = Math.round(p.price / (1 + ch.pct) / 10000) * 10000
    log(ch.date, ch.by === EXCEL ? "11:02" : time(), p.id, "price", fmtPrice(old), fmtPrice(p.price), ch.by)
  }
}
journal.sort((a, b) => a.at.localeCompare(b.at))
journal.forEach((e, i) => (e.id = i + 1))

// ---------- заявки ----------

const names = ["Михаил", "Елена", "Сергей", "Наталья", "Дмитрий", "Ирина", "Алексей", "Татьяна", "Павел", "Юлия", "Николай", "Марина", "Владимир", "Светлана", "Артем"]
const comments = [
  "Хочу посмотреть участок в субботу",
  "Есть ли рассрочка?",
  "Какой подъезд зимой?",
  "",
  "Интересует, когда проведут электричество",
  "Можно ли поставить дом сразу?",
  "Перезвоните после 18:00",
  "",
  "Какая глубина воды в колодцах?",
  "Хотим посмотреть вместе с женой",
  "Подойдет ли под ипотеку?",
  "",
  "Есть ли участки рядом свободные?",
  "Сколько стоит подключение света?",
]
const phone = () => `+7 900 0${int(10, 99)}-${int(10, 99)}-${int(10, 99)}`
const leadPlots = [
  ...plots.filter((p) => p.status === "free" && p.id !== PATH4 && p.id !== 58 && p.contour).map((p) => p.id),
]
const leads = []
for (let i = 0; i < 13; i++) {
  const recent = i < 9
  const date = recent ? addDays(TODAY, -int(0, 28)) : addDays(PERIOD_START, int(0, 55))
  leads.push({ at: `${date}T${time()}`, plotId: pick(leadPlots), name: names[i], phone: phone(), comment: comments[i] ?? "" })
}
// Заявка на 47 из сценария С-5: сегодня утром
leads.push({ at: `${TODAY}T09:14`, plotId: 47, name: "Михаил", phone: phone(), comment: "Хочу посмотреть участок в субботу" })
leads.push({ at: `${addDays(TODAY, -3)}T19:40`, plotId: booked[1], name: names[13], phone: phone(), comment: "Если бронь снимут, позвоните" })
leads.sort((a, b) => b.at.localeCompare(a.at))
leads.forEach((l, i) => (l.id = leads.length - i))

// ---------- просмотры ----------
// По дням с начала лета. Показы генплана и открытия карточек участков.

const planShows = Array.from({ length: DAYS }, (_, i) => poisson(26 + (isWeekend(i) ? 14 : 0) + i * 0.08))
const interest = (p) => {
  let k = { free: 1, booked: 0.6, sold: 0.12 }[p.status]
  if (p.tags.includes("pond")) k *= 1.8
  if (p.tags.includes("forest")) k *= 1.4
  if (p.id === PATH4) k = 3.2
  if (p.id === 58) k = 2.4
  return k
}
const plotViews = {}
const totalInterest = plots.filter((p) => p.contour).reduce((s, p) => s + interest(p), 0)
for (const p of plots) {
  plotViews[p.id] = p.contour ? planShows.map((n) => poisson((n * 1.3 * interest(p)) / totalInterest)) : planShows.map(() => 0)
}
// Заявки тоже добавляют просмотр карточки в свой день
for (const l of leads) plotViews[l.plotId][dayIndex(l.at.slice(0, 10))] += 1

// ---------- подписка, счета, настройки ----------

// ИНН вымышленный, с неверной контрольной цифрой, чтобы не совпасть с настоящей компанией
const inn = "5027183946"
const data = {
  meta: { today: TODAY, periodStart: PERIOD_START, seed: SEED },
  village: { name: "Ольховый ручей", site: "olhovy-ruchey.ru", plan: { width: px(W), height: px(H), image: "genplan.svg" } },
  plots: plots.map(({ tags, ...p }) => ({ ...p, booking: bookings[p.id] ?? null, tags })),
  outlines,
  leads,
  journal,
  stats: { planShows, plotViews },
  settings: {
    priceMode: "all",
    leadEmails: ["andrey@olhovy-ruchey.ru", "olga@olhovy-ruchey.ru"],
    crm: { amocrm: false, bitrix24: false },
    publishedAt: "2026-06-03T12:20",
  },
  billing: {
    company: "ООО «Ольховый ручей»",
    inn,
    paidUntil: "2026-07-31",
    invoices: [
      { id: "2026-06", month: "2026-06", amount: 5000, status: "paid", issuedAt: "2026-05-25", paidAt: "2026-05-28" },
      { id: "2026-07", month: "2026-07", amount: 5000, status: "paid", issuedAt: "2026-06-24", paidAt: "2026-06-30" },
      { id: "2026-08", month: "2026-08", amount: 5000, status: "pending", issuedAt: "2026-07-24", paidAt: null },
    ],
  },
}

// Версия данных: простой хэш содержимого, по нему хранилище понимает, что демо-данные поменялись
const json = JSON.stringify(data)
let h = 2166136261
for (let i = 0; i < json.length; i++) h = Math.imul(h ^ json.charCodeAt(i), 16777619)
data.meta.version = h >>> 0

writeFileSync(new URL("../src/data/demo.json", import.meta.url), JSON.stringify(data, null, 1) + "\n")

// ---------- подложка SVG ----------

const S = (v) => px(v)
const poly = (pts) => pts.map(([x, y]) => `${S(x)},${S(y)}`).join(" ")
const out = []
const add = (s) => out.push(s)

add(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S(W)} ${S(H)}" width="${S(W)}" height="${S(H)}" font-family="Golos Text, Arial, Helvetica, sans-serif">`)
add(`<rect width="100%" height="100%" fill="#EEF1E0"/>`)

// Лес на севере и западе, с неровной опушкой
const northEdge = []
for (let x = W; x >= 40; x -= 10) northEdge.push([x, 34 + 4 * Math.sin(x / 23) + between(-1.5, 1.5)])
const westEdge = []
for (let y = 40; y <= H; y += 10) westEdge.push([34 + 4 * Math.sin(y / 19) + between(-1.5, 1.5), y])
add(`<polygon points="${poly([[0, 0], [W, 0], ...northEdge, ...westEdge, [0, H]])}" fill="#CFE0BF"/>`)
const trees = []
for (let i = 0; i < 520; i++) {
  const north = rnd() < 0.55
  const x = north ? between(0, W) : between(0, 34)
  const y = north ? between(0, 33) : between(36, H)
  trees.push(`<circle cx="${S(x)}" cy="${S(y)}" r="${S(between(2.2, 4.2))}" fill="${pick(["#A9C996", "#9BBE86", "#B6D2A4", "#8FB57B"])}"/>`)
}
add(`<g opacity="0.9">${trees.join("")}</g>`)

// Ручей с востока впадает в пруд, вдоль него ольха
add(`<path d="M ${S(458)} 0 C ${S(445)} ${S(60)}, ${S(462)} ${S(120)}, ${S(450)} ${S(170)} S ${S(436)} ${S(222)}, ${S(424)} ${S(240)}" fill="none" stroke="#A9CDE1" stroke-width="${S(3.2)}" stroke-linecap="round"/>`)
const alders = []
for (let i = 0; i < 26; i++) {
  const y = between(40, 225)
  const x = 452 + 7 * Math.sin(y / 40) + (rnd() < 0.5 ? -9 : 9) + between(-2, 2)
  alders.push(`<circle cx="${S(x)}" cy="${S(y)}" r="${S(between(2, 3.2))}" fill="#A3C58F"/>`)
}
add(alders.join(""))
add(`<ellipse cx="${S(pond.cx)}" cy="${S(pond.cy)}" rx="${S(pond.rx)}" ry="${S(pond.ry)}" fill="#C7DEEB" stroke="#A5C8DD" stroke-width="3"/>`)
add(`<text x="${S(pond.cx)}" y="${S(pond.cy + 2)}" font-size="18" fill="#6E98B2" text-anchor="middle" font-style="italic">пруд</text>`)

// Улицы
for (const st of streets) {
  add(`<rect x="${S(st.x1)}" y="${S(st.y1)}" width="${S(st.x2 - st.x1)}" height="${S(st.y2 - st.y1)}" fill="#E6DDCB"/>`)
}
for (const st of streets) {
  const cx = S((st.x1 + st.x2) / 2)
  const cy = S((st.y1 + st.y2) / 2)
  if (st.vertical) {
    const y = st.name === "ул. Центральная" ? S(250) : S(255)
    add(`<text x="${cx}" y="${y}" font-size="13" fill="#9A8D77" text-anchor="middle" dominant-baseline="central" letter-spacing="1" transform="rotate(-90 ${cx} ${y})">${st.name}</text>`)
  } else {
    add(`<text x="${S(st.x1 + 70)}" y="${cy}" font-size="13" fill="#9A8D77" dominant-baseline="central" letter-spacing="1">${st.name}</text>`)
  }
}

// Детская площадка, КПП, парковка, въезд
add(`<rect x="${S(playground.x + 2)}" y="${S(playground.y + 2)}" width="${S(playground.w - 4)}" height="${S(playground.h - 4)}" rx="10" fill="#F1E3C4" stroke="#DCC79C" stroke-width="2"/>`)
add(`<text x="${S(playground.x + playground.w / 2)}" y="${S(playground.y + playground.h / 2)}" font-size="13" fill="#A08850" text-anchor="middle" dominant-baseline="central" transform="rotate(-90 ${S(playground.x + playground.w / 2)} ${S(playground.y + playground.h / 2)})">детская площадка</text>`)
add(`<rect x="${S(gate.x)}" y="${S(gate.y)}" width="${S(gate.w)}" height="${S(gate.h)}" fill="#D9CBB0" stroke="#BDAA87" stroke-width="2"/>`)
add(`<text x="${S(gate.x + gate.w / 2)}" y="${S(gate.y + gate.h / 2)}" font-size="12" fill="#7D6C4F" text-anchor="middle" dominant-baseline="central">КПП</text>`)
add(`<rect x="${S(parking.x)}" y="${S(parking.y)}" width="${S(parking.w)}" height="${S(parking.h)}" fill="#E1D8C6" stroke="#CBBE9F" stroke-width="2"/>`)
for (let i = 1; i < 6; i++) add(`<line x1="${S(parking.x + (parking.w * i) / 6)}" y1="${S(parking.y)}" x2="${S(parking.x + (parking.w * i) / 6)}" y2="${S(parking.y + parking.h * 0.45)}" stroke="#CBBE9F" stroke-width="2"/>`)
add(`<text x="${S(parking.x + parking.w / 2)}" y="${S(parking.y + parking.h * 0.75)}" font-size="12" fill="#8A7E6B" text-anchor="middle" dominant-baseline="central">парковка</text>`)
add(`<text x="${S(255)}" y="${S(H) - 10}" font-size="14" fill="#7D6C4F" text-anchor="middle" font-weight="600">↑ въезд</text>`)

// Участки с номерами
for (const s of shapes) {
  add(`<polygon points="${poly(s.pts)}" fill="#FBF9F1" stroke="#A0937E" stroke-width="1.6" stroke-linejoin="round"/>`)
}
for (const s of shapes) {
  const [cx, cy] = centroid(s.pts)
  add(`<text x="${S(cx)}" y="${S(cy)}" font-size="15" fill="#7A6E5C" text-anchor="middle" dominant-baseline="central">${s.number}</text>`)
}

// Штамп: название, север, масштаб
const tx = S(350)
const ty = S(300)
add(`<g>`)
add(`<rect x="${tx}" y="${ty}" width="${S(112)}" height="${S(38)}" fill="#FBF9F1" stroke="#A0937E" stroke-width="1.6"/>`)
add(`<text x="${tx + 14}" y="${ty + 26}" font-size="13" fill="#7A6E5C">ГЕНЕРАЛЬНЫЙ ПЛАН</text>`)
add(`<text x="${tx + 14}" y="${ty + 50}" font-size="17" font-weight="700" fill="#4E4436">КП «Ольховый ручей»</text>`)
add(`<line x1="${tx + 14}" y1="${ty + 80}" x2="${tx + 14 + S(50)}" y2="${ty + 80}" stroke="#4E4436" stroke-width="3"/>`)
add(`<line x1="${tx + 14}" y1="${ty + 74}" x2="${tx + 14}" y2="${ty + 86}" stroke="#4E4436" stroke-width="2"/>`)
add(`<line x1="${tx + 14 + S(50)}" y1="${ty + 74}" x2="${tx + 14 + S(50)}" y2="${ty + 86}" stroke="#4E4436" stroke-width="2"/>`)
add(`<text x="${tx + 14 + S(50) + 10}" y="${ty + 85}" font-size="13" fill="#4E4436">50 м</text>`)
add(`<g transform="translate(${tx + S(112) - 34} ${ty + 72})"><polygon points="0,-26 9,6 0,0 -9,6" fill="#4E4436"/><text x="0" y="24" font-size="13" text-anchor="middle" fill="#4E4436" font-weight="700">С</text></g>`)
add(`</g>`)
add(`</svg>`)

writeFileSync(new URL("../public/genplan.svg", import.meta.url), out.join("\n") + "\n")

// ---------- сводка для проверки ----------

const count = (st) => plots.filter((p) => p.status === st).length
const sot = plots.map((p) => p.areaM2 / 100)
const prices = plots.map((p) => p.price)
const fit = plots.filter((p) => p.status === "free" && p.contour && p.price <= 2_000_000 && p.areaM2 >= 700)
console.log(`участков ${plots.length}: свободно ${count("free")}, бронь ${count("booked")}, продано ${count("sold")}, без контура ${NO_CONTOUR.length}`)
console.log(`площадь ${Math.min(...sot).toFixed(1)}-${Math.max(...sot).toFixed(1)} сот., цена ${Math.min(...prices)}-${Math.max(...prices)}`)
console.log(`фильтр С-9 (до 2 млн, от 7 сот.): ${fit.length} -> ${fit.map((p) => p.id).join(", ")}`)
console.log(`заявок ${leads.length}, записей журнала ${journal.length}, дней статистики ${DAYS}`)
const views30 = (id) => plotViews[id].slice(-30).reduce((a, b) => a + b, 0)
const top = plots.filter((p) => p.contour).sort((a, b) => views30(b.id) - views30(a.id)).slice(0, 6)
console.log(`чаще всего смотрят за 30 дней: ${top.map((p) => `${p.id}(${views30(p.id)}, ${p.status}, заявок ${leads.filter((l) => l.plotId === p.id).length})`).join(" ")}`)
console.log(`версия данных ${data.meta.version}`)
