import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error('Supabase env vars missing at runtime')
    }

    supabaseClient = createClient(url, key)
  }

  return supabaseClient
}