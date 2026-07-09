import { getCollectionName } from './iconCollections'

/** Base URL of the public Iconify API. */
const ICONIFY_API = 'https://api.iconify.design'

/**
 * Parsed representation of an Iconify icon name (`prefix:name`).
 */
export interface ParsedIcon {
  /** Full Iconify name, e.g. `simple-icons:google`. */
  icon: string
  /** Collection prefix, e.g. `simple-icons`. */
  prefix: string
  /** Icon name within the collection, e.g. `google`. */
  name: string
}

/** Parse an Iconify name into its prefix + name parts. */
export function parseIcon(icon: string): ParsedIcon {
  const idx = icon.indexOf(':')
  if (idx === -1) return { icon, prefix: '', name: icon }
  return {
    icon,
    prefix: icon.slice(0, idx),
    name: icon.slice(idx + 1),
  }
}

/** Whether a string looks like a valid Iconify name (`prefix:name`). */
export function isIconifyName(icon: string): boolean {
  return /^[a-z0-9-]+:[a-z0-9-]+$/.test(icon)
}

/**
 * Legacy → Iconify migration map.
 *
 * Older data stored either a bare slug (`"google"`) or a react-icons component
 * key (`"SiGoogle"`, `"BsOpenai"`, `"LuGlobe"`). Map the ones we shipped to
 * their Iconify equivalents so persisted data keeps working.
 */
const LEGACY_ICON_MAP: Record<string, string> = {
  // bare provider/site slugs
  google: 'simple-icons:google',
  bing: 'simple-icons:microsoftbing',
  duckduckgo: 'simple-icons:duckduckgo',
  chatgpt: 'simple-icons:openai',
  claude: 'simple-icons:claude',
  perplexity: 'simple-icons:perplexity',
  github: 'simple-icons:github',

  // react-icons/si (SearchProvider registry)
  SiGoogle: 'simple-icons:google',
  SiDuckduckgo: 'simple-icons:duckduckgo',
  SiClaude: 'simple-icons:claude',
  SiAnthropic: 'simple-icons:anthropic',
  SiPerplexity: 'simple-icons:perplexity',
  SiDeepseek: 'simple-icons:deepseek',
  SiGooglegemini: 'simple-icons:googlegemini',
  SiHuggingface: 'simple-icons:huggingface',
  SiGithub: 'simple-icons:github',
  SiGitlab: 'simple-icons:gitlab',
  SiStackoverflow: 'simple-icons:stackoverflow',
  SiDocker: 'simple-icons:docker',
  SiNpm: 'simple-icons:npm',
  SiPypi: 'simple-icons:pypi',
  SiMdnwebdocs: 'simple-icons:mdnwebdocs',
  SiBrave: 'simple-icons:brave',
  SiEcosia: 'simple-icons:ecosia',
  SiStartpage: 'simple-icons:startpage',
  SiKagi: 'simple-icons:kagi',
  SiQwant: 'simple-icons:qwant',
  SiNaver: 'simple-icons:naver',
  SiSogou: 'simple-icons:sogou',
  SiBaidu: 'simple-icons:baidu',
  SiWikipedia: 'simple-icons:wikipedia',
  SiWikimediacommons: 'simple-icons:wikimediacommons',
  SiArxiv: 'simple-icons:arxiv',
  SiGooglescholar: 'simple-icons:googlescholar',
  SiReddit: 'simple-icons:reddit',
  SiX: 'simple-icons:x',
  SiTelegram: 'simple-icons:telegram',
  SiYoutube: 'simple-icons:youtube',
  SiYoutubemusic: 'simple-icons:youtubemusic',
  SiSpotify: 'simple-icons:spotify',
  SiBilibili: 'simple-icons:bilibili',
  SiGmail: 'simple-icons:gmail',
  SiGoogledrive: 'simple-icons:googledrive',
  SiGoogletranslate: 'simple-icons:googletranslate',
  SiGooglemaps: 'simple-icons:googlemaps',
  SiGooglecalendar: 'simple-icons:googlecalendar',
  SiVercel: 'simple-icons:vercel',
  SiCloudflare: 'simple-icons:cloudflare',
  SiDiscord: 'simple-icons:discord',
  SiSteam: 'simple-icons:steam',
  SiTwitch: 'simple-icons:twitch',
  SiThreads: 'simple-icons:threads',
  SiInstagram: 'simple-icons:instagram',
  SiFacebook: 'simple-icons:facebook',
  SiWhatsapp: 'simple-icons:whatsapp',
  SiWechat: 'simple-icons:wechat',
  SiZhihu: 'simple-icons:zhihu',
  SiPinterest: 'simple-icons:pinterest',
  SiMedium: 'simple-icons:medium',
  SiNotion: 'simple-icons:notion',
  SiFigma: 'simple-icons:figma',
  SiDribbble: 'simple-icons:dribbble',
  SiBehance: 'simple-icons:behance',
  SiProducthunt: 'simple-icons:producthunt',
  SiPython: 'simple-icons:python',
  SiNodedotjs: 'simple-icons:nodedotjs',
  SiReact: 'simple-icons:react',
  SiVuedotjs: 'simple-icons:vuedotjs',
  SiTailwindcss: 'simple-icons:tailwindcss',
  // react-icons/bs
  BsBing: 'simple-icons:microsoftbing',
  BsOpenai: 'simple-icons:openai',
  BsMicrosoft: 'simple-icons:microsoft',
  BsAmazon: 'simple-icons:amazon',
  BsSearch: 'lucide:search',
  // react-icons/lu (QuickAccess fallbacks)
  LuGlobe: 'lucide:globe',
  LuLink: 'lucide:link',
  LuBookmark: 'lucide:bookmark',
  LuStar: 'lucide:star',
  LuHouse: 'lucide:house',
  LuMail: 'lucide:mail',
  LuCloud: 'lucide:cloud',
  LuServer: 'lucide:server',
  LuCode: 'lucide:code',
  LuTerminal: 'lucide:terminal',
  LuMusic: 'lucide:music',
  LuVideo: 'lucide:video',
  LuImage: 'lucide:image',
  LuShoppingCart: 'lucide:shopping-cart',
  LuNewspaper: 'lucide:newspaper',
  LuFileText: 'lucide:file-text',
  LuMessageCircle: 'lucide:message-circle',
  LuBriefcase: 'lucide:briefcase',
  LuGraduationCap: 'lucide:graduation-cap',
  LuGamepad2: 'lucide:gamepad-2',
}

/** Icon used when an icon key is empty or cannot be resolved. */
export const FALLBACK_ICON = 'lucide:globe'

/**
 * Normalize any stored icon value into a valid Iconify name.
 *
 * Handles three legacy shapes so persisted data never breaks:
 * - already Iconify (`simple-icons:google`) → unchanged
 * - known legacy key (`SiGoogle`, `google`, `LuGlobe`) → mapped
 * - anything else → treated as a Simple Icons slug, else the fallback
 */
export function migrateIconValue(value: string | undefined | null): string {
  if (!value) return FALLBACK_ICON
  const v = value.trim()
  if (isIconifyName(v)) return v
  if (LEGACY_ICON_MAP[v]) return LEGACY_ICON_MAP[v]
  // Bare lowercase slug with no prefix — assume a brand (Simple Icons).
  if (/^[a-z0-9-]+$/.test(v)) return `simple-icons:${v}`
  return FALLBACK_ICON
}

/** Build the display metadata for an icon (name + collection). */
export function getIconMeta(icon: string): {
  icon: string
  name: string
  collection: string
} {
  const parsed = parseIcon(icon)
  return {
    icon,
    name: parsed.name,
    collection: getCollectionName(parsed.prefix),
  }
}

/* --------------------------------------------------------------------------
 * Iconify API access (search + browse), with in-memory caching.
 * ------------------------------------------------------------------------ */

/** In-memory caches so we never re-request the same data within a session. */
const searchCache = new Map<string, string[]>()
const collectionCache = new Map<string, string[]>()

/** Cap results so the virtual grid never has to handle unbounded lists. */
const SEARCH_LIMIT = 200
const COLLECTION_LIMIT = 500

/**
 * Search icons across the given collection prefixes.
 * Returns a list of full Iconify names. Cached by (query + prefixes).
 */
export async function searchIcons(
  query: string,
  prefixes: string[],
  signal?: AbortSignal
): Promise<string[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const key = `${q}::${prefixes.join(',')}`
  const cached = searchCache.get(key)
  if (cached) return cached

  const params = new URLSearchParams({
    query: q,
    limit: String(SEARCH_LIMIT),
  })
  if (prefixes.length) params.set('prefixes', prefixes.join(','))

  const res = await fetch(`${ICONIFY_API}/search?${params.toString()}`, {
    signal,
  })
  if (!res.ok) throw new Error(`Iconify search failed: ${res.status}`)
  const data = (await res.json()) as { icons?: string[] }
  const icons = data.icons ?? []
  searchCache.set(key, icons)
  return icons
}

/**
 * List icons in a single collection (browse mode). Returns full Iconify names.
 * Cached by prefix. Capped at COLLECTION_LIMIT for picker performance.
 */
export async function listCollectionIcons(
  prefix: string,
  signal?: AbortSignal
): Promise<string[]> {
  const cached = collectionCache.get(prefix)
  if (cached) return cached

  const res = await fetch(`${ICONIFY_API}/collection?prefix=${prefix}`, {
    signal,
  })
  if (!res.ok) throw new Error(`Iconify collection failed: ${res.status}`)
  const data = (await res.json()) as {
    uncategorized?: string[]
    categories?: Record<string, string[]>
  }
  const names: string[] = []
  if (data.uncategorized) names.push(...data.uncategorized)
  if (data.categories) {
    for (const list of Object.values(data.categories)) names.push(...list)
  }
  const icons = names.slice(0, COLLECTION_LIMIT).map((n) => `${prefix}:${n}`)
  collectionCache.set(prefix, icons)
  return icons
}

/** Browse (no search) across several collections, de-duplicated. */
export async function browseIcons(
  prefixes: string[],
  signal?: AbortSignal
): Promise<string[]> {
  const lists = await Promise.all(
    prefixes.map((p) => listCollectionIcons(p, signal).catch(() => []))
  )
  return lists.flat()
}
