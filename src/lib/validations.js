import { z } from 'zod'

export const ganadorSchema = z.object({
  nombre_ganador: z.string().min(1, 'El nombre es requerido').max(200),
  codigo: z.string().min(1, 'El código es requerido').max(100),
  articulo_id: z.string().uuid('Debe seleccionar un artículo'),
  numero_carnet: z.string().min(1, 'El número de carnet es requerido').max(50),
  foto_formulario_aj_url: z.string().optional().nullable(),
  foto_entrega_url: z.string().optional().nullable(),
  departamento: z.string().optional().nullable(),
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export function validateImageFile(file) {
  if (!file) return null
  if (!ALLOWED_TYPES.includes(file.type)) return 'Solo se permiten imágenes JPG, PNG o WEBP'
  if (file.size > MAX_SIZE) return 'La imagen no puede superar 5MB'
  return null
}
