/**
 * PlaceholderCard
 * A settings-item placeholder in the card-content language (canvas-card +
 * hairline border + rounded-sm). Title in body-md, description in body-sm.
 * UI-only — holds no real control (no switch / select).
 */
export function PlaceholderCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-[72px] flex-col justify-center gap-xxs rounded-sm border border-hairline bg-canvas-card px-lg py-md">
      <p className="text-body-md text-ink">{title}</p>
      <p className="text-body-sm text-body-mid">{description}</p>
    </div>
  )
}
