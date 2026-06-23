import OpenAI from 'openai'

let groqClient: OpenAI | null = null

export function getGroq() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      throw new Error('GROQ_API_KEY missing')
    }

    groqClient = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  }

  return groqClient
}
