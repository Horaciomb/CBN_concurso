import { useState } from 'react'
import { Search, X, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEliminarCarga } from '@/hooks/useParticipantes'
import { toast } from '@/hooks/use-toast'

export function ParticipantesTable({ participantes = [], ganadoresIds = new Set(), ganadorCIs = new Set() }) {
  const [busqueda, setBusqueda] = useState('')
  const eliminarCarga = useEliminarCarga()

  const filtrados = participantes.filter(p => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      p.nombre_completo?.toLowerCase().includes(q) ||
      p.ci?.toLowerCase().includes(q) ||
      p.codigo?.toLowerCase().includes(q) ||
      p.departamento?.toLowerCase().includes(q)
    )
  })

  async function handleEliminarCarga(cargaId, nombreArchivo) {
    if (!confirm(`¿Eliminar la carga "${nombreArchivo}" y todos sus participantes?`)) return
    try {
      await eliminarCarga.mutateAsync(cargaId)
      toast({ title: 'Carga eliminada' })
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  // Agrupar cargas únicas para mostrar botón de eliminar
  const cargasUnicas = [...new Map(
    participantes.map(p => [p.carga_id, p.cargas_participantes])
  ).entries()].filter(([, c]) => c)

  function esExcluido(p) {
    if (ganadoresIds.has(p.id)) return true
    if (p.ci && p.ci !== '-' && ganadorCIs.has(p.ci)) return true
    return false
  }

  return (
    <div className="space-y-3">
      {/* Header: búsqueda + cargas */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, CI, código…"
            className="pl-8 pr-8"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {filtrados.length} / {participantes.length} participantes
        </span>
      </div>

      {/* Cargas existentes */}
      {cargasUnicas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cargasUnicas.map(([cargaId, carga]) => (
            <div key={cargaId} className="flex items-center gap-1.5 bg-gray-100 rounded px-2 py-1 text-xs">
              <span className="text-gray-600">{carga.nombre_archivo}</span>
              <button
                onClick={() => handleEliminarCarga(cargaId, carga.nombre_archivo)}
                className="text-red-400 hover:text-red-600"
                title="Eliminar esta carga"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['N°', 'Nombre completo', 'CI', 'Departamento', 'Premio', 'Código', 'Estado'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium text-gray-600 text-xs whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400">
                  {participantes.length === 0 ? 'Aún no hay participantes cargados' : 'Sin resultados para la búsqueda'}
                </td>
              </tr>
            )}
            {filtrados.map(p => {
              const excluido = esExcluido(p)
              return (
                <tr key={p.id} className={`border-t ${excluido ? 'bg-yellow-50 opacity-70' : 'hover:bg-gray-50'}`}>
                  <td className="px-3 py-2 text-gray-500">{p.numero ?? '—'}</td>
                  <td className="px-3 py-2 font-medium">{p.nombre_completo}</td>
                  <td className="px-3 py-2 text-gray-600">{p.ci ?? '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{p.departamento ?? '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{p.premio ?? '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-500">{p.codigo ?? '—'}</td>
                  <td className="px-3 py-2">
                    {excluido ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Ya ganó
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Elegible
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
