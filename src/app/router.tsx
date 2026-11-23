import { createBrowserRouter } from 'react-router'
import { Layout } from './Layout'

function Placeholder({ title }: { title: string }) {
  return <h1 className="text-xl font-semibold">{title}</h1>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Placeholder title="Hoy" /> },
      { path: 'mapa', element: <Placeholder title="Mapa" /> },
      { path: 'plantas', element: <Placeholder title="Plantas" /> },
      { path: 'temporada', element: <Placeholder title="Temporada" /> },
      { path: 'ajustes', element: <Placeholder title="Ajustes" /> },
    ],
  },
])
