'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function AIUsagePage() {
  const [usage, setUsage] = useState<any[]>([])

  const [stats, setStats] = useState({
    requests: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  })

  useEffect(() => {
    loadUsage()
  }, [])

  async function loadUsage() {
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
      .from('ai_usage')
      .select('*')
      .eq('business_id', currentBusiness.id)
      .order('created_at', {
        ascending: false,
      })

    const rows = data || []

    const requests = rows.length

    const inputTokens = rows.reduce(
      (sum: number, row: any) =>
        sum + (row.input_tokens || 0),
      0
    )

    const outputTokens = rows.reduce(
      (sum: number, row: any) =>
        sum + (row.output_tokens || 0),
      0
    )

    const totalTokens =
      inputTokens + outputTokens

    setStats({
      requests,
      inputTokens,
      outputTokens,
      totalTokens,
    })

    setUsage(rows)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Usage Dashboard</h1>

      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',
          marginBottom: 20,
        }}
      >
        <div style={card}>
          <h3>Total Requests</h3>
          <h1>{stats.requests}</h1>
        </div>

        <div style={card}>
          <h3>Input Tokens</h3>
          <h1>{stats.inputTokens}</h1>
        </div>

        <div style={card}>
          <h3>Output Tokens</h3>
          <h1>{stats.outputTokens}</h1>
        </div>

        <div style={card}>
          <h3>Total Tokens</h3>
          <h1>{stats.totalTokens}</h1>
        </div>
      </div>

      <h2>Usage Log</h2>

      {usage.length === 0 && (
        <p>No AI usage recorded yet.</p>
      )}

      {usage.map((item) => (
        <div
          key={item.id}
          style={card}
        >
          <p>
            <strong>Provider:</strong>
            {' '}
            {item.provider}
          </p>

          <p>
            <strong>Model:</strong>
            {' '}
            {item.model}
          </p>

          <p>
            <strong>Input Tokens:</strong>
            {' '}
            {item.input_tokens}
          </p>

          <p>
            <strong>Output Tokens:</strong>
            {' '}
            {item.output_tokens}
          </p>

          <p>
            <strong>Date:</strong>
            {' '}
            {new Date(
              item.created_at
            ).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}

const card = {
  border: '1px solid #ddd',
  borderRadius: 10,
  padding: 16,
  marginBottom: 12,
}
