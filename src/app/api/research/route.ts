import { NextRequest } from 'next/server'
import { openai, MODEL } from '@/lib/openai'
import { lookupSection, searchActs } from '@/lib/acts/lookup'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { question, history = [], stream = false } = await request.json() as { 
      question: string
      history?: Message[]
      stream?: boolean
    }

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
        context = `[Reference: ${section.citation}]\n${section.title}\n\n${section.text}`
        citations.push(section.citation)
      }
    }

    if (!context) {
      const searchResults = await searchActs(question)
      if (searchResults.length > 0) {
        context = searchResults
          .map((r) => `[Reference: ${r.citation}]\n${r.title}\n${r.text}`)
          .join('\n\n---\n\n')
        citations.push(...searchResults.map((r) => r.citation))
      }
    }

    const systemPrompt = `You are a brilliant legal expert and researcher who loves helping advocates understand Indian law. You're like having a senior advocate friend who explains things clearly and engagingly.

Your personality:
- Warm, helpful, and genuinely interested in the question
- You explain complex legal concepts like you're having a conversation over chai
- You're thorough but not boring - you know when to be concise and when to elaborate
- You use examples and analogies to make things click
- You're honest about uncertainty - if something is debatable or you're not 100% sure, you say so naturally

${context ? `I found this relevant legal text for reference:

${context}

Use this as your source but explain it naturally - don't just recite it. Add your insights about why this matters, how it's applied in practice, and any important nuances.` : ''}

How you respond:
- Talk naturally, like a knowledgeable colleague would
- Structure your response in a way that's easy to follow, but don't be overly formal with headers unless it genuinely helps
- When citing sections/articles, weave them into your explanation naturally
- If the question is simple, give a simple answer - don't over-explain
- If it's complex, break it down step by step
- Feel free to mention related concepts the person might want to explore

Remember: The advocate asking you is smart - they just need clarity on this specific point. Respect their intelligence while being genuinely helpful.

At the end of your response, suggest 2-3 natural follow-up questions they might want to ask (format them on separate lines starting with "→").`

    const messages: { role: 'system' | 'user' | 'assistant', content: string }[] = [
      { role: 'system', content: systemPrompt },
    ]

    const recentHistory = history.slice(-6)
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content })
    }
    messages.push({ role: 'user', content: question })

    // Streaming response
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
          // Send citations first
          if (citations.length > 0) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'citations', citations })}\n\n`))
          }

          for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`))
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
          'Connection': 'keep-alive',
        },
      })
    }

    // Non-streaming response (fallback)
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

    return new Response(JSON.stringify({
      answer,
      citations: citations.length > 0 ? citations : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Research API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process question' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
