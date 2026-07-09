import { useTranslation } from 'react-i18next'
import { ProviderManager } from '@/features/search/ProviderManager'
import { SettingsPage } from './SettingsPage'

export function Search() {
  const { t } = useTranslation('settings')
  return (
    <SettingsPage
      title={t('search.title')}
      description={t('search.description')}
    >
      <ProviderManager />
    </SettingsPage>
  )
}
