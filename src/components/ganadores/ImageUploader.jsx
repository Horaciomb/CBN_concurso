import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { validateImageFile } from '@/lib/validations'

export function ImageUploader({ label, folder, value, onChange }) {
  const [preview, setPreview] = useState(value || null)
  const [pendingFile, setPendingFile] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { setError(err); return }
    setError(null)
    setPendingFile(file)
    setPreview(URL.createObjectURL(file))
    onChange({ file, url: null })
  }

  function handleClear() {
    setPreview(null)
    setPendingFile(null)
    setError(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      {preview ? (
        <div className="relative w-full max-w-xs">
          <a href={preview} target="_blank" rel="noopener noreferrer">
            <img src={preview} alt={label} className="w-full h-40 object-cover rounded-md border" />
          </a>
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow hover:bg-red-50"
          >
            <X className="h-4 w-4 text-red-500" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center w-full max-w-xs h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <ImageIcon className="h-8 w-8 text-gray-300 mb-1" />
          <span className="text-xs text-gray-400">Haz clic para subir imagen</span>
          <span className="text-xs text-gray-300">JPG, PNG o WEBP • máx 5MB</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// Fallback para contextos no-HTTPS (red local, HTTP)
function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export async function uploadImage(fileOrObj, folder) {
  if (!fileOrObj) return null
  const file = fileOrObj.file ?? fileOrObj
  if (!file || !(file instanceof File)) return typeof fileOrObj === 'string' ? fileOrObj : null

  const ext = file.name.split('.').pop()
  const fileName = `${generateUUID()}.${ext}`
  const path = `${folder}/${fileName}`

  const { error } = await supabase.storage.from('evidencias').upload(path, file)
  if (error) throw error

  const { data: { publicUrl } } = supabase.storage.from('evidencias').getPublicUrl(path)
  return publicUrl
}
