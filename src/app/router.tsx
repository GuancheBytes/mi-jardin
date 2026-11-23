import { createBrowserRouter } from 'react-router'
import { GardenMapPage } from '@/features/garden-map/GardenMapPage'
import { PlantDetailPage } from '@/features/plants/PlantDetailPage'
import { PlantsPage } from '@/features/plants/PlantsPage'
import { SeasonPage } from '@/features/season/SeasonPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { TodayPage } from '@/features/tasks/TodayPage'
import { Layout } from './Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'mapa', element: <GardenMapPage /> },
      { path: 'plantas', element: <PlantsPage /> },
      { path: 'plantas/:plantId', element: <PlantDetailPage /> },
      { path: 'temporada', element: <SeasonPage /> },
      { path: 'ajustes', element: <SettingsPage /> },
    ],
  },
])
