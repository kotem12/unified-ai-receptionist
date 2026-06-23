'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import DashboardNav from '@/components/DashboardNav'

export default function KnowledgePage() {
  const [items, setItems] =
    useState<any[]>([])

  const [title, setTitle] =
    useState('')

  const [category, setCategory] =
    useState('')

  const [content, setContent] =
    useState('')

  useEffect(() => {
    loadKnowledge()
  }, [])

  async function loadKnowledge() {
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
        .from('knowledge_base')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', {
          ascending: false,
        })

    setItems(data || [])
  }

  async function createKnowledge() {
    if (
      !title.trim() ||
      !content.trim()
    ) {
      alert('Title and content required')
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

    await (supabase as any)
      .from('knowledge_base')
      .insert({
        business_id: business.id,
        title,
        category,
        content,
      })

    setTitle('')
    setCategory('')
    setContent('')

    loadKnowledge()
  }

  async function deleteKnowledge(
    id: string
  ) {
    const supabase =
      getSupabaseBrowser()

    await (supabase as any)
      .from('knowledge_base')
      .delete()
      .eq('id', id)

    loadKnowledge()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Knowledge Base</h1>

      <DashboardNav />

      <div
        style={{
          border: '1px solid #ddd',
          padding: 15,
          borderRadius: 10,
          marginBottom: 20,
        }}
      >
        <h3>Add Knowledge</h3>

        <input
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Title"
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 10,
          }}
        />

        <input
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          placeholder="Category"
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 10,
          }}
        />

        <textarea
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          placeholder="Knowledge Content"
          style={{
            width: '100%',
            minHeight: 150,
            marginBottom: 10,
          }}
        />

        <button
          onClick={createKnowledge}
        >
          Save Knowledge
        </button>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            border: '1px solid #ddd',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <h3>{item.title}</h3>

          <p>
            Category:
            {' '}
            {item.category || '-'}
          </p>

          <p>{item.content}</p>

          <button
            onClick={() =>
              deleteKnowledge(item.id)
            }
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
