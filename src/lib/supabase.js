import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const useSupabase = !!(supabaseUrl && supabaseAnonKey)

export const supabase = useSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConnected = useSupabase

// Log connection status (helps debug Vercel issues)
if (typeof window !== 'undefined') {
  if (useSupabase) {
    console.log('✅ Supabase connected:', supabaseUrl)
  } else {
    console.warn('⚠️ Supabase NOT connected - check environment variables')
    console.warn('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
    console.warn('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING')
  }
}

export default supabase
