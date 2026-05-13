import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [rol, setRol] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadFromSession(session) {
    setUser(session?.user ?? null)

    if (session?.user?.id) {
      const { data } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', session.user.id)
        .single()
      setRol(data?.rol ?? null)
    } else {
      setRol(null)
    }
  }

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      await loadFromSession(session)
      if (mounted) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadFromSession(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    rol,
    loading,
    login,
    logout,
    isAdmin: rol === 'admin',
    isViewer: rol === 'viewer',
  }
}
