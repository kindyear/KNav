import type { ReactNode } from 'react'

/**
 * WallpaperSection
 * A titled subsection inside a wallpaper page: title (body-lg) + optional
 * description (body-sm), followed by its content.
 */
export function WallpaperSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-md">
      <div className="flex flex-col gap-xxs">
        <h4 className="text-body-lg text-ink">{title}</h4>
        {description ? (
          <p className="text-body-sm text-body-mid">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
