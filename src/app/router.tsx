import { createBrowserRouter } from 'react-router'
import { GardenMapPage } from '@/features/garden-map/GardenMapPage'
import { PlantDetailPage } from '@/features/plants/PlantDetailPage'
import { PlantsPage } from '@/features/plants/PlantsPage'
import { TodayPage } from '@/features/tasks/TodayPage'
import { Layout } from './Layout'

function Placeholder({ title }: { title: string }) {
  return <h1 className="text-xl font-semibold">{title}</h1>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'mapa', element: <GardenMapPage /> },
      { path: 'plantas', element: <PlantsPage /> },
      { path: 'plantas/:plantId', element: <PlantDetailPage /> },
      { path: 'temporada', element: <Placeholder title="Temporada" /> },
      { path: 'ajustes', element: <Placeholder title="Ajustes" /> },
    ],
  },
])
