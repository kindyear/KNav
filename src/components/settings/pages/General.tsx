import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Languages,
  Palette,
  Clock3,
  CalendarDays,
  CalendarRange,
  Timer,
  Search,
  CornerDownLeft,
  Upload,
  Download,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '@/components/ui'
import { useSettingsStore } from '@/stores/settings'
import {
  buildExportBlob,
  clearAllLocalData,
  importEnvelope,
  resetAll,
  CONFIG_EXPORT_FILENAME,
  CONFIG_LARGE_FILE_BYTES,
} from '@/lib/config'
import type {
  AppearanceSetting,
  DateFormatSetting,
  EnterBehaviorSetting,
  LanguageSetting,
  TimeFormatSetting,
} from '@/types/settings'
import { SettingsPage } from './SettingsPage'
import { SettingsGroup } from '../general/SettingsGroup'
import { SettingRow } from '../general/SettingRow'
import { Segmented } from '../general/Segmented'
import { Switch } from '../general/Switch'
import { Select } from '../general/Select'

/**
 * General settings page.
 * Reads/writes the unified settings store (auto-persisted). Every control
 * mutates the store directly so changes take effect immediately. Data actions
 * (import/export) and danger-zone actions (restore/clear) run through the
 * settings service, with confirmation dialogs for destructive operations.
 */
export function General() {
  const { t } = useTranslation('settings')

  const general = useSettingsStore((s) => s.general)
  const setGeneral = useSettingsStore((s) => s.setGeneral)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [clearOpen, setClearOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  // Holds a pending large export awaiting user confirmation.
  const [pendingExport, setPendingExport] = useState<{
    blob: Blob
    sizeMb: string
  } | null>(null)

  // ── Preference actions (with feedback for language/theme) ─────────────────
  function handleLanguageChange(value: LanguageSetting) {
    setGeneral({ language: value })
    toast.success(t('general.toasts.languageUpdated'))
  }

  function handleAppearanceChange(value: AppearanceSetting) {
    setGeneral({ appearance: value })
    toast.success(t('general.toasts.themeUpdated'))
  }

  // ── Data actions ──────────────────────────────────────────────────────────
  /** Trigger a browser download for an export blob. */
  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = CONFIG_EXPORT_FILENAME
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function handleExport() {
    if (busy) return
    setBusy(true)
    try {
      const blob = await buildExportBlob()
      // Guard against accidentally exporting a huge file (large local images).
      if (blob.size > CONFIG_LARGE_FILE_BYTES) {
        const sizeMb = (blob.size / (1024 * 1024)).toFixed(0)
        setPendingExport({ blob, sizeMb })
        return
      }
      downloadBlob(blob)
      toast.success(t('general.toasts.exported'))
    } catch {
      toast.error(t('general.toasts.importError'))
    } finally {
      setBusy(false)
    }
  }

  function confirmLargeExport() {
    if (!pendingExport) return
    downloadBlob(pendingExport.blob)
    setPendingExport(null)
    toast.success(t('general.toasts.exported'))
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so selecting the same file again re-triggers change.
    event.target.value = ''
    if (!file || busy) return
    setBusy(true)
    try {
      const report = await importEnvelope(JSON.parse(await file.text()))
      if (report.wallpapersFailed > 0) {
        toast.success(
          t('general.toasts.importedPartial', {
            modules: report.modulesRestored,
            wallpapers: report.wallpapersRestored,
            failed: report.wallpapersFailed,
          })
        )
      } else {
        toast.success(
          t('general.toasts.imported', {
            modules: report.modulesRestored,
            wallpapers: report.wallpapersRestored,
          })
        )
      }
      // Reload so every store re-hydrates from the freshly imported storage.
      window.setTimeout(() => window.location.reload(), 600)
    } catch {
      toast.error(t('general.toasts.importError'))
    } finally {
      setBusy(false)
    }
  }

  // ── Danger-zone actions ───────────────────────────────────────────────────
  async function handleRestore() {
    setRestoreOpen(false)
    await resetAll()
    toast.success(t('general.toasts.restored'))
    window.setTimeout(() => window.location.reload(), 400)
  }

  async function handleClear() {
    setClearOpen(false)
    await clearAllLocalData()
    toast.success(t('general.toasts.cleared'))
    // Reload so every store re-hydrates from the cleared storage.
    window.setTimeout(() => window.location.reload(), 400)
  }

  return (
    <SettingsPage
      title={t('general.title')}
      description={t('general.description')}
    >
      <div className="flex flex-col gap-2xl">
        {/* ── Preferences ─────────────────────────────────────────────── */}
        <SettingsGroup title={t('general.groups.preferences')}>
          <SettingRow
            icon={Languages}
            title={t('general.items.language.title')}
            description={t('general.items.language.description')}
            control={
              <Select<LanguageSetting>
                value={general.language}
                onChange={handleLanguageChange}
                ariaLabel={t('general.items.language.title')}
                options={[
                  { value: 'system', label: t('general.options.followSystem') },
                  { value: 'zh-CN', label: t('general.options.zhCN') },
                  { value: 'en-US', label: t('general.options.en') },
                ]}
              />
            }
          />
          <SettingRow
            icon={Palette}
            title={t('general.items.appearance.title')}
            description={t('general.items.appearance.description')}
            control={
              <Segmented<AppearanceSetting>
                value={general.appearance}
                onChange={handleAppearanceChange}
                ariaLabel={t('general.items.appearance.title')}
                options={[
                  { value: 'system', label: t('general.options.followSystem') },
                  { value: 'light', label: t('general.options.light') },
                  { value: 'dark', label: t('general.options.dark') },
                ]}
              />
            }
          />
          <SettingRow
            icon={Clock3}
            title={t('general.items.timeFormat.title')}
            description={t('general.items.timeFormat.description')}
            control={
              <Segmented<TimeFormatSetting>
                value={general.timeFormat}
                onChange={(v) => setGeneral({ timeFormat: v })}
                ariaLabel={t('general.items.timeFormat.title')}
                options={[
                  { value: '24', label: t('general.options.hour24') },
                  { value: '12', label: t('general.options.hour12') },
                ]}
              />
            }
          />
          <SettingRow
            icon={CalendarDays}
            title={t('general.items.dateFormat.title')}
            description={t('general.items.dateFormat.description')}
            control={
              <Select<DateFormatSetting>
                value={general.dateFormat}
                onChange={(v) => setGeneral({ dateFormat: v })}
                ariaLabel={t('general.items.dateFormat.title')}
                options={[
                  {
                    value: 'auto',
                    label: t('general.options.followLanguage'),
                  },
                  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
                  { value: 'mm-dd-yyyy', label: 'MM/DD/YYYY' },
                  { value: 'dd-mm-yyyy', label: 'DD/MM/YYYY' },
                ]}
              />
            }
          />
          <SettingRow
            icon={CalendarRange}
            title={t('general.items.showWeekday.title')}
            description={t('general.items.showWeekday.description')}
            control={
              <Switch
                checked={general.showWeekday}
                onChange={(v) => setGeneral({ showWeekday: v })}
                ariaLabel={t('general.items.showWeekday.title')}
              />
            }
          />
          <SettingRow
            icon={Timer}
            title={t('general.items.showSeconds.title')}
            description={t('general.items.showSeconds.description')}
            control={
              <Switch
                checked={general.showSeconds}
                onChange={(v) => setGeneral({ showSeconds: v })}
                ariaLabel={t('general.items.showSeconds.title')}
              />
            }
          />
          <SettingRow
            icon={Search}
            title={t('general.items.autoFocusSearch.title')}
            description={t('general.items.autoFocusSearch.description')}
            control={
              <Switch
                checked={general.autoFocusSearch}
                onChange={(v) => setGeneral({ autoFocusSearch: v })}
                ariaLabel={t('general.items.autoFocusSearch.title')}
              />
            }
          />
          <SettingRow
            icon={CornerDownLeft}
            title={t('general.items.enterBehavior.title')}
            description={t('general.items.enterBehavior.description')}
            control={
              <Segmented<EnterBehaviorSetting>
                value={general.enterBehavior}
                onChange={(v) => setGeneral({ enterBehavior: v })}
                ariaLabel={t('general.items.enterBehavior.title')}
                options={[
                  {
                    value: 'current',
                    label: t('general.options.currentTab'),
                  },
                  { value: 'new', label: t('general.options.newTab') },
                ]}
              />
            }
          />
        </SettingsGroup>

        {/* ── Data ────────────────────────────────────────────────────── */}
        <SettingsGroup title={t('general.groups.data')}>
          <SettingRow
            icon={Upload}
            title={t('general.items.importSettings.title')}
            description={t('general.items.importSettings.description')}
            control={
              <Button variant="outline" size="sm" onClick={handleImportClick}>
                {t('general.actions.import')}
              </Button>
            }
          />
          <SettingRow
            icon={Download}
            title={t('general.items.exportSettings.title')}
            description={t('general.items.exportSettings.description')}
            control={
              <Button variant="outline" size="sm" onClick={handleExport}>
                {t('general.actions.export')}
              </Button>
            }
          />
        </SettingsGroup>

        {/* ── Danger Zone ─────────────────────────────────────────────── */}
        <SettingsGroup title={t('general.groups.dangerZone')} danger>
          <SettingRow
            icon={RotateCcw}
            title={t('general.items.restoreDefaults.title')}
            description={t('general.items.restoreDefaults.description')}
            danger
            control={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRestoreOpen(true)}
              >
                {t('general.actions.restore')}
              </Button>
            }
          />
          <SettingRow
            icon={Trash2}
            title={t('general.items.clearData.title')}
            description={t('general.items.clearData.description')}
            danger
            control={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearOpen(true)}
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                {t('general.actions.clear')}
              </Button>
            }
          />
        </SettingsGroup>
      </div>

      {/* Hidden file input for Import. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Large-export confirmation. */}
      <Dialog
        open={pendingExport !== null}
        onOpenChange={(open) => !open && setPendingExport(null)}
      >
        <DialogContent className="max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>{t('general.largeExport.title')}</DialogTitle>
            <DialogDescription>
              {t('general.largeExport.description', {
                size: pendingExport?.sizeMb ?? '0',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingExport(null)}>
              {t('general.largeExport.cancel')}
            </Button>
            <Button onClick={confirmLargeExport}>
              {t('general.largeExport.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore-defaults confirmation. */}
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent className="max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>{t('general.dialogs.restore.title')}</DialogTitle>
            <DialogDescription>
              {t('general.dialogs.restore.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreOpen(false)}>
              {t('general.actions.cancel')}
            </Button>
            <Button onClick={handleRestore}>
              {t('general.actions.restore')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear-local-data confirmation. */}
      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>{t('general.dialogs.clear.title')}</DialogTitle>
            <DialogDescription>
              {t('general.dialogs.clear.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearOpen(false)}>
              {t('general.actions.cancel')}
            </Button>
            <Button
              onClick={handleClear}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t('general.actions.clear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsPage>
  )
}
