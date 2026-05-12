import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploader, uploadImage } from './ImageUploader'
import { useArticulos } from '@/hooks/useArticulos'
import { useCrearGanador, useEditarGanador } from '@/hooks/useGanadores'
import { ganadorSchema } from '@/lib/validations'
import { toast } from '@/hooks/use-toast'

export function GanadorForm({ ganador, onSuccess }) {
  const esEdicion = !!ganador
  const { data: articulos } = useArticulos()
  const crearMutation = useCrearGanador()
  const editarMutation = useEditarGanador()

  const [fotoFormulario, setFotoFormulario] = useState(ganador?.foto_formulario_aj_url ?? null)
  const [fotoEntrega, setFotoEntrega] = useState(ganador?.foto_entrega_url ?? null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(ganadorSchema),
    defaultValues: {
      nombre_ganador: ganador?.nombre_ganador ?? '',
      codigo: ganador?.codigo ?? '',
      articulo_id: ganador?.articulo_id ?? '',
      numero_carnet: ganador?.numero_carnet ?? '',
      foto_formulario_aj_url: ganador?.foto_formulario_aj_url ?? '',
      foto_entrega_url: ganador?.foto_entrega_url ?? '',
    },
  })

  const articuloSeleccionado = watch('articulo_id')

  async function onSubmit(values) {
    try {
      const urlFormulario = await uploadImage(fotoFormulario, 'formularios-aj')
      const urlEntrega = await uploadImage(fotoEntrega, 'entregas')

      const payload = { ...values, foto_formulario_aj_url: urlFormulario, foto_entrega_url: urlEntrega }

      if (esEdicion) {
        await editarMutation.mutateAsync({ id: ganador.id, formData: payload, articuloIdAnterior: ganador.articulo_id })
        toast({ title: 'Ganador actualizado correctamente', variant: 'success' })
      } else {
        await crearMutation.mutateAsync(payload)
        toast({ title: 'Ganador registrado correctamente', variant: 'success' })
      }
      onSuccess()
    } catch (err) {
      toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' })
    }
  }

  const isPending = crearMutation.isPending || editarMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nombre_ganador">Nombre completo *</Label>
          <Input id="nombre_ganador" {...register('nombre_ganador')} />
          {errors.nombre_ganador && <p className="text-xs text-red-500">{errors.nombre_ganador.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="codigo">Código del concurso *</Label>
          <Input id="codigo" {...register('codigo')} />
          {errors.codigo && <p className="text-xs text-red-500">{errors.codigo.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="numero_carnet">Número de carnet *</Label>
          <Input id="numero_carnet" {...register('numero_carnet')} />
          {errors.numero_carnet && <p className="text-xs text-red-500">{errors.numero_carnet.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Artículo ganado *</Label>
          <Select
            value={articuloSeleccionado}
            onValueChange={(v) => setValue('articulo_id', v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar artículo..." />
            </SelectTrigger>
            <SelectContent>
              {articulos?.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.nombre} — {a.stock_actual} disponibles
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.articulo_id && <p className="text-xs text-red-500">{errors.articulo_id.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageUploader
          label="Foto formulario AJ"
          folder="formularios-aj"
          value={ganador?.foto_formulario_aj_url}
          onChange={setFotoFormulario}
        />
        <ImageUploader
          label="Foto de entrega"
          folder="entregas"
          value={ganador?.foto_entrega_url}
          onChange={setFotoEntrega}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {esEdicion ? 'Guardar cambios' : 'Registrar ganador'}
        </Button>
      </div>
    </form>
  )
}
