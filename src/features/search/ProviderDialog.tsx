import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@/components/ui'
import { IconPicker } from '@/components/icon-system'
import { isValidSearchUrl } from './providerUtils'
import type { ProviderFormValues, SearchProvider } from './providerTypes'

interface ProviderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Existing provider when editing; undefined when creating. */
  provider?: SearchProvider
  /** Persist the form values (create or update). */
  onSubmit: (values: ProviderFormValues) => void
}

const EMPTY: ProviderFormValues = {
  name: '',
  icon: 'simple-icons:google',
  searchUrl: '',
  category: '',
  description: '',
}

/**
 * ProviderDialog
 * Create/edit a user search provider. Validates that name and search URL are
 * present and that the URL contains the `%s` placeholder before allowing save.
 */
export function ProviderDialog({
  open,
  onOpenChange,
  provider,
  onSubmit,
}: ProviderDialogProps) {
  const { t } = useTranslation('search')
  const [values, setValues] = useState<ProviderFormValues>(EMPTY)
  const [touched, setTouched] = useState(false)

  // Seed the form whenever the dialog opens (edit → existing, create → empty).
  useEffect(() => {
    if (!open) return
    setTouched(false)
    setValues(
      provider
        ? {
            name: provider.name,
            icon: provider.icon,
            searchUrl: provider.searchUrl,
            category: provider.category ?? '',
            description: provider.description ?? '',
          }
        : EMPTY
    )
  }, [open, provider])

  const nameValid = values.name.trim().length > 0
  const urlValid = isValidSearchUrl(values.searchUrl)
  const canSave = nameValid && urlValid

  function handleSubmit() {
    setTouched(true)
    if (!canSave) return
    onSubmit(values)
    onOpenChange(false)
  }

  const isEdit = Boolean(provider)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[30rem]">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('providers.dialog.editTitle')
              : t('providers.dialog.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('providers.dialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-lg">
          {/* Name + icon row */}
          <div className="flex flex-col gap-sm">
            <label className="text-body-sm text-body-mid">
              {t('providers.dialog.name')} *
            </label>
            <div className="flex items-center gap-md">
              <IconPicker
                value={values.icon}
                onChange={(icon) => setValues((v) => ({ ...v, icon }))}
              />
              <Input
                value={values.name}
                onChange={(e) =>
                  setValues((v) => ({ ...v, name: e.target.value }))
                }
                placeholder={t('providers.dialog.namePlaceholder')}
                aria-invalid={touched && !nameValid}
              />
            </div>
          </div>

          {/* Search URL */}
          <div className="flex flex-col gap-sm">
            <label className="text-body-sm text-body-mid">
              {t('providers.dialog.url')} *
            </label>
            <Input
              value={values.searchUrl}
              onChange={(e) =>
                setValues((v) => ({ ...v, searchUrl: e.target.value }))
              }
              placeholder="https://example.com/search?q=%s"
              aria-invalid={touched && !urlValid}
              className="font-mono text-body-sm"
            />
            <p
              className={
                touched && !urlValid
                  ? 'text-body-sm text-destructive'
                  : 'text-body-sm text-body-mid'
              }
            >
              {t('providers.dialog.urlHint')}
            </p>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-sm">
            <label className="text-body-sm text-body-mid">
              {t('providers.dialog.category')}
            </label>
            <Input
              value={values.category}
              onChange={(e) =>
                setValues((v) => ({ ...v, category: e.target.value }))
              }
              placeholder={t('providers.dialog.categoryPlaceholder')}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-sm">
            <label className="text-body-sm text-body-mid">
              {t('providers.dialog.descriptionField')}
            </label>
            <Input
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              placeholder={t('providers.dialog.descriptionPlaceholder')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('providers.dialog.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            {t('providers.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
