import { cn } from "@/lib/utils"

export function MezhaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7 shrink-0", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#B0532F" />
      <polygon points="6,6.6 15,6 14.6,14.8 6.3,15.4" fill="#F7EDE0" />
      <polygon points="17,5.9 26,5.4 26,14.2 16.6,14.7" fill="#F7EDE0" fillOpacity="0.5" />
      <polygon points="6.3,17.4 14.5,16.8 14.9,26 6,26" fill="#F7EDE0" fillOpacity="0.5" />
      <polygon points="16.5,16.7 26,16.2 26,26 16.9,26" fill="#7FCB7A" />
    </svg>
  )
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <MezhaMark className={markClassName} />
      <span className="font-heading text-lg leading-none font-semibold tracking-tight">межа</span>
    </span>
  )
}
