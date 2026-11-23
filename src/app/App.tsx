import { RouterProvider } from 'react-router'
import { ReloadPrompt } from '@/ui/ReloadPrompt'
import { Providers } from './Providers'
import { router } from './router'

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <ReloadPrompt />
    </Providers>
  )
}
