import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/** Historial completo de sorteos */
export function useSorteoHistorial() {
  return useQuery({
    queryKey: ['sorteos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sorteos_raspadita')
        .select('*, participante:participante_id(departamento, codigo, premio)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

/**
 * Lista de participantes elegibles:
 * - excluye quienes ya ganaron (por id)
 * - excluye quienes tienen el mismo CI que un ganador anterior (misma persona, otro registro)
 */
export function useElegibles() {
  return useQuery({
    queryKey: ['participantes-elegibles'],
    queryFn: async () => {
      const { data: sorteos } = await supabase
        .from('sorteos_raspadita')
        .select('participante_id, ci_ganador')

      const ganadorIds = new Set((sorteos || []).map(s => s.participante_id).filter(Boolean))
      const ganadorCIs = new Set(
        (sorteos || []).map(s => s.ci_ganador).filter(v => v && v !== '-' && v !== null)
      )

      const { data, error } = await supabase
        .from('participantes')
        .select('id, nombre_completo, ci, departamento, premio, email, telefono, codigo, numero')
        .order('id', { ascending: true }) // orden determinista para virtualPos

      if (error) throw error

      return data.filter(p => {
        if (ganadorIds.has(p.id)) return false
        if (p.ci && p.ci !== '-' && ganadorCIs.has(p.ci)) return false
        return true
      })
    },
  })
}

/** Guarda el resultado de un sorteo en Supabase */
export function useRegistrarSorteo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ ganador, virtualPos, totalElegibles, hash, seed, timestamp }) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('sorteos_raspadita').insert({
        seed,
        timestamp_ejecutado: timestamp,
        total_elegibles: totalElegibles,
        posicion_virtual: virtualPos,
        participante_id: ganador.id,
        nombre_ganador: ganador.nombre_completo,
        ci_ganador: ganador.ci,
        hash_verificacion: hash,
        ejecutado_por: user?.id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sorteos'] })
      qc.invalidateQueries({ queryKey: ['participantes-elegibles'] })
    },
  })
}
