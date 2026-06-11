import { getSupabaseBrowser } from '@/lib/supabase-browser'

export async function getCurrentBusiness() {
  const supabase = getSupabaseBrowser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return business
}
