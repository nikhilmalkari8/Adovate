import { NextRequest } from 'next/server'
import { openai, MODEL } from '@/lib/openai'
import { lookupSection, searchActs } from '@/lib/acts/lookup'
import { buildResearchSystemPrompt } from '@/lib/prompts/research'
import type { AnswerLanguage, ExplanationStyle } from '@/lib/user-preferences'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      question: string
      history?: Message[]
      stream?: boolean
      explanationStyle?: ExplanationStyle
      answerLanguage?: AnswerLanguage
    }

    const {
      question,
      history = [],
      stream = false,
      explanationStyle = 'standard',
      answerLanguage = 'english',
    } = body

    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const sectionMatch = question.match(/(?:article|section|sec\.?)\s*(\d+[a-zA-Z]?)/i)
    const actMatch = question.match(/(constitution|ipc|crpc|cpc|evidence act|indian penal code)/i)

    let context = ''
    const citations: string[] = []
    let verified = false

    if (sectionMatch) {
      const sectionNum = sectionMatch[1]
      const actName = actMatch?.[1]?.toLowerCase() || 'constitution'

      const actMap: Record<string, string> = {
        constitution: 'constitution',
        ipc: 'ipc',
        'indian penal code': 'ipc',
        crpc: 'crpc',
        cpc: 'cpc',
        'evidence act': 'evidence',
      }

      const actKey = actMap[actName] || 'constitution'
      const section = await lookupSection(actKey, sectionNum)

      if (section) {
        context = `[Reference: ${section.citation}]\n${section.title}\n\n${section.text}`
        citations.push(section.citation)
        verified = true
      }
    }

    if (!verified) {
      const searchResults = await searchActs(question)
      if (searchResults.length > 0) {
        context = searchResults
          .map((r) => `[Reference: ${r.citation}]\n${r.title}\n${r.text}`)
          .join('\n\n---\n\n')
        citations.push(...searchResults.map((r) => r.citation))
        verified = true
      }
    }

    const sourceType = verified ? 'verified' : 'general'

    const systemPrompt = buildResearchSystemPrompt({
      context,
      explanationStyle,
      answerLanguage,
      verified,
    })

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ]

    const recentHistory = history.slice(-6)
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content })
    }
    messages.push({ role: 'user', content: question })

    if (stream) {
      const streamResponse = await openai.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.75,
        max_tokens: 2000,
        stream: true,
      })

      const encoder = new TextEncoder()

      const readableStream = new ReadableStream({
        async start(controller) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'meta', sourceType, citations: citations.length ? citations : undefined })}\n\n`
            )
          )

          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`)
              )
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        },
      })

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.75,
      max_tokens: 2000,
    })

    const fullResponse = completion.choices[0]?.message?.content || 'Unable to generate response.'

    const lines = fullResponse.split('\n')
    const suggestions: string[] = []
    const answerLines: string[] = []

    for (const line of lines) {
      if (line.trim().startsWith('→')) {
        suggestions.push(line.trim().substring(1).trim())
      } else {
        answerLines.push(line)
      }
    }

    const answer = answerLines.join('\n').trim()

    return new Response(
      JSON.stringify({
        answer,
        citations: citations.length > 0 ? citations : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        sourceType,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Research API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process question' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
