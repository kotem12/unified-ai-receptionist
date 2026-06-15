'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function SettingsPage() {
  const [businessId, setBusinessId] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [aiTone, setAiTone] = useState('professional')
  const [aiPrompt, setAiPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [humanEscalationText, setHumanEscalationText] = useState('')
  const [captureLeads, setCaptureLeads] = useState(true)

  useEffect(() => {
    loadBusiness()
  }, [])

  async function loadBusiness() {
    const supabase = getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await (supabase as any)
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const business = data as any

    if (!data) return

    setBusinessId(data.id)
    setBusinessName(data.business_name || '')
    setBusinessType(data.business_type || '')
    setWhatsappNumber(data.whatsapp_number || '')
    setAiTone(data.ai_tone || 'professional')
    setAiPrompt(data.ai_prompt || '')
    setWelcomeMessage(data.welcome_message || '')
    setHumanEscalationText(data.human_escalation_text || '')
    setCaptureLeads(data.capture_leads ?? true)
  }

  async function saveSettings() {
    setSaving(true)

    const supabase = getSupabaseBrowser()

    const { error } = await (supabase as any)
      .from('businesses')
      .update({
        business_name: businessName,
        business_type: businessType,
        whatsapp_number: whatsappNumber,
        ai_tone: aiTone,
        ai_prompt: aiPrompt,

        welcome_message: welcomeMessage,
        human_escalation_text: humanEscalationText,
        capture_leads: captureLeads,
      })
      .eq('id', businessId)

    console.log(error)

    if (!error) {
      alert('Settings saved successfully')
    }

    setSaving(false)
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1>Business Settings</h1>

        <input
          style={input}
          value={businessName}
          onChange={(e) =>
            setBusinessName(e.target.value)
          }
          placeholder="Business Name"
        />

        <input
          style={input}
          value={businessType}
          onChange={(e) =>
            setBusinessType(e.target.value)
          }
          placeholder="Business Type"
        />

        <input
          style={input}
          value={whatsappNumber}
          onChange={(e) =>
            setWhatsappNumber(e.target.value)
          }
          placeholder="WhatsApp Number"
        />

        <select
          style={input}
          value={aiTone}
          onChange={(e) =>
            setAiTone(e.target.value)
          }
        >

        <input 
          style={input}
          value={welcomeMessage}
          onChange={(e) =>
            setWelcomeMessage(e.target.value)
          }
          placeholder="Welcome Message"
        />

        <input
          style={input}
          value={humanEscalationText}
          onChange={(e) =>
            setHumanEscalationText(e.target.value)
          }
          placeholder="Human Escalation Message"
        />

        <label>
          <input
            type="checkbox"
            checked={captureLeads}
            onChange={(e) =>
              setCaptureLeads(e.target.checked)
            }
          />

          Automatically Capture Leads
        </label>
        
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

        <textarea
          style={textarea}
          value={aiPrompt}
          onChange={(e) =>
            setAiPrompt(e.target.value)
          }
          placeholder="Custom AI Prompt"
        />

        <button
          onClick={saveSettings}
          style={button}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
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
  width: 700,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 12,
}

const input = {
  padding: 12,
  borderRadius: 8,
  border: '1px solid #ccc',
}

const textarea = {
  minHeight: 180,
  padding: 12,
  borderRadius: 8,
  border: '1px solid #ccc',
}

const button = {
  padding: 12,
  borderRadius: 8,
}
