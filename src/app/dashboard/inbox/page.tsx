'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import DashboardNav from '@/components/DashboardNav'

export default function InboxPage() {
  const [conversations, setConversations] =
    useState<any[]>([])

  const [statusFilter, setStatusFilter] =
    useState<'all' | 'open' | 'closed'>('all')

  const [showUnreadOnly, setShowUnreadOnly] =
    useState(false)

  const [replyText, setReplyText] =
    useState('')

  const [templates, setTemplates] =
    useState<any[]>([])

  useEffect(() => {
    loadInbox()
    loadTemplates()
  }, [])

  async function loadInbox() {
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
        .from('conversations')
        .select('*')
        .eq('business_id', business.id)
        .order(
          'last_customer_message_at',
          { ascending: false }
        )

    setConversations(data || [])
  }

  const filteredConversations =
    conversations.filter((c) => {

      const statusMatch = 
        statusFilter === 'all'
          ? true
          : (c.status || 'open') === statusFilter

      const unreadMatch =
        showUnreadOnly
          ? c.unread === true
          : true

      return statusMatch && unreadMatch
    })

  async function markAsRead(
    conversationId: number
  ) {
    const supabase = getSupabaseBrowser()

    await (supabase as any)
      .from('conversations')
      .update({
        unread: false,
      })
      .eq('id', conversationId)

    loadInbox()
  }

  async function closeConversation(
    conversationId: number
  ) {
    const supabase = getSupabaseBrowser()

    await (supabase as any)
      .from('conversations')
      .update({
        status: 'closed',
      })
      .eq('id', conversationId)

    loadInbox()
  }

  async function reopenConversation(
    conversationId: number
  ) {
    const supabase = getSupabaseBrowser()

    await (supabase as any)
      .from('conversations')
      .update({
        status: 'open',
      })
      .eq('id', conversationId)

    loadInbox()
  }

  async function assignConversation(
    conversationId: number,
    userName: string
  ) {
    const supabase = getSupabaseBrowser()

    await (supabase as any)
      .from('conversations')
      .update({
        assigned_to: userName,
      })
      .eq('id', conversationId)

    loadInbox()
  }

  async function enableHumanTakeover(
    conversationId: number
  ) {
    const supabase = getSupabaseBrowser()

    await (supabase as any)
      .from('conversations')
      .update({
        human_takeover: true,
      })
      .eq('id', conversationId)

    loadInbox()
  }

  async function disableHumanTakeover(
    conversationId: number
  ) {
    const supabase = getSupabaseBrowser()

    await (supabase as any)
      .from('conversations')
      .update({
        human_takeover: false,
      })
      .eq('id', conversationId)

    loadInbox()
  }

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

  async function sendReply(
    conversationId: number
  ) {
    if (!replyText.trim()) {
      alert('Enter reply')
      return
    }

    const supabase =
      getSupabaseBrowser()

    await (supabase as any)
      .from('conversations')
      .update({
        agent_reply: replyText,
        unread: false,
      })
      .eq('id', conversationId)

    alert('Reply saved')

    setReplyText('')

    loadInbox()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Shared Inbox</h1>

      <DashboardNav />

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
        }}
      >

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as any)
          }
        >
          <option value="all">
            All
          </option>

          <option value="open">
            Open
          </option>

          <option value="closed">
            Closed
          </option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) =>
              setShowUnreadOnly(e.target.checked)
            }
          />

          Unread Only
        </label>

      </div>

      {filteredConversations.map((c) => (
        <div
          key={c.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: 10,
            padding: 15,
            marginBottom: 10,
          }}
        >
          <h3>{c.customer_phone}</h3>

          <p>
            {c.customer_message}
          </p>

          <select
            onChange={(e) =>
              setReplyText(e.target.value)
            }
          >
            <option value="">
              Select Template
            </option>

            {templates.map((t) => (
              <option
                key={t.id}
                value={t.message}
              >
                {t.title}
              </option>
            ))}
          </select>

          <textarea
            value={replyText}
            onChange={(e) =>
              setReplyText(e.target.value)
            }
            placeholder="Type reply..."
            style={{
              width: '100%',
              minHeight: 100,
              marginTop: 10,
            }}
          />

          <p>
            Status:
            {' '}
            {c.status || 'open'}
          </p>

          <p>
            Assigned:
            {' '}
            {c.assigned_to || '-'}
          </p>

          <p>
            Unread:
            {' '}
            {c.unread ? 'Yes' : 'No'}
          </p>

          <p>
            Human Takeover:
            {' '}
            {c.human_takeover
              ? 'Enabled'
              : 'Disabled'}
          </p>

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            marginTop: 10,
          }}
        >

          <button
            onClick={() =>
              markAsRead(c.id)
            }
          >
            Mark Read
          </button>

          <button
            onClick={() =>
              closeConversation(c.id)
            }
          >
            Close
          </button>

          <button
            onClick={() =>
              sendReply(c.id)
            }
          >
            Send Reply
          </button>

          {!c.human_takeover && (
            <button
              onClick={() =>
                enableHumanTakeover(c.id)
              }
            >
              Human Takeover
            </button>
          )}

          {c.human_takeover && (
            <button
              onClick={() =>
                disableHumanTakeover(c.id)
              }
            >
              Return To AI
            </button>
          )}

          {c.status === 'closed' && (
            <button
              onClick={() =>
                reopenConversation(c.id)
              }
            >
                Reopen
            </button>
          )}

          <select
            value={c.assigned_to || ''}
            onChange={(e) =>
              assignConversation(
                c.id,
                e.target.value
              )
            }
          >

            <option value="">
                Unassigned
            </option>

            <option value="Sarah">
                Sarah
            </option>

            <option value="John">
                John
            </option>

            <option value="Manager">
                Manager
            </option>
          </select>
        </div>
      </div>
      ))}
    </div>
  )
}