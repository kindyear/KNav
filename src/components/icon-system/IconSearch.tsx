import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'

interface IconSearchProps {
  value: string
  onChange: (value: string) => void
}

/**
 * IconSearch
 * Search box for the Icon Picker. Input is debounced by the parent before
 * querying the Iconify API.
 */
export function IconSearch({ value, onChange }: IconSearchProps) {
  const { t } = useTranslation('common')
  return (
    <div className="flex h-9 items-center gap-sm rounded-sm border border-hairline bg-canvas px-md focus-within:border-ink">
      <Search className="size-4 shrink-0 text-body-mid" aria-hidden />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('iconPicker.searchPlaceholder')}
        className="h-full w-full bg-transparent font-sans text-body-sm text-ink outline-none placeholder:text-body-mid"
      />
    </div>
  )
}
