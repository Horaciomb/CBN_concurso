import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Users, Search, X } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GanadoresList } from '@/components/inventario/GanadoresList'
import { useArticulos } from '@/hooks/useArticulos'
import { useGanadoresPorArticulo } from '@/hooks/useGanadores'

export function ArticuloDetallePage() {
  const { articuloId } = useParams()
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')

  const { data: articulos } = useArticulos()
  const { data: ganadores, isLoading } = useGanadoresPorArticulo(articuloId)

  const articulo = articulos?.find((a) => a.id === articuloId)

  // Filtro client-side por nombre, carnet o código
  const ganadorFiltrados = useMemo(() => {
    if (!ganadores) return []
    if (!busqueda.trim()) return ganadores
    const q = busqueda.toLowerCase().trim()
    return ganadores.filter((g) =>
      g.nombre_ganador?.toLowerCase().includes(q) ||
      g.numero_carnet?.toLowerCase().includes(q) ||
      g.codigo?.toLowerCase().includes(q)
    )
  }, [ganadores, busqueda])

  const hayResultados = ganadorFiltrados.length > 0
  const hayGanadores = ganadores && ganadores.length > 0

  return (
    <PublicLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/inventario')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{articulo?.nombre ?? 'Artículo'}</h1>
            {articulo && (
              <p className="text-sm text-gray-500">
                Stock: <span className="font-semibold">{articulo.stock_actual}</span> / {articulo.stock_inicial} restantes
              </p>
            )}
          </div>
        </div>

        {/* Buscador — solo cuando hay ganadores */}
        {hayGanadores && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, carnet o código..."
              className="pl-9 pr-9"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando ganadores...
          </div>
        )}

        {/* Sin entregas aún */}
        {!isLoading && !hayGanadores && (
          <div className="text-center py-16 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aún no hay entregas confirmadas</p>
            <p className="text-sm mt-1">Los ganadores aparecerán aquí cuando se confirme su entrega.</p>
          </div>
        )}

        {/* Sin resultados de búsqueda */}
        {!isLoading && hayGanadores && !hayResultados && (
          <div className="text-center py-12 text-gray-400">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Sin resultados para "{busqueda}"</p>
            <p className="text-sm mt-1">Intenta con otro nombre, número de carnet o código.</p>
            <button
              onClick={() => setBusqueda('')}
              className="mt-3 text-sm text-red-600 hover:underline"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Lista de ganadores */}
        {!isLoading && hayResultados && (
          <GanadoresList
            ganadores={ganadorFiltrados}
            totalSinFiltro={ganadores.length}
            busqueda={busqueda}
          />
        )}
      </div>
    </PublicLayout>
  )
}
