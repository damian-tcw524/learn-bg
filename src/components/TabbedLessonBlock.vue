<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import LessonBlock from './LessonBlock.vue'
import type { LessonContentBlock } from '../types'

defineOptions({
  name: 'TabbedLessonBlock'
})

export interface TabbedLessonBlockTab {
  id: string
  label: string
  description?: string
  content: LessonContentBlock[]
}

const props = defineProps<{
  title?: string
  description?: string
  tabs: TabbedLessonBlockTab[]
  initialTabId?: string
}>()

const activeTabId = ref(props.initialTabId ?? props.tabs[0]?.id ?? '')

watch(
  () => props.tabs,
  (tabs) => {
    if (!tabs.some((tab) => tab.id === activeTabId.value)) {
      activeTabId.value = props.initialTabId ?? tabs[0]?.id ?? ''
    }
  },
  { immediate: true }
)

const activeTab = computed(() => {
  return props.tabs.find((tab) => tab.id === activeTabId.value) ?? props.tabs[0] ?? null
})

const selectTab = (tabId: string) => {
  activeTabId.value = tabId
}
</script>

<template>
  <article class="tabbed-block">
    <header v-if="title || description" class="tabbed-heading">
      <div>
        <p v-if="title" class="tabbed-kicker">{{ title }}</p>
        <p v-if="description" class="tabbed-description">{{ description }}</p>
      </div>
    </header>

    <div class="tab-bar" role="tablist" aria-label="Tabbed lesson content">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="tab-button"
        :class="{ active: tab.id === activeTabId }"
        role="tab"
        :aria-selected="tab.id === activeTabId"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <section v-if="activeTab" class="tab-panel" role="tabpanel">
      <p v-if="activeTab.description" class="tab-panel-description lesson-content">
        {{ activeTab.description }}
      </p>

      <div class="tab-panel-content">
        <LessonBlock
          v-for="(item, index) in activeTab.content"
          :key="`${activeTab.id}-${index}`"
          :item="item"
        />
      </div>
    </section>
  </article>
</template>

<style scoped>
.tabbed-block {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(5, 11, 25, 0.54);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}

.tabbed-heading {
  padding: 0.9rem 0.95rem 0.15rem;
}

.tabbed-kicker {
  margin: 0;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  font-size: 0.74rem;
  color: #ffc86f;
}

.tabbed-description {
  margin: 0.25rem 0 0;
  color: #c9d7da;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.7rem 0.95rem 0.95rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.tab-button {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  padding: 0.62rem 0.9rem;
  min-height: 2.7rem;
  background: rgba(8, 18, 30, 0.82);
  color: #dfeef0;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
  flex: 0 0 auto;
}

.tab-button:hover,
.tab-button.active {
  background: linear-gradient(180deg, rgba(20, 58, 80, 0.92), rgba(10, 30, 44, 0.95));
  border-color: rgba(107, 245, 203, 0.42);
  transform: translateY(-1px);
}

.tab-panel {
  border-top: 1px solid rgba(255, 255, 255, 0.11);
  padding: 0.95rem;
}

.tab-panel-description {
  margin: 0 0 0.9rem;
}

.tab-panel-content {
  display: grid;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .tab-bar {
    padding: 0.65rem 0.75rem 0.85rem;
  }

  .tab-panel {
    padding: 0.75rem;
  }

  .tab-button {
    padding: 0.58rem 0.8rem;
    font-size: 0.92rem;
  }
}
</style>