/**
 * ConfigManager — the single entry point for config export / import / reset /
 * clear. Modules register themselves with a `key` (their slot under `data`) and
 * three hooks (serialize / restore / reset). Adding a new persisted module later
 * means registering it here — no changes to the import/export pipeline.
 *
 * User-uploaded wallpaper blobs live in IndexedDB and are handled centrally:
 * exported as Base64 (one at a time), restored one at a time with per-item
 * error isolation so a single bad image never aborts the whole restore.
 */

import { useSettingsStore } from '@/stores/settings'
import { useWallpaperStore } from '@/stores/wallpaper'
import { useReadabilityStore } from '@/stores/readability'
import { useProviderStore } from '@/features/search/providerStore'
import { useSearchProviderStore } from '@/features/search/use-search-provider-store'
import { useSearchHistoryStore } from '@/features/search/use-search-history-store'
import { useQuickAccessStore } from '@/features/quick-access/quickAccessStore'
import { useRecentIconsStore } from '@/components/icon-system/useRecentIcons'
import { createDefaultWallpaperConfig } from '@/config/wallpaper'
import { createDefaultProviders } from '@/features/search/defaultProviders'
import { createDefaultQuickAccess } from '@/features/quick-access/defaultQuickAccess'
import { createDefaultReadabilitySettings } from '@/config/readability'
import { isValidGeneral } from '@/services/settingsService'
import {
  clearAllLocalWallpapers,
  getAllLocalWallpapers,
  saveLocalWallpaperBlobById,
} from '@/services/localWallpaperStore'
import { blobToBase64, base64ToBlob } from './blob'
import { isKnavEnvelope, isValidWallpaperExport } from './validate'
import {
  CONFIG_APP_NAME,
  CONFIG_VERSION,
  type ConfigEnvelope,
  type ConfigModule,
  type ImportReport,
  type WallpaperExport,
} from './types'

// ── Module registry ──────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

/**
 * Registered modules. Order matters for restore (search selection is validated
 * against providers, so providers restore first via the combined search module).
 */
const MODULES: ConfigModule[] = [
  // General settings (language / theme / clock / locale …).
  {
    key: 'general',
    serialize: () => useSettingsStore.getState().general,
    restore: (value) => {
      if (isValidGeneral(value)) {
        useSettingsStore.getState().setGeneral(value)
      }
    },
    reset: () => useSettingsStore.getState().reset(),
  },

  // Background / wallpaper configuration (blobs handled separately).
  {
    key: 'background',
    serialize: () => ({ config: useWallpaperStore.getState().config }),
    restore: (value) => {
      if (!isRecord(value) || !isRecord(value.config)) return
      const base = createDefaultWallpaperConfig()
      const saved = value.config as Record<string, unknown>
      useWallpaperStore.setState({
        config: {
          type: (saved.type as typeof base.type) ?? base.type,
          solid: { ...base.solid, ...(saved.solid as object) },
          gradient: { ...base.gradient, ...(saved.gradient as object) },
          bing: { ...base.bing, ...(saved.bing as object) },
          local: {
            fileName:
              (isRecord(saved.local) && typeof saved.local.fileName === 'string'
                ? saved.local.fileName
                : '') || '',
          },
        },
      })
    },
    reset: () =>
      useWallpaperStore.setState({ config: createDefaultWallpaperConfig() }),
  },

  // Search: providers + current selection.
  {
    key: 'search',
    serialize: () => ({
      providers: useProviderStore.getState().providers,
      selectedId: useSearchProviderStore.getState().providerId,
    }),
    restore: (value) => {
      if (!isRecord(value)) return
      if (Array.isArray(value.providers)) {
        useProviderStore.getState().replaceAll(value.providers)
      }
      if (typeof value.selectedId === 'string') {
        useSearchProviderStore.setState({ providerId: value.selectedId })
      }
    },
    reset: () => {
      useProviderStore.setState({ providers: createDefaultProviders() })
      useSearchProviderStore.setState({ providerId: '' })
    },
  },

  // Search history.
  {
    key: 'history',
    serialize: () => ({ entries: useSearchHistoryStore.getState().entries }),
    restore: (value) => {
      if (isRecord(value) && Array.isArray(value.entries)) {
        useSearchHistoryStore.setState({ entries: value.entries })
      }
    },
    reset: () => useSearchHistoryStore.getState().clear(),
  },

  // Quick access ("favorites").
  {
    key: 'favorites',
    serialize: () => ({ items: useQuickAccessStore.getState().items }),
    restore: (value) => {
      if (isRecord(value) && Array.isArray(value.items)) {
        useQuickAccessStore.getState().replaceAll(value.items)
      }
    },
    reset: () =>
      useQuickAccessStore.setState({ items: createDefaultQuickAccess() }),
  },

  // Readability (overlay/glass prefs + analysis cache).
  {
    key: 'readability',
    serialize: () => ({
      settings: useReadabilityStore.getState().settings,
      analysisCache: useReadabilityStore.getState().analysisCache,
    }),
    restore: (value) => {
      if (!isRecord(value)) return
      const patch: Record<string, unknown> = {}
      if (isRecord(value.settings)) patch.settings = value.settings
      if (isRecord(value.analysisCache))
        patch.analysisCache = value.analysisCache
      if (Object.keys(patch).length) useReadabilityStore.setState(patch)
    },
    reset: () =>
      useReadabilityStore.setState({
        settings: createDefaultReadabilitySettings(),
        analysisCache: {},
      }),
  },

  // Recently-used icons.
  {
    key: 'recentIcons',
    serialize: () => ({ recent: useRecentIconsStore.getState().recent }),
    restore: (value) => {
      if (isRecord(value) && Array.isArray(value.recent)) {
        useRecentIconsStore.setState({ recent: value.recent as string[] })
      }
    },
    reset: () => useRecentIconsStore.setState({ recent: [] }),
  },
]

/** All localStorage keys owned by KNav (derived once, used by Clear). */
export const KNAV_LOCALSTORAGE_KEYS = [
  'knav.settings',
  'knav.wallpaper',
  'knav.readability',
  'searchProviders',
  'knav-search-provider',
  'knav-search-history',
  'quickAccess',
  'knav-recent-icons',
] as const

// ── Wallpaper helpers ────────────────────────────────────────────────────────

/** Decode a blob's pixel dimensions (best-effort; 0×0 on failure). */
function getImageSize(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const size = { width: img.naturalWidth, height: img.naturalHeight }
      URL.revokeObjectURL(url)
      resolve(size)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ width: 0, height: 0 })
    }
    img.src = url
  })
}

/** Read + encode every stored wallpaper sequentially (memory-friendly). */
async function exportWallpapers(): Promise<WallpaperExport[]> {
  const stored = await getAllLocalWallpapers()
  const out: WallpaperExport[] = []
  const activeName = useWallpaperStore.getState().config.local.fileName
  // Sequential: one image encoded at a time, then released.
  for (const { id, blob } of stored) {
    const base64 = await blobToBase64(blob)
    const { width, height } = await getImageSize(blob)
    out.push({
      id,
      name: activeName || id,
      mime: blob.type || 'application/octet-stream',
      width,
      height,
      size: blob.size,
      blob: base64,
    })
  }
  return out
}

// ── Export ───────────────────────────────────────────────────────────────────

/** Build the full export envelope (includes wallpaper blobs as Base64). */
export async function buildExportEnvelope(): Promise<ConfigEnvelope> {
  const data: Record<string, unknown> = {}
  for (const mod of MODULES) {
    data[mod.key] = mod.serialize()
  }
  data.wallpapers = await exportWallpapers()
  return {
    app: CONFIG_APP_NAME,
    version: CONFIG_VERSION,
    exportTime: new Date().toISOString(),
    data,
  }
}

/** Serialize the envelope to a pretty JSON Blob (for download + size check). */
export async function buildExportBlob(): Promise<Blob> {
  const envelope = await buildExportEnvelope()
  const json = JSON.stringify(envelope, null, 2)
  return new Blob([json], { type: 'application/json' })
}

// ── Import ───────────────────────────────────────────────────────────────────

/**
 * Restore an imported v2 envelope into all stores + IndexedDB. Config modules
 * restore first, then wallpapers one at a time with per-item error isolation so
 * a single bad image never aborts the whole restore. Throws only when the file
 * isn't a valid KNav v2 config.
 */
export async function importEnvelope(input: unknown): Promise<ImportReport> {
  if (!isKnavEnvelope(input)) {
    throw new Error('NOT_KNAV_CONFIG')
  }
  const envelope: ConfigEnvelope = input

  const report: ImportReport = {
    modulesRestored: 0,
    wallpapersRestored: 0,
    wallpapersFailed: 0,
  }

  // Restore config modules (each isolated so one failure can't abort the rest).
  for (const mod of MODULES) {
    const slice = envelope.data[mod.key]
    if (slice === undefined) continue
    try {
      mod.restore(slice)
      report.modulesRestored += 1
    } catch {
      // Skip a broken module; continue with the others.
    }
  }

  // Restore wallpapers sequentially with per-item isolation.
  const wallpapers = Array.isArray(envelope.data.wallpapers)
    ? envelope.data.wallpapers
    : []
  for (const entry of wallpapers) {
    if (!isValidWallpaperExport(entry)) {
      report.wallpapersFailed += 1
      continue
    }
    try {
      const blob = base64ToBlob(entry.blob, entry.mime)
      await saveLocalWallpaperBlobById(entry.id, blob)
      report.wallpapersRestored += 1
    } catch {
      report.wallpapersFailed += 1
    }
  }

  // Refresh the active local wallpaper object URL so it shows without a reload.
  try {
    await useWallpaperStore.getState().hydrateLocal()
  } catch {
    // Non-fatal: a reload will hydrate it anyway.
  }

  return report
}

// ── Reset (restore defaults) ─────────────────────────────────────────────────

/**
 * Restore every module to its defaults and wipe all stored wallpaper blobs.
 * In-memory stores update immediately; persist middleware writes the defaults
 * back to localStorage.
 */
export async function resetAll(): Promise<void> {
  for (const mod of MODULES) {
    try {
      mod.reset()
    } catch {
      // Continue resetting the rest even if one throws.
    }
  }
  await clearAllLocalWallpapers()
}

// ── Clear local data ──────────────────────────────────────────────────────────

/**
 * Nuke all local persistence: localStorage keys, IndexedDB wallpapers, and any
 * Cache Storage entries. The caller is expected to reload so every store
 * re-hydrates from the now-empty storage.
 */
export async function clearAllLocalData(): Promise<void> {
  // localStorage
  for (const key of KNAV_LOCALSTORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // best-effort
    }
  }

  // IndexedDB wallpapers
  try {
    await clearAllLocalWallpapers()
  } catch {
    // best-effort
  }

  // Cache Storage (and any Service Worker caches)
  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      for (const k of keys) await caches.delete(k)
    }
  } catch {
    // best-effort
  }
}
