/// <reference types="vite/client" />

/** App version injected at build time from package.json (see vite.config.ts). */
declare const __APP_VERSION__: string

/** ISO timestamp of the build, injected at build time (see vite.config.ts). */
declare const __APP_BUILD_TIME__: string

/** Node.js version used for the build, injected at build time. */
declare const __APP_NODE_VERSION__: string

/** package.json `dependencies` map, injected at build time. */
declare const __APP_DEPENDENCIES__: Record<string, string>

/** package.json `devDependencies` map, injected at build time. */
declare const __APP_DEV_DEPENDENCIES__: Record<string, string>
