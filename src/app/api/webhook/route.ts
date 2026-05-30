import { NextRequest, NextResponse } from 'next/server'
import { createOpenAI } from '@/lib/openai'
import { supabase } from '@/lib/supabase'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const incomingMessage = formData.get('Body')?.toString() || ''
    const customerPhone = formData.get('From')?.toString() || ''

    const business = {
      id: 'demo-business',
      niche: 'real_estate',
      name: 'Demo Business',
    }

    const systemPrompt = `
You are a professional WhatsApp receptionist for a ${business.niche} business.

Your job:
- Respond quickly and clearly
- Ask relevant follow-up questions
- Capture lead details
- Be polite and concise
- Never hallucinate services
- If unsure, escalate to human staff

If real estate:
Collect: budget, location, property type, inspection time

If logistics:
Collect: pickup location, destination, package type, urgency

If travel:
Collect: destination, travel date, visa needs, budget
`

    // =========================
    // 🧠 MEMORY LAYER
    // =========================
    let conversationHistory = ''

    try {
      const { data: history } = await supabase
        .from('conversations')
        .select('customer_message, ai_response')
        .eq('customer_phone', customerPhone)
        .order('created_at', { ascending: false })
        .limit(5)

      conversationHistory =
        history
          ?.reverse()
          .map(
            (h) =>
              `User: ${h.customer_message}\nAssistant: ${h.ai_response}`
          )
          .join('\n') || ''
    } catch {
      console.log('⚠️ Memory fetch failed')
    }

    let reply = ''
    let leadData: any = null

    // =========================
    // OPENAI CLIENT (SAFE)
    // =========================
    const openai = createOpenAI()

    // =========================
    // AI RESPONSE
    // =========================
    try {
      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'system',
            content: conversationHistory
              ? `Conversation history:\n${conversationHistory}`
              : 'No previous conversation history.',
          },
          { role: 'user', content: incomingMessage },
        ],
      })

      reply =
        aiResponse.choices[0].message.content ||
        'Sorry, I could not generate a response.'
    } catch (err) {
      console.log('⚠️ AI failed, using fallback')
      reply = generateMockAI(incomingMessage)
    }

    // =========================
    // CRM LEAD EXTRACTION
    // =========================
    try {
      const extraction = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
You are a CRM lead extraction engine.

Return ONLY valid JSON:

{
  "intent": "rent | buy | logistics | travel | unknown",
  "budget": "string or null",
  "locations": ["string"],
  "timeline": "string or null",
  "urgency": "low | medium | high",
  "stage": "new | qualified | hot"
}

Rules:
- Output ONLY JSON
- No explanation
- Use null if missing
`,
          },
          { role: 'user', content: incomingMessage },
        ],
      })

      const text = extraction.choices[0].message.content || '{}'

      try {
        leadData = JSON.parse(text)
      } catch {
        leadData = null
      }
    } catch {
      console.log('⚠️ Lead extraction failed')
    }

    // =========================
    // SAVE TO SUPABASE
    // =========================
    await supabase.from('conversations').insert({
      business_id: business.id,
      customer_phone: customerPhone,
      customer_message: incomingMessage,
      ai_response: reply,
      lead_data: leadData,
    })

    // =========================
    // TWILIO RESPONSE
    // =========================
    const twiml = new twilio.twiml.MessagingResponse()
    twiml.message(reply)

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    })
  } catch (error) {
    console.error('Webhook error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// =========================
// MOCK AI FALLBACK ENGINE
// =========================
function generateMockAI(message: string) {
  const msg = message.toLowerCase()

  if (
    msg.includes('apartment') ||
    msg.includes('house') ||
    msg.includes('rent')
  ) {
    return 'Got it 👍 What is your budget and preferred location?'
  }

  if (
    msg.includes('delivery') ||
    msg.includes('logistics') ||
    msg.includes('package') ||
    msg.includes('pickup')
  ) {
    return 'Please share pickup location, destination, and package details.'
  }

  if (
    msg.includes('travel') ||
    msg.includes('flight') ||
    msg.includes('visa')
  ) {
    return 'Where are you traveling to and what are your preferred dates?'
  }

  return 'Thanks for your message 👍 A team member will respond shortly.'
}