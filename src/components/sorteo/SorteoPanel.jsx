import { useState } from 'react'
import { Dices, Play, RotateCcw, Copy, CheckCheck, ShieldCheck, ImageDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generarSeed, ejecutarSorteo } from '@/lib/sorteo'
import { useElegibles, useRegistrarSorteo } from '@/hooks/useSorteo'
import { generarImagenGanador } from '@/lib/generarImagenGanador'
import { toast } from '@/hooks/use-toast'

const ESTADO = { IDLE: 'idle', PREPARADO: 'preparado', EJECUTADO: 'ejecutado' }

export function SorteoPanel() {
  const [estado, setEstado] = useState(ESTADO.IDLE)
  const [seed, setSeed] = useState(null)
  const [resultado, setResultado] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [generando, setGenerando] = useState(false)

  const { data: elegibles = [], isLoading, refetch } = useElegibles()
  const registrarMutation = useRegistrarSorteo()

  // ── Paso 1: Preparar ──────────────────────────────────────────────
  function preparar() {
    if (!elegibles.length) return
    const nuevoSeed = generarSeed()
    setSeed(nuevoSeed)
    setResultado(null)
    setEstado(ESTADO.PREPARADO)
  }

  async function copiarSeed() {
    await navigator.clipboard.writeText(seed)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  // ── Paso 2: Ejecutar ──────────────────────────────────────────────
  async function ejecutar() {
    if (!seed || !elegibles.length) return
    setProcesando(true)
    try {
      const res = await ejecutarSorteo(seed, elegibles)
      await registrarMutation.mutateAsync(res)
      setResultado(res)
      setEstado(ESTADO.EJECUTADO)
    } catch (e) {
      toast({ title: 'Error en el sorteo', description: e.message, variant: 'destructive' })
    } finally {
      setProcesando(false)
    }
  }

  function nuevoSorteo() {
    setSeed(null)
    setResultado(null)
    setEstado(ESTADO.IDLE)
    refetch()
  }

  // ── UI ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
        <span className="animate-spin border-2 border-gray-300 border-t-red-600 rounded-full h-5 w-5" />
        Calculando elegibles…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estado: IDLE */}
      {estado === ESTADO.IDLE && (
        <div className="text-center py-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <Dices className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {elegibles.length} participantes elegibles
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Hacé click en "Preparar" para generar el seed y comprometer el resultado
            </p>
          </div>
          <Button
            onClick={preparar}
            disabled={!elegibles.length}
            className="bg-red-600 hover:bg-red-700 text-white px-8"
            size="lg"
          >
            <Dices className="h-4 w-4 mr-2" />
            Preparar sorteo
          </Button>
          {!elegibles.length && (
            <p className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded px-4 py-2 inline-block">
              No hay participantes elegibles. Cargá un Excel primero.
            </p>
          )}
        </div>
      )}

      {/* Estado: PREPARADO */}
      {estado === ESTADO.PREPARADO && (
        <div className="space-y-5">
          <div className="bg-gray-50 border rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Seed generado — comprometido antes de conocer el ganador
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-xs bg-white border rounded px-3 py-2 break-all text-gray-800">
                {seed}
              </code>
              <Button variant="outline" size="sm" onClick={copiarSeed} className="shrink-0">
                {copiado ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Copiá este seed para que un testigo lo anote o fotografíe <strong>antes</strong> de ejecutar.
              El ganador se calculará como <code>SHA-256(seed|timestamp) mod {elegibles.length}</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={ejecutar}
              disabled={procesando}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              {procesando ? 'Ejecutando…' : `Ejecutar sorteo (${elegibles.length} elegibles)`}
            </Button>
            <Button variant="outline" onClick={nuevoSorteo} disabled={procesando}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Estado: EJECUTADO */}
      {estado === ESTADO.EJECUTADO && resultado && (
        <div className="space-y-5">
          {/* Tarjeta del ganador */}
          <div className="border-2 border-green-400 bg-green-50 rounded-xl p-6 text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">🎉 Ganador del sorteo</p>
            <p className="text-2xl font-bold text-gray-900">{resultado.ganador.nombre_completo}</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-gray-600">
              {resultado.ganador.ci && <span>CI: {resultado.ganador.ci}</span>}
              {resultado.ganador.departamento && <span>{resultado.ganador.departamento}</span>}
              {resultado.ganador.premio && <span className="font-medium text-green-800">{resultado.ganador.premio}</span>}
              {resultado.ganador.codigo && <span className="font-mono">Cód: {resultado.ganador.codigo}</span>}
            </div>
            <div className="text-xs text-gray-500 pt-1">
              Posición virtual: {resultado.virtualPos} de {resultado.totalElegibles}
            </div>
          </div>

          {/* Datos de verificación */}
          <div className="bg-gray-50 border rounded-lg p-4 space-y-2 text-xs">
            <p className="font-semibold text-gray-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Verificación pública
            </p>
            <div className="space-y-1 text-gray-600">
              <div className="flex gap-2">
                <span className="font-medium w-20 shrink-0">Seed:</span>
                <code className="break-all">{resultado.seed}</code>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-20 shrink-0">Timestamp:</span>
                <code>{resultado.timestamp}</code>
              </div>
              <div className="flex gap-2">
                <span className="font-medium w-20 shrink-0">Hash:</span>
                <code className="break-all">{resultado.hash}</code>
              </div>
            </div>
            <p className="text-gray-400 pt-1">
              Verificable con: <code>echo -n "{resultado.seed}|{resultado.ganador.id}|{resultado.timestamp}" | sha256sum</code>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={async () => {
                setGenerando(true)
                try {
                  const blobUrl = await generarImagenGanador({
                    nombre:  resultado.ganador.nombre_completo,
                    region:  resultado.ganador.departamento || '',
                    ticket:  resultado.ganador.codigo || '',
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
              }}
              disabled={generando}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {generando ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
              {generando ? 'Generando…' : 'Generar imagen'}
            </Button>

            <Button onClick={nuevoSorteo} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Realizar otro sorteo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
