import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Loader2, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { GanadorRow } from './GanadorRow'
import { useGanadores, useEliminarGanador } from '@/hooks/useGanadores'
import { useArticulos } from '@/hooks/useArticulos'
import { toast } from '@/hooks/use-toast'

const PAGE_SIZE = 10

export function GanadorTable({ onEditar }) {
  const [articuloFiltro, setArticuloFiltro] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [ganadorAEliminar, setGanadorAEliminar] = useState(null)

  const { data: articulos } = useArticulos()
  const { data, isLoading } = useGanadores({
    articuloId: articuloFiltro || undefined,
    estado: estadoFiltro === 'todos' ? undefined : estadoFiltro,
    busqueda: busqueda || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const eliminarMutation = useEliminarGanador()
  const totalPages = Math.ceil((data?.count ?? 0) / PAGE_SIZE)

  function resetPage() { setPage(1) }

  async function handleEliminarConfirmado() {
    try {
      await eliminarMutation.mutateAsync(ganadorAEliminar)
      toast({ title: 'Ganador eliminado correctamente', variant: 'success' })
      setGanadorAEliminar(null)
    } catch (err) {
      toast({ title: 'Error al eliminar', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o código..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); resetPage() }}
          />
        </div>
        <Select value={articuloFiltro || 'todos'} onValueChange={(v) => { setArticuloFiltro(v === 'todos' ? '' : v); resetPage() }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todos los artículos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los artículos</SelectItem>
            {articulos?.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={estadoFiltro} onValueChange={(v) => { setEstadoFiltro(v); resetPage() }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="confirmados">Confirmados</SelectItem>
            <SelectItem value="pendientes">Pendientes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border bg-white overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando...
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No se encontraron ganadores</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Artículo</th>
                <th className="px-4 py-3 text-left">Carnet</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((ganador) => (
                <GanadorRow
                  key={ganador.id}
                  ganador={ganador}
                  onEditar={onEditar}
                  onEliminar={setGanadorAEliminar}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{data?.count} resultado{data?.count !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>Página {page} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminación */}
      <Dialog open={!!ganadorAEliminar} onOpenChange={() => setGanadorAEliminar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar ganador</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a <strong>{ganadorAEliminar?.nombre_ganador}</strong>? El stock del artículo será devuelto. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGanadorAEliminar(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={handleEliminarConfirmado}
              disabled={eliminarMutation.isPending}
            >
              {eliminarMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
