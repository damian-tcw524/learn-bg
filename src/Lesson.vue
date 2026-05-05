<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LessonData } from './types'

const route = useRoute()
const router = useRouter()

const lessonData = ref<LessonData | null>(null)

onMounted(async () => {
  const file = route.query.file as string
  const res = await fetch(`/data/lessons/${file}`)
  lessonData.value = await res.json()
})

</script>

<template>
  <div class="container">
    <button class="back" @click="router.push('/')">⬅ Back</button>

    <div v-if="lessonData">
      <h1>{{ lessonData.title }}</h1>
      <p v-if="lessonData.description" class="description">{{ lessonData.description }}</p>

      <div class="content">
        <div v-for="(item, index) in lessonData.content" :key="index">
          <!-- Section -->
          <div v-if="item.type === 'section'" class="section">
            <h2 class="section-title">{{ item.title }}</h2>
            <p v-if="item.description" class="section-description">{{ item.description }}</p>
            
            <!-- Section content -->
            <div class="section-content">
              <div v-for="(contentItem, contentIndex) in item.content" :key="contentIndex">
                <!-- Table within section -->
                <div v-if="contentItem.type === 'table'" class="table-wrapper">
                  <table class="lesson-table">
                    <thead>
                      <tr>
                        <th v-for="(header, i) in contentItem.headers" :key="i">
                          {{ header }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, rowIndex) in contentItem.rows" :key="rowIndex">
                        <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                          {{ cell }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Item within section -->
                <div v-else class="item">
                  <div v-if="contentItem.letter">
                    <span class="big">{{ contentItem.letter }}</span>
                    <span>{{ contentItem.sound }}</span>
                  </div>
                  <div v-else>
                    <span class="big">{{ contentItem.bg }}</span>
                    <span>{{ contentItem.en }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Top-level table -->
          <div v-else-if="item.type === 'table'" class="table-wrapper">
            <table class="lesson-table">
              <thead>
                <tr>
                  <th v-for="(header, i) in item.headers" :key="i">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in item.rows" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Top-level item -->
          <div v-else class="item">
            <div v-if="item.letter">
              <span class="big">{{ item.letter }}</span>
              <span>{{ item.sound }}</span>
            </div>
            <div v-else>
              <span class="big">{{ item.bg }}</span>
              <span>{{ item.en }}</span>
            </div>
          </div>
        </div>
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

.back {
  background: #123d35;
  border: none;
  padding: 0.6rem 1rem;
  color: #e0f2f1;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.content {
  margin-top: 1rem;
}

.item {
  background: rgba(20, 60, 50, 0.8);
  padding: 1rem;
  margin-bottom: 0.6rem;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
}

.big {
  font-size: 1.5rem;
  font-weight: bold;
}

.table-wrapper {
  margin-bottom: 1rem;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(20, 60, 50, 0.8);
}

.lesson-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(20, 60, 50, 0.8);
}

.lesson-table thead {
  background: rgba(10, 50, 45, 0.9);
  font-weight: bold;
}

.lesson-table th {
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid rgba(0, 255, 200, 0.3);
  color: #00ffc8;
}

.lesson-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 255, 200, 0.15);
  color: #e0f2f1;
}

.lesson-table tbody tr:hover {
  background: rgba(30, 80, 70, 0.5);
  transition: 0.2s;
}
</style>