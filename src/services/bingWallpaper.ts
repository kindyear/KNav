import {
  BING_MAX_POOL,
  BING_ORIGIN,
  buildBingEndpoint,
} from '@/config/wallpaper'
import type { BingImageDto } from '@/types/wallpaper'

/** Normalized daily image returned by the Bing service. */
export interface BingDailyImage {
  title: string
  copyright: string
  /** Absolute image URL. */
  url: string
  /** yyyymmdd from Bing. */
  date: string
}

interface BingApiResponse {
  images?: BingImageDto[]
}

/** Today's date as an ISO day string (yyyy-mm-dd) in local time. */
export function todayIso(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whether a cached ISO date is different from today (i.e. needs refresh). */
export function isStale(lastFetchDate: string): boolean {
  return lastFetchDate !== todayIso()
}

/** Turn Bing's relative url fragment into an absolute image URL. */
function absolutizeUrl(fragment: string): string {
  if (!fragment) return ''
  if (fragment.startsWith('http')) return fragment
  return `${BING_ORIGIN}${fragment}`
}

/** Map a raw Bing image DTO into our normalized shape. */
function toDailyImage(image: BingImageDto): BingDailyImage {
  return {
    title: image.title ?? '',
    copyright: image.copyright ?? '',
    url: absolutizeUrl(image.url ?? ''),
    date: image.startdate ?? '',
  }
}

/**
 * Fetch up to `count` recent Bing images from the public HPImageArchive
 * endpoint. Throws on network/parse failure so callers can fall back to cache.
 */
export async function fetchBingImages(
  count = 1,
  signal?: AbortSignal
): Promise<BingDailyImage[]> {
  const res = await fetch(buildBingEndpoint(count), { signal })
  if (!res.ok) {
    throw new Error(`BING_HTTP_${res.status}`)
  }
  const json = (await res.json()) as BingApiResponse
  const images = json.images ?? []
  if (images.length === 0) {
    throw new Error('BING_EMPTY_RESPONSE')
  }
  return images.map(toDailyImage)
}

/** Fetch today's single Bing image (daily mode). */
export async function fetchBingDailyImage(
  signal?: AbortSignal
): Promise<BingDailyImage> {
  const [first] = await fetchBingImages(1, signal)
  return first
}

/**
 * Fetch the recent pool and return a random image from it (random mode).
 * A larger pool gives more variety on each open.
 */
export async function fetchBingRandomImage(
  signal?: AbortSignal
): Promise<BingDailyImage> {
  const images = await fetchBingImages(BING_MAX_POOL, signal)
  const index = Math.floor(Math.random() * images.length)
  return images[index]
}
