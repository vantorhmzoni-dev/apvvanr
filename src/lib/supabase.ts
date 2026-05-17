import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function getAnonKey(): string | undefined {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  )
}

export function isSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && getAnonKey())
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anon = getAnonKey()
  if (!url || !anon) {
    throw new Error(
      'Supabase غير مُعد: عيّن VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY',
    )
  }
  if (!client) {
    client = createClient(url, anon)
  }
  return client
}
