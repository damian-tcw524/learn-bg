export interface RoadmapItem {
  id: string
  title: string
  description: string
  file: string
}

export interface LessonContentItem {
  type?: 'item' | 'table'
  letter?: string
  sound?: string
  bg?: string
  en?: string
  headers?: string[]
  rows?: string[][]
}

export interface LessonSection {
  type: 'section'
  title: string
  description?: string
  content: LessonContentItem[]
}

export interface LessonData {
  title: string
  description?: string
  content: (LessonContentItem | LessonSection)[]
}

export interface FlashcardTopic {
  id: string
  label: string
  description?: string
}

export interface FlashcardItem {
  id: string
  topics: string[]
  bg: string
  en: string
  kind?: 'word' | 'phrase'
  hint?: string
}

export interface FlashcardData {
  version: number
  topics: FlashcardTopic[]
  cards: FlashcardItem[]
}

export interface FlashcardAttempt {
  timestamp: string
  cardId: string
  topics: string[]
  correct: boolean
}

export interface FlashcardSessionSummary {
  timestamp: string
  topicIds: string[]
  total: number
  correct: number
  wrong: number
}

export interface FlashcardStats {
  totalCorrect: number
  totalWrong: number
  attempts: FlashcardAttempt[]
  sessions: FlashcardSessionSummary[]
}