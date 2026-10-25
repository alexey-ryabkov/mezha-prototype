// Картинки для интерфейса и документов: угол экрана с меню демонстрации и лого.
// Запуск после сборки: node scripts/shoot-assets.mjs [путь для png лого]
import { chromium } from "playwright"
import { preview } from "vite"

const logoOut = process.argv[2] ?? "logo.png"

const server = await preview({ preview: { port: 4174, strictPort: true }, logLevel: "silent" })
const base = "http://localhost:4174/mezha-prototype/"
const browser = await chromium.launch()

// Угол экрана с раскрытым меню демонстрации, для подсказки на стартовом экране
const corner = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 2 })
await corner.goto(base + "#/widget", { waitUntil: "networkidle" })
// Содержимое страницы прячется, остаются фон, кнопка и панель меню
await corner.addStyleTag({ content: "#root > :not(.fixed) { visibility: hidden }" })
await corner.click('button[aria-label="Навигация демонстрации"]')
await corner.waitForTimeout(400)
const panel = await corner.locator('[data-slot="popover-content"]').boundingBox()
const pad = 16
await corner.screenshot({
  path: "public/demo-nav-corner.png",
  clip: { x: panel.x - pad, y: panel.y - pad, width: 800 - panel.x + pad, height: 600 - panel.y + pad },
})

// Лого крупно и на прозрачном фоне
const logo = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 8 })
await logo.goto(base, { waitUntil: "networkidle" })
await logo.addStyleTag({ content: "html, body { background: transparent !important }" })
await logo.locator("[data-logo]").first().screenshot({ path: logoOut, omitBackground: true })

await browser.close()
server.httpServer.close()
console.log("ok: public/demo-nav-corner.png,", logoOut)
