<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { LessonData } from './types'

const route = useRoute()

const lessonData = ref<LessonData | null>(null)
const drawerOpen = ref(false)
const activeSectionId = ref('')
const observer = ref<IntersectionObserver | null>(null)
const observedElements = ref<HTMLElement[]>([])

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

  activeSectionId.value = targetId
  document.getElementById(targetId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

const setupSectionObserver = () => {
  observer.value?.disconnect()
  observedElements.value = []

  const links = sectionLinks.value
  if (!links.length) {
    return
  }

  observer.value = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible[0]?.target?.id) {
        activeSectionId.value = visible[0].target.id
      }
    },
    {
      root: null,
      rootMargin: '-15% 0px -65% 0px',
      threshold: [0.1, 0.35, 0.6]
    }
  )

  observedElements.value = links
    .map((link) => document.getElementById(link.id))
    .filter((element): element is HTMLElement => !!element)

  observedElements.value.forEach((element) => observer.value?.observe(element))

  if (!activeSectionId.value) {
    activeSectionId.value = links[0].id
  }
}

onMounted(async () => {
  const file = route.query.file as string
  const res = await fetch(`${import.meta.env.BASE_URL}data/lessons/${file}`)
  lessonData.value = await res.json()
  await nextTick()
  setupSectionObserver()
})

onBeforeUnmount(() => {
  observer.value?.disconnect()
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
        :class="{ active: link.id === activeSectionId }"
        @click="goToSection(link.id)"
      >
        {{ link.label }}
      </button>
    </aside>

    <div v-if="lessonData" class="lesson-layout">
      <header class="lesson-header">
        <div>
          <p class="eyebrow">Lesson</p>
          <h1>{{ lessonData.title }}</h1>
          <p v-if="lessonData.description" class="description">{{ lessonData.description }}</p>
        </div>

        <span class="section-count">{{ sectionLinks.length }} sections</span>
      </header>

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
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 186, 73, 0.2), transparent 30%),
    radial-gradient(circle at 80% 0%, rgba(35, 214, 180, 0.22), transparent 32%),
    linear-gradient(160deg, #0c1630 0%, #0d2d35 48%, #0f1526 100%);
  color: #ecf6f6;
  padding: 1rem 1rem 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
  background: rgba(5, 11, 25, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 0;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
}

.menu-button span {
  width: 1.15rem;
  height: 2px;
  border-radius: 999px;
  background: #7de9d3;
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
  background: rgba(6, 18, 30, 0.98);
  border-right: 1px solid rgba(255, 255, 255, 0.14);
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
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #ffc86f;
  text-transform: uppercase;
  padding: 0 0.25rem 0.35rem;
}

.drawer-link {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: linear-gradient(180deg, rgba(18, 42, 54, 0.92), rgba(13, 30, 38, 0.95));
  color: #eaf8f9;
  text-align: left;
  padding: 0.65rem 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  line-height: 1.3;
  transition: transform 0.14s ease, border-color 0.14s ease, background 0.14s ease;
}

.drawer-link:hover,
.drawer-link:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(110, 240, 210, 0.55);
  background: linear-gradient(180deg, rgba(21, 52, 66, 0.96), rgba(15, 36, 45, 1));
  outline: none;
}

.drawer-link.active {
  border-color: rgba(255, 200, 111, 0.62);
  box-shadow: inset 0 0 0 1px rgba(255, 200, 111, 0.2);
}

.lesson-layout {
  max-width: 1020px;
  margin: 0 auto;
  padding-top: 3.9rem;
}

.lesson-header {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(5, 11, 25, 0.56);
  padding: 1rem;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffc86f;
  font-size: 0.75rem;
}

h1 {
  margin: 0.25rem 0 0.2rem;
  font-size: clamp(1.3rem, 3vw, 1.9rem);
}

.description {
  margin: 0;
  color: #c9d7da;
}

.section-count {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  padding: 0.42rem 0.72rem;
  background: rgba(8, 18, 30, 0.68);
  color: #9fbbc0;
  font-size: 0.85rem;
  white-space: nowrap;
}

.content {
  margin-top: 0.85rem;
}

.content-block {
  scroll-margin-top: 1.25rem;
  margin-bottom: 0.75rem;
}

.section {
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 14px;
  background: rgba(5, 11, 25, 0.54);
  padding: 0.85rem;
}

.section-title {
  margin: 0;
  font-size: 1.07rem;
}

.section-description {
  margin: 0.32rem 0 0.7rem;
  color: #c2d2d6;
}

.section-content {
  display: grid;
  gap: 0.55rem;
}

.item {
  background: linear-gradient(180deg, rgba(18, 42, 54, 0.92), rgba(13, 30, 38, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.11);
  padding: 0.7rem 0.85rem;
  margin-bottom: 0.5rem;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  align-items: center;
}

.big {
  font-size: 1.5rem;
  font-weight: bold;
}

.table-wrapper {
  margin-bottom: 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(5, 11, 25, 0.58);
}

.lesson-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.lesson-table thead {
  background: rgba(12, 35, 44, 0.92);
  font-weight: bold;
}

.lesson-table th {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffc86f;
}

.lesson-table td {
  padding: 0.72rem 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: #e7f1f3;
}

.lesson-table tbody tr:hover {
  background: rgba(35, 79, 96, 0.38);
  transition: background 0.14s;
}

@media (max-width: 640px) {
  .container {
    padding: 0.75rem 0.75rem 1.5rem;
  }

  .lesson-layout {
    padding-top: 3.4rem;
  }

  .lesson-header {
    border-radius: 12px;
  }

  .section-drawer {
    width: min(18rem, 88vw);
    padding-top: 4.25rem;
  }
}
</style>