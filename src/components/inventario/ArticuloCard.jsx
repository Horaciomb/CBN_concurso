import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'

function getStockStatus(stockActual, stockInicial) {
  const pct = stockInicial > 0 ? (stockActual / stockInicial) * 100 : 0
  if (pct > 50) return { label: 'Disponible', variant: 'success', color: 'bg-green-500' }
  if (pct > 20) return { label: 'Stock bajo', variant: 'warning', color: 'bg-yellow-500' }
  return { label: 'Crítico', variant: 'destructive', color: 'bg-red-500' }
}

export function ArticuloCard({ articulo }) {
  const navigate = useNavigate()
  const pct = articulo.stock_inicial > 0 ? (articulo.stock_actual / articulo.stock_inicial) * 100 : 0
  const status = getStockStatus(articulo.stock_actual, articulo.stock_inicial)

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: status.color.replace('bg-', '').includes('green') ? '#22c55e' : status.color.includes('yellow') ? '#eab308' : '#ef4444' }}
      onClick={() => navigate(`/inventario/${articulo.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-lg">{articulo.nombre}</CardTitle>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-gray-900">{articulo.stock_actual}</span>
          <span className="text-sm text-gray-400">/ {articulo.stock_inicial} total</span>
        </div>
        <Progress value={pct} className="h-2" />
        <p className="text-xs text-gray-400 text-right">{Math.round(pct)}% disponible</p>
      </CardContent>
    </Card>
  )
}
