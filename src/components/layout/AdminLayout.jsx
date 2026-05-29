import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

const NAV_LINKS = [
  { label: 'Ganadores',     path: '/admin/ganadores' },
  { label: 'Participantes', path: '/admin/participantes' },
  { label: 'Sorteo',        path: '/admin/sorteo' },
]

export function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch {
      toast({ title: 'Error al cerrar sesión', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo → volver al inventario */}
          <button
            onClick={() => navigate('/inventario')}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity shrink-0"
            title="Volver al inventario"
          >
            <Trophy className="h-6 w-6 text-red-600" />
            <span className="text-lg font-bold text-gray-900 hidden sm:block">Panel Admin</span>
          </button>

          {/* Navegación entre secciones admin */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ label, path }) => {
              const active = location.pathname === path
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap
                    ${active
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  {label}
                </button>
              )
            })}
          </nav>

          {/* Email + logout */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:block text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
