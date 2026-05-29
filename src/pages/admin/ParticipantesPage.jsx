import { Users, Upload } from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { ExcelUploader } from '@/components/participantes/ExcelUploader'
import { ParticipantesTable } from '@/components/participantes/ParticipantesTable'
import { useParticipantes, useCargarParticipantes } from '@/hooks/useParticipantes'
import { useSorteoHistorial } from '@/hooks/useSorteo'
import { toast } from '@/hooks/use-toast'
import { useState } from 'react'

export function ParticipantesPage() {
  const [showUploader, setShowUploader] = useState(false)
  const { data: participantes = [], isLoading } = useParticipantes()
  const { data: sorteos = [] } = useSorteoHistorial()
  const cargarMutation = useCargarParticipantes()

  const ganadoresIds = new Set(sorteos.map(s => s.participante_id).filter(Boolean))
  const ganadorCIs = new Set(sorteos.map(s => s.ci_ganador).filter(v => v && v !== '-'))

  const totalElegibles = participantes.filter(p => {
    if (ganadoresIds.has(p.id)) return false
    if (p.ci && p.ci !== '-' && ganadorCIs.has(p.ci)) return false
    return true
  }).length

  async function handleConfirmar(archivo, datos) {
    try {
      await cargarMutation.mutateAsync({ archivo, participantes: datos })
      toast({ title: 'Carga exitosa', description: `${datos.length} participantes agregados` })
      setShowUploader(false)
    } catch (e) {
      toast({ title: 'Error al cargar', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Participantes del Sorteo</h1>
            <p className="text-sm text-gray-500 mt-1">
              {participantes.length} participantes totales · {totalElegibles} elegibles
            </p>
          </div>
          <Button onClick={() => setShowUploader(v => !v)}>
            <Upload className="h-4 w-4 mr-2" />
            {showUploader ? 'Cancelar carga' : 'Cargar Excel'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total cargados', value: participantes.length, color: 'text-gray-900' },
            { label: 'Elegibles', value: totalElegibles, color: 'text-green-700' },
            { label: 'Ya ganaron', value: participantes.length - totalElegibles, color: 'text-yellow-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-lg border p-4 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Uploader */}
        {showUploader && (
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Cargar archivo Excel</h2>
            <ExcelUploader
              onConfirmar={handleConfirmar}
              loading={cargarMutation.isPending}
            />
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-lg border p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
              <span className="animate-spin border-2 border-gray-300 border-t-red-600 rounded-full h-5 w-5" />
              Cargando participantes…
            </div>
          ) : (
            <ParticipantesTable
              participantes={participantes}
              ganadoresIds={ganadoresIds}
              ganadorCIs={ganadorCIs}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
