import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Users } from 'lucide-react'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Button } from '@/components/ui/button'
import { GanadoresList } from '@/components/inventario/GanadoresList'
import { useArticulos } from '@/hooks/useArticulos'
import { useGanadoresPorArticulo } from '@/hooks/useGanadores'

export function ArticuloDetallePage() {
  const { articuloId } = useParams()
  const navigate = useNavigate()
  const { data: articulos } = useArticulos()
  const { data: ganadores, isLoading } = useGanadoresPorArticulo(articuloId)

  const articulo = articulos?.find((a) => a.id === articuloId)

  return (
    <PublicLayout>
      <div className="space-y-6">
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

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Cargando ganadores...
          </div>
        )}

        {ganadores && ganadores.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Aún no hay entregas confirmadas</p>
            <p className="text-sm mt-1">Los ganadores aparecerán aquí cuando se confirme su entrega.</p>
          </div>
        )}

        {ganadores && ganadores.length > 0 && <GanadoresList ganadores={ganadores} />}
      </div>
    </PublicLayout>
  )
}
