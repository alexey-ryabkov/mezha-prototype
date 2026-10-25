import { TODAY } from "@/data/demo"

// Новые события получают «сегодняшнюю» дату прототипа и текущее время
export function nowStamp() {
  const d = new Date()
  return `${TODAY}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}
