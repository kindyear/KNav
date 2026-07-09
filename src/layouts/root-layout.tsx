import type { ReactNode } from 'react'
import { Footer } from '@/components/home/Footer'
import { BackgroundOverlay } from '@/components/settings/background/BackgroundOverlay'
import { BackgroundReadabilityManager } from '@/components/settings/background/BackgroundReadabilityManager'
import { WallpaperRenderer } from '@/components/settings/background/WallpaperRenderer'

/**
 * RootLayout
 * The single app shell wrapper. Layer order (bottom → top):
 *   WallpaperRenderer (-z-10) → BackgroundOverlay (-z-9) → page content.
 * BackgroundReadabilityManager is headless; it writes readability CSS variables
 * that drive the overlay, glass surfaces, and foreground text colors.
 */
export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <WallpaperRenderer />
      <BackgroundOverlay />
      <BackgroundReadabilityManager />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}
