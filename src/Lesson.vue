<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { LessonData } from './types'

const route = useRoute()

const lessonData = ref<LessonData | null>(null)
const drawerOpen = ref(false)

type SectionLink = {
  id: string
  label: string
}

const sectionLinks = computed<SectionLink[]>(() => {
  const content = lessonData.value?.content ?? []

  return content.map((item, index) => {
    if (item.type === 'section') {
      return {
        id: `lesson-block-${index}`,
        label: item.title || `Section ${index + 1}`
      }
    }

    if (item.type === 'table') {
      return {
        id: `lesson-block-${index}`,
        label: `Table ${index + 1}`
      }
    }

    if (item.letter) {
      return {
        id: `lesson-block-${index}`,
        label: `Letter ${item.letter}`
      }
    }

    if (item.bg && item.en) {
      return {
        id: `lesson-block-${index}`,
        label: `${item.bg} - ${item.en}`
      }
    }

    return {
      id: `lesson-block-${index}`,
      label: `Item ${index + 1}`
    }
  })
})

const closeDrawer = () => {
  drawerOpen.value = false
}

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value
}

const goToSection = async (targetId: string) => {
  closeDrawer()
  await nextTick()

  document.getElementById(targetId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

onMounted(async () => {
  const file = route.query.file as string
  const res = await fetch(`${import.meta.env.BASE_URL}data/lessons/${file}`)
  lessonData.value = await res.json()
})
</script>

<template>
  <div class="container">
    <button
      class="menu-button"
      type="button"
      aria-label="Open section list"
      :aria-expanded="drawerOpen"
      aria-controls="section-drawer"
      @click="toggleDrawer"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div
      class="drawer-backdrop"
      :class="{ open: drawerOpen }"
      @click="closeDrawer"
    ></div>

    <aside id="section-drawer" class="section-drawer" :class="{ open: drawerOpen }">
      <div class="drawer-title">Sections</div>

      <button
        v-for="link in sectionLinks"
        :key="link.id"
        type="button"
        class="drawer-link"
        @click="goToSection(link.id)"
      >
        {{ link.label }}
      </button>
    </aside>

    <div v-if="lessonData" class="lesson-layout">
      <h1>{{ lessonData.title }}</h1>
      <p v-if="lessonData.description" class="description">{{ lessonData.description }}</p>

      <div class="content">
        <div
          v-for="(item, index) in lessonData.content"
          :key="index"
          :id="`lesson-block-${index}`"
          class="content-block"
        >
          <div v-if="item.type === 'section'" class="section">
            <h2 class="section-title">{{ item.title }}</h2>
            <p v-if="item.description" class="section-description">{{ item.description }}</p>

            <div class="section-content">
              <div v-for="(contentItem, contentIndex) in item.content" :key="contentIndex">
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

                <div v-else class="item">
                  <div v-if="contentItem.letter">
                    <span class="big">{{ contentItem.letter }}</span>
                    <span>{{ contentItem.sound }}</span>
                  </div>
                  <div v-else>
                    <span>{{ contentItem.bg }} - {{ contentItem.en }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
  padding: 1.5rem 1.5rem 2.5rem;
  font-family: Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.menu-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 40;
  width: 3rem;
  height: 3rem;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  background: rgba(10, 31, 61, 0.92);
  border: 1px solid rgba(0, 255, 200, 0.18);
  padding: 0;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
}

.menu-button span {
  width: 1.15rem;
  height: 2px;
  border-radius: 999px;
  background: #00ffc8;
}

.drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(2, 8, 15, 0.45);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.24s ease;
}

.drawer-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}

.section-drawer {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 35;
  width: min(19rem, 84vw);
  height: 100vh;
  padding: 4.5rem 1rem 1rem;
  background: rgba(6, 22, 34, 0.98);
  border-right: 1px solid rgba(0, 255, 200, 0.16);
  box-shadow: 16px 0 32px rgba(0, 0, 0, 0.3);
  transform: translateX(-102%);
  transition: transform 0.28s ease;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  overflow-y: auto;
}

.section-drawer.open {
  transform: translateX(0);
}

.drawer-title {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #00ffc8;
  text-transform: uppercase;
  padding: 0 0.25rem 0.35rem;
}

.drawer-link {
  width: 100%;
  border: 1px solid rgba(0, 255, 200, 0.14);
  background: rgba(18, 61, 53, 0.85);
  color: #e0f2f1;
  text-align: left;
  padding: 0.9rem 0.95rem;
  border-radius: 12px;
  cursor: pointer;
  line-height: 1.35;
}

.drawer-link:hover,
.drawer-link:focus-visible {
  background: rgba(30, 80, 70, 0.95);
  border-color: rgba(0, 255, 200, 0.35);
  outline: none;
}

.lesson-layout {
  max-width: 980px;
  margin: 0 auto;
  padding-top: 3.75rem;
}

.content {
  margin-top: 1rem;
}

.content-block {
  scroll-margin-top: 1.25rem;
  margin-bottom: 1rem;
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

@media (max-width: 640px) {
  .container {
    padding: 1rem 1rem 2rem;
  }

  .lesson-layout {
    padding-top: 3.4rem;
  }

  .section-drawer {
    width: min(18rem, 88vw);
    padding-top: 4.25rem;
  }
}
</style>