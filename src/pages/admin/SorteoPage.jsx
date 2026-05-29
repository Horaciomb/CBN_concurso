import { AdminLayout } from '@/components/layout/AdminLayout'
import { SorteoPanel } from '@/components/sorteo/SorteoPanel'
import { SorteoHistorial } from '@/components/sorteo/SorteoHistorial'
import { Dices, History } from 'lucide-react'

export function SorteoPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sorteo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Resultado determinista y verificable públicamente con seed SHA-256
          </p>
        </div>

        {/* Panel principal */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-5">
            <Dices className="h-5 w-5 text-red-600" />
            <h2 className="font-semibold text-gray-800">Ejecutar sorteo</h2>
          </div>
          <SorteoPanel />
        </div>

        {/* Historial */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-5">
            <History className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-800">Historial de sorteos</h2>
          </div>
          <SorteoHistorial />
        </div>
      </div>
    </AdminLayout>
  )
}
