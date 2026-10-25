export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
      Раздел «{title}» появится на шаге 4
    </div>
  )
}
