import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useParticipantes() {
  return useQuery({
    queryKey: ['participantes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participantes')
        .select('*, cargas_participantes(id, nombre_archivo, created_at)')
        .order('numero', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data
    },
  })
}

export function useCargas() {
  return useQuery({
    queryKey: ['cargas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cargas_participantes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCargarParticipantes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ archivo, participantes }) => {
      // 1. Crear lote
      const { data: carga, error: e1 } = await supabase
        .from('cargas_participantes')
        .insert({ nombre_archivo: archivo, total_registros: participantes.length })
        .select()
        .single()
      if (e1) throw e1

      // 2. Insertar participantes en batches de 100
      const filas = participantes.map(p => ({ ...p, carga_id: carga.id }))
      for (let i = 0; i < filas.length; i += 100) {
        const { error } = await supabase.from('participantes').insert(filas.slice(i, i + 100))
        if (error) throw error
      }
      return carga
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['participantes'] })
      qc.invalidateQueries({ queryKey: ['cargas'] })
      qc.invalidateQueries({ queryKey: ['participantes-elegibles'] })
    },
  })
}

export function useEliminarCarga() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (cargaId) => {
      const { error } = await supabase
        .from('cargas_participantes')
        .delete()
        .eq('id', cargaId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['participantes'] })
      qc.invalidateQueries({ queryKey: ['cargas'] })
      qc.invalidateQueries({ queryKey: ['participantes-elegibles'] })
    },
  })
}
