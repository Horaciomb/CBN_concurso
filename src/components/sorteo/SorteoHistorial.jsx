import { useState } from 'react'
import { Copy, CheckCheck, ChevronDown, ChevronUp, ImageDown, Loader2 } from 'lucide-react'
import { useSorteoHistorial } from '@/hooks/useSorteo'
import { generarImagenGanador } from '@/lib/generarImagenGanador'
import { toast } from '@/hooks/use-toast'

function HashCell({ value }) {
  const [copiado, setCopiado] = useState(false)
  async function copiar() {
    await navigator.clipboard.writeText(value)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }
  return (
    <div className="flex items-center gap-1.5">
      <code className="font-mono text-xs text-gray-500 truncate max-w-[100px]" title={value}>
        {value.slice(0, 10)}…
      </code>
      <button onClick={copiar} className="text-gray-400 hover:text-gray-600 shrink-0">
        {copiado ? <CheckCheck className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

function BtnGenerarImagen({ sorteo }) {
  const [loading, setLoading] = useState(false)

  async function handleGenerar(e) {
    e.stopPropagation()
    setLoading(true)
    try {
      const blobUrl = await generarImagenGanador({
        nombre:  sorteo.nombre_ganador || '',
        region:  sorteo.participante?.departamento || '',
        ticket:  sorteo.participante?.codigo || '',
      })
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `ganador_${(sorteo.nombre_ganador || 'sorteo').replace(/\s+/g, '_')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      toast({ title: 'Error al generar imagen', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGenerar}
      disabled={loading}
      title="Generar imagen del ganador"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors shrink-0"
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <ImageDown className="h-3.5 w-3.5" />
      }
      {loading ? 'Generando…' : 'Imagen'}
    </button>
  )
}

export function SorteoHistorial() {
  const { data: sorteos = [], isLoading } = useSorteoHistorial()
  const [expandido, setExpandido] = useState(null)

  if (isLoading) return null

  if (!sorteos.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        Aún no se han realizado sorteos
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {['#', 'Ganador', 'CI', 'Dept.', 'Elegibles', 'Pos.', 'Fecha', 'Hash', ''].map(h => (
              <th key={h} className="px-3 py-2.5 text-left font-medium text-gray-600 text-xs whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorteos.map((s, i) => (
            <>
              <tr
                key={s.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandido(expandido === s.id ? null : s.id)}
              >
                <td className="px-3 py-2 text-gray-400 font-mono text-xs">{sorteos.length - i}</td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{s.nombre_ganador ?? '—'}</td>
                <td className="px-3 py-2 text-gray-600">{s.ci_ganador ?? '—'}</td>
                <td className="px-3 py-2 text-gray-600">{s.participante?.departamento ?? '—'}</td>
                <td className="px-3 py-2 text-center">{s.total_elegibles}</td>
                <td className="px-3 py-2 text-center text-gray-500">{s.posicion_virtual}</td>
                <td className="px-3 py-2 text-gray-500 whitespace-nowrap text-xs">
                  {new Date(s.created_at).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <HashCell value={s.hash_verificacion} />
                    {expandido === s.id
                      ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                      : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
                  </div>
                </td>
                {/* ← Botón generar imagen */}
                <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                  <BtnGenerarImagen sorteo={s} />
                </td>
              </tr>

              {expandido === s.id && (
                <tr key={`${s.id}-detail`} className="bg-blue-50 border-t">
                  <td colSpan={9} className="px-4 py-3">
                    <div className="text-xs space-y-1 text-gray-700">
                      <p><span className="font-semibold">Seed:</span> <code className="break-all">{s.seed}</code></p>
                      <p><span className="font-semibold">Timestamp:</span> <code>{s.timestamp_ejecutado}</code></p>
                      <p><span className="font-semibold">Hash completo:</span> <code className="break-all">{s.hash_verificacion}</code></p>
                      <p className="text-gray-400 pt-1">
                        Verificar: <code>echo -n "{s.seed}|{s.participante_id}|{s.timestamp_ejecutado}" | sha256sum</code>
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
