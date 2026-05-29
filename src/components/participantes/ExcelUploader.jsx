import { useRef, useState } from 'react'
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parsearExcel } from '@/lib/excelParser'

/**
 * Uploader de Excel con drag-and-drop.
 * Props:
 *   onConfirmar(archivo: string, participantes: array) — llamado al confirmar carga
 *   loading — deshabilita botón mientras se sube
 */
export function ExcelUploader({ onConfirmar, loading }) {
  const inputRef = useRef(null)
  const [drag, setDrag] = useState(false)
  const [preview, setPreview] = useState(null) // { archivo, participantes }
  const [error, setError] = useState(null)
  const [parsing, setParsing] = useState(false)

  async function procesar(file) {
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Solo se aceptan archivos .xlsx o .xls')
      return
    }
    setParsing(true)
    setError(null)
    try {
      const participantes = await parsearExcel(file)
      if (!participantes.length) throw new Error('El archivo no contiene participantes válidos')
      setPreview({ archivo: file.name, participantes })
    } catch (e) {
      setError(e.message)
    } finally {
      setParsing(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDrag(false)
    procesar(e.dataTransfer.files[0])
  }

  function handleChange(e) {
    procesar(e.target.files[0])
    e.target.value = ''
  }

  function cancelar() {
    setPreview(null)
    setError(null)
  }

  if (preview) {
    return (
      <div className="border rounded-lg p-4 space-y-4 bg-green-50 border-green-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-green-800 text-sm truncate">{preview.archivo}</p>
            <p className="text-sm text-green-700">
              {preview.participantes.length} participantes detectados
            </p>
          </div>
          <button onClick={cancelar} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Previsualización de los primeros 5 */}
        <div className="overflow-x-auto rounded border border-green-200 bg-white">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {['N°', 'Nombre', 'CI', 'Departamento', 'Premio'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.participantes.slice(0, 5).map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-1.5">{p.numero ?? '—'}</td>
                  <td className="px-3 py-1.5 max-w-[160px] truncate">{p.nombre_completo}</td>
                  <td className="px-3 py-1.5">{p.ci ?? '—'}</td>
                  <td className="px-3 py-1.5">{p.departamento ?? '—'}</td>
                  <td className="px-3 py-1.5">{p.premio ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {preview.participantes.length > 5 && (
            <p className="text-xs text-gray-400 px-3 py-2">
              … y {preview.participantes.length - 5} más
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onConfirmar(preview.archivo, preview.participantes)}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Cargando…' : `Confirmar carga (${preview.participantes.length} registros)`}
          </Button>
          <Button variant="outline" onClick={cancelar} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${drag ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleChange}
        />
        <FileSpreadsheet className="h-10 w-10 mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-700">
          {parsing ? 'Procesando…' : 'Arrastrá el Excel o hacé click para seleccionar'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Formato: Ganadores Raspadita Mundialera (.xlsx)</p>
        <Button variant="outline" size="sm" className="mt-3" disabled={parsing}>
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Seleccionar archivo
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
