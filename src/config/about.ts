/**
 * About page configuration
 * ---------------------------------------------------------------------------
 * Single source of truth for every link, developer detail, tech-stack entry,
 * roadmap item and third-party library metadata shown on the About page.
 *
 * RULES:
 *  - Never hardcode a URL inside the About component. Add it here instead.
 *  - Text that is user-facing (labels, descriptions) lives in i18n, not here —
 *    this file only owns links, identifiers and icon names.
 *  - The Open Source Libraries list is derived from package.json at build time
 *    (see vite.config.ts); this file only supplies optional metadata overrides
 *    (icon / homepage / license) keyed by package name.
 * ---------------------------------------------------------------------------
 */

/** Canonical external links for the project. */
export const PROJECT_LINKS = {
  github: 'https://github.com/kindyear/knav',
  repository: 'https://github.com/kindyear/knav',
  issues: 'https://github.com/kindyear/knav/issues',
  discussions: 'https://github.com/kindyear/knav/discussions',
  homepage: 'https://github.com/kindyear/knav',
  license: 'https://github.com/kindyear/knav/blob/main/LICENSE',
} as const

/** Developer contact links. */
export const DEVELOPER_LINKS = {
  blog: 'https://www.kindyear.cn',
  bilibili: 'https://space.bilibili.com/73565005',
  x: 'https://x.com/kindyear',
  email: 'mailto:me@kindyear.cn',
} as const

/** SPDX license identifier for the project. */
export const PROJECT_LICENSE = 'MIT'

/** Copyright metadata for the footer. */
export const COPYRIGHT = {
  year: 2026,
  holder: 'KINDYEAR',
} as const

export interface DeveloperEntry {
  /** i18n label key under `developer.fields`. */
  key: string
  /** Iconify icon name for the brand mark. */
  icon: string
  /** The literal value shown (identifier / handle / address). Not translated. */
  value: string
  /** Optional external link; when present an "Open" button is rendered. */
  href?: string
}

/** Developer information rows (icons + values). */
export const DEVELOPER_ENTRIES: DeveloperEntry[] = [
  { key: 'id', icon: 'lucide:user', value: 'KINDYEAR' },
  {
    key: 'blog',
    icon: 'lucide:globe',
    value: 'www.kindyear.cn',
    href: DEVELOPER_LINKS.blog,
  },
  {
    key: 'bilibili',
    icon: 'simple-icons:bilibili',
    value: 'space.bilibili.com/73565005',
    href: DEVELOPER_LINKS.bilibili,
  },
  {
    key: 'x',
    icon: 'simple-icons:x',
    value: '@kindyear',
    href: DEVELOPER_LINKS.x,
  },
  {
    key: 'email',
    icon: 'lucide:mail',
    value: 'me@kindyear.cn',
    href: DEVELOPER_LINKS.email,
  },
]

export interface TechStackEntry {
  /** Display name (brand names aren't translated). */
  name: string
  /** Iconify icon name. */
  icon: string
  /** Optional brand color; when omitted the icon inherits currentColor. */
  color?: string
}

/** Runtime environment labels shown in the Version card. */
export const ENVIRONMENT_ENTRIES: TechStackEntry[] = [
  { name: 'React', icon: 'simple-icons:react', color: '#61DAFB' },
  { name: 'TypeScript', icon: 'simple-icons:typescript', color: '#3178C6' },
  { name: 'Vite', icon: 'simple-icons:vite', color: '#646CFF' },
  { name: 'Tailwind CSS', icon: 'simple-icons:tailwindcss', color: '#06B6D4' },
]

export interface LibraryMeta {
  /** Iconify icon name (optional). */
  icon?: string
  /** Optional brand color. */
  color?: string
  /** Official website. */
  homepage?: string
  /** GitHub repository. */
  github?: string
  /** SPDX license identifier. */
  license?: string
}

/**
 * Optional metadata for known npm packages, keyed by package name. Anything
 * missing here still shows up (name + version from package.json); unknown
 * fields simply fall back to "Unknown" / hidden buttons.
 */
export const LIBRARY_META: Record<string, LibraryMeta> = {
  react: {
    icon: 'simple-icons:react',
    color: '#61DAFB',
    homepage: 'https://react.dev',
    github: 'https://github.com/facebook/react',
    license: 'MIT',
  },
  'react-dom': {
    icon: 'simple-icons:react',
    color: '#61DAFB',
    homepage: 'https://react.dev',
    github: 'https://github.com/facebook/react',
    license: 'MIT',
  },
  'react-router-dom': {
    icon: 'simple-icons:reactrouter',
    color: '#CA4245',
    homepage: 'https://reactrouter.com',
    github: 'https://github.com/remix-run/react-router',
    license: 'MIT',
  },
  zustand: {
    homepage: 'https://zustand-demo.pmnd.rs',
    github: 'https://github.com/pmndrs/zustand',
    license: 'MIT',
  },
  i18next: {
    icon: 'simple-icons:i18next',
    color: '#26A69A',
    homepage: 'https://www.i18next.com',
    github: 'https://github.com/i18next/i18next',
    license: 'MIT',
  },
  'react-i18next': {
    icon: 'simple-icons:i18next',
    color: '#26A69A',
    homepage: 'https://react.i18next.com',
    github: 'https://github.com/i18next/react-i18next',
    license: 'MIT',
  },
  '@iconify/react': {
    icon: 'simple-icons:iconify',
    color: '#1769AA',
    homepage: 'https://iconify.design',
    github: 'https://github.com/iconify/iconify',
    license: 'MIT',
  },
  'lucide-react': {
    icon: 'simple-icons:lucide',
    color: '#F56565',
    homepage: 'https://lucide.dev',
    github: 'https://github.com/lucide-icons/lucide',
    license: 'ISC',
  },
  sonner: {
    homepage: 'https://sonner.emilkowal.ski',
    github: 'https://github.com/emilkowalski/sonner',
    license: 'MIT',
  },
  clsx: {
    github: 'https://github.com/lukeed/clsx',
    license: 'MIT',
  },
  'tailwind-merge': {
    github: 'https://github.com/dcastil/tailwind-merge',
    license: 'MIT',
  },
  'tw-animate-css': {
    github: 'https://github.com/Wombosvideo/tw-animate-css',
    license: 'MIT',
  },
  'class-variance-authority': {
    homepage: 'https://cva.style',
    github: 'https://github.com/joe-bell/cva',
    license: 'Apache-2.0',
  },
  '@tanstack/react-virtual': {
    homepage: 'https://tanstack.com/virtual',
    github: 'https://github.com/TanStack/virtual',
    license: 'MIT',
  },
  '@dnd-kit/core': {
    homepage: 'https://dndkit.com',
    github: 'https://github.com/clauderic/dnd-kit',
    license: 'MIT',
  },
  '@dnd-kit/modifiers': {
    homepage: 'https://dndkit.com',
    github: 'https://github.com/clauderic/dnd-kit',
    license: 'MIT',
  },
  '@dnd-kit/sortable': {
    homepage: 'https://dndkit.com',
    github: 'https://github.com/clauderic/dnd-kit',
    license: 'MIT',
  },
  '@dnd-kit/utilities': {
    homepage: 'https://dndkit.com',
    github: 'https://github.com/clauderic/dnd-kit',
    license: 'MIT',
  },
  '@radix-ui/react-dialog': {
    icon: 'simple-icons:radixui',
    homepage: 'https://www.radix-ui.com',
    github: 'https://github.com/radix-ui/primitives',
    license: 'MIT',
  },
  '@radix-ui/react-label': {
    icon: 'simple-icons:radixui',
    homepage: 'https://www.radix-ui.com',
    github: 'https://github.com/radix-ui/primitives',
    license: 'MIT',
  },
  '@radix-ui/react-popover': {
    icon: 'simple-icons:radixui',
    homepage: 'https://www.radix-ui.com',
    github: 'https://github.com/radix-ui/primitives',
    license: 'MIT',
  },
  '@radix-ui/react-slot': {
    icon: 'simple-icons:radixui',
    homepage: 'https://www.radix-ui.com',
    github: 'https://github.com/radix-ui/primitives',
    license: 'MIT',
  },
  '@radix-ui/react-tabs': {
    icon: 'simple-icons:radixui',
    homepage: 'https://www.radix-ui.com',
    github: 'https://github.com/radix-ui/primitives',
    license: 'MIT',
  },
  vite: {
    icon: 'simple-icons:vite',
    color: '#646CFF',
    homepage: 'https://vite.dev',
    github: 'https://github.com/vitejs/vite',
    license: 'MIT',
  },
  typescript: {
    icon: 'simple-icons:typescript',
    color: '#3178C6',
    homepage: 'https://www.typescriptlang.org',
    github: 'https://github.com/microsoft/TypeScript',
    license: 'Apache-2.0',
  },
  tailwindcss: {
    icon: 'simple-icons:tailwindcss',
    color: '#06B6D4',
    homepage: 'https://tailwindcss.com',
    github: 'https://github.com/tailwindlabs/tailwindcss',
    license: 'MIT',
  },
  eslint: {
    icon: 'simple-icons:eslint',
    color: '#4B32C3',
    homepage: 'https://eslint.org',
    github: 'https://github.com/eslint/eslint',
    license: 'MIT',
  },
  prettier: {
    icon: 'simple-icons:prettier',
    color: '#F7B93E',
    homepage: 'https://prettier.io',
    github: 'https://github.com/prettier/prettier',
    license: 'MIT',
  },
}

export interface LibraryEntry {
  name: string
  version: string
  dev: boolean
  meta: LibraryMeta
}

/** Fallback icon for packages without a brand mark. */
export const LIBRARY_FALLBACK_ICON = 'lucide:package'

/**
 * Build the full library list from the package.json maps injected at build
 * time, merged with any known metadata. Sorted alphabetically, runtime deps
 * first. This means adding/removing a dependency automatically updates the
 * About page with no code change.
 */
export function getLibraries(): LibraryEntry[] {
  const toEntries = (
    map: Record<string, string>,
    dev: boolean
  ): LibraryEntry[] =>
    Object.entries(map).map(([name, version]) => ({
      name,
      version: version.replace(/^[\^~]/, ''),
      dev,
      meta: LIBRARY_META[name] ?? {},
    }))

  const deps = toEntries(__APP_DEPENDENCIES__ ?? {}, false)
  const devDeps = toEntries(__APP_DEV_DEPENDENCIES__ ?? {}, true)

  const byName = (a: LibraryEntry, b: LibraryEntry) =>
    a.name.localeCompare(b.name)
  return [...deps.sort(byName), ...devDeps.sort(byName)]
}

/** Build metadata (version / build time / node version) for the Version card. */
export const BUILD_INFO = {
  version: __APP_VERSION__,
  buildTime: __APP_BUILD_TIME__,
  nodeVersion: __APP_NODE_VERSION__,
} as const
