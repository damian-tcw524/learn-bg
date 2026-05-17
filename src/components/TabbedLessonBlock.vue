<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
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

const tabPanelHeight = ref('auto')
const measurePanels = ref<Record<string, HTMLElement | null>>({})
const measureContainer = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

const instanceId = `tabbed-${Math.random().toString(36).slice(2, 10)}`

const getTabButtonId = (tabId: string) => `${instanceId}-tab-${tabId}`

const getTabPanelId = (tabId: string) => `${instanceId}-panel-${tabId}`

const selectTab = (tabId: string) => {
  activeTabId.value = tabId
}

const setMeasurePanelRef = (tabId: string) => (element: Element | ComponentPublicInstance | null) => {
  measurePanels.value[tabId] = element instanceof HTMLElement ? element : null
}

const updatePanelHeight = async () => {
  await nextTick()

  const heights = props.tabs
    .map((tab) => measurePanels.value[tab.id]?.getBoundingClientRect().height ?? 0)
    .filter((height) => height > 0)

  const maxHeight = heights.length > 0 ? Math.ceil(Math.max(...heights)) : 0
  tabPanelHeight.value = maxHeight > 0 ? `${maxHeight}px` : 'auto'
}

onMounted(() => {
  void updatePanelHeight()

  if (typeof ResizeObserver !== 'undefined' && measureContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      void updatePanelHeight()
    })

    resizeObserver.observe(measureContainer.value)
  }
})

watch(
  () => props.tabs,
  () => {
    void updatePanelHeight()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
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
        :id="getTabButtonId(tab.id)"
        type="button"
        class="tab-button"
        :class="{ active: tab.id === activeTabId }"
        role="tab"
        :aria-selected="tab.id === activeTabId"
        :aria-controls="getTabPanelId(tab.id)"
        :tabindex="tab.id === activeTabId ? 0 : -1"
        @click="selectTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <section
      v-if="activeTab"
      :id="getTabPanelId(activeTab.id)"
      class="tab-panel"
      role="tabpanel"
      :aria-labelledby="getTabButtonId(activeTab.id)"
    >
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

    <div ref="measureContainer" class="tab-panel-measure" aria-hidden="true">
      <section
        v-for="tab in tabs"
        :key="tab.id"
        :ref="setMeasurePanelRef(tab.id)"
        class="tab-panel tab-panel-measure-item"
      >
        <p v-if="tab.description" class="tab-panel-description lesson-content">
          {{ tab.description }}
        </p>

        <div class="tab-panel-content">
          <LessonBlock
            v-for="(item, index) in tab.content"
            :key="`${tab.id}-${index}`"
            :item="item"
          />
        </div>
      </section>
    </div>
  </article>
</template>

<style scoped>
.tabbed-block {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(5, 11, 25, 0.54);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  position: relative;
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
  padding: 0.7rem 0.95rem 0 0.95rem;
  overflow: visible;
  flex-wrap: wrap;
  align-items: flex-end;
  position: relative;
  z-index: 1;
  margin-bottom: -1px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tab-bar::-webkit-scrollbar {
  display: none;
}

.tab-button {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-bottom: 0;
  border-radius: 12px 12px 0 0;
  padding: 0.68rem 1rem;
  min-height: 3rem;
  background: linear-gradient(180deg, rgba(18, 37, 58, 0.96), rgba(9, 19, 32, 0.98));
  color: #eef7f8;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease;
  flex: 0 0 auto;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.08) inset,
    0 8px 18px rgba(0, 0, 0, 0.22);
  margin-bottom: -1px;
}

.tab-button:hover,
.tab-button.active {
  background: linear-gradient(180deg, rgba(10, 24, 42, 0.98), rgba(7, 16, 28, 1));
  border-color: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.1) inset,
    0 10px 18px rgba(0, 0, 0, 0.22),
    0 0 0 1px rgba(255, 255, 255, 0.04);
}

.tab-button.active {
  position: relative;
  z-index: 2;
  margin-bottom: -2px;
  background: rgba(6, 14, 28, 0.64);
  border-color: rgba(255, 255, 255, 0.14);
  border-bottom-color: rgba(6, 14, 28, 0.64);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.08) inset,
    0 8px 16px rgba(0, 0, 0, 0.18);
}

.tab-panel {
  position: relative;
  z-index: 0;
  padding: 1rem 0.95rem 0.95rem;
  background: rgba(6, 14, 28, 0.64);
  min-height: 24rem;
  height: v-bind(tabPanelHeight);
  box-sizing: border-box;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tab-panel::-webkit-scrollbar {
  display: none;
}

.tab-panel-description {
  margin: 0 0 0.9rem;
}

.tab-panel-content {
  display: grid;
  gap: 0.75rem;
  background: rgba(8, 18, 30, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.75rem;
}

.tab-panel-measure {
  position: absolute;
  inset: 0;
  width: 100%;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
  z-index: -1;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tab-panel-measure::-webkit-scrollbar {
  display: none;
}

.tab-panel-measure-item {
  margin: 0;
  min-height: 0;
  height: auto;
  overflow: visible;
}

@media (max-width: 640px) {
  .tab-bar {
    padding: 0.65rem 0.75rem 0 0.75rem;
  }

  .tab-panel {
    padding: 0.75rem;
    min-height: 22rem;
  }

  .tab-panel-content {
    padding: 0.65rem;
  }

  .tab-button {
    padding: 0.62rem 0.85rem;
    font-size: 0.92rem;
  }
}
</style>