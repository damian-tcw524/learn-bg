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