import { useNavigate } from 'react-router-dom'
import { Trophy, LayoutDashboard, LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

export function PublicLayout({ children }) {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Logo / título */}
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-red-600" />
            <span className="text-base font-semibold text-gray-800">
              Concurso CBN — Inventario de Premios
            </span>
          </div>

          {/* Acciones según estado de sesión */}
          <div className="flex items-center gap-2">
            {/* Admin: botón para ir al panel de gestión */}
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => navigate('/admin/ganadores')}
                className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Panel admin</span>
              </Button>
            )}

            {/* Sesión activa: mostrar cerrar sesión */}
            {user && (
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            )}

            {/* Sin sesión: acceso al login */}
            {!user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-gray-500 gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
