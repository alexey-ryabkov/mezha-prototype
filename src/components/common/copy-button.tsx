import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export async function copyText(text: string, message = "Скопировано") {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // В некоторых браузерах доступа к буферу нет, для прототипа это не важно
  }
  toast.success(message)
}

export function CopyButton({ text, label = "Скопировать", message }: { text: string; label?: string; message?: string }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => copyText(text, message)}>
      <Copy />
      {label}
    </Button>
  )
}
