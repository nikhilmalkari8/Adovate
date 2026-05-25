import { NextRequest, NextResponse } from 'next/server'
import { openai, MODEL } from '@/lib/openai'
import { lookupSection, searchActs } from '@/lib/acts/lookup'

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const sectionMatch = question.match(/(?:article|section|sec\.?)\s*(\d+[a-zA-Z]?)/i)
    const actMatch = question.match(/(constitution|ipc|crpc|cpc|evidence act|indian penal code)/i)

    let context = ''
    const citations: string[] = []

    if (sectionMatch) {
      const sectionNum = sectionMatch[1]
      const actName = actMatch?.[1]?.toLowerCase() || 'constitution'
      
      const actMap: Record<string, string> = {
        'constitution': 'constitution',
        'ipc': 'ipc',
        'indian penal code': 'ipc',
        'crpc': 'crpc',
        'cpc': 'cpc',
        'evidence act': 'evidence',
      }
      
      const actKey = actMap[actName] || 'constitution'
      const section = await lookupSection(actKey, sectionNum)
      
      if (section) {
        context = `[${section.citation}]\n${section.title}\n\n${section.text}`
        citations.push(section.citation)
      }
    }

    if (!context) {
      const searchResults = await searchActs(question)
      if (searchResults.length > 0) {
        context = searchResults
          .map((r) => `[${r.citation}]\n${r.title}\n${r.text}`)
          .join('\n\n---\n\n')
        citations.push(...searchResults.map((r) => r.citation))
      }
    }

    const systemPrompt = `You are a knowledgeable legal research assistant specializing in Indian law. You help advocates understand the Constitution of India, Indian Penal Code (IPC), Code of Criminal Procedure (CrPC), Code of Civil Procedure (CPC), and other Indian laws.

${context ? `Use the following verified legal text as your primary source. Explain it in your own words, provide context, and cite the section/article.

VERIFIED LEGAL TEXT:
${context}

Instructions:
- Explain the provision in simple, clear language
- Add relevant context (purpose, importance, practical application)
- Always cite the specific section/article
- Don't just repeat the text - explain and elaborate` : 'Answer based on your knowledge of Indian law. If unsure, say so.'}

Guidelines:
- Be conversational yet professional
- Explain legal concepts in simple terms any advocate can understand
- If you're not certain about something, clearly say so
- For case law citations, note this is beta - always verify independently

DISCLAIMER: This is AI-assisted research. Always verify information from official sources.`

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    })

    const answer = completion.choices[0]?.message?.content || 'Unable to generate response.'

    return NextResponse.json({
      answer,
      citations: citations.length > 0 ? citations : undefined,
    })
  } catch (error) {
    console.error('Research API error:', error)
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
}
