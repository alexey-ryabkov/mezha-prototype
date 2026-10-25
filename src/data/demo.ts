import json from "./demo.json"
import type { DemoJson } from "./types"

// Демо-данные из scripts/generate-demo.mjs
export const DEMO = json as unknown as DemoJson

export const TODAY = DEMO.meta.today
export const PLAN = DEMO.village.plan
export const PLAN_IMAGE = `${import.meta.env.BASE_URL}${PLAN.image}`

// Картинка генплана грузится один раз при старте, пока она не загрузилась, на плане крутится прелоадер
let planLoaded = false
export const planReady = new Promise<void>((resolve) => {
  const img = new Image()
  img.onload = img.onerror = () => {
    planLoaded = true
    resolve()
  }
  img.src = PLAN_IMAGE
})
export const isPlanLoaded = () => planLoaded
