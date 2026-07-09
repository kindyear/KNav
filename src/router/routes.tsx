import App from '@/app/App'
import { RootLayout } from '@/layouts/root-layout'

/**
 * Route element for the home path.
 * No home page is built in this phase — App renders the placeholder only.
 */
export function HomeRoute() {
  return (
    <RootLayout>
      <App />
    </RootLayout>
  )
}
