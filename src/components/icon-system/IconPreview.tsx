import { useTranslation } from 'react-i18next'
import { IconRenderer } from './IconRenderer'
import { getIconMeta } from './iconUtils'

interface IconPreviewProps {
  /** The icon to preview (hovered icon, else the current selection). */
  icon: string | null
}

/**
 * IconPreview
 * Footer preview for the Icon Picker: a large glyph beside the icon's full
 * name (`simple-icons:google`), short name, and collection.
 */
export function IconPreview({ icon }: IconPreviewProps) {
  const { t } = useTranslation('common')

  if (!icon) {
    return (
      <div className="flex h-14 items-center px-xs text-body-sm text-body-mid">
        {t('iconPicker.previewHint')}
      </div>
    )
  }

  const meta = getIconMeta(icon)
  return (
    <div className="flex h-14 items-center gap-md px-xs">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-hairline bg-canvas-soft">
        <IconRenderer icon={icon} className="size-6" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-mono text-body-sm text-ink">
          {meta.icon}
        </span>
        <span className="truncate text-body-sm text-body-mid">
          {meta.name} · {meta.collection}
        </span>
      </div>
    </div>
  )
}
