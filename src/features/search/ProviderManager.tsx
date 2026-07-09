import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Pencil, Trash2 } from 'lucide-react'
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
import { ProviderDialog } from './ProviderDialog'
import { IconRenderer } from '@/components/icon-system'
import { useProviderStore } from './providerStore'
import {
  MAX_ENABLED_PROVIDERS,
  getAvailableProviders,
  getEnabledProviders,
} from './providerUtils'
import type { ProviderFormValues, SearchProvider } from './providerTypes'

/**
 * ProviderManager
 * Full search-provider management UI for the Search settings page:
 * - "Activated" — enabled providers, drag-to-reorder, per-item disable, and
 *   delete (user providers only).
 * - "Available" — disabled providers with enable, plus edit/delete for user
 *   providers.
 * - Add Provider (create dialog).
 * All state lives in the provider store and is persisted immediately.
 * Backup/restore of providers is handled by the unified config export/import
 * (General settings), so there is no separate export/import here.
 */
export function ProviderManager() {
  const { t } = useTranslation('search')
  const providers = useProviderStore((s) => s.providers)
  const enableProvider = useProviderStore((s) => s.enableProvider)
  const disableProvider = useProviderStore((s) => s.disableProvider)
  const removeProvider = useProviderStore((s) => s.removeProvider)
  const reorderEnabled = useProviderStore((s) => s.reorderEnabled)
  const addProvider = useProviderStore((s) => s.addProvider)
  const updateProvider = useProviderStore((s) => s.updateProvider)

  const enabled = useMemo(() => getEnabledProviders(providers), [providers])
  const available = useMemo(() => getAvailableProviders(providers), [providers])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SearchProvider | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<SearchProvider | null>(
    null
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = enabled.map((p) => p.id)
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from === -1 || to === -1) return
    const reordered = [...ids]
    reordered.splice(to, 0, reordered.splice(from, 1)[0])
    reorderEnabled(reordered)
  }

  function handleEnable(id: string) {
    if (enableProvider(id) === 'limit-reached') {
      toast.error(t('providers.limitReached', { max: MAX_ENABLED_PROVIDERS }))
    }
  }

  function handleAdd() {
    setEditing(undefined)
    setDialogOpen(true)
  }

  function handleEdit(provider: SearchProvider) {
    setEditing(provider)
    setDialogOpen(true)
  }

  function handleSubmit(values: ProviderFormValues) {
    if (editing) {
      updateProvider(editing.id, values)
      toast.success(t('providers.toasts.updated'))
    } else {
      addProvider(values)
      toast.success(t('providers.toasts.added'))
    }
  }

  function confirmDelete() {
    if (!pendingDelete) return
    removeProvider(pendingDelete.id)
    setPendingDelete(null)
    toast.success(t('providers.toasts.deleted'))
  }

  return (
    <div className="flex flex-col gap-2xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <Button size="sm" onClick={handleAdd}>
          <Plus className="size-4" />
          {t('providers.addProvider')}
        </Button>
      </div>

      {/* Activated */}
      <section className="flex flex-col gap-md">
        <h4 className="text-body-lg text-ink">
          {t('providers.activated')}{' '}
          <span className="text-body-mid">
            ({enabled.length}/{MAX_ENABLED_PROVIDERS})
          </span>
        </h4>
        {enabled.length === 0 ? (
          <p className="rounded-sm border border-hairline bg-canvas-soft px-lg py-md text-body-sm text-body-mid">
            {t('providers.emptyActivated')}
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={enabled.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-sm">
                {enabled.map((provider) => (
                  <SortableRow
                    key={provider.id}
                    provider={provider}
                    onDisable={() => disableProvider(provider.id)}
                    onDelete={() => setPendingDelete(provider)}
                    disableLabel={t('providers.disable')}
                    deleteLabel={t('providers.delete')}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {/* Available */}
      <section className="flex flex-col gap-md">
        <h4 className="text-body-lg text-ink">{t('providers.available')}</h4>
        {available.length === 0 ? (
          <p className="rounded-sm border border-hairline bg-canvas-soft px-lg py-md text-body-sm text-body-mid">
            {t('providers.emptyAvailable')}
          </p>
        ) : (
          <ul className="flex flex-col gap-sm">
            {available.map((provider) => (
              <li
                key={provider.id}
                className="flex items-center gap-md rounded-sm border border-hairline bg-canvas-soft px-lg py-md"
              >
                <IconRenderer
                  icon={provider.icon}
                  className="size-5 shrink-0"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body-md text-ink">
                    {provider.name}
                  </span>
                  {provider.description ? (
                    <span className="truncate text-body-sm text-body-mid">
                      {provider.description}
                    </span>
                  ) : null}
                </div>
                {!provider.builtin ? (
                  <>
                    <IconButton
                      label={t('providers.edit')}
                      onClick={() => handleEdit(provider)}
                    >
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton
                      label={t('providers.delete')}
                      danger
                      onClick={() => setPendingDelete(provider)}
                    >
                      <Trash2 className="size-4" />
                    </IconButton>
                  </>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEnable(provider.id)}
                >
                  {t('providers.enable')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProviderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        provider={editing}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation (user providers only). */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <DialogContent className="max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>
              {t('providers.confirmDelete.title', {
                name: pendingDelete?.name ?? '',
              })}
            </DialogTitle>
            <DialogDescription>
              {t('providers.confirmDelete.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              {t('providers.confirmDelete.cancel')}
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t('providers.confirmDelete.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Small square icon-button used for row actions. */
function IconButton({
  label,
  danger = false,
  onClick,
  children,
}: {
  label: string
  danger?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={
        danger
          ? 'flex size-8 shrink-0 items-center justify-center rounded-full text-body-mid outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring'
          : 'flex size-8 shrink-0 items-center justify-center rounded-full text-body-mid outline-none transition-colors hover:bg-canvas-mid hover:text-ink focus-visible:ring-2 focus-visible:ring-ring'
      }
    >
      {children}
    </button>
  )
}

/** A draggable row in the Activated list. */
function SortableRow({
  provider,
  onDisable,
  onDelete,
  disableLabel,
  deleteLabel,
}: {
  provider: SearchProvider
  onDisable: () => void
  onDelete: () => void
  disableLabel: string
  deleteLabel: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: provider.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-md rounded-sm border border-hairline bg-canvas-soft px-lg py-md"
    >
      <button
        type="button"
        className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-body-mid outline-none transition-colors hover:bg-canvas-mid hover:text-ink focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <IconRenderer icon={provider.icon} className="size-5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body-md text-ink">{provider.name}</span>
        {provider.description ? (
          <span className="truncate text-body-sm text-body-mid">
            {provider.description}
          </span>
        ) : null}
      </div>
      {!provider.builtin ? (
        <IconButton label={deleteLabel} danger onClick={onDelete}>
          <Trash2 className="size-4" />
        </IconButton>
      ) : null}
      <Button size="sm" variant="outline" onClick={onDisable}>
        {disableLabel}
      </Button>
    </li>
  )
}
