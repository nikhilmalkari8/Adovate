import type { AnswerLanguage } from '@/lib/user-preferences'

/** English-only: user picks Simple / Standard / Professional */
export function isEnglishLanguage(lang: AnswerLanguage): boolean {
  return lang === 'english'
}

export const REGIONAL_COURT_STYLE = `Use court-spoken style (fixed — no Simple/Standard/Professional variants):
- Write like a practicing advocate explaining to a colleague in office or district court
- NOT literary, NOT textbook, NOT news editorial language
- Simple, direct sentences as advocates use today
- Standard English legal terms may stay in English (Section, IPC, bail, FIR, petition, etc.)
- Only use regional words advocates actually say in court; never invent translations
- Section numbers and citations always in English format`
