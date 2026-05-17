import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

let client: SupabaseClient<Database> | null = null

/** Returns Supabase client only when URL and anon key are configured (optional). */
export function getSupabase(): SupabaseClient<Database> | null {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) return null

  client = createClient<Database>(url, key, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return client
}
