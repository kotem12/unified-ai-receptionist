import OpenAI from 'openai'

export function createOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing at runtime')
  }

  return new OpenAI({ apiKey })
}