import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

async function fetchArticulos() {
  const { data, error } = await supabase
    .from('articulos')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}

export function useArticulos() {
  return useQuery({
    queryKey: ['articulos'],
    queryFn: fetchArticulos,
  })
}
