export type ExplanationStyle = 'simple' | 'standard' | 'professional'

export type AnswerLanguage =
  | 'english'
  | 'hindi'
  | 'hinglish'
  | 'bengali'
  | 'tamil'
  | 'telugu'
  | 'marathi'
  | 'gujarati'
  | 'kannada'
  | 'malayalam'
  | 'punjabi'
  | 'odia'
  | 'urdu'
  | 'assamese'

export interface UserPreferences {
  explanationStyle: ExplanationStyle
  answerLanguage: AnswerLanguage
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  explanationStyle: 'standard',
  answerLanguage: 'english',
}

const STORAGE_KEY = 'nyay_user_preferences'

export const EXPLANATION_STYLE_OPTIONS: {
  value: ExplanationStyle
  label: string
  description: string
}[] = [
  {
    value: 'simple',
    label: 'Simple',
    description: 'Easy words, short sentences, everyday language',
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Clear English with brief explanations',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Dense legal language for experienced advocates',
  },
]

/** Languages GPT handles well for Indian legal Q&A */
export const ANSWER_LANGUAGE_OPTIONS: {
  value: AnswerLanguage
  label: string
  tier: 'primary' | 'regional'
}[] = [
  { value: 'english', label: 'English', tier: 'primary' },
  { value: 'hindi', label: 'हिंदी (Hindi)', tier: 'primary' },
  { value: 'hinglish', label: 'Hinglish', tier: 'primary' },
  { value: 'bengali', label: 'বাংলা (Bengali)', tier: 'regional' },
  { value: 'tamil', label: 'தமிழ் (Tamil)', tier: 'regional' },
  { value: 'telugu', label: 'తెలుగు (Telugu)', tier: 'regional' },
  { value: 'marathi', label: 'मराठी (Marathi)', tier: 'regional' },
  { value: 'gujarati', label: 'ગુજરાતી (Gujarati)', tier: 'regional' },
  { value: 'kannada', label: 'ಕನ್ನಡ (Kannada)', tier: 'regional' },
  { value: 'malayalam', label: 'മലയാളം (Malayalam)', tier: 'regional' },
  { value: 'punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)', tier: 'regional' },
  { value: 'odia', label: 'ଓଡ଼ିଆ (Odia)', tier: 'regional' },
  { value: 'urdu', label: 'اردو (Urdu)', tier: 'regional' },
  { value: 'assamese', label: 'অসমীয়া (Assamese)', tier: 'regional' },
]

export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function setUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const next = { ...getUserPreferences(), ...prefs }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('nyay-preferences-updated', { detail: next }))
  return next
}
