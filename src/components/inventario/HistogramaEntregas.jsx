import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, BarChart2 } from 'lucide-react'
import { useArticulos } from '@/hooks/useArticulos'
import { useEntregasPorDepartamento } from '@/hooks/useGanadores'

export function HistogramaEntregas() {
  const [articuloFiltro, setArticuloFiltro] = useState('')
  const { data: articulos } = useArticulos()
  const { data, isLoading } = useEntregasPorDepartamento(articuloFiltro || undefined)

  const total = data?.reduce((s, d) => s + d.count, 0) ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-gray-400" />
            Entregas confirmadas por departamento
          </h2>
          <p className="text-sm text-gray-500">Solo registros con entrega confirmada</p>
        </div>
        <Select
          value={articuloFiltro || 'todos'}
          onValueChange={(v) => setArticuloFiltro(v === 'todos' ? '' : v)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todos los premios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los premios</SelectItem>
            {articulos?.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando...
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          <BarChart2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No hay entregas confirmadas con departamento registrado.</p>
        </div>
      )}

      {!isLoading && data && data.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="departamento"
                tick={{ fontSize: 12 }}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={30} />
              <Tooltip
                formatter={(value) => [value, 'Entregas']}
                cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              />
              <Bar dataKey="count" name="Entregas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 text-right mt-1">
            Total: {total} entrega{total !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
