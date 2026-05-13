import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoginPage } from '@/pages/admin/LoginPage'
import { GanadoresPage } from '@/pages/admin/GanadoresPage'
import { InventarioPage } from '@/pages/public/InventarioPage'
import { ArticuloDetallePage } from '@/pages/public/ArticuloDetallePage'

// Spinner compartido
function Cargando() {
  return (
    <div className="flex items-center justify-center h-screen text-gray-400 gap-2">
      <span className="animate-spin border-2 border-gray-300 border-t-red-600 rounded-full h-5 w-5 inline-block" />
      Cargando...
    </div>
  )
}

// Si ya está autenticado, va directo al inventario
function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Cargando />
  if (user) return <Navigate to="/inventario" replace />
  return children
}

// Requiere autenticación Y rol admin; viewer o anónimo no pasan
function RequireAdmin({ children }) {
  const { user, rol, loading } = useAuth()
  if (loading) return <Cargando />
  if (!user) return <Navigate to="/login" replace />
  if (rol !== 'admin') return <Navigate to="/inventario" replace />
  return children
}

export const router = createBrowserRouter([
  // Raíz → siempre al login
  { path: '/', element: <Navigate to="/login" replace /> },

  // Login: si ya está autenticado va a inventario
  {
    path: '/login',
    element: <RedirectIfAuth><LoginPage /></RedirectIfAuth>,
  },

  // Inventario público (cualquiera puede ver)
  { path: '/inventario', element: <InventarioPage /> },
  { path: '/inventario/:articuloId', element: <ArticuloDetallePage /> },

  // Admin: solo rol 'admin'
  {
    path: '/admin/ganadores',
    element: <RequireAdmin><GanadoresPage /></RequireAdmin>,
  },
])
