'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function DashboardPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])

  const [stageFilter, setStageFilter] =
    useState<
      | 'all' 
      | 'hot' 
      | 'qualified' 
      | 'new'
      | 'appointment'
      | 'lost'
      | 'won'
    >('all')

  const [intentFilter, setIntentFilter] =
    useState<'all' | 'rent' | 'logistics' | 'travel'>('all')

  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    hotLeads: 0,
    appointments: 0,
    wonDeals: 0,
    conversionRate: 0,
  })

  // =========================
  // FETCH DATA CLIENT-SIDE
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabaseBrowser()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!business) {
        router.push('/onboarding')
        return
      }

      const currentBusiness = business as any

      console.log('Business:', business)

      const { data: leads } = await (supabase as any)
        .from('leads')
        .select('*')
        .eq('business_id', currentBusiness.id)

      const totalLeads = leads?.length || 0

      const hotLeads = 
        leads?.filter(
          (l: any) => l.stage === 'hot'
        ).length || 0

      const appointments =
        leads?.filter(
          (l: any) => l.stage === 'appointment'
        ).length || 0

      const wonDeals =
        leads?.filter(
          (l: any) => l.stage === 'won'
        ).length || 0

      const conversionRate =
        totalLeads === 0
          ? 0
          : Math.round(
              (wonDeals / totalLeads) * 100
            )

      setAnalytics({
        totalLeads,
        hotLeads,
        appointments,
        wonDeals,
        conversionRate,
      })

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('business_id', currentBusiness.id)
        .order('created_at', { ascending: false })
        .limit(100)

      console.log('Current business ID:', currentBusiness.id)
      console.log('Dashboard data:', data)
      console.log('Dashboard rows:', data?.length)
      console.log('Dashboard error:', error)

      setConversations(data || [])
    }

    fetchData()
  }, [])

  const filtered = useMemo(() => {
    return conversations
      .filter((c: any) => {
        const lead = c.lead_data || {}

        const stageMatch =
          stageFilter === 'all' || lead.stage === stageFilter

        const intentMatch =
          intentFilter === 'all' || lead.intent === intentFilter

        return stageMatch && intentMatch
      })
      .sort((a: any, b: any) => {
        const aStage = a.lead_data?.stage
        const bStage = b.lead_data?.stage

        if (aStage === 'hot') return -1
        if (bStage === 'hot') return 1
        return 0
      })
  }, [conversations, stageFilter, intentFilter])

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 'bold' }}>
        AI Receptionist CRM
      </h1>

      <div 
        style={{ 
          display: 'grid', 
          gap: 12, 
          marginBottom: 20,
          marginTop: 20,
          gridTemplateColumns: 
            'repeat(auto-fit, minmax(150px, 1fr))',
        }}
      >

        <div style={metriccard}>
          <h3>Total Leads</h3>
          <h1>{analytics.totalLeads}</h1>
        </div>

        <div style={metriccard}>
          <h3>Hot Leads</h3>
          <h1>{analytics.hotLeads}</h1>
        </div>

        <div style={metriccard}>
          <h3>Appointments</h3>
          <h1>{analytics.appointments}</h1>
        </div>

        <div style={metriccard}>
          <h3>Won Deals</h3>
          <h1>{analytics.wonDeals}</h1>
        </div>

        <div style={metriccard}>
          <h3>Conversion Rate</h3>
          <h1>
            {analytics.conversionRate}%
          </h1>
        </div>
      </div>

      <p style={{ marginBottom: 20, color: '#666' }}>
        Hot leads are prioritized automatically 🔥
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as any)}
          style={selectStyle}
        >
          <option value="all">All Stages</option>
          <option value="hot">Hot</option>
          <option value="qualified">Qualified</option>
          <option value="new">New</option>
          <option value="appointment">Appointment Set</option>
          <option value="lost">Lost</option>
          <option value="won">Won</option>
        </select>

        <select
          value={intentFilter}
          onChange={(e) => setIntentFilter(e.target.value as any)}
          style={selectStyle}
        >
          <option value="all">All Intents</option>
          <option value="rent">Rent</option>
          <option value="logistics">Logistics</option>
          <option value="travel">Travel</option>
        </select>

        <button
          onClick={() => router.push('/settings')}
          style={buttonStyle}
        >
          Settings
        </button>

        <button
          onClick={() => 
            router.push('/dashboard/pipeline')
          }
          style={buttonStyle}
        >
          Pipeline View
        </button>

        <button
          onClick={() => 
            router.push('/dashboard/analytics')
          }
          style={buttonStyle}
        >
          Analytics View
        </button>

        <button
          onClick={() => {
            setStageFilter('all')
            setIntentFilter('all')
          }}
          style={buttonStyle}
        >
          Reset Filters
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Phone</th>
            <th style={th}>Message</th>
            <th style={th}>AI Reply</th>
            <th style={th}>Intent</th>
            <th style={th}>Budget</th>
            <th style={th}>Locations</th>
            <th style={th}>Stage</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((c: any) => {
            const lead = c.lead_data || {}

            return (
              <tr 
                key={c.id}
                onClick={() =>
                  router.push(
                    `/dashboard/lead/${encodeURIComponent(
                      c.customer_phone
                    )}`
                  )
                }
                style={{ 
                  cursor: 'pointer',
                  }}
              >  
                <td style={td}>{c.customer_phone}</td>
                <td style={td}>{c.customer_message}</td>
                <td style={td}>{c.ai_response}</td>
                <td style={td}>{lead.intent || '-'}</td>
                <td style={td}>{lead.budget || '-'}</td>
                <td style={td}>
                  {lead.locations?.join(', ') || '-'}
                </td>
                <td style={td}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background:
                        lead.stage === 'hot'
                          ? 'red'
                          : lead.stage === 'qualified'
                          ? 'orange'
                          : '#888',
                      color: 'white',
                      fontSize: 12,
                    }}
                  >
                    {lead.stage || 'new'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const th = {
  textAlign: 'left' as const,
  borderBottom: '1px solid #ddd',
  padding: 10,
}

const td = {
  textAlign: 'left' as const,
  borderBottom: '1px solid #eee',
  padding: 10,
  verticalAlign: 'top' as const,
}

const selectStyle = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #ccc',
}

const buttonStyle = {
  padding: '8px 12px',
  borderRadius: 6,
  border: 'none',
  background: '#111',
  color: 'white',
  cursor: 'pointer',
}

const metriccard = {
  padding: 20,
  borderRadius: 8,
  background: 'white',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}