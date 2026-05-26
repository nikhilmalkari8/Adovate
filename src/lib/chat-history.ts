export interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: string[]
  suggestions?: string[]
  sourceType?: 'verified' | 'general'
}

export interface ChatSession {
  id: string
  title: string
  messages: StoredMessage[]
  createdAt: string
  updatedAt: string
}

const SESSIONS_KEY = 'nyay_chat_sessions'
const ACTIVE_KEY = 'nyay_active_session_id'
const MAX_SESSIONS = 50

function readSessions(): ChatSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeSessions(sessions: ChatSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
}

export function getChatSessions(): ChatSession[] {
  return readSessions().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function getActiveSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACTIVE_KEY)
}

export function setActiveSessionId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id)
  else localStorage.removeItem(ACTIVE_KEY)
}

export function createChatSession(firstMessage?: string): ChatSession {
  const session: ChatSession = {
    id: crypto.randomUUID(),
    title: firstMessage
      ? firstMessage.slice(0, 60) + (firstMessage.length > 60 ? '…' : '')
      : 'New conversation',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const sessions = [session, ...readSessions()]
  writeSessions(sessions)
  setActiveSessionId(session.id)
  return session
}

export function getChatSession(id: string): ChatSession | null {
  return readSessions().find((s) => s.id === id) ?? null
}

export function saveChatSession(session: ChatSession) {
  const sessions = readSessions()
  const idx = sessions.findIndex((s) => s.id === session.id)
  const updated = { ...session, updatedAt: new Date().toISOString() }
  if (idx >= 0) sessions[idx] = updated
  else sessions.unshift(updated)
  writeSessions(sessions)
}

export function deleteChatSession(id: string) {
  writeSessions(readSessions().filter((s) => s.id !== id))
  if (getActiveSessionId() === id) setActiveSessionId(null)
}

export function startNewChat(): ChatSession {
  setActiveSessionId(null)
  return createChatSession()
}
