import { DigitalClock } from '@/features/clock'
import { SearchBox, SearchProvider, SearchHistory } from '@/features/search'
import { QuickAccess } from '@/components/home/QuickAccess'
import { SettingsPanel } from '@/components/settings'

/**
 * App
 * Hero centre composition: live clock + date, provider bar, search box,
 * recent search history, and the Quick Access grid. Settings bottom sheet
 * is triggered from its own top-right button.
 */
export default function App() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2xl px-lg py-4xl">
      <DigitalClock />
      <div className="flex w-full flex-col items-center gap-lg">
        <SearchProvider />
        <SearchBox />
        <SearchHistory />
      </div>
      <QuickAccess />
      <SettingsPanel />
    </div>
  )
}
