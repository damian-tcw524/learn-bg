<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { clearFlashcardStats, loadFlashcardStats } from './flashcardStats'
import type { FlashcardData, FlashcardStats } from './types'

const router = useRouter()
const stats = ref<FlashcardStats>(loadFlashcardStats())
const data = ref<FlashcardData | null>(null)
const clearConfirm = ref(false)

const totalAnswers = computed(() => stats.value.totalCorrect + stats.value.totalWrong)
const accuracy = computed(() => {
  if (!totalAnswers.value) {
    return 0
  }
  return Math.round((stats.value.totalCorrect / totalAnswers.value) * 100)
})

const topicStats = computed(() => {
  const topicMap = new Map<string, { label: string; correct: number; wrong: number }>()

  for (const topic of data.value?.topics ?? []) {
    topicMap.set(topic.id, { label: topic.label, correct: 0, wrong: 0 })
  }

  for (const attempt of stats.value.attempts) {
    for (const topicId of attempt.topics) {
      if (!topicMap.has(topicId)) {
        topicMap.set(topicId, { label: topicId, correct: 0, wrong: 0 })
      }

      const value = topicMap.get(topicId)
      if (!value) {
        continue
      }

      if (attempt.correct) {
        value.correct += 1
      } else {
        value.wrong += 1
      }
    }
  }

  return Array.from(topicMap.entries())
    .map(([id, value]) => ({
      id,
      label: value.label,
      correct: value.correct,
      wrong: value.wrong,
      total: value.correct + value.wrong,
      accuracy: value.correct + value.wrong ? Math.round((value.correct / (value.correct + value.wrong)) * 100) : 0
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
})

const recentSessions = computed(() => stats.value.sessions.slice(-10).reverse())

const improvement = computed(() => {
  const recent = stats.value.sessions.slice(-5)
  const previous = stats.value.sessions.slice(-10, -5)

  const recentTotal = recent.reduce((sum, row) => sum + row.total, 0)
  const previousTotal = previous.reduce((sum, row) => sum + row.total, 0)

  if (!recentTotal || !previousTotal) {
    return null
  }

  const recentAccuracy = recent.reduce((sum, row) => sum + row.correct, 0) / recentTotal
  const previousAccuracy = previous.reduce((sum, row) => sum + row.correct, 0) / previousTotal

  return Math.round((recentAccuracy - previousAccuracy) * 100)
})

function refreshStats(): void {
  stats.value = loadFlashcardStats()
}

function clearStats(): void {
  clearFlashcardStats()
  clearConfirm.value = false
  refreshStats()
}

function openFlashcards(): void {
  router.push('/flashcards')
}

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/flashcards.json`)
    if (res.ok) {
      data.value = (await res.json()) as FlashcardData
    }
  } catch {
    data.value = null
  }

  refreshStats()
})
</script>

<template>
  <main class="stats-page">
    <section class="hero">
      <div>
        <p class="eyebrow">Flashcards</p>
        <h1>Statistics</h1>
        <p class="subtitle">Track your progress and see if your accuracy improves over time.</p>
      </div>

      <button class="back-btn" type="button" @click="openFlashcards">Back To Flashcards</button>
    </section>

    <section class="summary-panel">
      <article>
        <p>Total Answers</p>
        <strong>{{ totalAnswers }}</strong>
      </article>
      <article>
        <p>Correct</p>
        <strong>{{ stats.totalCorrect }}</strong>
      </article>
      <article>
        <p>Wrong</p>
        <strong>{{ stats.totalWrong }}</strong>
      </article>
      <article>
        <p>Accuracy</p>
        <strong>{{ accuracy }}%</strong>
      </article>
    </section>

    <section class="trend-panel">
      <h2>Improvement</h2>
      <p v-if="improvement === null">Complete at least 10 rounds to unlock trend comparison.</p>
      <p v-else-if="improvement > 0">You are improving: +{{ improvement }}% vs previous rounds.</p>
      <p v-else-if="improvement < 0">Current trend: {{ improvement }}% vs previous rounds. Keep practicing.</p>
      <p v-else>Stable performance: no change vs previous rounds.</p>
    </section>

    <section class="topic-panel">
      <h2>By Topic</h2>
      <p v-if="!topicStats.length">No topic data yet. Complete some cards first.</p>
      <div v-else class="topic-list">
        <div v-for="item in topicStats" :key="item.id" class="topic-row">
          <span>{{ item.label }}</span>
          <span>{{ item.correct }}/{{ item.total }} ({{ item.accuracy }}%)</span>
        </div>
      </div>
    </section>

    <section class="session-panel">
      <h2>Recent Rounds</h2>
      <p v-if="!recentSessions.length">No rounds completed yet.</p>
      <table v-else class="session-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Correct</th>
            <th>Wrong</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="session in recentSessions" :key="session.timestamp">
            <td>{{ new Date(session.timestamp).toLocaleString() }}</td>
            <td>{{ session.correct }}</td>
            <td>{{ session.wrong }}</td>
            <td>{{ Math.round((session.correct / session.total) * 100) }}%</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="danger-panel">
      <h2>Danger Zone</h2>
      <p>Clear all flashcard statistics if you want to start fresh.</p>
      <div class="danger-actions">
        <button type="button" class="danger-btn" @click="clearConfirm = true">Clear Statistics</button>
        <button v-if="clearConfirm" type="button" class="confirm-btn" @click="clearStats">Are You Sure? Confirm</button>
        <button v-if="clearConfirm" type="button" class="cancel-btn" @click="clearConfirm = false">Cancel</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.stats-page {
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

.hero,
.summary-panel,
.trend-panel,
.topic-panel,
.session-panel,
.danger-panel {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(5, 11, 25, 0.56);
  padding: 1rem;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

h1,
h2 {
  margin: 0.25rem 0;
}

.subtitle {
  margin: 0;
  color: #c6d4d7;
}

.back-btn {
  border: 0;
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  cursor: pointer;
  color: #1b2329;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd16f, #6bf5cb);
}

.summary-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.7rem;
}

.summary-panel article {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(17, 35, 44, 0.9);
  padding: 0.7rem;
}

.summary-panel p {
  margin: 0;
  color: #a9bcc1;
}

.summary-panel strong {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.35rem;
}

.topic-list {
  display: grid;
  gap: 0.5rem;
}

.topic-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.56rem 0.75rem;
  background: rgba(17, 35, 44, 0.9);
}

.session-table {
  width: 100%;
  border-collapse: collapse;
}

.session-table thead {
  background: rgba(12, 35, 44, 0.92);
}

.session-table th,
.session-table td {
  text-align: left;
  padding: 0.62rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.danger-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.danger-btn,
.confirm-btn,
.cancel-btn {
  border: 0;
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  font-weight: 700;
}

.danger-btn {
  background: linear-gradient(135deg, #99334a, #be5368);
  color: #fae8eb;
}

.confirm-btn {
  background: linear-gradient(135deg, #ffd16f, #ffc08a);
  color: #2f2721;
}

.cancel-btn {
  background: rgba(124, 145, 155, 0.26);
  color: #dfeaed;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@media (max-width: 700px) {
  .stats-page {
    padding: 0.75rem;
  }

  .hero,
  .summary-panel,
  .trend-panel,
  .topic-panel,
  .session-panel,
  .danger-panel {
    border-radius: 12px;
  }
}
</style>
