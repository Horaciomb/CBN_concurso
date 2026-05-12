import { useState } from 'react'
import { CheckCircle2, ExternalLink, FileText, Camera } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-BO', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function ImageThumb({ url, label, icon: Icon }) {
  const [open, setOpen] = useState(false)
  if (!url) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex flex-col items-center gap-1.5"
        title={`Ver ${label}`}
      >
        <div className="relative w-28 h-28 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100 group-hover:border-red-400 group-hover:shadow-md transition-all duration-200">
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
            <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center leading-tight">
              Click para ampliar
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-red-600 transition-colors">
          <Icon className="h-3 w-3" />
          <span>{label}</span>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[560px] p-4 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Icon className="h-4 w-4 text-gray-400" />
              {label}
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Ver imagen completa
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden border">
            <img
              src={url}
              alt={label}
              className="object-contain rounded-lg"
              style={{ width: '500px', height: '500px', maxWidth: '100%', objectFit: 'contain' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function GanadoresList({ ganadores }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {ganadores.length} entrega{ganadores.length !== 1 ? 's' : ''} confirmada{ganadores.length !== 1 ? 's' : ''}
      </h2>

      <div className="divide-y rounded-md border bg-white overflow-hidden">
        {ganadores.map((g) => (
          <div key={g.codigo} className="px-4 py-4 space-y-3">
            {/* Info del ganador */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{g.nombre_ganador}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5 text-sm text-gray-500">
                  <span>Código: <span className="font-mono text-gray-700">{g.codigo}</span></span>
                  <span>Carnet: <span className="text-gray-700">{g.numero_carnet}</span></span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatDate(g.entrega_confirmada_at)}</p>
              </div>
            </div>

            {/* Imágenes de respaldo */}
            {(g.foto_formulario_aj_url || g.foto_entrega_url) && (
              <div className="flex flex-wrap gap-4 pl-8">
                <ImageThumb
                  url={g.foto_formulario_aj_url}
                  label="Formulario AJ"
                  icon={FileText}
                />
                <ImageThumb
                  url={g.foto_entrega_url}
                  label="Foto de entrega"
                  icon={Camera}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
