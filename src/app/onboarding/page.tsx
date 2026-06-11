'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function OnboardingPage() {
  const router = useRouter()

  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [aiTone, setAiTone] = useState('professional')

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    const supabase = getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    console.log('User:', user)

    const payload = {
        user_id: user.id,
        name: businessName,
        niche: businessType,
        business_name: businessName,
        business_type: businessType,
        whatsapp_number: whatsapp.startsWith('whatsapp:')
          ? whatsapp 
          : `whatsapp:${whatsapp}`,
        email,
        ai_tone: aiTone,
      }

      console.log('Submitting business:', payload)

      const { error } = await (supabase as any)
        .from('businesses')
        .insert(payload)

    console.log('Insert error:', error)

    if (!error) {
      router.push('/dashboard')
    }
  }

  return (
    <div style={container}>
      <form style={card} onSubmit={handleSubmit}>
        <h1>Business Setup</h1>

        <p>ONBOARDING VERSION 123</p>

        <input
          style={input}
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => {
            console.log('Business Name:', e.target.value)
            setBusinessName(e.target.value)
          }}
        />

        <input
          style={input}
          placeholder="Business Type"
          value={businessType}
          onChange={(e) =>
            setBusinessType(e.target.value)
          }
        />

        <input
          style={input}
          placeholder="WhatsApp Number"
          value={whatsapp}
          onChange={(e) =>
            setWhatsapp(e.target.value)
          }
        />

        <input
          style={input}
          placeholder="Business Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <select
          style={input}
          value={aiTone}
          onChange={(e) =>
            setAiTone(e.target.value)
          }
        >
          <option value="professional">
            Professional
          </option>
          <option value="friendly">
            Friendly
          </option>
          <option value="sales">
            Sales Focused
          </option>
        </select>

        <pre>
        {JSON.stringify(
          {
            businessName,
            businessType,
            whatsapp,
            email,
            aiTone,
          },
          null,
          2
        )}
        </pre>

        <button style={button}>
          Save Business
        </button>
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
  width: 500,
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
  borderRadius: 8,
}
