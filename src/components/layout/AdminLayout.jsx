import { useNavigate } from 'react-router-dom'
import { LogOut, Trophy, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

export function AdminLayout({ children }) {
  const { user, logout } = useAuth()
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/inventario')}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity"
            title="Volver al inventario"
          >
            <Trophy className="h-6 w-6 text-red-600" />
            <span className="text-lg font-bold text-gray-900">Gestión de Ganadores</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.email}</span>
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
