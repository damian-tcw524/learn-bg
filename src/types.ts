export interface RoadmapItem {
  id: string
  title: string
  description: string
  file: string
}

export type LessonTone = 'info' | 'tip' | 'warning' | 'success'

export interface LessonLegacyItem {
  type?: 'item'
  letter?: string
  sound?: string
  bg?: string
  en?: string
  hint?: string
}

export interface LessonTableItem {
  type: 'table'
  headers: string[]
  rows: string[][]
}

export interface LessonNoteItem {
  type: 'note'
  title?: string
  text: string
  tone?: LessonTone
}

export interface LessonListItem {
  type: 'list'
  title?: string
  items: string[]
}

export interface LessonExampleItem {
  type: 'example'
  bg: string
  en: string
  note?: string
}

export interface LessonCardsItem {
  type: 'cards'
  title?: string
  cards: {
    front: string
    back: string
    hint?: string
  }[]
}

export interface LessonQuizItem {
  type: 'quiz'
  question: string
  answer: string
  choices?: string[]
  note?: string
}

export interface LessonRuleItem {
  type: 'rule'
  title?: string
  bullets: string[]
  note?: string
}

export interface LessonTabsItem {
  type: 'tabs'
  title?: string
  description?: string
  initialTabId?: string
  tabs: {
    id: string
    label: string
    description?: string
    content: LessonContentBlock[]
  }[]
}

export interface LessonSection {
  type: 'section'
  title: string
  description?: string
  content: LessonContentBlock[]
}

export type LessonContentBlock =
  | LessonLegacyItem
  | LessonTableItem
  | LessonNoteItem
  | LessonListItem
  | LessonExampleItem
  | LessonCardsItem
  | LessonQuizItem
  | LessonRuleItem
  | LessonTabsItem
  | LessonSection

export interface LessonData {
  title: string
  description?: string
  content: LessonContentBlock[]
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