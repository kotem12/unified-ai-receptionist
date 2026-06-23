'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import DashboardNav from '@/components/DashboardNav'

export default function TeamPage() {
  const [members, setMembers] =
    useState<any[]>([])

  const [fullName, setFullName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [role, setRole] =
    useState('agent')

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
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
        .from('team_members')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', {
          ascending: false,
        })

    setMembers(data || [])
  }

  async function createMember() {
    if (
      !fullName.trim() ||
      !email.trim()
    ) {
      alert('Name and email required')
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
      .from('team_members')
      .insert({
        business_id: business.id,
        full_name: fullName,
        email,
        role,
        active: true,
      })

    setFullName('')
    setEmail('')
    setRole('agent')

    loadMembers()
  }

  async function deactivateMember(
    memberId: string
  ) {
    const supabase =
      getSupabaseBrowser()

    await (supabase as any)
      .from('team_members')
      .update({
        active: false,
      })
      .eq('id', memberId)

    loadMembers()
  }

  async function activateMember(
    memberId: string
  ) {
    const supabase =
      getSupabaseBrowser()

    await (supabase as any)
      .from('team_members')
      .update({
        active: true,
      })
      .eq('id', memberId)

    loadMembers()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Team Members</h1>

      <DashboardNav />

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 10,
          padding: 15,
          marginBottom: 20,
        }}
      >
        <h3>Add Team Member</h3>

        <input
          value={fullName}
          onChange={(e) =>
            setFullName(e.target.value)
          }
          placeholder="Full Name"
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 10,
          }}
        />

        <input
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="Email"
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 10,
          }}
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
          style={{
            width: '100%',
            padding: 10,
            marginBottom: 10,
          }}
        >
          <option value="agent">
            Agent
          </option>

          <option value="manager">
            Manager
          </option>

          <option value="admin">
            Admin
          </option>
        </select>

        <button
          onClick={createMember}
        >
          Add Team Member
        </button>
      </div>

      {members.map((member) => (
        <div
          key={member.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: 10,
            padding: 15,
            marginBottom: 10,
          }}
        >
          <h3>
            {member.full_name}
          </h3>

          <p>
            {member.email}
          </p>

          <p>
            Role:
            {' '}
            {member.role}
          </p>

          <p>
            Status:
            {' '}
            {member.active
              ? 'Active'
              : 'Inactive'}
          </p>

          {member.active ? (
            <button
              onClick={() =>
                deactivateMember(
                  member.id
                )
              }
            >
              Deactivate
            </button>
          ) : (
            <button
              onClick={() =>
                activateMember(
                  member.id
                )
              }
            >
              Activate
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
