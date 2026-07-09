import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { hexToRgb, isValidHex, rgbToHex, type Rgb } from '@/utils/color'

/**
 * ColorPickerPopover
 * A compact in-app color picker rendered in a Popover. Offers two entry modes
 * only — HEX and RGB — with a live preview. Unlike the native
 * `<input type="color">` (whose OS panel can't be closed programmatically),
 * this closes automatically the moment a valid color is applied.
 *
 * `children` is the trigger (e.g. a swatch button or the "Add" tile).
 */
export function ColorPickerPopover({
  value,
  onSelect,
  children,
  align = 'start',
}: {
  /** Current color (hex); seeds both inputs. */
  value: string
  /** Called once with the chosen hex; the popover then closes. */
  onSelect: (hex: string) => void
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
}) {
  const { t } = useTranslation('wallpaper')
  const [open, setOpen] = useState(false)
  const [hex, setHex] = useState(value)
  const [rgb, setRgb] = useState<Rgb>(() => hexToRgb(value) ?? { r: 0, g: 0, b: 0 })

  // Re-seed both inputs whenever the popover reopens or the value changes.
  useEffect(() => {
    if (!open) return
    setHex(value)
    setRgb(hexToRgb(value) ?? { r: 0, g: 0, b: 0 })
  }, [open, value])

  const hexValid = isValidHex(hex.trim())
  const previewHex = hexValid ? hex.trim() : rgbToHex(rgb)

  const handleHexChange = (raw: string) => {
    const next = `#${raw.replace(/^#/, '')}`
    setHex(next)
    const parsed = hexToRgb(next)
    if (parsed) setRgb(parsed)
  }

  const handleRgbChange = (channel: keyof Rgb, raw: string) => {
    const n = raw === '' ? 0 : Number(raw)
    if (Number.isNaN(n)) return
    const next = { ...rgb, [channel]: Math.min(255, Math.max(0, n)) }
    setRgb(next)
    setHex(rgbToHex(next))
  }

  const apply = () => {
    onSelect(hexValid ? hex.trim() : rgbToHex(rgb))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-64">
        <div className="flex flex-col gap-md">
          {/* Live preview */}
          <div
            aria-hidden="true"
            className="h-12 w-full rounded-sm border border-hairline"
            style={{ backgroundColor: previewHex }}
          />

          {/* HEX */}
          <div className="flex flex-col gap-xs">
            <span className="text-caption-mono-sm uppercase tracking-[var(--tracking-caption-mono-sm)] text-body-mid">
              {t('colorPicker.hexLabel')}
            </span>
            <div className="flex h-9 items-center gap-xs rounded-sm border border-hairline bg-canvas px-sm focus-within:border-ink">
              <span className="text-body-sm text-body-mid">#</span>
              <input
                type="text"
                value={hex.replace(/^#/, '')}
                onChange={(e) => handleHexChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && hexValid) apply()
                }}
                spellCheck={false}
                maxLength={6}
                aria-label={t('colorPicker.hexLabel')}
                className="h-full w-full bg-transparent font-mono text-body-sm uppercase text-ink outline-none"
              />
            </div>
          </div>

          {/* RGB */}
          <div className="flex flex-col gap-xs">
            <span className="text-caption-mono-sm uppercase tracking-[var(--tracking-caption-mono-sm)] text-body-mid">
              {t('colorPicker.rgbLabel')}
            </span>
            <div className="grid grid-cols-3 gap-sm">
              {(['r', 'g', 'b'] as const).map((channel) => (
                <div
                  key={channel}
                  className="flex h-9 items-center gap-xs rounded-sm border border-hairline bg-canvas px-sm focus-within:border-ink"
                >
                  <span className="text-caption-mono-sm uppercase text-body-mid">
                    {channel}
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb[channel]}
                    onChange={(e) => handleRgbChange(channel, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') apply()
                    }}
                    aria-label={`${t('colorPicker.rgbLabel')} ${channel.toUpperCase()}`}
                    className="h-full w-full bg-transparent font-mono text-body-sm text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={apply}
            className="h-9 rounded-pill bg-primary text-button-md text-on-primary outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('colorPicker.apply')}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
