import type { FlashcardAttempt, FlashcardSessionSummary, FlashcardStats } from './types'

const STORAGE_KEY = 'learnbg.flashcards.stats.v1'
const MAX_ATTEMPTS = 4000
const MAX_SESSIONS = 500

export function createEmptyFlashcardStats(): FlashcardStats {
  return {
    totalCorrect: 0,
    totalWrong: 0,
    attempts: [],
    sessions: []
  }
}

export function loadFlashcardStats(): FlashcardStats {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return createEmptyFlashcardStats()
  }

  try {
    const parsed = JSON.parse(raw) as FlashcardStats

    return {
      totalCorrect: Number(parsed.totalCorrect || 0),
      totalWrong: Number(parsed.totalWrong || 0),
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : []
    }
  } catch {
    return createEmptyFlashcardStats()
  }
}

export function saveFlashcardStats(stats: FlashcardStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
}

export function clearFlashcardStats(): FlashcardStats {
  localStorage.removeItem(STORAGE_KEY)
  return createEmptyFlashcardStats()
}

export function appendFlashcardAttempt(attempt: FlashcardAttempt): FlashcardStats {
  const stats = loadFlashcardStats()

  if (attempt.correct) {
    stats.totalCorrect += 1
  } else {
    stats.totalWrong += 1
  }

  stats.attempts.push(attempt)
  if (stats.attempts.length > MAX_ATTEMPTS) {
    stats.attempts = stats.attempts.slice(stats.attempts.length - MAX_ATTEMPTS)
  }

  saveFlashcardStats(stats)
  return stats
}

export function appendFlashcardSession(session: FlashcardSessionSummary): FlashcardStats {
  const stats = loadFlashcardStats()

  stats.sessions.push(session)
  if (stats.sessions.length > MAX_SESSIONS) {
    stats.sessions = stats.sessions.slice(stats.sessions.length - MAX_SESSIONS)
  }

  saveFlashcardStats(stats)
  return stats
}
