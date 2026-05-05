<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { RoadmapItem } from './types'

const router = useRouter()
const lessons = ref<RoadmapItem[]>([])

onMounted(async () => {
  const res = await fetch('/data/roadmap.json')
  lessons.value = await res.json()
})

function goToLesson(lesson: RoadmapItem) {
  router.push({
    path: `/lesson/${lesson.id}`,
    query: { file: lesson.file }
  })
}
</script>

<template>
  <div class="container">
    <h1 class="title">Bulgarian Learning</h1>

    <div class="grid">
      <div
        v-for="lesson in lessons"
        :key="lesson.id"
        class="card"
        @click="goToLesson(lesson)"
      >
        <h2>{{ lesson.title }}</h2>
        <p>{{ lesson.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0b2f2a, #0a1f3d);
  color: #e0f2f1;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

.card {
  background: rgba(20, 60, 50, 0.8);
  border: 1px solid rgba(0, 255, 200, 0.2);
  padding: 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.card:hover {
  transform: scale(1.02);
  background: rgba(30, 80, 70, 0.9);
}
</style>