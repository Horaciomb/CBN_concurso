import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user.id
}

async function fetchGanadores({ articuloId, estado, busqueda, page = 1, pageSize = 10 }) {
  let query = supabase
    .from('ganadores')
    .select('*, articulos(nombre, stock_actual)', { count: 'exact' })
    .eq('eliminado', false)
    .order('created_at', { ascending: false })

  if (articuloId) query = query.eq('articulo_id', articuloId)
  if (estado === 'confirmados') query = query.eq('entrega_confirmada', true)
  if (estado === 'pendientes') query = query.eq('entrega_confirmada', false)
  if (busqueda) query = query.or(`nombre_ganador.ilike.%${busqueda}%,codigo.ilike.%${busqueda}%`)

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error
  return { data, count }
}

async function fetchGanadoresPorArticulo(articuloId) {
  const { data, error } = await supabase
    .from('ganadores')
    .select('nombre_ganador, codigo, numero_carnet, entrega_confirmada_at, foto_formulario_aj_url, foto_entrega_url')
    .eq('articulo_id', articuloId)
    .eq('entrega_confirmada', true)
    .eq('eliminado', false)
    .order('entrega_confirmada_at', { ascending: false })
  if (error) throw error
  return data
}

async function crearGanador(formData) {
  const userId = await getCurrentUserId()

  // Verificar stock disponible
  const { data: articulo, error: artError } = await supabase
    .from('articulos')
    .select('stock_actual')
    .eq('id', formData.articulo_id)
    .single()
  if (artError) throw artError
  if (articulo.stock_actual <= 0) throw new Error('No hay stock disponible para este artículo')

  const { data: ganador, error } = await supabase
    .from('ganadores')
    .insert({
      nombre_ganador: formData.nombre_ganador,
      codigo: formData.codigo,
      articulo_id: formData.articulo_id,
      numero_carnet: formData.numero_carnet,
      foto_formulario_aj_url: formData.foto_formulario_aj_url || null,
      foto_entrega_url: formData.foto_entrega_url || null,
      departamento: formData.departamento || null,
      eliminado: false,
      entrega_confirmada: false,
      created_by: userId,
    })
    .select()
    .single()
  if (error) throw error

  // Decrementar stock
  const { error: stockError } = await supabase
    .from('articulos')
    .update({ stock_actual: articulo.stock_actual - 1, updated_at: new Date().toISOString() })
    .eq('id', formData.articulo_id)
  if (stockError) throw stockError

  // Registrar auditoría
  await supabase.from('auditoria_stock').insert({
    articulo_id: formData.articulo_id,
    stock_anterior: articulo.stock_actual,
    stock_nuevo: articulo.stock_actual - 1,
    motivo: 'entrega_registrada',
    ganador_id: ganador.id,
    realizado_by: userId,
  })

  return ganador
}

async function editarGanador({ id, formData, articuloIdAnterior }) {
  const userId = await getCurrentUserId()

  const cambioPremio = formData.articulo_id !== articuloIdAnterior

  if (cambioPremio) {
    // Devolver stock al artículo anterior
    const { data: artAnterior } = await supabase
      .from('articulos').select('stock_actual').eq('id', articuloIdAnterior).single()
    const { data: artNuevo } = await supabase
      .from('articulos').select('stock_actual').eq('id', formData.articulo_id).single()

    if (artNuevo.stock_actual <= 0) throw new Error('No hay stock disponible para el nuevo artículo')

    await supabase.from('articulos')
      .update({ stock_actual: artAnterior.stock_actual + 1, updated_at: new Date().toISOString() })
      .eq('id', articuloIdAnterior)

    await supabase.from('articulos')
      .update({ stock_actual: artNuevo.stock_actual - 1, updated_at: new Date().toISOString() })
      .eq('id', formData.articulo_id)

    await supabase.from('auditoria_stock').insert([
      { articulo_id: articuloIdAnterior, stock_anterior: artAnterior.stock_actual, stock_nuevo: artAnterior.stock_actual + 1, motivo: 'ajuste_manual', ganador_id: id, realizado_by: userId },
      { articulo_id: formData.articulo_id, stock_anterior: artNuevo.stock_actual, stock_nuevo: artNuevo.stock_actual - 1, motivo: 'entrega_registrada', ganador_id: id, realizado_by: userId },
    ])
  }

  const { data, error } = await supabase
    .from('ganadores')
    .update({
      nombre_ganador: formData.nombre_ganador,
      codigo: formData.codigo,
      articulo_id: formData.articulo_id,
      numero_carnet: formData.numero_carnet,
      foto_formulario_aj_url: formData.foto_formulario_aj_url || null,
      foto_entrega_url: formData.foto_entrega_url || null,
      departamento: formData.departamento || null,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

async function eliminarGanador(ganador) {
  const userId = await getCurrentUserId()

  const { error } = await supabase
    .from('ganadores')
    .update({ eliminado: true, eliminado_at: new Date().toISOString(), eliminado_by: userId })
    .eq('id', ganador.id)
  if (error) throw error

  // Devolver stock
  const { data: articulo } = await supabase
    .from('articulos').select('stock_actual').eq('id', ganador.articulo_id).single()

  await supabase.from('articulos')
    .update({ stock_actual: articulo.stock_actual + 1, updated_at: new Date().toISOString() })
    .eq('id', ganador.articulo_id)

  await supabase.from('auditoria_stock').insert({
    articulo_id: ganador.articulo_id,
    stock_anterior: articulo.stock_actual,
    stock_nuevo: articulo.stock_actual + 1,
    motivo: 'entrega_eliminada',
    ganador_id: ganador.id,
    realizado_by: userId,
  })
}

async function confirmarEntrega(ganadorId) {
  const userId = await getCurrentUserId()
  const { data, error } = await supabase
    .from('ganadores')
    .update({ entrega_confirmada: true, entrega_confirmada_at: new Date().toISOString(), updated_by: userId, updated_at: new Date().toISOString() })
    .eq('id', ganadorId)
    .select()
    .single()
  if (error) throw error
  return data
}

export function useGanadores(filtros) {
  return useQuery({
    queryKey: ['ganadores', filtros],
    queryFn: () => fetchGanadores(filtros),
    keepPreviousData: true,
  })
}

export function useGanadoresPorArticulo(articuloId) {
  return useQuery({
    queryKey: ['ganadores-publicos', articuloId],
    queryFn: () => fetchGanadoresPorArticulo(articuloId),
    enabled: !!articuloId,
  })
}

async function fetchEntregasPorDepartamento(articuloId) {
  let query = supabase
    .from('ganadores')
    .select('departamento, articulo_id')
    .eq('entrega_confirmada', true)
    .eq('eliminado', false)
    .not('departamento', 'is', null)

  if (articuloId) query = query.eq('articulo_id', articuloId)

  const { data, error } = await query
  if (error) throw error

  const counts = {}
  for (const g of data) counts[g.departamento] = (counts[g.departamento] || 0) + 1

  return Object.entries(counts)
    .map(([departamento, count]) => ({ departamento, count }))
    .sort((a, b) => b.count - a.count)
}

export function useEntregasPorDepartamento(articuloId) {
  return useQuery({
    queryKey: ['entregas-por-departamento', articuloId ?? null],
    queryFn: () => fetchEntregasPorDepartamento(articuloId),
  })
}

export function useCrearGanador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: crearGanador,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ganadores'] })
      qc.invalidateQueries({ queryKey: ['articulos'] })
    },
  })
}

export function useEditarGanador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: editarGanador,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ganadores'] })
      qc.invalidateQueries({ queryKey: ['articulos'] })
      qc.invalidateQueries({ queryKey: ['entregas-por-departamento'] })
    },
  })
}

export function useEliminarGanador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: eliminarGanador,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ganadores'] })
      qc.invalidateQueries({ queryKey: ['articulos'] })
      qc.invalidateQueries({ queryKey: ['entregas-por-departamento'] })
    },
  })
}

export function useConfirmarEntrega() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: confirmarEntrega,
    onMutate: async (ganadorId) => {
      await qc.cancelQueries({ queryKey: ['ganadores'] })
      const snapshot = qc.getQueriesData({ queryKey: ['ganadores'] })
      qc.setQueriesData({ queryKey: ['ganadores'] }, (old) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((g) =>
            g.id === ganadorId ? { ...g, entrega_confirmada: true, entrega_confirmada_at: new Date().toISOString() } : g
          ),
        }
      })
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        ctx.snapshot.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data))
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['ganadores'] })
      qc.invalidateQueries({ queryKey: ['ganadores-publicos'] })
      qc.invalidateQueries({ queryKey: ['entregas-por-departamento'] })
    },
  })
}
