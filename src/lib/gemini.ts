import { GoogleGenerativeAI } from '@google/generative-ai'

let geminiClient: GoogleGenerativeAI | null = null

export function getGemini() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing')
    }

    geminiClient = new GoogleGenerativeAI(apiKey)
  }

  return geminiClient
}
