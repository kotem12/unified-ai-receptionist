'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function PipelinePage() {
  const router = useRouter()

  const [leads, setLeads] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [intentFilter, setIntentFilter] =
    useState('all')

  useEffect(() => {
    loadPipeline()
  }, [])

  async function loadPipeline() {
    const supabase = getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!business) return

    const currentBusiness = business as any

    const { data } = await (supabase as any)
      .from('leads')
      .select('*')
      .eq('business_id', currentBusiness.id)
      .order('created_at', {
        ascending: false,
      })

    setLeads(data || [])
  }

  const stages = [
    'new',
    'qualified',
    'hot',
    'appointment',
    'won',
    'lost',
  ]

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const phoneMatch =
        !search ||
        lead.customer_phone
          ?.toLowerCase()
          .includes(search.toLowerCase())

      const intentMatch =
        intentFilter === 'all' ||
        lead.intent === intentFilter

      return phoneMatch && intentMatch
    })
  }, [leads, search, intentFilter])

  const totalLeads = filteredLeads.length

  const hotLeads = filteredLeads.filter(
    (l) => l.stage === 'hot'
  ).length

  const appointments = filteredLeads.filter(
    (l) => l.stage === 'appointment'
  ).length

  const wonDeals = filteredLeads.filter(
    (l) => l.stage === 'won'
  ).length

  return (
    <div style={{ padding: 20 }}>
      <h1>Pipeline</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(180px,1fr))',
          gap: 12,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <div style={metricCard}>
          <h3>Total Leads</h3>
          <h1>{totalLeads}</h1>
        </div>

        <div style={metricCard}>
          <h3>Hot Leads</h3>
          <h1>{hotLeads}</h1>
        </div>

        <div style={metricCard}>
          <h3>Appointments</h3>
          <h1>{appointments}</h1>
        </div>

        <div style={metricCard}>
          <h3>Won Deals</h3>
          <h1>{wonDeals}</h1>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <input
          placeholder="Search phone..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={inputStyle}
        />

        <select
          value={intentFilter}
          onChange={(e) =>
            setIntentFilter(e.target.value)
          }
          style={inputStyle}
        >
          <option value="all">
            All Intents
          </option>

          <option value="rent">
            Rent
          </option>

          <option value="travel">
            Travel
          </option>

          <option value="logistics">
            Logistics
          </option>
        </select>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(6,minmax(260px,1fr))',
          gap: 16,
          overflowX: 'auto',
        }}
      >
        {stages.map((stage) => {
          const stageLeads =
            filteredLeads.filter(
              (lead) =>
                (lead.stage || 'new') === stage
            )

          return (
            <div
              key={stage}
              style={{
                background: '#f7f7f7',
                padding: 12,
                borderRadius: 10,
                minHeight: 650,
              }}
            >
              <h3
                style={{
                  textTransform: 'capitalize',
                }}
              >
                {stage}
                {' '}
                ({stageLeads.length})
              </h3>

              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/lead/${encodeURIComponent(
                        lead.customer_phone
                      )}`
                    )
                  }
                  style={{
                    background: 'white',
                    padding: 12,
                    marginBottom: 10,
                    borderRadius: 10,
                    cursor: 'pointer',
                    borderLeft:
                      `6px solid ${getStageColor(
                        lead.stage
                      )}`,
                    boxShadow:
                      '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <strong>
                    {lead.customer_phone}
                  </strong>

                  <p>
                    Intent:
                    {' '}
                    {lead.intent || '-'}
                  </p>

                  <p>
                    Score:
                    {' '}
                    {lead.score || 0}
                  </p>

                  <p>
                    Budget:
                    {' '}
                    {lead.budget || '-'}
                  </p>

                  <p>
                    Stage:
                    {' '}
                    {lead.stage || 'new'}
                  </p>

                  <small>
                    Updated:
                    {' '}
                    {new Date(
                      lead.created_at
                    ).toLocaleDateString()}
                  </small>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getStageColor(
  stage: string
) {
  switch (stage) {
    case 'hot':
      return '#ef4444'

    case 'qualified':
      return '#f59e0b'

    case 'appointment':
      return '#3b82f6'

    case 'won':
      return '#10b981'

    case 'lost':
      return '#6b7280'

    default:
      return '#9ca3af'
  }
}

const metricCard = {
  background: 'white',
  padding: 20,
  borderRadius: 10,
  boxShadow:
    '0 2px 4px rgba(0,0,0,0.1)',
}

const inputStyle = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #ddd',
}