'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import DashboardNav from '@/components/DashboardNav'

export default function BroadcastPage() {
  const [message, setMessage] =
    useState('')

  const [leads, setLeads] =
    useState<any[]>([])

  const [history, setHistory] =
    useState<any[]>([])

  useEffect(() => {
    loadLeads()
    loadHistory()
  }, [])

  async function loadLeads() {
    const supabase =
      getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: business } =
      await (supabase as any)
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!business) return

    const { data } =
      await (supabase as any)
        .from('leads')
        .select('*')
        .eq('business_id', business.id)

    setLeads(data || [])
  }

  async function loadHistory() {
    const supabase =
      getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: business } =
      await (supabase as any)
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!business) return

    const { data } =
      await (supabase as any)
        .from('outbound_messages')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', {
          ascending: false,
        })

    setHistory(data || [])
  }

  async function sendBroadcast() {
    if (!message.trim()) {
      alert('Enter message')
      return
    }

    const supabase =
      getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: business } =
      await (supabase as any)
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!business) return

    for (const lead of leads) {
      await (supabase as any)
        .from('outbound_messages')
        .insert({
          business_id: business.id,
          customer_phone:
            lead.customer_phone,
          channel: 'whatsapp',
          message,
          status: 'queued',
        })
    }

    alert(
      `Broadcast queued for ${leads.length} contacts`
    )

    setMessage('')

    loadHistory()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Broadcast Messaging</h1>

      <DashboardNav />

      <div
        style={{
          border: '1px solid #ddd',
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <h3>
          Send Broadcast
        </h3>

        <p>
          Recipients:
          {' '}
          {leads.length}
        </p>

        <textarea
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          placeholder="Enter campaign message..."
          style={{
            width: '100%',
            minHeight: 150,
            marginBottom: 10,
          }}
        />

        <button
          onClick={sendBroadcast}
        >
          Send Broadcast
        </button>
      </div>

      <h2>
        Broadcast History
      </h2>

      {history.map((item) => (
        <div
          key={item.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: 10,
            padding: 15,
            marginBottom: 10,
          }}
        >
          <p>
            {item.customer_phone}
          </p>

          <p>
            {item.message}
          </p>

          <p>
            Status:
            {' '}
            {item.status}
          </p>

          <p>
            Channel:
            {' '}
            {item.channel}
          </p>
        </div>
      ))}
    </div>
  )
}
