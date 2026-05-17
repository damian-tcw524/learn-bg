<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countersEnabled = ref(true)
const bgFont = ref('default')
const fontOptions = [
  { value: 'default', label: 'Default' },
  { value: 'montserrat_alternates', label: 'Montserrat Alternates' },
  { value: 'comfortaa', label: 'Comfortaa' },
]

onMounted(() => {
  const saved = localStorage.getItem('counters_enabled')
  countersEnabled.value = saved === null ? true : saved === 'true'

  const savedFont = localStorage.getItem('bg_font')
  bgFont.value = savedFont || 'default'
  // apply class to root
  try {
    const root = document.documentElement
    root.classList.remove('bg-font-montserrat', 'bg-font-comfortaa')
    if (bgFont.value === 'montserrat_alternates') root.classList.add('bg-font-montserrat')
    else if (bgFont.value === 'comfortaa') root.classList.add('bg-font-comfortaa')
  } catch (e) {
    // ignore
  }
})

function toggleCounters() {
  countersEnabled.value = !countersEnabled.value
  localStorage.setItem('counters_enabled', countersEnabled.value.toString())
}

function resetCounters() {
  if (confirm('Are you sure you want to reset all lesson counters to 0? This cannot be undone.')) {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith('lesson_clicks_'))
    keys.forEach((key) => localStorage.removeItem(key))
    alert('All counters have been reset to 0.')
  }
}

function setBgFont() {
  try {
    localStorage.setItem('bg_font', bgFont.value)
    const root = document.documentElement
    root.classList.remove('bg-font-montserrat', 'bg-font-comfortaa')
    if (bgFont.value === 'montserrat_alternates') root.classList.add('bg-font-montserrat')
    else if (bgFont.value === 'comfortaa') root.classList.add('bg-font-comfortaa')
  } catch (e) {
    // ignore
  }
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <main class="settings">
    <div class="settings-container">
      <div class="header">
        <button class="back-btn" @click="goHome" type="button" aria-label="Back to home">
          ← Back
        </button>
        <h1>User Settings</h1>
      </div>

      <section class="settings-section">
        <h2>Lesson Tracking</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>Lesson Counter</h3>
            <p>Track how many times you've accessed each lesson with a counter badge.</p>
          </div>
          <button
            class="toggle-btn"
            :class="{ active: countersEnabled }"
            @click="toggleCounters"
            type="button"
            :aria-label="`Turn ${countersEnabled ? 'off' : 'on'} lesson counters`"
          >
            <span class="toggle-indicator"></span>
            {{ countersEnabled ? 'ON' : 'OFF' }}
          </button>
        </div>

        <div class="setting-item danger">
          <div class="setting-info">
            <h3>Reset Counters</h3>
            <p>Clear all lesson counter data and reset them to 0.</p>
          </div>
          <button class="reset-btn" @click="resetCounters" type="button"> Reset </button>
        </div>
      </section>

      <section class="settings-section">
        <h2>Appearance</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>Lesson Content Font</h3>
            <p>Choose a font to use for lesson content throughout the app.</p>
          </div>

          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem;min-width:220px;">
            <select v-model="bgFont" @change="setBgFont" aria-label="Bulgarian font selector">
              <option v-for="opt in fontOptions" :value="opt.value" :key="opt.value">{{ opt.label }}</option>
            </select>
            <div class="font-preview lesson-content" aria-hidden="true">Здравей, свят — Примерен текст</div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.settings {
  min-height: 100vh;
  padding: clamp(1rem, 2vw, 2rem);
  color: #ecf6f6;
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 186, 73, 0.2), transparent 30%),
    radial-gradient(circle at 80% 0%, rgba(35, 214, 180, 0.22), transparent 32%),
    linear-gradient(160deg, #0c1630 0%, #0d2d35 48%, #0f1526 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #6bf5cb;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(107, 245, 203, 0.1);
  border-color: rgba(107, 245, 203, 0.4);
}

.header h1 {
  margin: 0;
  font-size: 2rem;
}

.settings-section {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(5, 11, 25, 0.58);
  padding: 1.5rem;
  display: grid;
  gap: 1.5rem;
}

.settings-section h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #6bf5cb;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(18, 42, 54, 0.5);
}

.setting-item.danger {
  border-color: rgba(255, 107, 107, 0.2);
  background: rgba(255, 107, 107, 0.05);
}

.setting-info h3 {
  margin: 0;
  font-size: 1rem;
}

.setting-info p {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: #b8c8cb;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(107, 245, 203, 0.15);
  border: 2px solid rgba(107, 245, 203, 0.3);
  color: #6bf5cb;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toggle-btn:hover {
  background: rgba(107, 245, 203, 0.25);
  border-color: rgba(107, 245, 203, 0.6);
}

.toggle-btn.active {
  background: rgba(107, 245, 203, 0.25);
  border-color: #6bf5cb;
}

.toggle-indicator {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6bf5cb;
}

.reset-btn {
  background: rgba(255, 107, 107, 0.15);
  border: 2px solid rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.reset-btn:hover {
  background: rgba(255, 107, 107, 0.25);
  border-color: rgba(255, 107, 107, 0.6);
}

.settings-section select {
  background: #ffffff;
  color: #000000;
  border: 1px solid rgba(0,0,0,0.12);
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  min-width: 180px;
}
.settings-section select option {
  color: #000000;
}

.font-preview {
  font-size: 0.95rem;
  color: #b8c8cb;
  background: rgba(255,255,255,0.02);
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.04);
}

@media (max-width: 700px) {
  .settings {
    padding: 0.75rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
