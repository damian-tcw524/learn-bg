<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import LessonBlock from './components/LessonBlock.vue'
import type { LessonContentBlock, LessonData } from './types'

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

const getBlockLabel = (item: LessonContentBlock, index: number) => {
  if (item.type === 'section') {
    return item.title || `Section ${index + 1}`
  }

  if (item.type === 'table') {
    return item.headers[0] ? `${item.headers[0]} table` : `Table ${index + 1}`
  }

  if (item.type === 'note') {
    return item.title || `Note ${index + 1}`
  }

  if (item.type === 'list') {
    return item.title || `List ${index + 1}`
  }

  if (item.type === 'example') {
    return `Example ${index + 1}`
  }

  if (item.type === 'cards') {
    return item.title || `Cards ${index + 1}`
  }

  if (item.type === 'quiz') {
    return `Quiz ${index + 1}`
  }

  if (item.type === 'rule') {
    return item.title || `Rule ${index + 1}`
  }

  if (item.type === 'tabs') {
    return item.title || `Tabs ${index + 1}`
  }

  if (item.letter) {
    return `Letter ${item.letter}`
  }

  if (item.bg && item.en) {
    return `${item.bg} - ${item.en}`
  }

  return `Item ${index + 1}`
}

const sectionLinks = computed<SectionLink[]>(() => {
  const content = lessonData.value?.content ?? []

  return content.map((item, index) => ({
    id: `lesson-block-${index}`,
    label: getBlockLabel(item, index)
  }))
})

const sectionCount = computed(() => sectionLinks.value.length)

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
  const file = Array.isArray(route.query.file) ? route.query.file[0] : route.query.file
  if (typeof file !== 'string' || !file) {
    return
  }

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

        <span class="section-count">{{ sectionCount }} blocks</span>
      </header>

      <div class="content">
        <LessonBlock
          v-for="(item, index) in lessonData.content"
          :key="index"
          :item="item"
          :block-id="`lesson-block-${index}`"
        />
      </div>
    </div>

    <div v-else class="lesson-layout loading-state">
      <header class="lesson-header">
        <div>
          <p class="eyebrow">Lesson</p>
          <h1>Loading lesson</h1>
          <p class="description">The lesson file is being fetched.</p>
        </div>
      </header>
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

.content {
  display: grid;
  gap: 0.75rem;
}

.loading-state {
  opacity: 0.9;
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