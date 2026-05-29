import { useState } from 'react'
import { Dices, RotateCcw, ImageDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generarSeed, ejecutarSorteo } from '@/lib/sorteo'
import { useElegibles, useRegistrarSorteo } from '@/hooks/useSorteo'
import { generarImagenGanador } from '@/lib/generarImagenGanador'
import { toast } from '@/hooks/use-toast'

export function SorteoPanel() {
  const [resultado, setResultado] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const [generando, setGenerando] = useState(false)

  const { data: elegibles = [], isLoading, refetch } = useElegibles()
  const registrarMutation = useRegistrarSorteo()

  async function realizarSorteo() {
    if (!elegibles.length) return
    setProcesando(true)
    try {
      const seed = generarSeed()
      const res  = await ejecutarSorteo(seed, elegibles)
      await registrarMutation.mutateAsync(res)
      setResultado(res)
    } catch (e) {
      toast({ title: 'Error en el sorteo', description: e.message, variant: 'destructive' })
    } finally {
      setProcesando(false)
    }
  }

  async function descargarImagen() {
    if (!resultado) return
    setGenerando(true)
    try {
      const blobUrl = await generarImagenGanador({
        nombre: resultado.ganador.nombre_completo,
        region: resultado.ganador.departamento || '',
        ticket: resultado.ganador.codigo || '',
      })
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `ganador_${resultado.ganador.nombre_completo.replace(/\s+/g, '_')}.png`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (e) {
      toast({ title: 'Error al generar imagen', description: e.message, variant: 'destructive' })
    } finally {
      setGenerando(false)
    }
  }

  function otroSorteo() {
    setResultado(null)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
        <span className="animate-spin border-2 border-gray-300 border-t-red-600 rounded-full h-5 w-5" />
        Cargando participantes…
      </div>
    )
  }

  // ── Sin resultado: pantalla inicial ──────────────────────────────────────
  if (!resultado) {
    return (
      <div className="flex flex-col items-center gap-5 py-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
          <Dices className="h-7 w-7 text-red-600" />
        </div>

        <p className="text-gray-600 text-sm">
          <span className="font-semibold text-gray-900">{elegibles.length}</span> participantes elegibles
        </p>

        {elegibles.length === 0 ? (
          <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-4 py-2">
            No hay participantes elegibles. Cargá un Excel primero.
          </p>
        ) : (
          <Button
            onClick={realizarSorteo}
            disabled={procesando}
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white px-10 gap-2"
          >
            {procesando
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Sorteando…</>
              : <><Dices className="h-4 w-4" /> Realizar sorteo</>
            }
          </Button>
        )}
      </div>
    )
  }

  // ── Con resultado: ganador ────────────────────────────────────────────────
  const g = resultado.ganador
  return (
    <div className="space-y-5">
      {/* Tarjeta ganador */}
      <div className="border-2 border-green-400 bg-green-50 rounded-xl p-6 text-center space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-green-600">🎉 Ganador</p>
        <p className="text-2xl font-bold text-gray-900">{g.nombre_completo}</p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-gray-600 pt-1">
          {g.ci          && <span>CI: {g.ci}</span>}
          {g.departamento && <span>{g.departamento}</span>}
          {g.premio      && <span className="font-medium text-green-800">{g.premio}</span>}
          {g.codigo      && <span className="font-mono text-xs">Cód: {g.codigo}</span>}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={descargarImagen}
          disabled={generando}
          className="bg-red-600 hover:bg-red-700 text-white gap-2"
        >
          {generando
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Generando…</>
            : <><ImageDown className="h-4 w-4" /> Generar imagen</>
          }
        </Button>

        <Button onClick={otroSorteo} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Otro sorteo
        </Button>
      </div>
    </div>
  )
}
