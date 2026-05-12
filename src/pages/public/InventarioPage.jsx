import { PublicLayout } from '@/components/layout/PublicLayout'
import { ArticuloCard } from '@/components/inventario/ArticuloCard'
import { useArticulos } from '@/hooks/useArticulos'
import { Loader2, Package } from 'lucide-react'

export function InventarioPage() {
  const { data: articulos, isLoading, isError } = useArticulos()

  return (
    <PublicLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario de Premios</h1>
          <p className="text-sm text-gray-500 mt-1">Stock disponible actualizado en tiempo real</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Cargando inventario...
          </div>
        )}

        {isError && (
          <div className="text-center py-16 text-red-500">
            Error al cargar el inventario. Intenta nuevamente.
          </div>
        )}

        {articulos && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articulos.map((articulo) => (
              <ArticuloCard key={articulo.id} articulo={articulo} />
            ))}
          </div>
        )}

        {articulos?.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No hay artículos disponibles.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
