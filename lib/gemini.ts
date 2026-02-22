import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!
const genAI = new GoogleGenerativeAI(apiKey)

export async function evaluateSpeaking(audioTranscript: string, question: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  
  const prompt = `
You are an IELTS examiner. Evaluate this speaking response and return JSON only.
Question: ${question}
Response: ${audioTranscript}

Return exactly this format:
{
  "overallBand": number,
  "fluency": number,
  "lexical": number,
  "grammar": number,
  "pronunciation": number,
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"],
  "detailedFeedback": "text here",
  "wordCount": number
}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return JSON.parse(text.replace(/```json|```/g, ''))
}

export async function evaluateWriting(essay: string, task: string, isTask1: boolean) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  
  const prompt = `
You are an IELTS examiner. Evaluate this ${isTask1 ? 'Task 1' : 'Task 2'} essay and return JSON only.
Task: ${task}
Essay: ${essay}

Return exactly this format:
{
  "overallBand": number,
  "taskResponse": number,
  "coherence": number,
  "lexical": number,
  "grammar": number,
  "corrections": [{"line": number, "error": "text", "correction": "text", "explanation": "text"}],
  "vocabularyUpgrades": [{"original": "word", "upgrade": "better word", "context": "sentence"}],
  "improvedEssay": "full corrected text",
  "tips": ["tip 1", "tip 2"]
}
`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  return JSON.parse(text.replace(/```json|```/g, ''))
}
