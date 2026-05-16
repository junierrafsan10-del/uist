import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase, isSupabaseConnected } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const timeoutRef = useRef(null)

  const fetchProfile = useCallback(async (userId) => {
    if (!supabase) return null
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
    return data
  }, [])

  useEffect(() => {
    // Safety timeout: force loading false after 3s
    timeoutRef.current = setTimeout(() => setLoading(false), 3000)

    if (!isSupabaseConnected) {
      setLoading(false)
      clearTimeout(timeoutRef.current)
      return
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) fetchProfile(u.id)
        setLoading(false)
        clearTimeout(timeoutRef.current)
      })
      .catch(() => {
        setLoading(false)
        clearTimeout(timeoutRef.current)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      else setProfile(null)
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [fetchProfile])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') }
    return await supabase.auth.signInWithPassword({ email, password })
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    sessionStorage.removeItem('authUser')
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isSupabaseConnected }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
