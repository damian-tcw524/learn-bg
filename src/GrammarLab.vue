<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import LessonBlock from './components/LessonBlock.vue'
import TabbedLessonBlock, { type TabbedLessonBlockTab } from './components/TabbedLessonBlock.vue'
import type { LessonContentBlock, LessonData } from './types'

interface GrammarModuleIndexItem {
  id: string
  title: string
  description: string
  focus: string[]
  file: string
}

interface GrammarIndex {
  title: string
  description: string
  modules: GrammarModuleIndexItem[]
}

interface VerbConjugationSet {
  id: string
  label: string
  note: string
  infinitive: string
  forms: {
    present: { bg: string[]; en: string[] }
    past: { bg: string[]; en: string[] }
    future: { bg: string[]; en: string[] }
    conditional: { bg: string[]; en: string[] }
  }
}

interface VerbConjugationData {
  title: string
  description: string
  persons: string[]
  verbs: VerbConjugationSet[]
}

const grammarIndex = ref<GrammarIndex | null>(null)
const verbLab = ref<VerbConjugationData | null>(null)
const selectedModuleId = ref('')
const selectedLesson = ref<LessonData | null>(null)
const selectedVerbId = ref('')
const loading = ref(true)
const loadError = ref('')

const selectedModule = computed(() => {
  return grammarIndex.value?.modules.find((module) => module.id === selectedModuleId.value) ?? null
})

const totalFocusAreas = computed(() => {
  const focus = grammarIndex.value?.modules.flatMap((module) => module.focus) ?? []
  return new Set(focus).size
})

const lessonBlockCount = computed(() => selectedLesson.value?.content.length ?? 0)

const selectedVerb = computed(() => {
  return verbLab.value?.verbs.find((verb) => verb.id === selectedVerbId.value) ?? null
})

const buildTenseRows = (tense: keyof VerbConjugationSet['forms']) => {
  const verb = selectedVerb.value
  const persons = verbLab.value?.persons ?? []

  if (!verb) {
    return []
  }

  return persons.map((person, index) => ({
    person,
    bg: verb.forms[tense].bg[index] ?? '',
    en: verb.forms[tense].en[index] ?? ''
  }))
}

const verbTenseTabs = computed(() => {
  const verb = selectedVerb.value

  if (!verb) {
    return []
  }

  const tabs: TabbedLessonBlockTab[] = [
    {
      id: 'present',
      label: 'Present / Настояще',
      description: 'The present tense uses person endings that usually make the subject clear.',
      content: [
        {
          type: 'table',
          headers: ['Person', 'Bulgarian', 'English'],
          rows: buildTenseRows('present').map((row) => [row.person, row.bg, row.en])
        },
        {
          type: 'note',
          tone: 'tip',
          title: 'Present tense focus',
          text: 'Use this tab to compare the person endings and the English translation at the same time.'
        }
      ]
    },
    {
      id: 'past',
      label: 'Past / Минало',
      description: 'The past tab shows the completed or historical forms of the selected verb.',
      content: [
        {
          type: 'table',
          headers: ['Person', 'Bulgarian', 'English'],
          rows: buildTenseRows('past').map((row) => [row.person, row.bg, row.en])
        },
        {
          type: 'note',
          tone: 'info',
          title: 'Past tense focus',
          text: 'Compare the Bulgarian shape with the English past meaning so the time reference stays clear.'
        }
      ]
    },
    {
      id: 'future',
      label: 'Future / Бъдеще',
      description: 'The future tab shows how ще combines with the verb for planned or upcoming actions.',
      content: [
        {
          type: 'table',
          headers: ['Person', 'Bulgarian', 'English'],
          rows: buildTenseRows('future').map((row) => [row.person, row.bg, row.en])
        },
        {
          type: 'note',
          tone: 'info',
          title: 'Future tense focus',
          text: 'The English column shows the natural translation, not a word-for-word mapping.'
        }
      ]
    },
    {
      id: 'conditional',
      label: 'Conditional / Условно',
      description: 'The conditional tab shows hypothetical or polite forms.',
      content: [
        {
          type: 'table',
          headers: ['Person', 'Bulgarian', 'English'],
          rows: buildTenseRows('conditional').map((row) => [row.person, row.bg, row.en])
        },
        {
          type: 'note',
          tone: 'warning',
          title: 'Conditional tense focus',
          text: 'This is the best tab for comparing polite and imagined meanings in both languages.'
        }
      ]
    }
  ]

  return tabs
})

const lessonGuideTabs = computed(() => {
  const module = selectedModule.value
  const lesson = selectedLesson.value

  if (!module || !lesson) {
    return []
  }

  const overviewTab: TabbedLessonBlockTab = {
    id: 'overview',
    label: 'Overview',
    description: 'A quick summary of the active lesson before you scroll into the full content.',
    content: [
      {
        type: 'note',
        tone: 'info',
        title: module.title,
        text: lesson.description ?? module.description
      },
      {
        type: 'list',
        title: 'Core focus',
        items: module.focus.map((focus) => focus)
      }
    ]
  }

  const studyTab: TabbedLessonBlockTab = {
    id: 'study',
    label: 'Study path',
    description: 'Use this tab when you want a compact plan for how to review the lesson.',
    content: [
      {
        type: 'rule',
        title: 'How to study this module',
        bullets: [
          'Read the summary first.',
          'Compare the examples with the tables or cards in the lesson below.',
          'Say the forms out loud before moving to the next module.',
          'Return to the verb conjugator when you need tense comparison.'
        ]
      },
      {
        type: 'note',
        tone: 'tip',
        title: 'Mobile-first review',
        text: 'On a phone, use the tabs to keep the lesson compact and switch between the overview and the study plan without scrolling through the whole page.'
      }
    ]
  }

  const practiceTab: TabbedLessonBlockTab = {
    id: 'practice',
    label: 'Practice',
    description: 'A small self-check panel for the active lesson.',
    content: [
      {
        type: 'cards',
        title: 'Remember these cues',
        cards: module.focus.map((focus) => ({
          front: focus,
          back: lesson.title,
          hint: 'Use the lesson content below to find a matching example or table.'
        }))
      },
      {
        type: 'note',
        tone: 'success',
        title: 'Next action',
        text: 'If the overview feels clear, scroll to the full lesson blocks and look for one example you can explain back in your own words.'
      }
    ]
  }

  return [overviewTab, studyTab, practiceTab]
})

const fetchJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(`${import.meta.env.BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`Could not load ${path}`)
  }

  return response.json() as Promise<T>
}

const loadModule = async (module: GrammarModuleIndexItem) => {
  selectedModuleId.value = module.id
  selectedLesson.value = await fetchJson<LessonData>(`data/grammar/${module.file}`)
}

const loadVerb = (verbId: string) => {
  selectedVerbId.value = verbId
}

onMounted(async () => {
  try {
    const [grammarData, verbData] = await Promise.all([
      fetchJson<GrammarIndex>('data/grammar/index.json'),
      fetchJson<VerbConjugationData>('data/grammar/verbs.json')
    ])

    grammarIndex.value = grammarData
    verbLab.value = verbData

    if (!grammarIndex.value.modules.length) {
      throw new Error('No grammar modules were found.')
    }

    await loadModule(grammarIndex.value.modules[0])

    if (verbLab.value.verbs.length) {
      await loadVerb(verbLab.value.verbs[0].id)
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Unexpected error while loading grammar lab.'
  } finally {
    loading.value = false
  }
})

const getBlockId = (index: number) => `grammar-block-${index}`
</script>

<template>
  <main class="grammar-lab">
    <section class="hero">
      <div>
        <p class="eyebrow">Grammar Lab</p>
        <h1>{{ grammarIndex?.title ?? 'Loading grammar lab' }}</h1>
        <p class="subtitle">
          {{ grammarIndex?.description ?? 'Building a structured grammar curriculum.' }}
        </p>
      </div>

      <div class="hero-metrics">
        <div class="metric">
          <span class="metric-value">{{ grammarIndex?.modules.length ?? 0 }}</span>
          <span class="metric-label">modules</span>
        </div>
        <div class="metric">
          <span class="metric-value">{{ totalFocusAreas }}</span>
          <span class="metric-label">focus areas</span>
        </div>
      </div>
    </section>

    <section class="conjugator-card">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Verb conjugator</p>
          <h2>{{ verbLab?.title ?? 'Verb conjugator' }}</h2>
          <p class="subtitle">
            {{ verbLab?.description ?? 'Pick a verb and compare its forms across persons and tenses.' }}
          </p>
        </div>

        <div class="verb-picker-wrap">
          <label class="verb-picker-label" for="verb-picker">Choose a verb</label>
          <select id="verb-picker" class="verb-picker" :value="selectedVerbId" @change="loadVerb(($event.target as HTMLSelectElement).value)">
            <option v-for="verb in verbLab?.verbs ?? []" :key="verb.id" :value="verb.id">
              {{ verb.label }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="selectedVerb" class="conjugator-output">
        <div class="verb-summary">
          <div>
            <span class="summary-label">Infinitive</span>
            <strong>{{ selectedVerb.infinitive }}</strong>
          </div>
          <p class="verb-note">{{ selectedVerb.note }}</p>
        </div>

        <TabbedLessonBlock
          title="Tense tabs"
          description="Switch between tense tabs to compare the Bulgarian forms and the English translations side by side."
          :tabs="verbTenseTabs"
          initial-tab-id="present"
        />
      </div>
    </section>

    <section class="workspace">
      <aside class="module-list">
        <div class="panel-header">
          <h2>Curriculum</h2>
          <span class="count">{{ grammarIndex?.modules.length ?? 0 }} lessons</span>
        </div>

        <p v-if="loading" class="status">Loading grammar lessons...</p>
        <p v-else-if="loadError" class="status error">{{ loadError }}</p>

        <button
          v-for="module in grammarIndex?.modules ?? []"
          :key="module.id"
          type="button"
          class="module-card"
          :class="{ active: module.id === selectedModuleId }"
          @click="loadModule(module)"
        >
          <div class="module-card-top">
            <span class="module-id">{{ module.id }}</span>
            <span class="module-focus-count">{{ module.focus.length }} topics</span>
          </div>

          <strong>{{ module.title }}</strong>
          <p>{{ module.description }}</p>

          <div class="focus-row">
            <span v-for="focus in module.focus" :key="focus" class="focus-pill">
              {{ focus }}
            </span>
          </div>
        </button>
      </aside>

      <section class="lesson-pane">
        <div v-if="selectedLesson && selectedModule" class="lesson-shell">
          <header class="lesson-header">
            <div>
              <p class="eyebrow">Selected module</p>
              <h2>{{ selectedModule.title }}</h2>
              <p class="subtitle">{{ selectedModule.description }}</p>
            </div>

            <div class="module-meta">
              <span class="meta-pill">{{ lessonBlockCount }} blocks</span>
              <span class="meta-pill">{{ selectedModule.focus.join(' · ') }}</span>
            </div>
          </header>

          <div class="lesson-summary">
            <div class="summary-card">
              <span class="summary-label">What this lesson covers</span>
              <ul>
                <li v-if="selectedLesson.description">{{ selectedLesson.description }}</li>
                <li v-for="focus in selectedModule.focus" :key="focus + '-focus'">{{ focus }}</li>
              </ul>
            </div>
          </div>

          <TabbedLessonBlock
            title="Study guide"
            description="This reusable tabbed block keeps the lesson summary compact on phones while still giving quick access to the main ideas."
            :tabs="lessonGuideTabs"
            initial-tab-id="overview"
          />

          <div class="lesson-content">
            <LessonBlock
              v-for="(item, index) in selectedLesson.content"
              :key="index"
              :item="item as LessonContentBlock"
              :block-id="getBlockId(index)"
            />
          </div>
        </div>

        <div v-else class="lesson-shell empty-state">
          <p class="eyebrow">Lesson viewer</p>
          <h2>No lesson loaded</h2>
          <p class="subtitle">Select a grammar module to view its rules, examples, and drills.</p>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.grammar-lab {
  min-height: 100vh;
  padding: clamp(1rem, 2vw, 2rem);
  color: #ecf6f6;
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 186, 73, 0.2), transparent 30%),
    radial-gradient(circle at 80% 0%, rgba(35, 214, 180, 0.22), transparent 32%),
    linear-gradient(160deg, #0c1630 0%, #0d2d35 48%, #0f1526 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.hero,
.conjugator-card,
.workspace,
.module-card,
.lesson-shell,
.summary-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(5, 11, 25, 0.58);
}

.hero {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.conjugator-card {
  padding: 1rem;
  margin-bottom: 1rem;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffc86f;
  font-size: 0.75rem;
}

h1,
h2,
p {
  margin: 0;
}

.subtitle {
  max-width: 64ch;
  color: #c9d7da;
  margin-top: 0.35rem;
}

.hero-metrics {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.verb-picker-wrap {
  display: grid;
  gap: 0.4rem;
  min-width: min(100%, 18rem);
}

.verb-picker-label {
  color: #9fbbc0;
  font-size: 0.82rem;
}

.verb-picker {
  width: 100%;
  min-height: 2.85rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(8, 18, 30, 0.9);
  color: #ecf6f6;
  padding: 0.65rem 0.8rem;
  font: inherit;
}

.conjugator-output {
  margin-top: 1rem;
  display: grid;
  gap: 0.9rem;
}

.verb-summary {
  display: grid;
  gap: 0.45rem;
}

.verb-summary strong {
  display: block;
  font-size: 1.08rem;
  margin-top: 0.15rem;
}

.verb-note {
  color: #c9d7da;
}

.metric {
  min-width: 7rem;
  padding: 0.8rem 0.95rem;
  border-radius: 14px;
  background: rgba(8, 18, 30, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: grid;
  gap: 0.15rem;
}

.metric-value {
  font-size: 1.45rem;
  font-weight: 700;
}

.metric-label,
.module-id,
.module-focus-count,
.meta-pill,
.summary-label {
  color: #9fbbc0;
  font-size: 0.82rem;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.module-list {
  display: grid;
  gap: 0.75rem;
  align-content: start;
}

.panel-header,
.module-card-top,
.lesson-header,
.module-meta,
.focus-row {
  display: flex;
  justify-content: space-between;
  gap: 0.65rem;
  flex-wrap: wrap;
  align-items: center;
}

.count {
  color: #9fbbc0;
}

.status {
  color: #d2e0e3;
}

.status.error {
  color: #ffafaf;
}

.module-card {
  width: 100%;
  padding: 0.95rem;
  text-align: left;
  cursor: pointer;
  color: inherit;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.module-card:hover,
.module-card.active {
  transform: translateY(-1px);
  border-color: rgba(107, 245, 203, 0.4);
  background: linear-gradient(180deg, rgba(20, 58, 80, 0.92), rgba(10, 30, 44, 0.95));
}

.module-card strong {
  display: block;
  margin: 0.4rem 0 0.28rem;
  font-size: 1rem;
}

.module-card p {
  color: #c9d7da;
}

.focus-row {
  justify-content: flex-start;
  margin-top: 0.65rem;
}

.focus-pill,
.meta-pill {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  background: rgba(8, 18, 30, 0.7);
}

.lesson-pane {
  min-width: 0;
}

.lesson-shell {
  padding: 1rem;
}

.lesson-summary {
  margin-top: 0.95rem;
}

.summary-card {
  padding: 0.95rem;
}

.summary-card ul {
  margin: 0.55rem 0 0;
  padding-left: 1.1rem;
  color: #e7f1f3;
}

.summary-card li + li {
  margin-top: 0.35rem;
}

.lesson-content {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.empty-state {
  min-height: 24rem;
  display: grid;
  align-content: center;
  gap: 0.55rem;
}

@media (max-width: 980px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .hero,
  .conjugator-card,
  .workspace,
  .lesson-shell {
    padding: 0.9rem;
  }

  .hero {
    align-items: stretch;
  }

  .hero-metrics,
  .verb-picker-wrap {
    width: 100%;
  }

  .module-card {
    padding: 0.85rem;
  }

  .module-card p,
  .subtitle,
  .verb-note,
  .summary-card li,
  .status {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .module-meta,
  .panel-header {
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .grammar-lab {
    padding: 0.65rem;
  }

  .hero,
  .conjugator-card,
  .workspace,
  .lesson-shell,
  .summary-card {
    border-radius: 14px;
  }

  .hero-metrics {
    width: 100%;
  }

  .metric {
    flex: 1 1 8rem;
    min-width: 0;
  }

  .workspace {
    padding: 0.75rem;
  }

  .module-list {
    gap: 0.65rem;
  }

  .module-card {
    border-radius: 14px;
  }

  .focus-pill,
  .meta-pill {
    font-size: 0.78rem;
  }

  .lesson-content {
    gap: 0.65rem;
  }
}
</style>
