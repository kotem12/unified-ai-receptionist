'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function TemplatesPage() {
  const [templates, setTemplates] =
    useState<any[]>([])

  const [title, setTitle] =
    useState('')

  const [message, setMessage] =
    useState('')

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    const supabase = getSupabaseBrowser()

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
        .from('quick_replies')
        .select('*')
        .eq('business_id', business.id)

    setTemplates(data || [])
  }

  async function createTemplate() {
    const supabase = getSupabaseBrowser()

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

    await (supabase as any)
      .from('quick_replies')
      .insert({
        business_id: business.id,
        title,
        message,
      })

    setTitle('')
    setMessage('')

    loadTemplates()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Quick Reply Templates</h1>

      <input
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        placeholder="Template title"
        style={{
          width: '100%',
          padding: 10,
          marginBottom: 10,
        }}
      />

      <textarea
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        placeholder="Template message"
        style={{
          width: '100%',
          minHeight: 120,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <button
        onClick={createTemplate}
      >
        Save Template
      </button>

      <div style={{ marginTop: 20 }}>
        {templates.map((t) => (
          <div
            key={t.id}
            style={{
              border: '1px solid #ddd',
              padding: 12,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >
            <strong>
              {t.title}
            </strong>

            <p>
              {t.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}