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
import { isValidQuickAccessUrl } from './quickAccessUtils'
import type { QuickAccessFormValues, QuickAccessItem } from './quickAccessTypes'

interface QuickAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Existing item when editing; undefined when creating. */
  item?: QuickAccessItem
  /** Persist the form values (create or update). */
  onSubmit: (values: QuickAccessFormValues) => void
}

const EMPTY: QuickAccessFormValues = {
  name: '',
  url: '',
  icon: 'lucide:globe',
  category: '',
  description: '',
  accentColor: '',
}

/**
 * QuickAccessDialog
 * Create/edit a Quick Access site. Validates that name and URL are present and
 * that the URL starts with http:// or https:// before allowing save. Applies to
 * every item — builtins are fully editable too.
 */
export function QuickAccessDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
}: QuickAccessDialogProps) {
  const { t } = useTranslation('quickAccess')
  const [values, setValues] = useState<QuickAccessFormValues>(EMPTY)
  const [touched, setTouched] = useState(false)

  // Seed the form whenever the dialog opens (edit → existing, create → empty).
  useEffect(() => {
    if (!open) return
    setTouched(false)
    setValues(
      item
        ? {
            name: item.name,
            url: item.url,
            icon: item.icon,
            category: item.category ?? '',
            description: item.description ?? '',
            accentColor: item.accentColor ?? '',
          }
        : EMPTY
    )
  }, [open, item])

  const nameValid = values.name.trim().length > 0
  const urlValid = isValidQuickAccessUrl(values.url)
  const canSave = nameValid && urlValid

  function handleSubmit() {
    setTouched(true)
    if (!canSave) return
    onSubmit(values)
    onOpenChange(false)
  }

  const isEdit = Boolean(item)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[30rem]">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('manager.dialog.editTitle')
              : t('manager.dialog.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('manager.dialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-lg">
          {/* Name + icon row */}
          <div className="flex flex-col gap-sm">
            <label className="text-body-sm text-body-mid">
              {t('manager.dialog.name')} *
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
                placeholder={t('manager.dialog.namePlaceholder')}
                aria-invalid={touched && !nameValid}
              />
            </div>
          </div>

          {/* URL */}
          <div className="flex flex-col gap-sm">
            <label className="text-body-sm text-body-mid">
              {t('manager.dialog.url')} *
            </label>
            <Input
              value={values.url}
              onChange={(e) =>
                setValues((v) => ({ ...v, url: e.target.value }))
              }
              placeholder="https://example.com"
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
              {t('manager.dialog.urlHint')}
            </p>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-sm">
            <label className="text-body-sm text-body-mid">
              {t('manager.dialog.category')}
            </label>
            <Input
              value={values.category}
              onChange={(e) =>
                setValues((v) => ({ ...v, category: e.target.value }))
              }
              placeholder={t('manager.dialog.categoryPlaceholder')}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-sm">
            <label className="text-body-sm text-body-mid">
              {t('manager.dialog.descriptionField')}
            </label>
            <Input
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              placeholder={t('manager.dialog.descriptionPlaceholder')}
            />
          </div>

          {/* Accent color (optional) */}
          <div className="flex flex-col gap-sm">
            <label className="text-body-sm text-body-mid">
              {t('manager.dialog.accentColor')}
            </label>
            <div className="flex items-center gap-md">
              <input
                type="color"
                value={values.accentColor || '#4285F4'}
                onChange={(e) =>
                  setValues((v) => ({ ...v, accentColor: e.target.value }))
                }
                aria-label={t('manager.dialog.accentColor')}
                className="size-10 shrink-0 cursor-pointer rounded-sm border border-hairline bg-canvas-soft p-0.5"
              />
              <Input
                value={values.accentColor}
                onChange={(e) =>
                  setValues((v) => ({ ...v, accentColor: e.target.value }))
                }
                placeholder={t('manager.dialog.accentColorPlaceholder')}
                className="font-mono text-body-sm"
              />
              {values.accentColor ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setValues((v) => ({ ...v, accentColor: '' }))}
                >
                  {t('manager.dialog.clearColor')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('manager.dialog.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            {t('manager.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
