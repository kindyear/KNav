import { useTranslation } from 'react-i18next'
import { WallpaperPage } from '../background/WallpaperPage'
import { SettingsPage } from './SettingsPage'

export function Background() {
  const { t } = useTranslation('settings')
  return (
    <SettingsPage
      title={t('background.title')}
      description={t('background.description')}
    >
      <WallpaperPage />
    </SettingsPage>
  )
}
