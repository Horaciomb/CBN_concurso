import { useState } from 'react'
import { Plus, FileDown, ChevronDown } from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { GanadorTable } from '@/components/ganadores/GanadorTable'
import { GanadorForm } from '@/components/ganadores/GanadorForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const BASE = import.meta.env.BASE_URL

const FORMULARIOS = [
  {
    label: 'Bolsón',
    archivo: 'FORMULARIO DE ENTREGA DE PREMIOS - BOLSON.pdf',
  },
  {
    label: 'Polera',
    archivo: 'FORMULARIO DE ENTREGA DE PREMIOS - POLERA.pdf',
  },
  {
    label: 'Vaso',
    archivo: 'FORMULARIO DE ENTREGA DE PREMIOS - VASO.pdf',
  },
]

function descargarFormulario(archivo) {
  const url = `${BASE}docs/${encodeURIComponent(archivo)}`
  const a = document.createElement('a')
  a.href = url
  a.download = archivo
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ganadores</h1>
            <p className="text-sm text-gray-500 mt-1">Gestión de ganadores y entrega de premios</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Dropdown de formularios PDF */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileDown className="h-4 w-4" />
                  Formularios
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-gray-500 font-normal">
                  Descargar formulario de entrega
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {FORMULARIOS.map(({ label, archivo }) => (
                  <DropdownMenuItem
                    key={label}
                    onClick={() => descargarFormulario(archivo)}
                    className="cursor-pointer gap-2"
                  >
                    <FileDown className="h-4 w-4 text-gray-400" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Registrar ganador */}
            <Button onClick={handleNuevo}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar ganador
            </Button>
          </div>
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
