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
import { GripVertical, Plus, Pencil, Trash2, EyeOff } from 'lucide-react'
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
import { QuickAccessIcon } from './quick-access-icon'
import { QuickAccessDialog } from './QuickAccessDialog'
import { useQuickAccessStore } from './quickAccessStore'
import {
  MAX_QUICK_ACCESS_ITEMS,
  getEnabledItems,
  getHiddenItems,
} from './quickAccessUtils'
import type { QuickAccessFormValues, QuickAccessItem } from './quickAccessTypes'

/**
 * QuickAccessManager
 * Full Quick Access management UI for the settings page:
 * - "Activated (X/128)" — enabled tiles, drag-to-reorder, per-item hide, edit,
 *   and delete.
 * - "Hidden" — disabled tiles with enable, edit, and delete.
 * Every item (builtin included) is fully editable and deletable. All state
 * lives in the quick-access store and is persisted immediately.
 */
export function QuickAccessManager() {
  const { t } = useTranslation('quickAccess')
  const items = useQuickAccessStore((s) => s.items)
  const enableItem = useQuickAccessStore((s) => s.enableItem)
  const disableItem = useQuickAccessStore((s) => s.disableItem)
  const removeItem = useQuickAccessStore((s) => s.removeItem)
  const reorderEnabled = useQuickAccessStore((s) => s.reorderEnabled)
  const addItem = useQuickAccessStore((s) => s.addItem)
  const updateItem = useQuickAccessStore((s) => s.updateItem)

  const enabled = useMemo(() => getEnabledItems(items), [items])
  const hidden = useMemo(() => getHiddenItems(items), [items])
  const atLimit = items.length >= MAX_QUICK_ACCESS_ITEMS

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<QuickAccessItem | undefined>(undefined)
  const [pendingDelete, setPendingDelete] = useState<QuickAccessItem | null>(
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
    const ids = enabled.map((i) => i.id)
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from === -1 || to === -1) return
    const reordered = [...ids]
    reordered.splice(to, 0, reordered.splice(from, 1)[0])
    reorderEnabled(reordered)
  }

  function handleAdd() {
    if (atLimit) {
      toast.error(t('manager.limitReached', { max: MAX_QUICK_ACCESS_ITEMS }))
      return
    }
    setEditing(undefined)
    setDialogOpen(true)
  }

  function handleEdit(item: QuickAccessItem) {
    setEditing(item)
    setDialogOpen(true)
  }

  function handleSubmit(values: QuickAccessFormValues) {
    if (editing) {
      updateItem(editing.id, values)
      toast.success(t('manager.toasts.updated'))
    } else {
      if (addItem(values) === 'limit-reached') {
        toast.error(t('manager.limitReached', { max: MAX_QUICK_ACCESS_ITEMS }))
        return
      }
      toast.success(t('manager.toasts.added'))
    }
  }

  function confirmDelete() {
    if (!pendingDelete) return
    removeItem(pendingDelete.id)
    setPendingDelete(null)
    toast.success(t('manager.toasts.deleted'))
  }

  return (
    <div className="flex flex-col gap-2xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <Button size="sm" onClick={handleAdd} disabled={atLimit}>
          <Plus className="size-4" />
          {t('manager.addWebsite')}
        </Button>
      </div>

      {/* Activated */}
      <section className="flex flex-col gap-md">
        <h4 className="text-body-lg text-ink">
          {t('manager.activated')}{' '}
          <span className="text-body-mid">
            ({items.length}/{MAX_QUICK_ACCESS_ITEMS})
          </span>
        </h4>
        {enabled.length === 0 ? (
          <p className="rounded-sm border border-hairline bg-canvas-soft px-lg py-md text-body-sm text-body-mid">
            {t('manager.emptyActivated')}
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={enabled.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-sm">
                {enabled.map((item) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    onHide={() => disableItem(item.id)}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => setPendingDelete(item)}
                    hideLabel={t('manager.hide')}
                    editLabel={t('manager.edit')}
                    deleteLabel={t('manager.delete')}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {/* Hidden */}
      <section className="flex flex-col gap-md">
        <h4 className="text-body-lg text-ink">{t('manager.hidden')}</h4>
        {hidden.length === 0 ? (
          <p className="rounded-sm border border-hairline bg-canvas-soft px-lg py-md text-body-sm text-body-mid">
            {t('manager.emptyHidden')}
          </p>
        ) : (
          <ul className="flex flex-col gap-sm">
            {hidden.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-md rounded-sm border border-hairline bg-canvas-soft px-lg py-md"
              >
                <QuickAccessIcon
                  iconKey={item.icon}
                  accentColor={item.accentColor}
                  className="size-5 shrink-0"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body-md text-ink">
                    {item.name}
                  </span>
                  <span className="truncate text-body-sm text-body-mid">
                    {item.url}
                  </span>
                </div>
                <IconButton
                  label={t('manager.edit')}
                  onClick={() => handleEdit(item)}
                >
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton
                  label={t('manager.delete')}
                  danger
                  onClick={() => setPendingDelete(item)}
                >
                  <Trash2 className="size-4" />
                </IconButton>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => enableItem(item.id)}
                >
                  {t('manager.enable')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <QuickAccessDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editing}
        onSubmit={handleSubmit}
      />

      {/* Delete confirmation. */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <DialogContent className="max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>
              {t('manager.confirmDelete.title', {
                name: pendingDelete?.name ?? '',
              })}
            </DialogTitle>
            <DialogDescription>
              {t('manager.confirmDelete.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              {t('manager.confirmDelete.cancel')}
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t('manager.confirmDelete.delete')}
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
  item,
  onHide,
  onEdit,
  onDelete,
  hideLabel,
  editLabel,
  deleteLabel,
}: {
  item: QuickAccessItem
  onHide: () => void
  onEdit: () => void
  onDelete: () => void
  hideLabel: string
  editLabel: string
  deleteLabel: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

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
      <QuickAccessIcon
        iconKey={item.icon}
        accentColor={item.accentColor}
        className="size-5 shrink-0"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body-md text-ink">{item.name}</span>
        <span className="truncate text-body-sm text-body-mid">{item.url}</span>
      </div>
      <IconButton label={editLabel} onClick={onEdit}>
        <Pencil className="size-4" />
      </IconButton>
      <IconButton label={deleteLabel} danger onClick={onDelete}>
        <Trash2 className="size-4" />
      </IconButton>
      <IconButton label={hideLabel} onClick={onHide}>
        <EyeOff className="size-4" />
      </IconButton>
    </li>
  )
}
