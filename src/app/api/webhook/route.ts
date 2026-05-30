import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'
import { getSupabase } from '@/lib/supabase'
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
    const supabase = getSupabase()
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
          .map((h: any) =>
              `User: ${h.customer_message}\nAssistant: ${h.ai_response}`
          )
          .join('\n') || ''
    } catch (err) {
      console.log('⚠️ Memory fetch failed, continuing without history')
    }

    let reply = ''
    let leadData: any = null

    let openaiClient: ReturnType<typeof getOpenAI> | null = null

    try {
      openaiClient = getOpenAI()
    } catch (err) {
      console.log('⚠️ OpenAI unavailable')
    }

    // =========================
    // AI LAYER
    // =========================
    try {
      if (!openaiClient) {
        throw new Error('OpenAI client unavailable')
      }

      const aiResponse = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'system',
            content:
              conversationHistory
                ? `Conversation history:\n${conversationHistory}`
                : 'No previous conversation history.',
          },
          {
            role: 'user',
            content: incomingMessage,
          },
        ],
      })

      reply =
        aiResponse.choices[0].message.content ||
        'Sorry, I could not generate a response.'
    } catch (error) {
      console.log('⚠️ OpenAI failed, switching to mock AI')
      reply = generateMockAI(incomingMessage)
    }

    // =========================
    // CRM LEAD EXTRACTION
    // =========================
    try {
      if (openaiClient) {
        const extraction = await openaiClient.chat.completions.create({
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
`
            },
            {
              role: 'user',
              content: incomingMessage,
            },
          ],
        })

        const text = extraction.choices[0].message.content || '{}'

        try {
          leadData = JSON.parse(text)
        } catch (err) {
          console.log('⚠️ Failed to parse lead JSON')
          leadData = null
        }
      }
    } catch (err) {
      console.log('⚠️ Lead extraction failed')
    }

// =========================
// 🚀 A–G WOW FEATURES (SAFE ENHANCEMENT LAYER)
// =========================
if (leadData) {
  let score = 0

  // A - Lead scoring (ENRICH ONLY)
  if (leadData.intent && leadData.intent !== 'unknown') score += 25
  if (leadData.budget) score += 25
  if (leadData.locations?.length) score += 20
  if (leadData.urgency === 'high') score += 30

  leadData.score = score

  // B - Stage computation (DO NOT DESTROY ORIGINAL VALUE)
  const computedStage =
    score >= 70 ? 'hot' :
    score >= 40 ? 'qualified' :
    'new'

  leadData.computed_stage = computedStage

  // keep original stage intact if it exists
  if (!leadData.stage) {
    leadData.stage = computedStage
  }

  // C - Missing info detection
  const missing: string[] = []

  if (!leadData.budget) missing.push('budget')
  if (!leadData.locations?.length) missing.push('location')
  if (!leadData.timeline) missing.push('timeline')

  leadData.missing_fields = missing

  // D - Smart follow-up injection (ONLY APPEND)
  if (missing.length > 0) {
    reply += `\n\nQuick question: can you share your ${missing[0]}?`
  }

  // E - Hot lead boost (NO LOGIC CHANGE)
  if (computedStage === 'hot') {
    reply += `\n\n🔥 A specialist will contact you shortly.`
  }

  // F - Engagement tag
  leadData.engagement =
    score >= 70 ? 'high' :
    score >= 40 ? 'medium' :
    'low'

  // G - n8n automation hook (SAFE + NON-BREAKING)
  const n8nUrl = process.env.N8N_WEBHOOK_URL

  if (n8nUrl && n8nUrl.startsWith('http')) {
    try {
      fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customerPhone,
          message: incomingMessage,
          reply,
          leadData,
          business: business.id,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // silent fail (non-blocking)
      })
    } catch {
      // prevent runtime crash
    }
  }
}

    // =========================
    // SAVE TO SUPABASE (FIXED)
    // =========================
    await supabase
      .from('conversations')
      .insert({
        business_id: business.id,
        customer_phone: customerPhone,
        customer_message: incomingMessage,
        ai_response: reply,
        lead_data: leadData,
      } as any)

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