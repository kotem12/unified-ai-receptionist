'use client'

import { useEffect, useMemo, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [conversations, setConversations] = useState<any[]>([])

  const [stageFilter, setStageFilter] =
    useState<'all' | 'hot' | 'qualified' | 'new'>('all')

  const [intentFilter, setIntentFilter] =
    useState<'all' | 'rent' | 'logistics' | 'travel'>('all')

  // =========================
  // FETCH DATA CLIENT-SIDE
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

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
              <tr key={c.id}>
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