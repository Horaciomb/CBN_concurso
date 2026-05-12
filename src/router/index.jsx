import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoginPage } from '@/pages/admin/LoginPage'
import { GanadoresPage } from '@/pages/admin/GanadoresPage'
import { InventarioPage } from '@/pages/public/InventarioPage'
import { ArticuloDetallePage } from '@/pages/public/ArticuloDetallePage'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Cargando...</div>
  if (user) return <Navigate to="/admin/ganadores" replace />
  return children
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/inventario" replace /> },
  {
    path: '/login',
    element: <RedirectIfAuth><LoginPage /></RedirectIfAuth>,
  },
  {
    path: '/admin/ganadores',
    element: <RequireAuth><GanadoresPage /></RequireAuth>,
  },
  { path: '/inventario', element: <InventarioPage /> },
  { path: '/inventario/:articuloId', element: <ArticuloDetallePage /> },
])
