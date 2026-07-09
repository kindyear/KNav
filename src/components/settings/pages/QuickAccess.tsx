import { useTranslation } from 'react-i18next'
import { QuickAccessManager } from '@/features/quick-access'
import { SettingsPage } from './SettingsPage'

export function QuickAccess() {
  const { t } = useTranslation('settings')
  return (
    <SettingsPage
      title={t('quickAccess.title')}
      description={t('quickAccess.description')}
    >
      <QuickAccessManager />
    </SettingsPage>
  )
}
