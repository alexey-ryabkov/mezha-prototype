import json from "./demo.json"
import type { DemoJson } from "./types"

// Демо-данные из scripts/generate-demo.mjs
export const DEMO = json as unknown as DemoJson

export const TODAY = DEMO.meta.today
export const PLAN = DEMO.village.plan
export const PLAN_IMAGE = `${import.meta.env.BASE_URL}${PLAN.image}`
