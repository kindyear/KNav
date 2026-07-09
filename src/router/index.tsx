import { createBrowserRouter } from 'react-router-dom'
import { HomeRoute } from './routes'

/**
 * Application router.
 * Only the root route exists in this phase; feature routes are added later.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeRoute />,
  },
])
