'use client'

import { useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage('')

    const supabase = getSupabaseBrowser()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage(
      'Account created successfully. Check your email for verification.'
    )

    setTimeout(() => {
      router.push('/login')
    }, 2000)

    setLoading(false)
  }

  return (
    <div style={container}>
      <form style={card} onSubmit={handleSignup}>
        <h1>Create Business Account</h1>

        <input
          style={input}
          placeholder="Business Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={button} disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>

        {message && (
          <p style={{ marginTop: 12 }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}

const container = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const card = {
  width: 400,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 12,
}

const input = {
  padding: 12,
  borderRadius: 8,
  border: '1px solid #ccc',
}

const button = {
  padding: 12,
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
}
