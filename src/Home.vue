<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'

interface Lesson {
  id: string
  title: string
  description: string
  file: string
}

interface LessonCategory {
  category: string
  lessons: Lesson[]
}

const router = useRouter()
const categories = ref<LessonCategory[]>([])
const loading = ref(true)
const loadError = ref('')
const lessonClickCounts = reactive<Record<string, number>>({})

const featureButtons = [
  { label: 'Flashcards', path: '/flashcards' },
  { label: 'Quick Quiz', path: '/quiz' },
  { label: 'Grammar Lab', path: '/grammar-lab' },
  { label: 'Listening Drills', path: '/listening' },
  { label: 'Progress Tracker', path: '/progress' }
]

const totalLessons = computed(() => {
  return categories.value.reduce((sum, cat) => sum + cat.lessons.length, 0)
})

function getClickCount(lessonId: string): number {
  return lessonClickCounts[lessonId] || 0
}

function setClickCount(lessonId: string, count: number) {
  lessonClickCounts[lessonId] = count
  localStorage.setItem(`lesson_clicks_${lessonId}`, count.toString())
}

function incrementClickCount(lessonId: string) {
  const current = getClickCount(lessonId)
  setClickCount(lessonId, current + 1)
}

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/roadmap.json`)

    if (!res.ok) {
      throw new Error('Could not load lesson roadmap.')
    }

    categories.value = await res.json()

    // Load click counts from localStorage
    categories.value.forEach((category) => {
      category.lessons.forEach((lesson) => {
        const saved = localStorage.getItem(`lesson_clicks_${lesson.id}`)
        if (saved) {
          lessonClickCounts[lesson.id] = parseInt(saved, 10)
        }
      })
    })
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Unexpected error while loading lessons.'
  } finally {
    loading.value = false
  }
})

function goToLesson(lesson: Lesson) {
  incrementClickCount(lesson.id)
  router.push({
    path: `/lesson/${lesson.id}`,
    query: { file: lesson.file }
  })
}

function goToFeature(path: string) {
  router.push(path)
}
</script>

<template>
  <main class="home">
    <section class="hero">
      <div>
        <p class="eyebrow">Learn Bulgarian</p>
        <h1 class="title">Your Study Dashboard</h1>
        <p class="subtitle">
          Lessons are organized as a compact list so you can scale easily as more topics are added.
        </p>
      </div>
    </section>

    <section class="features-panel">
      <div class="panel-header">
        <h2>Learning Apps</h2>
      </div>

      <div class="feature-list" role="list">
        <button
          v-for="feature in featureButtons"
          :key="feature.path"
          class="feature-btn"
          type="button"
          @click="goToFeature(feature.path)"
        >
          {{ feature.label }}
        </button>
      </div>
    </section>

    <section class="lessons-panel">
      <div class="panel-header">
        <h2>Sections</h2>
        <span class="count">{{ totalLessons }} total</span>
      </div>

      <p v-if="loading" class="status">Loading lessons...</p>
      <p v-else-if="loadError" class="status error">{{ loadError }}</p>

      <div v-else class="categories-container">
        <div v-for="(categoryGroup, catIndex) in categories" :key="categoryGroup.category" class="category-section">
          <h3 class="category-title">{{ categoryGroup.category }}</h3>
          <div class="section-list" role="list">
            <button
              v-for="(lesson, lessonIndex) in categoryGroup.lessons"
              :key="lesson.id"
              class="section-item"
              type="button"
              @click="goToLesson(lesson)"
            >
              <span class="item-index">{{ String(lessonIndex + 1).padStart(2, '0') }}</span>
              <span class="item-body">
                <strong>{{ lesson.title }}</strong>
                <small>{{ lesson.description }}</small>
              </span>
              <span class="item-counter">{{ getClickCount(lesson.id) }}</span>
              <span class="item-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  min-height: 100vh;
  padding: clamp(1rem, 2vw, 2rem);
  color: #ecf6f6;
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 186, 73, 0.2), transparent 30%),
    radial-gradient(circle at 80% 0%, rgba(35, 214, 180, 0.22), transparent 32%),
    linear-gradient(160deg, #0c1630 0%, #0d2d35 48%, #0f1526 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: grid;
  gap: 1rem;
}

.hero {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 1rem;
  background: rgba(5, 11, 25, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffc86f;
  font-size: 0.75rem;
}

.title {
  margin: 0.25rem 0;
  font-size: clamp(1.4rem, 3vw, 2rem);
}

.subtitle {
  margin: 0;
  max-width: 60ch;
  color: #c9d7da;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-btn {
  border: 0;
  border-radius: 10px;
  padding: 0.58rem 0.9rem;
  cursor: pointer;
  color: #1b2329;
  font-weight: 700;
  font-size: 0.92rem;
  background: linear-gradient(135deg, #ffd16f, #6bf5cb);
  white-space: nowrap;
}

.feature-btn:hover {
  filter: brightness(1.06);
}

.features-panel,
.lessons-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(5, 11, 25, 0.58);
  padding: 1rem;
}

.panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.panel-header h2 {
  margin: 0;
}

.count {
  color: #a9b8bc;
  font-size: 0.9rem;
}

.categories-container {
  display: grid;
  gap: 1.5rem;
}

.category-section {
  display: grid;
  gap: 0.5rem;
}

.category-title {
  margin: 0;
  font-size: 1.1rem;
  color: #6bf5cb;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.status {
  margin: 0.75rem 0;
  color: #cad9dc;
}

.status.error {
  color: #ffb6b6;
}

.section-list {
  display: grid;
  gap: 0.55rem;
}

.section-item {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: linear-gradient(180deg, rgba(18, 42, 54, 0.92), rgba(13, 30, 38, 0.95));
  color: #eaf8f9;
  border-radius: 10px;
  padding: 0.55rem 0.7rem;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 0.7rem;
  align-items: center;
  text-align: left;
  cursor: pointer;
  transition: transform 0.14s ease, border-color 0.14s ease, background 0.14s ease;
}

.section-item:hover {
  transform: translateY(-1px);
  border-color: rgba(110, 240, 210, 0.55);
  background: linear-gradient(180deg, rgba(21, 52, 66, 0.96), rgba(15, 36, 45, 1));
}

.item-index {
  width: 2.3rem;
  color: #8dc8be;
  font-variant-numeric: tabular-nums;
}

.item-body {
  display: grid;
  gap: 0.1rem;
}

.item-body strong {
  font-size: 0.97rem;
  line-height: 1.2;
}

.item-body small {
  color: #b8c8cb;
  line-height: 1.2;
}

.item-counter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: rgba(110, 240, 210, 0.15);
  color: #6bf5cb;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(110, 240, 210, 0.3);
}

.item-arrow {
  color: #85e9d6;
  font-size: 1.1rem;
}

@media (max-width: 700px) {
  .home {
    padding: 0.75rem;
  }

  .hero,
  .lessons-panel {
    border-radius: 12px;
  }
}
</style>