// Прогон пяти сквозных путей из ТЗ на телефоне и на компьютере.
// BASE — адрес прототипа (по умолчанию опубликованный), SHOTS — папка для скриншотов (если нужны).
// Запуск: node scripts/paths.mjs [номер пути ...]
import { mkdirSync } from "node:fs"
import { chromium } from "playwright"

const BASE = process.env.BASE ?? "https://alexey-ryabkov.github.io/mezha-prototype/"
const SHOTS = process.env.SHOTS
const ONLY = process.argv.slice(2).map(Number)

const DEVICES = {
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  // Для скриншотов в презентацию компьютер снимается с удвоенной плотностью
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: process.env.SHOTS ? 2 : 1 },
}

if (SHOTS) mkdirSync(SHOTS, { recursive: true })

function expect(cond, message) {
  if (!cond) throw new Error(message)
}

async function session(browser, device, name) {
  const ctx = await browser.newContext({ ...DEVICES[device], locale: "ru-RU" })
  const page = await ctx.newPage()
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: "networkidle" })
  const mobile = device === "phone"
  let shot = 0
  const s = {
    page,
    mobile,
    errors,
    tap: (loc) => (mobile ? loc.tap() : loc.click()),
    wait: (ms = 400) => page.waitForTimeout(ms),
    // keepToast: уведомление подтверждает действие этого шага, на остальных кадрах оно от прошлого шага и прячется
    shot: async (label, { keepToast = false } = {}) => {
      if (!SHOTS) return
      shot++
      await page.waitForTimeout(350)
      const hide = [
        // Кнопка демонстрации не часть интерфейса «Межи», ее видно только там, где по ней переходят
        label !== "demo-nav" && '[aria-label="Навигация демонстрации"]',
        !keepToast && "[data-sonner-toaster]",
      ].filter(Boolean)
      await page.screenshot({
        path: `${SHOTS}/${name}-${device}-${String(shot).padStart(2, "0")}-${label}.png`,
        style: hide.length ? `${hide.join(", ")} { visibility: hidden !important; }` : undefined,
      })
    },
    // Переход по разделу кабинета: на телефоне меню сначала нужно открыть
    nav: async (label) => {
      if (mobile) {
        await page.locator('[data-sidebar="trigger"]').tap()
        await page.waitForTimeout(400)
      }
      await s.tap(page.getByRole("link", { name: label, exact: true }))
      await page.waitForTimeout(500)
    },
    login: async (role) => {
      await page.goto(`${BASE}#/login/${role}`)
      await page.waitForTimeout(300)
      await s.tap(page.getByRole("button", { name: "Войти" }))
      await page.waitForTimeout(500)
    },
    close: () => ctx.close(),
  }
  return s
}

const paths = {
  // Покупатель: виджет -> фильтр -> участок в списке -> карточка -> заявка
  1: async (s) => {
    const { page } = s
    await page.goto(`${BASE}#/widget`)
    await s.wait(800)
    await s.shot("widget")
    let scope = page
    if (s.mobile) {
      await s.tap(page.getByRole("button", { name: "Фильтры" }))
      await s.wait()
      scope = page.getByRole("dialog")
    }
    const thumbs = scope.locator('[role="slider"]:visible')
    await thumbs.nth(1).focus()
    await page.keyboard.press("PageDown")
    await page.keyboard.press("PageDown")
    await page.keyboard.press("ArrowLeft")
    await s.wait(200)
    await s.shot("filter")
    if (s.mobile) await s.tap(scope.getByRole("button", { name: /^Показать/ }))
    await s.wait()
    expect(await page.getByText("подходит 9 участков").locator("visible=true").first().isVisible(), "нет надписи «подходит 9 участков»")
    await s.shot("filtered")
    await s.tap(page.locator("li button").first())
    await s.wait(600)
    const card = page.getByRole("dialog")
    expect((await card.getByRole("heading").innerText()).startsWith("Участок №"), "карточка не открылась")
    await s.shot("card")
    await s.tap(card.getByRole("button", { name: "Оставить заявку" }))
    await s.wait()
    await page.fill("#lead-name", "Михаил")
    await page.fill("#lead-phone", "+7 900 012-34-56")
    await page.fill("#lead-comment", "Хочу посмотреть участок в субботу")
    await s.tap(page.locator("#lead-consent"))
    await s.shot("form")
    await s.tap(page.getByRole("button", { name: "Отправить заявку" }))
    await s.wait()
    expect((await page.getByRole("dialog").getByRole("heading").innerText()) === "Заявка принята", "нет сообщения о заявке")
    await s.shot("sent")
    // Заявка появилась в кабинете
    await s.login("manager")
    await s.nav("Заявки")
    const first = s.mobile ? page.locator("main li").first() : page.locator("tbody tr").first()
    expect((await first.innerText()).includes("Михаил"), "заявки нет в кабинете")
    await s.shot("lead-in-cabinet")
  },

  // Менеджер на показе: участки -> поиск -> бронь -> виджет, участок желтый
  2: async (s) => {
    const { page } = s
    await s.shot("menu")
    await s.tap(page.getByText("Кабинет девелопера, роль «Менеджер»"))
    await s.wait()
    await s.shot("login")
    await s.tap(page.getByRole("button", { name: "Войти" }))
    await s.wait(500)
    await page.getByPlaceholder("Поиск по номеру").fill("47")
    await s.wait(300)
    await s.shot("search")
    const row = s.mobile ? page.locator("main li").first() : page.locator("tbody tr").first()
    await s.tap(row.getByRole("combobox"))
    await s.wait(300)
    await s.tap(page.getByRole("option", { name: "забронирован" }))
    await s.wait(500)
    await s.shot("booked", { keepToast: true })
    await s.tap(page.getByRole("button", { name: "Навигация демонстрации" }))
    await s.wait(300)
    await s.shot("demo-nav")
    await s.tap(page.getByRole("link", { name: "Виджет на сайте поселка" }))
    await s.wait(800)
    const cls = await page.locator('polygon[data-plot="47"]').getAttribute("class")
    expect(cls.includes("fill-booked"), "участок 47 в виджете не желтый")
    await s.shot("widget")
  },

  // Собственник: генплан -> обвести участок -> карточка -> опубликовать -> оплата -> код
  3: async (s) => {
    const { page } = s
    await s.login("owner")
    await s.nav("Генплан")
    await s.shot("editor")
    await s.tap(page.getByRole("button", { name: /№ 73/ }))
    await s.wait()
    await s.shot("outline-mode")
    await page.locator("polygon.fill-primary\\/10").first().click({ force: true })
    await s.wait(600)
    expect((await page.getByRole("dialog").getByRole("heading").innerText()) === "Участок № 73", "карточка 73 не открылась")
    await s.shot("card")
    await s.tap(page.getByRole("button", { name: "Сохранить" }))
    await s.wait()
    await s.tap(page.getByRole("button", { name: "Опубликовать" }))
    await s.wait()
    expect((await page.getByRole("dialog").getByRole("heading").innerText()) === "Подписка не оплачена", "нет предложения оплатить")
    await s.shot("unpaid")
    await s.tap(page.getByRole("button", { name: "Перейти к оплате" }))
    await s.wait(900)
    expect(page.url().includes("profile#billing"), "не открылся профиль с оплатой")
    await s.shot("billing")
    await s.tap(page.getByRole("button", { name: "Оплатить" }))
    await s.wait(500)
    expect(await page.getByText("активна до 31.08.2026").first().isVisible(), "подписка не стала активной")
    await s.shot("paid", { keepToast: true })
    await s.nav("Генплан")
    await s.tap(page.getByRole("button", { name: "Опубликовать" }))
    await s.wait()
    const dlg = page.getByRole("dialog")
    expect((await dlg.getByRole("heading").innerText()) === "Генплан опубликован", "генплан не опубликован")
    expect((await dlg.locator("pre").innerText()).includes("<script"), "нет кода для вставки")
    await s.shot("published")
  },

  // Собственник смотрит отдачу: статистика -> участок без заявок -> снизить цену -> журнал
  4: async (s) => {
    const { page } = s
    await s.login("owner")
    await s.nav("Статистика")
    await s.shot("stats")
    const hot = page.locator("tr", { hasText: "смотрят без заявок" }).first()
    const number = (await hot.getByRole("button", { name: /№/ }).innerText()).replace("№ ", "")
    await s.tap(hot.getByRole("button", { name: /№/ }))
    await s.wait(500)
    expect(page.url().includes(`q=${number}`), "не открылись участки с поиском")
    await s.shot("plot")
    await s.tap(page.getByTitle("Изменить цену").locator("visible=true").first())
    await page.locator('input[aria-label^="Цена участка"]').fill("2600000")
    await page.keyboard.press("Enter")
    await s.wait(400)
    expect(await page.getByText("2 600 000 ₽").locator("visible=true").first().isVisible(), "новая цена не видна")
    await s.shot("price", { keepToast: true })
    await s.nav("Журнал")
    const first = page.locator("tbody tr").first()
    const text = (await first.innerText()).replace(/\s+/g, " ")
    expect(text.includes(`№ ${number}`) && text.includes("2 600 000"), "записи в журнале нет")
    await s.shot("journal")
  },

  // Менеджер разбирает заявку: заявки -> номер участка -> карточка
  5: async (s) => {
    const { page } = s
    await s.login("manager")
    await s.nav("Заявки")
    await s.shot("leads")
    const first = s.mobile ? page.locator("main li").first() : page.locator("tbody tr").first()
    await s.tap(first.getByRole("button", { name: /№/ }))
    await s.wait(600)
    expect((await page.getByRole("dialog").getByRole("heading").innerText()).startsWith("Участок №"), "карточка не открылась")
    await s.shot("card")
  },
}

const browser = await chromium.launch()
const results = []
for (const n of Object.keys(paths).map(Number)) {
  if (ONLY.length && !ONLY.includes(n)) continue
  for (const device of Object.keys(DEVICES)) {
    const s = await session(browser, device, `path${n}`)
    try {
      await paths[n](s)
      results.push({ path: n, device, ok: !s.errors.length, note: s.errors.join("; ") })
    } catch (e) {
      results.push({ path: n, device, ok: false, note: e.message.split("\n")[0] })
      if (SHOTS) await s.page.screenshot({ path: `${SHOTS}/path${n}-${device}-FAILED.png` })
    }
    await s.close()
  }
}
await browser.close()

for (const r of results) console.log(`путь ${r.path} ${r.device.padEnd(7)} ${r.ok ? "ok" : "FAIL"} ${r.note}`)
process.exit(results.every((r) => r.ok) ? 0 : 1)
