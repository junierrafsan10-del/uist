import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const useSupabase = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = useSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConnected = useSupabase

export default supabase
