import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { GanadorTable } from '@/components/ganadores/GanadorTable'
import { GanadorForm } from '@/components/ganadores/GanadorForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function GanadoresPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [ganadorEdit, setGanadorEdit] = useState(null)

  function handleNuevo() {
    setGanadorEdit(null)
    setFormOpen(true)
  }

  function handleEditar(ganador) {
    setGanadorEdit(ganador)
    setFormOpen(true)
  }

  function handleCerrar() {
    setFormOpen(false)
    setGanadorEdit(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ganadores</h1>
            <p className="text-sm text-gray-500 mt-1">Gestión de ganadores y entrega de premios</p>
          </div>
          <Button onClick={handleNuevo}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar ganador
          </Button>
        </div>

        <GanadorTable onEditar={handleEditar} />
      </div>

      <Dialog open={formOpen} onOpenChange={handleCerrar}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{ganadorEdit ? 'Editar ganador' : 'Registrar nuevo ganador'}</DialogTitle>
          </DialogHeader>
          <GanadorForm ganador={ganadorEdit} onSuccess={handleCerrar} />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
