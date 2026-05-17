/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SUPABASE_FUNCTION_NAME?: string
  readonly VITE_WEBHOOK_URL?: string
  readonly VITE_SAVE_SUBMISSIONS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
