import { CheckCircle2, Clock, Pencil, Trash2, Check, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useConfirmarEntrega } from '@/hooks/useGanadores'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

export function GanadorRow({ ganador, onEditar, onEliminar }) {
  const { user } = useAuth()
  const confirmarMutation = useConfirmarEntrega()

  // Solo el usuario que registró el ganador puede confirmar la entrega
  const esCreador = user?.id === ganador.created_by
  const puedeConfirmar = !ganador.entrega_confirmada && esCreador

  async function handleConfirmar() {
    try {
      await confirmarMutation.mutateAsync(ganador.id)
      toast({ title: 'Entrega confirmada', variant: 'success' })
    } catch (err) {
      toast({ title: 'Error al confirmar', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <tr className="border-b hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-gray-600">{ganador.codigo}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ganador.nombre_ganador}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{ganador.articulos?.nombre}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{ganador.numero_carnet}</td>
      <td className="px-4 py-3">
        {ganador.entrega_confirmada ? (
          <Badge variant="success" className="flex items-center gap-1 w-fit">
            <CheckCircle2 className="h-3 w-3" /> Confirmada
          </Badge>
        ) : (
          <Badge variant="warning" className="flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" /> Pendiente
          </Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {/* Confirmar entrega: solo visible para el creador del registro */}
          {!ganador.entrega_confirmada && (
            esCreador ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleConfirmar}
                disabled={confirmarMutation.isPending}
                title="Confirmar entrega"
              >
                <Check className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-300 cursor-not-allowed"
                disabled
                title="Solo quien registró este ganador puede confirmar la entrega"
              >
                <Lock className="h-4 w-4" />
              </Button>
            )
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEditar(ganador)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onEliminar(ganador)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
