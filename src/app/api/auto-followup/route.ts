import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()

  const { data: leads } =
    await (supabase as any)
      .from('leads')
      .select('*')

  for (const lead of leads || []) {

    const { data: existingTask } =
      await (supabase as any)
        .from('follow_up_tasks')
        .select('*')
        .eq('lead_id', lead.id)
        .eq('auto_created', true)
        .limit(1)
        .maybeSingle()

    if (existingTask) {
      continue
    }

    await (supabase as any)
      .from('follow_up_tasks')
      .insert({
        business_id: lead.business_id,
        lead_id: lead.id,
        task: 'Follow up with customer',
        task_type: 'auto_followup',
        auto_created: true,
        due_date: new Date(),
      })
  }

  return NextResponse.json({
    success: true,
  })
}
