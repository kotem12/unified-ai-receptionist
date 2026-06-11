'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setError('')
    setLoading(true)

    const supabase = getSupabaseBrowser()
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={container}>
      <form style={card} onSubmit={handleLogin}>
        <h1>Login</h1>

        <input
          style={input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          type="submit"
          style={button}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && (
          <p style={{ color: 'red' }}>
            {error}
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
  background: '#111',
  color: '#fff',
}